import { sendConfirmationEmail, ConfirmationEmailInput } from '@/ai/flows/send-confirmation-email';
import { sendAssignmentEmail } from '@/ai/flows/send-assignment-email';
import { sendStatusUpdateEmail, StatusUpdateEmailInput } from '@/ai/flows/send-status-update-email';
import { evaluateCandidate, EvaluateCandidateInput } from '@/ai/flows/evaluate-candidate';
import { TeamService } from '@/lib/services/team-service';
import { Application } from '@/types';
import { ApplicationDb, buildFilteredQuery } from '@/lib/db/application-db';
import { TeamDb } from '@/lib/db/team-db';

// Generate a unique, readable reference ID
function generateReferenceId() {
  const prefix = "MLSC";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export class ApplicationService {
  static async submitApplication(applicationData: any, file: File | null) {
    const activeChapter = await ApplicationDb.getActiveChapter();
    const chapterSettings = await ApplicationDb.getChapterSettings(activeChapter);

    if (!chapterSettings.isHiringOpen) {
      throw new Error(`Applications are currently closed for Chapter ${activeChapter}.`);
    }

    const deadline = await ApplicationDb.getDeadline();
    if (deadline && new Date() > new Date(deadline)) {
      throw new Error('The application deadline for this recruitment cycle has passed.');
    }

    const registrationLimit = chapterSettings.registrationLimit || 0;
    if (registrationLimit > 0) {
      const currentCount = await ApplicationDb.getActiveApplicationsCount(activeChapter);
      if (currentCount >= registrationLimit) {
        throw new Error(`Application registration limit of ${registrationLimit} has been reached for Chapter ${activeChapter}. Registrations are now closed.`);
      }
    }

    const referenceId = generateReferenceId();
    const rollNo_lowercase = applicationData.rollNo.toLowerCase();
    const name_lowercase = applicationData.name.toLowerCase();

    const emailExists = await ApplicationDb.checkEmailExists(applicationData.email, activeChapter);
    if (emailExists) {
      throw new Error('An application with this email address already exists for this recruitment cycle.');
    }

    const rollNoExists = await ApplicationDb.checkRollNoExists(rollNo_lowercase, activeChapter);
    if (rollNoExists) {
      throw new Error('An application with this roll number already exists for this recruitment cycle.');
    }

    // Round-robin assignment
    const domainPanels = await ApplicationDb.getDomainPanelMembers(applicationData.technicalDomain);
    let assignedTo = null;
    let assignedPanelEmail = null;
    let assignedPanelName = null;

    if (domainPanels.length > 0) {
      const panelCounts = await ApplicationDb.getPanelAssignmentCounts(applicationData.technicalDomain, activeChapter);
      let minCount = Infinity;
      let selectedPanel = domainPanels[0];
      for (const panel of domainPanels) {
        const count = panelCounts[panel.uid] || 0;
        if (count < minCount) {
          minCount = count;
          selectedPanel = panel;
        }
      }
      assignedTo = selectedPanel.uid;
      assignedPanelEmail = selectedPanel.email;
      assignedPanelName = selectedPanel.displayName || 'Panel Member';
    }

    const newApplication = {
      id: referenceId,
      assignedTo,
      submittedAt: new Date().toISOString(),
      isArchived: false,
      chapter: activeChapter,
      ...applicationData,
      rollNo_lowercase,
      name_lowercase,
      linkedin: applicationData.linkedin || '',
      anythingElse: applicationData.anythingElse || '',
      resumeSummary: null,
      status: 'Received',
      isRecommended: false,
      interviewAttended: false,
      suitability: {
        technical: 'undecided',
        nonTechnical: 'undecided',
      },
      ratings: {
        communication: 0,
        technical: 0,
        problemSolving: 0,
        teamFit: 0,
        confidence: 0,
        growthMindset: 0,
        leadership: 0,
        overall: 0,
      },
      remarks: '',
    };

    const docRef = await ApplicationDb.addApplication(newApplication);

    // Send confirmation email to applicant & notification email to assigned panel member
    const emailPromises: Promise<any>[] = [];

    const emailInput: ConfirmationEmailInput = {
      name: newApplication.name,
      email: newApplication.email,
      referenceId
    };
    emailPromises.push(
      sendConfirmationEmail(emailInput).catch(err => {
        console.error(`Confirmation email failed for ${referenceId}:`, err);
      })
    );

    if (assignedPanelEmail) {
      emailPromises.push(
        sendAssignmentEmail({
          panelMemberName: assignedPanelName || 'Panel Member',
          panelMemberEmail: assignedPanelEmail,
          applicantName: newApplication.name,
          applicantDomain: newApplication.technicalDomain,
          referenceId
        }).catch(err => {
          console.error(`Assignment email failed for ${referenceId}:`, err);
        })
      );
    }

    // Await all email dispatches to prevent serverless process cutoff
    await Promise.allSettled(emailPromises);

    // Process resume and evaluate candidate using AI synchronously
    let resumeSummary = null;
    try {
      let resumeDataUri = '';
      if (file && file.size > 0) {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        resumeDataUri = `data:${file.type};base64,${base64}`;
      }

      const evaluationInput: EvaluateCandidateInput = {
        resumeDataURI: resumeDataUri,
        cgpa: applicationData.cgpa,
        joinReason: applicationData.joinReason,
        aboutClub: applicationData.aboutClub,
        domain: applicationData.technicalDomain,
      };

      const result = await evaluateCandidate(evaluationInput);
      resumeSummary = result.summary;

      await ApplicationDb.updateApplicationDoc(docRef.id, { 
        resumeSummary: result.summary,
        isAiRecommended: result.isRecommended,
        isRecommended: false,
        isManualSelected: false,
        aiSuitability: result.suitability,
        aiRatings: result.ratings,
        ratings: {
          communication: 0,
          technical: 0,
          problemSolving: 0,
          teamFit: 0,
          confidence: 0,
          growthMindset: 0,
          leadership: 0,
          overall: 0,
        },
        manualRatings: {
          communication: 0,
          technical: 0,
          problemSolving: 0,
          teamFit: 0,
          confidence: 0,
          growthMindset: 0,
          leadership: 0,
          overall: 0,
        }
      });
    } catch (aiError) {
      console.error(`AI evaluation failed for ${referenceId}:`, aiError);
      await ApplicationDb.updateApplicationDoc(docRef.id, { resumeSummary: "AI evaluation failed." });
    }

    return { referenceId, summary: resumeSummary };
  }

  static async internalRegister(applicationData: any) {
    const referenceId = generateReferenceId();
    const rollNo_lowercase = applicationData.rollNo.toLowerCase();
    const name_lowercase = applicationData.name.toLowerCase();

    const emailExists = await ApplicationDb.checkEmailExists(applicationData.email);
    if (emailExists) {
      throw new Error('An application with this email address already exists.');
    }

    const rollNoExists = await ApplicationDb.checkRollNoExists(rollNo_lowercase);
    if (rollNoExists) {
      throw new Error('An application with this roll number already exists.');
    }

    const newApplication = {
      id: referenceId,
      submittedAt: new Date().toISOString(),
      isArchived: false,
      ...applicationData,
      rollNo_lowercase,
      name_lowercase,
      linkedin: applicationData.linkedin || '',
      resumeSummary: 'Manually registered by admin.',
      status: 'Received',
      isRecommended: false,
      interviewAttended: false,
      suitability: {
        technical: 'undecided',
        nonTechnical: 'undecided',
      },
      ratings: {
        communication: 0,
        technical: 0,
        problemSolving: 0,
        teamFit: 0,
        overall: 0,
      },
      remarks: applicationData.remarks || 'Manually registered by admin.',
      joinReason: applicationData.joinReason || '',
      aboutClub: applicationData.aboutClub || '',
      anythingElse: applicationData.anythingElse || '',
    };

    await ApplicationDb.addApplication(newApplication);

    return referenceId;
  }

  static async getApplications(params: any) {
    const { page = '1', limit: limitStr = '10', lastVisibleId, fetchAll = false, sortByRecommended, sortByPerformance } = params;
    const limitNumber = parseInt(limitStr, 10);

    const baseQuery = buildFilteredQuery(params);
    let finalQuery = baseQuery;

    const sortConstraints: any[] = [];
    if (sortByRecommended === 'true' || sortByPerformance === 'true') {
      // Note: ordering in DB
    }

    // Since sorting constraints are dynamic, we build the final query
    // To match getApplications parameters:
    const applicationsDocs = await ApplicationDb.getApplicationsDocs(baseQuery);

    const targetChapter = params.chapter || '3.0';
    const allChapterApps = applicationsDocs.docs
      .map(doc => {
        const data = doc.data();
        const hasManualReview = !!(
          (data.manualRatings && (data.manualRatings.overall > 0 || data.manualRatings.technical > 0 || data.manualRatings.communication > 0)) ||
          (data.ratings && data.aiRatings && data.ratings.overall !== data.aiRatings.overall && data.ratings.overall > 0) ||
          (data.status === 'Interviewed' || data.status === 'Interview Done' || data.status === 'Thank You For Attending')
        );
        const interviewAttended = hasManualReview ? true : !!data.interviewAttended;
        const status = (hasManualReview && (data.status === 'Received' || !data.status)) ? 'Interviewed' : (data.status || 'Received');
        return { 
          firestoreId: doc.id, 
          ...data,
          interviewAttended,
          status,
        } as Application;
      })
      .filter(app => {
        const appChapter = app.chapter || '3.0';
        return appChapter === targetChapter;
      });

    // Compute comprehensive field-level counts for filters and top dashboard
    const filterCounts = {
      total: allChapterApps.length,
      attended: allChapterApps.filter(a => !!a.interviewAttended).length,
      manualSelected: allChapterApps.filter(a => !!a.isManualSelected).length,
      aiRecommended: allChapterApps.filter(a => !!(a.isAiRecommended || a.isRecommended)).length,
      statuses: {} as Record<string, number>,
      years: {} as Record<string, number>,
      branches: {} as Record<string, number>,
      domains: {} as Record<string, number>,
    };

    for (const app of allChapterApps) {
      const s = app.status || 'Received';
      filterCounts.statuses[s] = (filterCounts.statuses[s] || 0) + 1;

      if (app.yearOfStudy) {
        filterCounts.years[app.yearOfStudy] = (filterCounts.years[app.yearOfStudy] || 0) + 1;
      }
      if (app.branch) {
        filterCounts.branches[app.branch] = (filterCounts.branches[app.branch] || 0) + 1;
      }
      if (app.technicalDomain) {
        filterCounts.domains[app.technicalDomain] = (filterCounts.domains[app.technicalDomain] || 0) + 1;
      }
      if (app.nonTechnicalDomain) {
        filterCounts.domains[app.nonTechnicalDomain] = (filterCounts.domains[app.nonTechnicalDomain] || 0) + 1;
      }
    }

    let applications = [...allChapterApps];

    // Attendance filter (Attended / Present)
    if (params.attendedOnly === 'true' || params.attendedOnly === true) {
      applications = applications.filter(app => !!app.interviewAttended);
    }

    // Status filter
    if (params.status && params.status !== 'all') {
      applications = applications.filter(app => (app.status || 'Received') === params.status);
    }

    // Year of study filter
    if (params.year && params.year !== 'all') {
      applications = applications.filter(app => app.yearOfStudy === params.year);
    }

    // Branch filter
    if (params.branch && params.branch !== 'all') {
      applications = applications.filter(app => app.branch === params.branch);
    }

    // Domain filter
    if (params.domain && params.domain !== 'all') {
      const nonTechDomains = ['event_management', 'public_relations', 'media_marketing', 'creativity'];
      const isNonTech = nonTechDomains.includes(params.domain);
      applications = applications.filter(app => isNonTech ? app.nonTechnicalDomain === params.domain : app.technicalDomain === params.domain);
    }

    // Flexible Search Filtering (Semi Search & Full Search)
    if (params.search && typeof params.search === 'string' && params.search.trim() !== '') {
      const searchTerm = params.search.trim().toLowerCase();
      const searchBy = params.searchBy || 'rollNo';
      const searchMode = params.searchMode || (searchBy === 'all' ? 'full' : 'semi');

      applications = applications.filter(app => {
        if (searchMode === 'full' || searchBy === 'all') {
          // Full Search: Match across all candidate profile fields & text
          const combinedFields = [
            app.name,
            app.rollNo,
            app.email,
            app.phone,
            app.id,
            app.firestoreId,
            app.technicalDomain,
            app.nonTechnicalDomain,
            app.branch,
            app.section,
            app.yearOfStudy,
            app.remarks,
            app.joinReason,
            app.aboutClub,
            app.anythingElse,
            app.resumeSummary,
            app.suitability?.technical,
            app.suitability?.nonTechnical
          ].filter(Boolean).join(' ').toLowerCase();

          return combinedFields.includes(searchTerm);
        } else if (searchBy === 'name') {
          return (app.name || '').toLowerCase().includes(searchTerm);
        } else if (searchBy === 'email') {
          return (app.email || '').toLowerCase().includes(searchTerm);
        } else if (searchBy === 'phone') {
          return (app.phone || '').toLowerCase().includes(searchTerm);
        } else if (searchBy === 'rollNo') {
          return (app.rollNo || '').toLowerCase().includes(searchTerm);
        } else {
          // Semi Search: Substring match on Roll Number, Name, or Branch
          const rollMatch = (app.rollNo || '').toLowerCase().includes(searchTerm);
          const nameMatch = (app.name || '').toLowerCase().includes(searchTerm);
          const branchMatch = (app.branch || '').toLowerCase().includes(searchTerm);
          return rollMatch || nameMatch || branchMatch;
        }
      });
    }

    // Selection status filtering (AI Selected vs Manual Selected)
    if (params.selectionFilter === 'ai') {
      applications = applications.filter(app => !!(app.isAiRecommended || app.isRecommended));
    } else if (params.selectionFilter === 'manual') {
      applications = applications.filter(app => !!app.isManualSelected);
    }

    // Client-side sorting for simplicity and performance with firestore indexes:
    if (sortByRecommended === 'true') {
      applications.sort((a, b) => {
        const aRec = (a.isManualSelected || a.isRecommended || a.isAiRecommended) ? 1 : 0;
        const bRec = (b.isManualSelected || b.isRecommended || b.isAiRecommended) ? 1 : 0;
        return bRec - aRec;
      });
    } else if (sortByPerformance === 'true') {
      applications.sort((a, b) => {
        const aScore = Math.max(a.manualRatings?.overall || 0, a.ratings?.overall || 0, a.aiRatings?.overall || 0);
        const bScore = Math.max(b.manualRatings?.overall || 0, b.ratings?.overall || 0, b.aiRatings?.overall || 0);
        return bScore - aScore;
      });
    } else {
      applications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }

    if (fetchAll) {
      return {
        applications,
        totalApplications: applications.length,
        totalPages: 1,
        currentPage: 1,
        filterCounts,
      };
    }

    const pageIndex = parseInt(page, 10);
    const startIndex = (pageIndex - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    const paginatedApps = applications.slice(startIndex, endIndex);
    const hasNextPage = applications.length > endIndex;

    return {
      applications: paginatedApps,
      totalApplications: applications.length,
      hasNextPage,
      currentPage: pageIndex,
      filterCounts,
    };
  }

  static async getApplicationById(id: string) {
    return await ApplicationDb.getApplicationByRefId(id);
  }

  static async getPanels() {
    return await ApplicationDb.getPanels();
  }

  static async toggleRecommendation(id: string, isRecommended: boolean) {
    await ApplicationDb.updateApplicationDoc(id, { 
      isRecommended,
      isManualSelected: isRecommended
    });
    return { success: true };
  }

  static async updateApplicantDetails(id: string, data: any) {
    const cleanData: Record<string, any> = { updatedAt: new Date().toISOString() };
    const allowedFields = [
      'name', 'email', 'phone', 'rollNo', 'branch', 'section', 'yearOfStudy',
      'cgpa', 'backlogs', 'technicalDomain', 'nonTechnicalDomain', 'linkedin',
      'assignedTo', 'status', 'remarks'
    ];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        cleanData[field] = data[field];
      }
    }
    if (data.name) cleanData.name_lowercase = data.name.toLowerCase();
    if (data.rollNo) cleanData.rollNo_lowercase = data.rollNo.toLowerCase();

    await ApplicationDb.updateApplicationDoc(id, cleanData);
    return { success: true };
  }

  static async deleteApplication(id: string) {
    await ApplicationDb.deleteApplicationDoc(id);
    return { success: true };
  }

  static async saveApplicationReview(data: any) {
    // Fetch applicant details needed for the status email
    const docSnap = await ApplicationDb.getApplicationDoc(data.id);
    const existing = docSnap.exists() ? docSnap.data() : null;

    // Automatic rule: human manual review automatically marks attended and changes status to 'Interviewed'
    const finalStatus = (data.status === 'Received' || !data.status) ? 'Interviewed' : data.status;

    await ApplicationDb.updateApplicationDoc(data.id, {
      status: finalStatus,
      interviewAttended: true, // Automatically set attended on manual review
      isRecommended: data.isRecommended,
      isManualSelected: data.isManualSelected !== undefined ? data.isManualSelected : data.isRecommended,
      suitability: data.suitability,
      ratings: data.ratings,
      manualRatings: data.ratings,
      remarks: data.remarks || '',
    });

    // Send status update email whenever status changes or upon manual review
    if (existing && existing.email) {
      try {
        await sendStatusUpdateEmail({
          name: existing.name || 'Applicant',
          email: existing.email,
          status: finalStatus,
          referenceId: existing.id || existing.rollNo || data.id || 'MLSC-SVEC',
        });
      } catch (emailError) {
        console.error(`Failed to send status update email to ${existing.email}:`, emailError);
      }
    }
  }

  static async syncReviewedApplications() {
    const { updatedCount, applicantsToEmail } = await ApplicationDb.syncReviewedApplications();

    let emailCount = 0;
    for (const applicant of applicantsToEmail) {
      try {
        await sendStatusUpdateEmail(applicant);
        emailCount++;
      } catch (emailError) {
        console.error(`Failed to send sync status update email to ${applicant.email}:`, emailError);
      }
    }

    return { updatedCount, emailCount };
  }

  static async updateAttendance(firestoreId: string, attended: boolean) {
    await ApplicationDb.updateApplicationDoc(firestoreId, {
      interviewAttended: attended,
    });
  }

  static async bulkUpdateStatus(filters: any, newStatus: string) {
    const { applications } = await this.getApplications({ ...filters, fetchAll: true });

    if (!applications || applications.length === 0) {
      return { updatedCount: 0, sentEmailCount: 0 };
    }

    const applicantsToEmail = await ApplicationDb.executeBulkStatusUpdateForList(applications, newStatus);

    (async () => {
      let sentCount = 0;
      for (const applicant of applicantsToEmail) {
        try {
          await sendStatusUpdateEmail(applicant);
          sentCount++;
        } catch (emailError) {
          console.error(`Failed to send status update email to ${applicant.email}:`, emailError);
        }
      }
    })();

    return { updatedCount: applications.length, sentEmailCount: applicantsToEmail.length };
  }

  static async bulkUpdateFromCsv(hiredCandidates: { rollNo: string }[]) {
    const hiredRollNos = new Set(hiredCandidates.map(c => c.rollNo.toLowerCase()));

    // Get default category id
    const categoriesSnapshot = await ApplicationDb.getTeamCategoriesDocs();
    const technicalCat = categoriesSnapshot.docs.find(doc => doc.data().name === 'Technical Team');
    const defaultCategoryId = technicalCat ? technicalCat.id : null;

    const { applicantsToEmail, membersToInvite } = await ApplicationDb.executeBulkUpdateFromCsv(hiredRollNos, defaultCategoryId);

    (async () => {
      for (const member of membersToInvite) {
        try {
          await TeamService.inviteTeamMember(member);
        } catch (inviteError) {
          console.error(`Failed to invite team member ${member.email}:`, inviteError);
        }
      }

      for (const applicant of applicantsToEmail) {
        try {
          await sendStatusUpdateEmail(applicant);
        } catch (emailError) {
          console.error(`Failed to send status update email to ${applicant.email}:`, emailError);
        }
      }
    })();

    return applicantsToEmail.length + membersToInvite.length;
  }

  static async getHiredCandidates() {
    const querySnapshot = await ApplicationDb.getHiredCandidatesDocs();
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        referenceId: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        rollNo: data.rollNo,
        branch: data.branch,
        section: data.section,
        yearOfStudy: data.yearOfStudy,
        cgpa: data.cgpa,
        backlogs: data.backlogs,
        technicalDomain: data.technicalDomain,
        nonTechnicalDomain: data.nonTechnicalDomain,
        linkedin: data.linkedin,
        submittedAt: data.submittedAt,
        overallRating: data.ratings?.overall || 0,
      };
    });
  }

  static async getAnalyticsData(panelDomain?: string, chapter: string = '3.0') {
    const params = panelDomain ? { panelDomain } : {};
    const q = buildFilteredQuery(params);

    const allApplicationsSnapshot = await ApplicationDb.getApplicationsDocs(q);
    const applications = allApplicationsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        const hasManualReview = !!(
          (data.manualRatings && (data.manualRatings.overall > 0 || data.manualRatings.technical > 0 || data.manualRatings.communication > 0)) ||
          (data.ratings && data.aiRatings && data.ratings.overall !== data.aiRatings.overall && data.ratings.overall > 0) ||
          (data.status === 'Interviewed' || data.status === 'Interview Done' || data.status === 'Thank You For Attending')
        );
        const interviewAttended = hasManualReview ? true : !!data.interviewAttended;
        const status = (hasManualReview && (data.status === 'Received' || !data.status)) ? 'Interviewed' : (data.status || 'Received');
        return {
          ...data,
          interviewAttended,
          status,
        } as Application;
      })
      .filter(app => (app.chapter || '3.0') === chapter);

    const totalApplications = applications.length;
    const attendedCount = applications.filter(app => app.interviewAttended).length;

    const techDomainCounts: { [key: string]: number } = {};
    const techDomainAttendedCounts: { [key: string]: number } = {};
    const nonTechDomainCounts: { [key: string]: number } = {};
    const statusCounts: { [key: string]: number } = {};
    const branchCounts: { [key: string]: number } = {};
    const yearCounts: { [key: string]: number } = {};
    let hiredCount = 0;
    let rejectedCount = 0;

    const techDomainLabels: Record<string, string> = {
      gen_ai: "Generative AI",
      ds_ml: "Data Science & ML",
      azure: "Azure Cloud",
      web_app: "Web & App Development",
    };

    const nonTechDomainLabels: Record<string, string> = {
      event_management: "Event Management",
      public_relations: "Public Relations",
      media_marketing: "Media Marketing",
      creativity: "Creativity",
    };

    // Find all actual submission dates to establish dynamic boundaries
    const submissionDates = applications
      .map(app => app.submittedAt ? app.submittedAt.split('T')[0] : null)
      .filter((d): d is string => !!d)
      .sort();

    const timelineDataMap: { [dateStr: string]: { desktop: number; mobile: number } } = {};

    if (submissionDates.length > 0) {
      const start = new Date(submissionDates[0]);
      const end = new Date(submissionDates[submissionDates.length - 1]);
      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        timelineDataMap[dateStr] = { desktop: 0, mobile: 0 };
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Fallback: Pre-populate last 90 days with 0 counts if no data exists
      const today = new Date();
      for (let i = 90; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        timelineDataMap[dateStr] = { desktop: 0, mobile: 0 };
      }
    }

    const nonTechDomainAttendedCounts: { [key: string]: number } = {};

    applications.forEach(app => {
      const status = app.status || 'Received';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (status === 'Hired') hiredCount++;
      if (status === 'Rejected') rejectedCount++;

      const techDomainKey = app.technicalDomain;
      const techDomainName = techDomainLabels[techDomainKey] || techDomainKey;
      if (techDomainName) {
        techDomainCounts[techDomainName] = (techDomainCounts[techDomainName] || 0) + 1;
        if (app.interviewAttended) {
          techDomainAttendedCounts[techDomainName] = (techDomainAttendedCounts[techDomainName] || 0) + 1;
        }
      }

      const nonTechDomainKey = app.nonTechnicalDomain;
      const nonTechDomainName = nonTechDomainLabels[nonTechDomainKey] || nonTechDomainKey;
      if (nonTechDomainName) {
        nonTechDomainCounts[nonTechDomainName] = (nonTechDomainCounts[nonTechDomainName] || 0) + 1;
        if (app.interviewAttended) {
          nonTechDomainAttendedCounts[nonTechDomainName] = (nonTechDomainAttendedCounts[nonTechDomainName] || 0) + 1;
        }
      }

      const branch = app.branch || 'Unknown';
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
      const year = app.yearOfStudy || 'Unknown';
      yearCounts[year] = (yearCounts[year] || 0) + 1;

      if (app.submittedAt) {
        const dateStr = app.submittedAt.split('T')[0];
        if (timelineDataMap[dateStr] !== undefined) {
          if (app.technicalDomain) {
            timelineDataMap[dateStr].desktop++;
          }
          if (app.nonTechnicalDomain) {
            timelineDataMap[dateStr].mobile++;
          }
        }
      }
    });

    const timelineData = Object.entries(timelineDataMap)
      .map(([date, counts]) => ({
        date,
        desktop: counts.desktop,
        mobile: counts.mobile,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const techDomainData = Object.entries(techDomainCounts).map(([name, count]) => ({
      name,
      count,
      attended: techDomainAttendedCounts[name] || 0
    }));
    const nonTechDomainData = Object.entries(nonTechDomainCounts).map(([name, count]) => ({
      name,
      count,
      attended: nonTechDomainAttendedCounts[name] || 0
    }));
    const statusData = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));
    const branchData = Object.entries(branchCounts).map(([name, count]) => ({ name, count }));
    const yearData = Object.entries(yearCounts).map(([name, count]) => ({ name, count }));

    return {
      totalApplications,
      attendedCount,
      hiredCount,
      rejectedCount,
      techDomainData,
      nonTechDomainData,
      statusData,
      branchData,
      yearData,
      timelineData,
    };
  }

  static async getInterviewAnalyticsData(chapter: string = '3.0') {
    const q = buildFilteredQuery({});

    const allApplicationsSnapshot = await ApplicationDb.getApplicationsDocs(q);
    const applications = allApplicationsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        const hasManualReview = !!(
          (data.manualRatings && (data.manualRatings.overall > 0 || data.manualRatings.technical > 0 || data.manualRatings.communication > 0)) ||
          (data.ratings && data.aiRatings && data.ratings.overall !== data.aiRatings.overall && data.ratings.overall > 0) ||
          (data.status === 'Interviewed' || data.status === 'Interview Done' || data.status === 'Thank You For Attending')
        );
        const interviewAttended = hasManualReview ? true : !!data.interviewAttended;
        const status = (hasManualReview && (data.status === 'Received' || !data.status)) ? 'Interviewed' : (data.status || 'Received');
        return {
          ...data,
          interviewAttended,
          status,
        } as Application;
      })
      .filter(app => (app.chapter || '3.0') === chapter && app.interviewAttended);

    const totalApplications = applications.length;

    const techDomainCounts: { [key: string]: number } = {};
    const techDomainAttendedCounts: { [key: string]: number } = {};
    const nonTechDomainCounts: { [key: string]: number } = {};
    const statusCounts: { [key: string]: number } = {};
    const branchCounts: { [key: string]: number } = {};
    const yearCounts: { [key: string]: number } = {};
    let hiredCount = 0;
    let rejectedCount = 0;

    const techDomainLabels: Record<string, string> = {
      gen_ai: "Generative AI",
      ds_ml: "Data Science & ML",
      azure: "Azure Cloud",
      web_app: "Web & App Development",
    };

    const nonTechDomainLabels: Record<string, string> = {
      event_management: "Event Management",
      public_relations: "Public Relations",
      media_marketing: "Media Marketing",
      creativity: "Creativity",
    };

    // Find all actual submission dates to establish dynamic boundaries
    const submissionDates = applications
      .map(app => app.submittedAt ? app.submittedAt.split('T')[0] : null)
      .filter((d): d is string => !!d)
      .sort();

    const timelineDataMap: { [dateStr: string]: { desktop: number; mobile: number } } = {};

    if (submissionDates.length > 0) {
      const start = new Date(submissionDates[0]);
      const end = new Date(submissionDates[submissionDates.length - 1]);
      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        timelineDataMap[dateStr] = { desktop: 0, mobile: 0 };
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Fallback: Pre-populate last 90 days with 0 counts if no data exists
      const today = new Date();
      for (let i = 90; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        timelineDataMap[dateStr] = { desktop: 0, mobile: 0 };
      }
    }

    const nonTechDomainAttendedCounts: { [key: string]: number } = {};

    applications.forEach(app => {
      const status = app.status || 'Received';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (status === 'Hired') hiredCount++;
      if (status === 'Rejected') rejectedCount++;

      const techDomainKey = app.technicalDomain;
      const techDomainName = techDomainLabels[techDomainKey] || techDomainKey;
      if (techDomainName) {
        techDomainCounts[techDomainName] = (techDomainCounts[techDomainName] || 0) + 1;
        // Since query is attendedOnly: true, count and attended will be same here
        techDomainAttendedCounts[techDomainName] = (techDomainAttendedCounts[techDomainName] || 0) + 1;
      }

      const nonTechDomainKey = app.nonTechnicalDomain;
      const nonTechDomainName = nonTechDomainLabels[nonTechDomainKey] || nonTechDomainKey;
      if (nonTechDomainName) {
        nonTechDomainCounts[nonTechDomainName] = (nonTechDomainCounts[nonTechDomainName] || 0) + 1;
        // Since query is attendedOnly: true, count and attended will be same here
        nonTechDomainAttendedCounts[nonTechDomainName] = (nonTechDomainAttendedCounts[nonTechDomainName] || 0) + 1;
      }

      const branch = app.branch || 'Unknown';
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
      const year = app.yearOfStudy || 'Unknown';
      yearCounts[year] = (yearCounts[year] || 0) + 1;

      if (app.submittedAt) {
        const dateStr = app.submittedAt.split('T')[0];
        if (timelineDataMap[dateStr] !== undefined) {
          if (app.technicalDomain) {
            timelineDataMap[dateStr].desktop++;
          }
          if (app.nonTechnicalDomain) {
            timelineDataMap[dateStr].mobile++;
          }
        }
      }
    });

    const timelineData = Object.entries(timelineDataMap)
      .map(([date, counts]) => ({
        date,
        desktop: counts.desktop,
        mobile: counts.mobile,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const techDomainData = Object.entries(techDomainCounts).map(([name, count]) => ({
      name,
      count,
      attended: techDomainAttendedCounts[name] || 0
    }));
    const nonTechDomainData = Object.entries(nonTechDomainCounts).map(([name, count]) => ({
      name,
      count,
      attended: nonTechDomainAttendedCounts[name] || 0
    }));
    const statusData = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));
    const branchData = Object.entries(branchCounts).map(([name, count]) => ({ name, count }));
    const yearData = Object.entries(yearCounts).map(([name, count]) => ({ name, count }));

    return {
      totalApplications,
      attendedCount: totalApplications,
      hiredCount,
      rejectedCount,
      techDomainData,
      nonTechDomainData,
      statusData,
      branchData,
      yearData,
      timelineData,
    };
  }

  static async setDeadline(deadline: Date) {
    await ApplicationDb.setDeadline(deadline.toISOString());
  }

  static async getDeadline() {
    return await ApplicationDb.getDeadline();
  }

  static async getHiringStatus() {
    const activeChapter = await ApplicationDb.getActiveChapter();
    const settings = await ApplicationDb.getChapterSettings(activeChapter);
    const deadline = await ApplicationDb.getDeadline();

    const registrationLimit = settings.registrationLimit || 0;
    let currentCount = 0;
    let isLimitReached = false;

    if (registrationLimit > 0) {
      currentCount = await ApplicationDb.getActiveApplicationsCount(activeChapter);
      if (currentCount >= registrationLimit) {
        isLimitReached = true;
      }
    }

    const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false;
    const isHiringOpen = !!settings.isHiringOpen && !isLimitReached && !isDeadlinePassed;

    return {
      isHiringOpen,
      isHiringOpenRaw: !!settings.isHiringOpen,
      isLimitReached,
      isDeadlinePassed,
      registrationLimit,
      currentCount,
      activeChapter,
    };
  }

  static async toggleHiringStatus(isOpen: boolean) {
    const activeChapter = await ApplicationDb.getActiveChapter();
    await ApplicationDb.updateChapterSettings(activeChapter, { isHiringOpen: isOpen });
  }

  static async finalizeHiringCycle() {
    const activeMembersSnapshotDocs = await TeamDb.getActiveMembers();

    const hiredAppsDocs = await ApplicationDb.getHiredCandidatesDocs();

    const allActiveAppsDocs = await ApplicationDb.getAllApplicationsDocs();

    const categoriesSnapshot = await ApplicationDb.getTeamCategoriesDocs();
    const defaultCategoryId = !categoriesSnapshot.empty ? categoriesSnapshot.docs[0].id : '';

    const membersToInvite = await ApplicationDb.executeFinalizeHiringCycle(
      activeMembersSnapshotDocs,
      hiredAppsDocs,
      allActiveAppsDocs,
      defaultCategoryId
    );

    // Send background invites
    (async () => {
      for (const member of membersToInvite) {
        try {
          await TeamService.inviteTeamMember(member);
        } catch (inviteError) {
          console.error(`Failed to invite team member ${member.email}:`, inviteError);
        }
      }
    })();

    // Close hiring status
    await this.toggleHiringStatus(false);
  }

  static async cleanChapterApplicants(chapter: string = '4.0') {
    return await ApplicationDb.cleanChapterApplicants(chapter);
  }
}
