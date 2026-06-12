'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { logActivityAction, logErrorAction } from './log-actions';
import { sendEmailDirect } from '@/lib/mail-sender';

const ADMIN_EMAIL = 'vinaysiddha19@gmail.com';

export async function submitContributorApplicationAction(
  name: string,
  email: string,
  github: string,
  department: string,
  skills: string,
  message: string
) {
  try {
    const appData = {
      name,
      email,
      github: github || '',
      department,
      skills,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'contributions'), appData);

    // Log as activity
    await logActivityAction(
      `Contributor Application: ${name}`,
      `${name} applied for open-source contribution in the ${department} department.`,
      undefined,
      name,
      email
    );

    // Email to Admin
    const adminSubject = `[Contributor App] New Submission: ${name} (${department})`;
    const adminHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); height: 8px;"></div>
        <div style="background-color: #4f46e5; color: #ffffff; text-align: center; padding: 16px 20px; font-size: 20px; font-weight: 600;">
          🛠️ New Contributor Request Received!
        </div>
        <div style="padding: 25px;">
          <p style="font-size: 16px;">Hello Admin,</p>
          <p style="font-size: 15px;">A new open-source contributor request has been submitted. Details are below:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 130px;">Name:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Email:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${email}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">GitHub Profile:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">@${github || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Department:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${department}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Skills:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${skills}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; vertical-align: top;">Message:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; white-space: pre-wrap;">${message}</td></tr>
          </table>
        </div>
      </div>
    `;
    await sendEmailDirect(ADMIN_EMAIL, adminSubject, adminHtml);

    // Email to Contributor
    const userSubject = `Contributor Application Received - MLSC SVEC`;
    const userHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0056b3 0%, #007bff 100%); height: 8px;"></div>
        <div style="padding: 30px 25px;">
          <h2 style="color: #222; font-size: 22px; font-weight: 700; margin-bottom: 15px;">Application Received</h2>
          <p style="font-size: 15px; color: #555;">Hi ${name},</p>
          <p style="font-size: 15px; color: #555;">
            You have successfully submitted the contributor request form. Soon you will get the access after the verification process is completed by our core team.
          </p>
          <p style="font-size: 15px; color: #555; margin-top: 15px;">
            Thank you for your interest in building open source software for MLSC SVEC!
          </p>
          <p style="margin-top: 30px; font-weight: 500; color: #222;">Best regards,<br><strong>MLSC Tech Lead</strong></p>
        </div>
      </div>
    `;
    await sendEmailDirect(email, userSubject, userHtml);

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error submitting contributor request:', error);
    await logErrorAction(`Failed Contributor Application: ${name}`, error.message, undefined, name);
    return { success: false, error: error.message };
  }
}

