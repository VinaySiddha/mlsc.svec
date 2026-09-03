import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  writeBatch,
  Query,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';

export function buildFilteredQuery(params: {
  panelDomain?: string;
  search?: string;
  searchBy?: string;
  status?: string;
  year?: string;
  branch?: string;
  domain?: string;
  attendedOnly?: boolean | string;
  sortByRecommended?: string;
}) {
  const { panelDomain } = params;
  let q: Query<DocumentData> = collection(db, 'applications');
  const constraints: QueryConstraint[] = [
    where("isArchived", "==", false)
  ];

  if (panelDomain) {
    const nonTechDomains = ['event_management', 'public_relations', 'media_marketing', 'creativity'];
    const isNonTech = nonTechDomains.includes(panelDomain);
    constraints.push(where(isNonTech ? 'nonTechnicalDomain' : 'technicalDomain', '==', panelDomain));
  }

  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  return q;
}

export class ApplicationDb {
  static async checkEmailExists(email: string, chapter: string = '3.0') {
    const applicationsRef = collection(db, "applications");
    const emailQuery = query(applicationsRef, where("email", "==", email));
    const snapshot = await getDocs(emailQuery);
    if (snapshot.empty) return false;
    return snapshot.docs.some(doc => {
      const docChapter = doc.data().chapter || '3.0';
      return docChapter === chapter;
    });
  }

  static async checkRollNoExists(rollNoLowercase: string, chapter: string = '3.0') {
    const applicationsRef = collection(db, "applications");
    const rollNoQuery = query(applicationsRef, where("rollNo_lowercase", "==", rollNoLowercase));
    const snapshot = await getDocs(rollNoQuery);
    if (snapshot.empty) return false;
    return snapshot.docs.some(doc => {
      const docChapter = doc.data().chapter || '3.0';
      return docChapter === chapter;
    });
  }

  static async addApplication(newApplication: any) {
    const applicationsRef = collection(db, "applications");
    const docRef = await addDoc(applicationsRef, newApplication);
    await updateDoc(docRef, { firestoreId: docRef.id });
    return docRef;
  }

  static async updateApplicationDoc(idOrRefId: string, dataToUpdate: any) {
    if (!idOrRefId) throw new Error("No application ID provided.");
    
    // First try direct firestoreId
    const directDocRef = doc(db, 'applications', idOrRefId);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      await updateDoc(directDocRef, dataToUpdate);
      return;
    }

    // Fallback search by reference ID (id field)
    const q = query(collection(db, 'applications'), where('id', '==', idOrRefId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      await updateDoc(querySnapshot.docs[0].ref, dataToUpdate);
      return;
    }

    throw new Error(`Application not found with ID: ${idOrRefId}`);
  }

  static async deleteApplicationDoc(idOrRefId: string) {
    if (!idOrRefId) throw new Error("No application ID provided.");
    
    const directDocRef = doc(db, 'applications', idOrRefId);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      await deleteDoc(directDocRef);
      return;
    }

    const q = query(collection(db, 'applications'), where('id', '==', idOrRefId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      await deleteDoc(querySnapshot.docs[0].ref);
      return;
    }

    throw new Error(`Application not found with ID: ${idOrRefId}`);
  }

  static async getApplicationByRefId(refId: string) {
    const q = query(collection(db, 'applications'), where('id', '==', refId), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnap = querySnapshot.docs[0];
    return { firestoreId: docSnap.id, ...docSnap.data() } as any;
  }

  static async getApplicationDoc(firestoreId: string) {
    return await getDoc(doc(db, 'applications', firestoreId));
  }

  static async getPanels() {
    const panelsCol = collection(db, 'panels');
    const panelSnapshot = await getDocs(panelsCol);
    return panelSnapshot.docs.map(doc => doc.data());
  }

  static async getApplicationsCount(q: Query<DocumentData>) {
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  static async getApplicationsDocs(q: Query<DocumentData>) {
    return await getDocs(q);
  }

  static async getDeadline() {
    const settingsRef = doc(db, 'settings', 'global');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists() && settingsSnap.data().deadline) {
      return settingsSnap.data().deadline;
    }
    return null;
  }

  static async setDeadline(deadline: string) {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, { deadline }, { merge: true });
  }

