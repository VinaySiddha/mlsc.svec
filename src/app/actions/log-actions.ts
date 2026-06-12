'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, where, updateDoc, doc, getDoc } from 'firebase/firestore';
import { sendEmailDirect } from '@/lib/mail-sender';

export interface SystemLog {
  id?: string;
  type: 'activity' | 'error';
  message: string;
  details?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  timestamp: string;
  meta?: any;
}

export interface BugReport {
  id?: string;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export async function logActivityAction(
  message: string,
  details?: string,
  userId?: string,
  userName?: string,
  userEmail?: string,
  meta?: any
) {
  try {
    const logData = {
      type: 'activity',
      message,
      details: details || '',
      userId: userId || 'system',
      userName: userName || 'System',
      userEmail: userEmail || '',
      timestamp: new Date().toISOString(),
      meta: meta || null,
    };
    await addDoc(collection(db, 'systemLogs'), logData);
    return { success: true };
  } catch (error: any) {
    console.error('Error logging activity:', error);
    return { success: false, error: error.message };
  }
}

export async function logErrorAction(
  message: string,
  details?: string,
  userId?: string,
  userName?: string,
  meta?: any
) {
  try {
    const logData = {
      type: 'error',
      message,
      details: details || '',
      userId: userId || 'system',
      userName: userName || 'System',
      timestamp: new Date().toISOString(),
      meta: meta || null,
    };
    await addDoc(collection(db, 'systemLogs'), logData);
    return { success: true };
  } catch (error: any) {
    console.error('Error logging error:', error);
    return { success: false, error: error.message };
  }
}

export async function submitBugReportAction(
  title: string,
  description: string,
  userId?: string,
  userName?: string,
  userEmail?: string,
  severity = 'medium',
  category = 'other'
) {
  try {
    const reportData = {
      title,
      description,
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      userEmail: userEmail || '',
      severity,
      category,
      upvotedBy: [] as string[],
      comments: [] as any[],
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'bugReports'), reportData);
    
    // Log as activity
    await logActivityAction(
      `Bug Report Submitted: ${title}`,
      `Bug report #${docRef.id} submitted by ${userName || 'Anonymous'}`,
      userId,
      userName,
      userEmail
    );
    
    // Send confirmation email to the submitter if email exists
    if (userEmail) {
      const subject = `Bug Report Submitted: ${title} - MLSC SVEC`;
      const html = `
        <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); height: 8px;"></div>
          <div style="padding: 25px;">
            <h2 style="color: #222; font-size: 20px; font-weight: 700; margin-bottom: 15px;">Ticket Opened Successfully</h2>
            <p>Hi ${userName || 'there'},</p>
            <p>Thank you for reporting this issue. Your bug report has been successfully raised. Our technical leads will investigate it immediately.</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;"><strong>Ticket Details:</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 13px;">
                <strong>Title:</strong> ${title}<br/>
                <strong>Description:</strong> ${description}<br/>
                <strong>Ticket ID:</strong> #${docRef.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
            
            <p style="font-size: 13px; color: #666;">You will receive another notification email once this issue is resolved.</p>
          </div>
        </div>
      `;
      await sendEmailDirect(userEmail, subject, html);
    }
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error submitting bug report:', error);
    // Log system error
    await logErrorAction(`Failed Bug Report Submission: ${title}`, error.message, userId, userName);
    return { success: false, error: error.message };
  }
}

export async function getLogsAction(type?: 'activity' | 'error', limitCount = 50) {
  try {
    let q = query(collection(db, 'systemLogs'), orderBy('timestamp', 'desc'), limit(limitCount));
    if (type) {
      q = query(
        collection(db, 'systemLogs'),
        where('type', '==', type),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }
    const snap = await getDocs(q);
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { logs };
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return { logs: [], error: error.message };
  }
}

export async function getBugReportsAction(limitCount = 50) {
  try {
    const q = query(collection(db, 'bugReports'), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    const bugReports = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { bugReports };
  } catch (error: any) {
    console.error('Error fetching bug reports:', error);
    return { bugReports: [], error: error.message };
  }
}

export async function resolveBugReportAction(id: string) {
  try {
    const docRef = doc(db, 'bugReports', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: 'Bug report not found.' };
    }
    
    const bug = docSnap.data();
    await updateDoc(docRef, { status: 'resolved', resolvedAt: new Date().toISOString() });
    
    // Log as activity
    await logActivityAction(
      `Bug Report Resolved`,
      `Bug report #${id} has been marked as resolved`
    );
    
    // Send resolution email to the submitter
    if (bug.userEmail) {
      const subject = `Bug Report Resolved: ${bug.title} - MLSC SVEC`;
      const html = `
        <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 8px;"></div>
          <div style="padding: 25px;">
            <h2 style="color: #222; font-size: 20px; font-weight: 700; margin-bottom: 15px;">Issue Resolved! 🎉</h2>
            <p>Hi ${bug.userName || 'there'},</p>
            <p>The issue you reported has been successfully resolved by our developer team. Thank you for helping us improve MLSC SVEC!</p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;"><strong>Resolved Ticket Details:</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 13px;">
                <strong>Title:</strong> ${bug.title}<br/>
                <strong>Resolved Ticket ID:</strong> #${id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      `;
      await sendEmailDirect(bug.userEmail, subject, html);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error resolving bug report:', error);
    await logErrorAction(`Failed to resolve bug report #${id}`, error.message);
    return { success: false, error: error.message };
  }
}

export async function getCommunityReportsAction(limitCount = 50) {
  try {
    const q = query(collection(db, 'communityReports'), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    const reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { reports };
  } catch (error: any) {
    console.error('Error fetching community reports:', error);
    return { reports: [], error: error.message };
  }
}

export async function addBugReportCommentAction(
  bugId: string,
  userName: string,
  userEmail: string,
  content: string
) {
  try {
    const docRef = doc(db, 'bugReports', bugId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Bug report not found.' };
    }

    const bug = docSnap.data();
    const comments = bug.comments || [];
    
    const newComment = {
      id: Math.random().toString(36).substring(2, 10),
      userName,
      userEmail,
      content,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(docRef, {
      comments: [...comments, newComment],
    });

    // Log as activity
    await logActivityAction(
      `Bug Comment Added`,
      `Comment added to bug report #${bugId} by ${userName}`
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error adding comment to bug report:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleBugUpvoteAction(bugId: string, userEmail: string) {
  try {
    const docRef = doc(db, 'bugReports', bugId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Bug report not found.' };
    }

    const bug = docSnap.data();
    const upvotedBy = bug.upvotedBy || [];

    let updatedUpvotes: string[];
    if (upvotedBy.includes(userEmail)) {
      // Remove upvote
      updatedUpvotes = upvotedBy.filter((email: string) => email !== userEmail);
    } else {
      // Add upvote
      updatedUpvotes = [...upvotedBy, userEmail];
    }

    await updateDoc(docRef, {
      upvotedBy: updatedUpvotes,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling bug upvote:', error);
    return { success: false, error: error.message };
  }
}