export async function approveContributorAction(appId: string) {
  try {
    const docRef = doc(db, 'contributions', appId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Contributor application not found.' };
    }

    const app = docSnap.data();
    await updateDoc(docRef, { status: 'approved', approvedAt: new Date().toISOString() });

    // Log as activity
    await logActivityAction(
      `Contributor Approved`,
      `Contributor application #${appId} for ${app.name} has been approved`
    );

    const githubRepoLink = 'https://github.com/VinaySiddha/mlsc.svec';
    const branchGuidelines = 'feature/your-github-username';

    // Send email to Contributor
    const subject = `Welcome to the MLSC Developer Force, ${app.name}! 🎉`;
    const userHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 8px;"></div>
        <div style="padding: 30px 25px;">
          <h2 style="color: #222; font-size: 22px; font-weight: 700; margin-bottom: 15px;">Congratulations, You're Approved!</h2>
          <p style="font-size: 15px; color: #555;">Hi ${app.name},</p>
          <p style="font-size: 15px; color: #555;">
            Your open source contributor status has been approved successfully by our super admin!
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #166534;">GitHub Guidelines:</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #166534;">
              <strong>Repository Link:</strong> <a href="${githubRepoLink}" target="_blank" style="color: #059669; text-decoration: underline;">${githubRepoLink}</a><br/>
              <strong>Guidelines:</strong> Create a new branch named <code>${branchGuidelines}</code> from <code>Dev</code> and implement your contributions.
            </p>
          </div>

          <p style="font-size: 15px; color: #555;">
            You can now access your <strong>Contributor Dashboard</strong> using your registered email address to submit pull request merge requests and track updates:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://mlscsvec.in/contribute/dashboard" target="_blank" style="background-color: #10b981; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; display: inline-block;">
              Access Contributor Dashboard
            </a>
          </div>

          <p style="margin-top: 30px; font-weight: 500; color: #222;">Best regards,<br><strong>Super Admin, MLSC SVEC</strong></p>
        </div>
      </div>
    `;
    await sendEmailDirect(app.email, subject, userHtml);

    return { success: true };
  } catch (error: any) {
    console.error('Error approving contributor:', error);
    await logErrorAction(
      `Contributor Approval Failed`,
      `Failed to approve contributor application ID ${appId}. Error: ${error.message || error}`
    );
    return { success: false, error: error.message };
  }
}

export async function submitPullRequestAction(
  name: string,
  email: string,
  prLink: string,
  branchName: string,
  title: string,
  description: string
) {
  try {
    const prData = {
      name,
      email,
      prLink,
      branchName,
      title,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'pullRequests'), prData);

    // Log as activity
    await logActivityAction(
      `PR Merge Request Submitted: ${title}`,
      `Pull request merge request submitted by contributor ${name} (${email}) for branch ${branchName}`
    );

    // Email to Admin
    const adminSubject = `[MLSC PR Merge Request] New PR from ${name}`;
    const adminHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); height: 8px;"></div>
        <div style="padding: 25px;">
          <h2 style="color: #222; font-size: 20px; font-weight: 700; margin-bottom: 15px;">New PR Merge Request</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 130px;">Contributor:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name} (${email})</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">PR Link:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="${prLink}" target="_blank">${prLink}</a></td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Branch Name:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><code>${branchName}</code></td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Title:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${title}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; vertical-align: top;">Description:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; white-space: pre-wrap;">${description}</td></tr>
          </table>
        </div>
      </div>
    `;
    await sendEmailDirect(ADMIN_EMAIL, adminSubject, adminHtml);

    // Email to Contributor
    const userSubject = `PR Review Request Submitted - MLSC SVEC`;
    const userHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); height: 8px;"></div>
        <div style="padding: 30px 25px;">
          <h2 style="color: #222; font-size: 22px; font-weight: 700; margin-bottom: 15px;">PR Request Sent</h2>
          <p style="font-size: 15px; color: #555;">Hi ${name},</p>
          <p style="font-size: 15px; color: #555;">
            Your pull request merge request for <strong>${title}</strong> (${prLink}) has been successfully submitted to the administrator.
          </p>
          <p style="font-size: 15px; color: #555;">
            You will receive a notification email once the admin reviews and merges your pull request.
          </p>
          <p style="margin-top: 30px; font-weight: 500; color: #222;">Best regards,<br><strong>MLSC Tech Lead</strong></p>
        </div>
      </div>
    `;
    await sendEmailDirect(email, userSubject, userHtml);

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error submitting PR merge request:', error);
    await logErrorAction(
      `PR Submission Failed`,
      `Failed to submit PR merge request for "${title}" by ${name} (${email}). Error: ${error.message || error}`
    );
    return { success: false, error: error.message };
  }
}

export async function mergePullRequestAction(prId: string) {
  try {
    const docRef = doc(db, 'pullRequests', prId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'PR request not found.' };
    }

    const pr = docSnap.data();
    await updateDoc(docRef, { status: 'merged', mergedAt: new Date().toISOString() });

    // Log as activity
    await logActivityAction(
      `PR Merge Request Accepted`,
      `PR merge request #${prId} for branch ${pr.branchName} by ${pr.name} has been merged`
    );

    // Send email to Contributor
    const subject = `Your Pull Request has been Merged! 🎉`;
    const userHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 8px;"></div>
        <div style="padding: 30px 25px;">
          <h2 style="color: #222; font-size: 22px; font-weight: 700; margin-bottom: 15px;">Congratulations, PR Merged!</h2>
          <p style="font-size: 15px; color: #555;">Hi ${pr.name},</p>
          <p style="font-size: 15px; color: #555;">
            We are pleased to inform you that your pull request <strong>${pr.title}</strong> (<a href="${pr.prLink}" target="_blank" style="color: #059669;">${pr.prLink}</a>) has been successfully reviewed and merged by the admin!
          </p>
          <p style="font-size: 15px; color: #555; margin-top: 15px;">
            Thank you for contributing to MLSC SVEC! Your code is now live.
          </p>
          <p style="margin-top: 30px; font-weight: 500; color: #222;">Best regards,<br><strong>Super Admin, MLSC SVEC</strong></p>
        </div>
      </div>
    `;
    await sendEmailDirect(pr.email, subject, userHtml);

    return { success: true };
  } catch (error: any) {
    console.error('Error merging pull request:', error);
    await logErrorAction(
      `PR Merge Failed`,
      `Failed to merge pull request ID ${prId}. Error: ${error.message || error}`
    );
    return { success: false, error: error.message };
  }
}

export async function requestMoreDetailsAction(appId: string, feedback: string) {
  try {
    const docRef = doc(db, 'contributions', appId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Contributor application not found.' };
    }

    const app = docSnap.data();
    await updateDoc(docRef, { 
      status: 'insufficient', 
      feedback: feedback || '',
      feedbackAt: new Date().toISOString()
    });

    // Log as activity
    await logActivityAction(
      `Contributor Details Requested`,
      `Requested additional details from contributor applicant ${app.name} (${app.email})`
    );

    // Send email to Contributor
    const subject = `Action Required: Contributor Application details need update - MLSC SVEC`;
    const reverifyLink = `https://mlscsvec.in/contribute/reverify?id=${appId}`;
    
    const userHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); height: 8px;"></div>
        <div style="padding: 30px 25px;">
          <h2 style="color: #222; font-size: 22px; font-weight: 700; margin-bottom: 15px;">Additional Details Required</h2>
          <p style="font-size: 15px; color: #555;">Hi ${app.name},</p>
          <p style="font-size: 15px; color: #555;">
            Thank you for applying to contribute. Our admin team has reviewed your application, and we need some additional details or updates before we can approve your access.
          </p>
          
          <div style="background-color: #fffbeb; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #b45309;">Admin Feedback:</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #78350f; white-space: pre-wrap;">${feedback}</p>
          </div>

          <p style="font-size: 15px; color: #555;">
            Please visit the reverification portal using the link below to update your GitHub, skills, or statement details and resubmit:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${reverifyLink}" target="_blank" style="background-color: #d97706; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; display: inline-block;">
              Update & Resubmit Application
            </a>
          </div>

          <p style="font-size: 13px; color: #888;">
            Note: Once you resubmit, your application will be re-evaluated for access.
          </p>
          <p style="margin-top: 30px; font-weight: 500; color: #222;">Best regards,<br><strong>MLSC Tech Lead</strong></p>
        </div>
      </div>
    `;
    await sendEmailDirect(app.email, subject, userHtml);

    return { success: true };
  } catch (error: any) {
    console.error('Error requesting more details:', error);
    await logErrorAction(
      `Request More Contributor Details Failed`,
      `Failed to request more details for contributor application ID ${appId}. Error: ${error.message || error}`
    );
    return { success: false, error: error.message };
  }
}

export async function resubmitApplicationDetailsAction(
  appId: string,
  github: string,
  skills: string,
  message: string
) {
  try {
    const docRef = doc(db, 'contributions', appId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Contributor application not found.' };
    }

    const app = docSnap.data();
    await updateDoc(docRef, {
      github,
      skills,
      message,
      status: 'resubmitted',
      resubmittedAt: new Date().toISOString()
    });

    // Log as activity
    await logActivityAction(
      `Contributor Application Resubmitted`,
      `Applicant ${app.name} (${app.email}) updated and resubmitted their contributor details.`
    );

    // Email to Admin
    const adminSubject = `[Contributor Resubmission] Updated Details: ${app.name}`;
    const adminHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 8px;"></div>
        <div style="padding: 25px;">
          <h2 style="color: #222; font-size: 20px; font-weight: 700; margin-bottom: 15px;">Details Resubmitted for Verification</h2>
          <p>Hi Admin,</p>
          <p>Contributor applicant <strong>${app.name}</strong> has updated and resubmitted their details. They are ready for reverification.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 130px;">Name:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${app.name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Email:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${app.email}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">GitHub Profile:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">@${github || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Skills:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${skills}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; vertical-align: top;">Message:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; white-space: pre-wrap;">${message}</td></tr>
          </table>
          
          <p>You can review and approve this resubmission in the super admin Operations Center.</p>
        </div>
      </div>
    `;
    const ADMIN_EMAIL = 'vinaysiddha19@gmail.com';
    await sendEmailDirect(ADMIN_EMAIL, adminSubject, adminHtml);

    // Email to Contributor
    const userSubject = `Contributor Resubmission Received - MLSC SVEC`;
    const userHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0056b3 0%, #007bff 100%); height: 8px;"></div>
        <div style="padding: 30px 25px;">
          <h2 style="color: #222; font-size: 22px; font-weight: 700; margin-bottom: 15px;">Resubmission Received</h2>
          <p style="font-size: 15px; color: #555;">Hi ${app.name},</p>
          <p style="font-size: 15px; color: #555;">
            You have successfully updated and resubmitted your contributor application form. Our super admin team will verify it again and update your access.
          </p>
          <p style="font-size: 15px; color: #555; margin-top: 15px;">
            Thank you for your patience during this verification process!
          </p>
          <p style="margin-top: 30px; font-weight: 500; color: #222;">Best regards,<br><strong>MLSC Tech Lead</strong></p>
        </div>
      </div>
    `;
    await sendEmailDirect(app.email, userSubject, userHtml);

    return { success: true };
  } catch (error: any) {
    console.error('Error resubmitting application details:', error);
    await logErrorAction(
      `Resubmit Contributor Details Failed`,
      `Failed to resubmit application details for ID ${appId}. Error: ${error.message || error}`
    );
    return { success: false, error: error.message };
  }
}
