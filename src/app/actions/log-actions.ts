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

import { AuthService } from '@/lib/services/auth-service';

function formatUserIdentity(sessionUser: { username?: string; name?: string; email?: string; role?: string; domain?: string }) {
  const panelMap: Record<string, string> = {
    'gen_ai_panel': 'Generative AI Panel',
    'ds_ml_panel': 'Data Science & ML Panel',
    'azure_panel': 'Azure Cloud Panel',
    'web_app_panel': 'Web & App Dev Panel',
    'vinaysiddha': 'Vinay Siddha (Super Admin)',
  };

  let name = sessionUser.name || (sessionUser.username ? (panelMap[sessionUser.username] || sessionUser.username) : undefined);
  if (!name && sessionUser.email) {
    name = sessionUser.email.split('@')[0];
  }
  
  let email = sessionUser.email;
  if (!email && sessionUser.username) {
    if (sessionUser.username === 'vinaysiddha') {
      email = 'vinaysiddha.mlsc@gmail.com';
    } else {
      email = `${sessionUser.username}@mlsc.svec`;
    }
  }

  const id = email || sessionUser.username || sessionUser.role || 'system';
  return { name: name || 'Admin', email: email || '', id };
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
    let finalUserId = userId;
    let finalUserName = userName;
    let finalUserEmail = userEmail;

    // Check if name is generic or placeholder
    const isGenericName = !finalUserName || ['system', 'system admin', 'interviewer', 'interview admin', 'admin', 'anonymous'].some(g => finalUserName?.toLowerCase().includes(g));

    if (isGenericName || !finalUserEmail) {
      try {
        const sessionUser = await AuthService.getSessionUser();
        if (sessionUser) {
          const resolved = formatUserIdentity(sessionUser);
          if (!finalUserId || finalUserId === 'system') finalUserId = resolved.id;
          if (isGenericName) finalUserName = resolved.name;
          if (!finalUserEmail) finalUserEmail = resolved.email;
        }
      } catch (authError) {
        console.warn('Could not retrieve session user for activity log:', authError);
      }
    }

    const logData = {
      type: 'activity',
      message,
      details: details || '',
      userId: finalUserId || 'system',
      userName: finalUserName || 'System',
      userEmail: finalUserEmail || '',
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
  userEmailOrMeta?: string | any,
  meta?: any
) {
  try {
    let finalUserId = userId;
    let finalUserName = userName;
    let finalUserEmail = typeof userEmailOrMeta === 'string' ? userEmailOrMeta : (userEmailOrMeta?.userEmail || userEmailOrMeta?.email || undefined);
    let finalMeta = typeof userEmailOrMeta === 'object' && userEmailOrMeta !== null && !meta ? userEmailOrMeta : (meta || null);

    const isGenericName = !finalUserName || ['system', 'system admin', 'interviewer', 'interview admin', 'admin', 'anonymous'].some(g => finalUserName?.toLowerCase().includes(g));

    if (isGenericName || !finalUserEmail) {
      try {
        const sessionUser = await AuthService.getSessionUser();
        if (sessionUser) {
          const resolved = formatUserIdentity(sessionUser);
          if (!finalUserId || finalUserId === 'system') finalUserId = resolved.id;
          if (isGenericName) finalUserName = resolved.name;
          if (!finalUserEmail) finalUserEmail = resolved.email;
        }
      } catch (authError) {
        console.warn('Could not retrieve session user for error log:', authError);
      }
    }

    const logData = {
      type: 'error',
      message,
      details: details || '',
      userId: finalUserId || 'system',
      userName: finalUserName || 'System',
      userEmail: finalUserEmail || '',
      timestamp: new Date().toISOString(),
      meta: finalMeta || null,
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
  category = 'other',
  imageUrl = ''
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
      imageUrl,
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

export async function reopenBugReportAction(id: string, identifier: string) {
  try {
    const docRef = doc(db, 'bugReports', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: 'Bug report not found.' };
    }
    
    const bug = docSnap.data();
    
    // Check if identifier matches either userId or userEmail
    const matchesUser = 
      (bug.userId && bug.userId !== 'anonymous' && bug.userId === identifier) ||
      (bug.userEmail && bug.userEmail.toLowerCase() === identifier.toLowerCase());
      
    if (!matchesUser) {
      return { success: false, error: 'Unauthorized: Only the reporter of this bug can reopen it.' };
    }
    
    const reopenedComment = {
      id: Math.random().toString(36).substring(2, 10),
      userName: bug.userName || 'Reporter',
      userEmail: 'system@mlscsvec.org',
      content: 'reopened this issue',
      createdAt: new Date().toISOString(),
    };
    
    const comments = bug.comments || [];
    
    await updateDoc(docRef, { 
      status: 'open',
      comments: [...comments, reopenedComment]
    });
    
    // Log as activity
    await logActivityAction(
      `Bug Report Reopened`,
      `Bug report #${id} has been reopened by the reporter (${bug.userName || 'Reporter'})`
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error reopening bug report:', error);
    await logErrorAction(`Failed to reopen bug report #${id}`, error.message);
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

export async function getSystemHealthAction() {
  try {
    // 1. Measure Firestore Latency
    const startDb = Date.now();
    const q = query(collection(db, 'systemLogs'), limit(1));
    await getDocs(q);
    const dbLatency = Date.now() - startDb;

    // 2. Check AI Engine config
    const aiAvailable = !!process.env.GEMINI_API_KEY;

    // 3. Check Mail sender config
    const mailAvailable = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

    return {
      success: true,
      dbStatus: 'operational',
      dbLatency,
      aiStatus: aiAvailable ? 'operational' : 'offline',
      mailStatus: mailAvailable ? 'operational' : 'offline',
      serverTime: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error in getSystemHealthAction:', error);
    return {
      success: false,
      error: error.message,
      dbStatus: 'degraded',
      dbLatency: -1,
      aiStatus: process.env.GEMINI_API_KEY ? 'operational' : 'offline',
      mailStatus: (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ? 'operational' : 'offline',
      serverTime: new Date().toISOString(),
    };
  }
}