  static async getHiringStatus() {
    const settingsRef = doc(db, 'settings', 'global');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      return settingsSnap.data().isHiringOpen || false;
    }
    return false;
  }

  static async setHiringStatus(isOpen: boolean) {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, { isHiringOpen: isOpen }, { merge: true });
  }

  static async getAllApplicationsDocs() {
    const applicationsRef = collection(db, 'applications');
    return await getDocs(applicationsRef);
  }

  static async getHiredCandidatesDocs() {
    const q = query(collection(db, 'applications'), where('status', '==', 'Hired'));
    return await getDocs(q);
  }

  static async getTeamCategoriesDocs() {
    const categoriesRef = collection(db, 'teamCategories');
    return await getDocs(categoriesRef);
  }

  static async executeBulkStatusUpdate(querySnapshot: any, newStatus: string) {
    const batch = writeBatch(db);
    const applicantsToEmail: any[] = [];

    querySnapshot.docs.forEach((documentSnapshot: any) => {
      const data = documentSnapshot.data();
      if (data.status !== newStatus) {
        batch.update(documentSnapshot.ref, { status: newStatus });
        applicantsToEmail.push({
          name: data.name,
          email: data.email,
          status: newStatus,
          referenceId: data.id || data.rollNo || documentSnapshot.id || 'MLSC-SVEC',
        });
      }
    });

    await batch.commit();
    return applicantsToEmail;
  }

  static async executeBulkStatusUpdateForList(applications: any[], newStatus: string) {
    let batch = writeBatch(db);
    let operationCount = 0;
    const applicantsToEmail: any[] = [];

    const commitBatchIfNeeded = async () => {
      if (operationCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    };

    for (const app of applications) {
      if (app.status !== newStatus) {
        const docId = app.firestoreId || app.id;
        if (docId) {
          const docRef = doc(db, 'applications', docId);
          batch.update(docRef, { status: newStatus });
          operationCount++;
          await commitBatchIfNeeded();

          applicantsToEmail.push({
            name: app.name,
            email: app.email,
            status: newStatus,
            referenceId: app.id || app.rollNo || app.firestoreId || 'MLSC-SVEC',
          });
        }
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    return applicantsToEmail;
  }

  static async executeBulkUpdateFromCsv(hiredRollNos: Set<string>, defaultCategoryId: string | null) {
    const allApplicationsSnapshot = await getDocs(collection(db, 'applications'));
    const batch = writeBatch(db);
    const applicantsToEmail: any[] = [];
    const membersToInvite: any[] = [];

    for (const doc of allApplicationsSnapshot.docs) {
      const app = doc.data();
      const isHired = hiredRollNos.has(app.rollNo_lowercase);

      if (isHired) {
        if (app.status !== 'Hired') {
          batch.update(doc.ref, { status: 'Hired' });
          if (defaultCategoryId) {
            membersToInvite.push({
              name: app.name,
              email: app.email,
              role: 'Team Member',
              categoryId: defaultCategoryId
            });
          }
        }
      } else {
        if (app.status !== 'Hired' && app.status !== 'Rejected') {
          batch.update(doc.ref, { status: 'Rejected' });
          applicantsToEmail.push({
            name: app.name,
            email: app.email,
            status: 'Rejected',
            referenceId: app.id,
          });
        }
      }
    }

    await batch.commit();
    return { applicantsToEmail, membersToInvite };
  }

  static async executeFinalizeHiringCycle(
    activeMembersSnapshot: any,
    hiredAppsSnapshot: any,
    allActiveAppsSnapshot: any,
    defaultCategoryId: string
  ) {
    const categoriesRef = collection(db, 'teamCategories');
    let batch = writeBatch(db);
    let operationCount = 0;

    const commitBatchIfNeeded = async () => {
      if (operationCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    };

    // 1. Archive active team members
    for (const docSnap of activeMembersSnapshot.docs) {
      batch.update(docSnap.ref, { status: 'alumni' });
      operationCount++;
      await commitBatchIfNeeded();
    }

    // 2. Prep hired members list
    const membersToInvite: any[] = [];
    for (const docSnap of hiredAppsSnapshot.docs) {
      const app = docSnap.data();
      const catQuery = query(categoriesRef, where('subDomain', '==', app.technicalDomain));
      const catSnapshot = await getDocs(catQuery);
      const categoryId = !catSnapshot.empty ? catSnapshot.docs[0].id : defaultCategoryId;

      membersToInvite.push({
        name: app.name,
        email: app.email,
        role: 'Team Member',
        categoryId
      });
    }

    // 3. Archive all active apps
    for (const docSnap of allActiveAppsSnapshot.docs) {
      batch.update(docSnap.ref, { isArchived: true });
      operationCount++;
      await commitBatchIfNeeded();
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    return membersToInvite;
  }

  static async getGlobalSettingsDoc() {
    return await getDoc(doc(db, 'settings', 'global'));
  }

  static async getActiveChapter() {
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    if (settingsSnap.exists() && settingsSnap.data().activeChapter) {
      return settingsSnap.data().activeChapter;
    }
    return '3.0';
  }

  static async getDomainPanelMembers(domain: string) {
    const usersRef = collection(db, "users");
    try {
      const q = query(
        usersRef, 
        where("role", "in", ["panel", "common_panel"])
      );
      const snapshot = await getDocs(q);
      const allPanels = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() } as any))
        .filter(user => !user.disabled && user.email);

      // First check for domain-matched panels
      const domainMatches = allPanels.filter(p => p.role === 'panel' && p.domain === domain);
      if (domainMatches.length > 0) {
        return domainMatches;
      }

      // Fallback to common panel members if no domain-specific panel exists
      const commonMatches = allPanels.filter(p => p.role === 'common_panel');
      if (commonMatches.length > 0) {
        return commonMatches;
      }

      return allPanels;
    } catch (e) {
      console.error("Error fetching domain panel members:", e);
      return [];
    }
  }

  static async getPanelAssignmentCounts(domain: string, activeChapter: string) {
    const appsRef = collection(db, "applications");
    const q = query(
      appsRef,
      where("isArchived", "==", false),
      where("chapter", "==", activeChapter)
    );
    // Since we can't easily query by domain and chapter and group by without a composite index,
    // we'll just fetch active apps in the chapter and filter/count manually. This is fast enough for ~500 apps.
    const snapshot = await getDocs(q);
    const counts: Record<string, number> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.assignedTo && data.technicalDomain === domain) {
        counts[data.assignedTo] = (counts[data.assignedTo] || 0) + 1;
      }
    });
    return counts;
  }

  static async setActiveChapter(chapter: string) {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, { activeChapter: chapter }, { merge: true });
  }

  static async getChapterSettings(chapter: string) {
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    if (settingsSnap.exists() && settingsSnap.data().chapters?.[chapter]) {
      const data = settingsSnap.data().chapters[chapter];
      return {
        isHiringOpen: data.isHiringOpen ?? false,
        isTeamVisible: data.isTeamVisible ?? true,
        registrationLimit: data.registrationLimit ?? 0,
      };
    }
    return {
      isHiringOpen: false,
      isTeamVisible: true,
      registrationLimit: 0,
    };
  }

  static async updateChapterSettings(
    chapter: string, 
    values: { isHiringOpen?: boolean; isTeamVisible?: boolean; registrationLimit?: number }
  ) {
    const settingsRef = doc(db, 'settings', 'global');
    const settingsSnap = await getDoc(settingsRef);
    const chapters = settingsSnap.exists() ? settingsSnap.data().chapters || {} : {};
    
    // Seed default configurations for legacy chapters if they do not exist
    if (!chapters['3.0']) {
      chapters['3.0'] = { isHiringOpen: false, isTeamVisible: true, registrationLimit: 0 };
    }
    if (!chapters['4.0']) {
      chapters['4.0'] = { isHiringOpen: true, isTeamVisible: true, registrationLimit: 0 };
    }

    chapters[chapter] = {
      ...(chapters[chapter] || { isHiringOpen: false, isTeamVisible: true, registrationLimit: 0 }),
      ...values,
    };
    await setDoc(settingsRef, { chapters }, { merge: true });
  }

  static async getActiveApplicationsCount(chapter: string = '3.0'): Promise<number> {
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('isArchived', '==', false));
    const snapshot = await getDocs(q);
    let count = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      const docChapter = data.chapter || '3.0';
      if (docChapter === chapter) {
        count++;
      }
    });
    return count;
  }

  static async getChapterApplicationsCounts(): Promise<Record<string, number>> {
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('isArchived', '==', false));
    const snapshot = await getDocs(q);
    const counts: Record<string, number> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const docChapter = data.chapter || '3.0';
      counts[docChapter] = (counts[docChapter] || 0) + 1;
    });
    return counts;
  }

  static async cleanChapterApplicants(chapter: string = '4.0'): Promise<number> {
    const appsRef = collection(db, 'applications');
    const snapshot = await getDocs(appsRef);
    let cleanedCount = 0;
    const batch = writeBatch(db);
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const docChapter = String(data.chapter || '3.0');
      const targetChapter = String(chapter);
      if (docChapter === targetChapter || (targetChapter.startsWith('4') && docChapter.startsWith('4'))) {
        batch.update(docSnap.ref, {
          status: 'Received',
          interviewAttended: false,
          isManualSelected: false,
          isRecommended: false,
          manualRatings: null,
          ratings: null,
          remarks: '',
        });
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      await batch.commit();
    }
    return cleanedCount;
  }

  static async syncReviewedApplications(): Promise<{ updatedCount: number; applicantsToEmail: any[] }> {
    const appsRef = collection(db, 'applications');
    const snapshot = await getDocs(appsRef);
    let updatedCount = 0;
    let operationCount = 0;
    let batch = writeBatch(db);
    const applicantsToEmail: any[] = [];

    const commitBatchIfNeeded = async () => {
      if (operationCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    };

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const hasManualReview = (
        (data.manualRatings && (data.manualRatings.overall > 0 || data.manualRatings.technical > 0 || data.manualRatings.communication > 0)) ||
        (data.ratings && data.aiRatings && data.ratings.overall !== data.aiRatings.overall && data.ratings.overall > 0) ||
        (data.status === 'Interviewed' || data.status === 'Interview Done' || data.status === 'Thank You For Attending')
      );

      if (hasManualReview) {
        const updates: Record<string, any> = {};
        let needsUpdate = false;

        if (!data.interviewAttended) {
          updates.interviewAttended = true;
          needsUpdate = true;
        }

        // Change status to Interviewed if still Received or empty
        if (data.status === 'Received' || !data.status) {
          updates.status = 'Interviewed';
          needsUpdate = true;
        }

        if (needsUpdate) {
          batch.update(docSnap.ref, updates);
          updatedCount++;
          operationCount++;
          await commitBatchIfNeeded();

          const finalStatus = updates.status || data.status;
          if (data.email) {
            applicantsToEmail.push({
              name: data.name,
              email: data.email,
              status: finalStatus,
              referenceId: data.id || data.rollNo || docSnap.id || 'MLSC-SVEC',
            });
          }
        }
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    return { updatedCount, applicantsToEmail };
  }
}

