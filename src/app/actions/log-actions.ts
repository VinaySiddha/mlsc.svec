'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, where, updateDoc, doc } from 'firebase/firestore';

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
  userEmail?: string
) {
  try {
    const reportData = {
      title,
      description,
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      userEmail: userEmail || '',
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
    await updateDoc(docRef, { status: 'resolved', resolvedAt: new Date().toISOString() });
    
    // Log as activity
    await logActivityAction(
      `Bug Report Resolved`,
      `Bug report #${id} has been marked as resolved`
    );
    
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
