'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  Activity, 
  AlertCircle, 
  Bug, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Users,
  Search,
  ExternalLink,
  GitPullRequest,
  CreditCard,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { resolveBugReportAction } from '@/app/actions/log-actions';
import { approveContributorAction, mergePullRequestAction, requestMoreDetailsAction } from '@/app/actions/contributor-actions';
import { verifyAtsPaymentAction } from '@/app/actions/ats-actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';

interface LogEntry {
  id: string;
  type: 'activity' | 'error';
  message: string;
  details?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  timestamp: string;
  meta?: any;
}

interface BugReport {
  id: string;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

interface CommunityReport {
  id: string;
  contentType: 'post' | 'comment';
  contentId: string;
  postId: string;
  reason: string;
  reporterId: string;
  reporterName: string;
  resolved: boolean;
  createdAt: string;
}

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  username?: string;
  role: string;
  createdAt: string;
}

interface ContributorApplication {
  id: string;
  name: string;
  email: string;
  github?: string;
  department: string;
  skills: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'resubmitted' | 'insufficient';
  feedback?: string;
  createdAt: string;
}

interface PRSubmission {
  id: string;
  name: string;
  email: string;
  prLink: string;
  branchName: string;
  title: string;
  description: string;
  status: 'pending' | 'merged' | 'rejected';
  createdAt: string;
  mergedAt?: string;
}

interface OperationsCenterProps {
  mode: 'activity' | 'errors' | 'bugs' | 'moderation' | 'users' | 'contributors' | 'pullrequests' | 'ats-payments';
}

export function OperationsCenter({ mode }: OperationsCenterProps) {
  const [activities, setActivities] = useState<LogEntry[]>([]);
  const [errors, setErrors] = useState<LogEntry[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [moderation, setModeration] = useState<CommunityReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [contributors, setContributors] = useState<ContributorApplication[]>([]);
  const [pullRequests, setPullRequests] = useState<PRSubmission[]>([]);
  const [atsPayments, setAtsPayments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [feedbackAppId, setFeedbackAppId] = useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Deletion States
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteCollection, setDeleteCollection] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Subscribe ONLY to the active collection based on mode
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    if (mode === 'activity' || mode === 'errors') {
      const q = query(collection(db, 'systemLogs'), orderBy('timestamp', 'desc'), limit(100));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const logsList: LogEntry[] = [];
        snapshot.forEach((doc) => {
          logsList.push({ id: doc.id, ...doc.data() } as LogEntry);
        });
        setActivities(logsList.filter(l => l.type === 'activity'));
        setErrors(logsList.filter(l => l.type === 'error'));
        setLoading(false);
      }, (err) => {
        console.error("Logs listener error:", err);
        setLoading(false);
      });
    } else if (mode === 'bugs') {
      const q = query(collection(db, 'bugReports'), orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const bugList: BugReport[] = [];
        snapshot.forEach((doc) => {
          bugList.push({ id: doc.id, ...doc.data() } as BugReport);
        });
        setBugs(bugList);
        setLoading(false);
      }, (err) => {
        console.error("Bug reports listener error:", err);
        setLoading(false);
      });
    } else if (mode === 'moderation') {
      const q = query(collection(db, 'communityReports'), orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const modList: CommunityReport[] = [];
        snapshot.forEach((doc) => {
          modList.push({ id: doc.id, ...doc.data() } as CommunityReport);
        });
        setModeration(modList);
        setLoading(false);
      }, (err) => {
        console.error("Community reports listener error:", err);
        setLoading(false);
      });
    } else if (mode === 'users') {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const usersList: UserProfile[] = [];
        snapshot.forEach((doc) => {
          usersList.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        setUsers(usersList);
        setLoading(false);
      }, (err) => {
        console.error("Users listener error:", err);
        setLoading(false);
      });
    } else if (mode === 'contributors') {
      const q = query(collection(db, 'contributions'), orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const contribList: ContributorApplication[] = [];
        snapshot.forEach((doc) => {
          contribList.push({ id: doc.id, ...doc.data() } as ContributorApplication);
        });
        setContributors(contribList);
        setLoading(false);
      }, (err) => {
        console.error("Contributions listener error:", err);
        setLoading(false);
      });
    } else if (mode === 'pullrequests') {
      const q = query(collection(db, 'pullRequests'), orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const prList: PRSubmission[] = [];
        snapshot.forEach((doc) => {
          prList.push({ id: doc.id, ...doc.data() } as PRSubmission);
        });
        setPullRequests(prList);
        setLoading(false);
      }, (err) => {
        console.error("PR submissions listener error:", err);
        setLoading(false);
      });
    } else if (mode === 'ats-payments') {
      const q = query(collection(db, 'atsPayments'), orderBy('createdAt', 'desc'), limit(100));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const payList: any[] = [];
        snapshot.forEach((doc) => {
          payList.push({ id: doc.id, ...doc.data() });
        });
        setAtsPayments(payList);
        setLoading(false);
      }, (err) => {
        console.error("ATS payments listener error:", err);
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, [mode]);

  const handleResolveBug = async (id: string) => {
    try {
      const res = await resolveBugReportAction(id);
      if (res.success) {
        toast.success("Bug report resolved successfully");
      } else {
        toast.danger("Failed to resolve bug report", { description: res.error });
      }
    } catch (err: any) {
      toast.danger("An unexpected error occurred", { description: err.message });
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      const reportRef = doc(db, 'communityReports', reportId);
      await updateDoc(reportRef, { resolved: true });
      toast.success("Report dismissed/resolved successfully");
    } catch (err: any) {
      toast.danger("Failed to dismiss report", { description: err.message });
    }
  };

  const handleReviewContribution = async (id: string) => {
    try {
      const res = await approveContributorAction(id);
      if (res.success) {
        toast.success("Contributor approved and onboarding email sent successfully!");
      } else {
        toast.danger("Failed to approve contributor", { description: res.error });
      }
    } catch (err: any) {
      toast.danger("Failed to update contributor status", { description: err.message });
    }
  };

  const handleMergePR = async (id: string) => {
    try {
      const res = await mergePullRequestAction(id);
      if (res.success) {
        toast.success("PR merge request marked as merged!");
      } else {
        toast.danger("Failed to merge PR", { description: res.error });
      }
    } catch (err: any) {
      toast.danger("An unexpected error occurred", { description: err.message });
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return timeStr;
    }
  };

  const handleVerifyPayment = async (paymentId: string, approve: boolean) => {
    try {
      const res = await verifyAtsPaymentAction(paymentId, approve);
      if (res.success) {
        toast.success(approve ? "Payment Approved!" : "Payment Rejected!", {
          description: approve ? "The student now has credits to perform ATS Resume analysis." : "The reference has been marked as rejected."
        });
      } else {
        toast.danger("Operation failed", { description: res.error });
      }
    } catch (err: any) {
      console.error("Verification handler error:", err);
      toast.danger("Error occurred", { description: err.message || "Failed to resolve payment request." });
    }
  };

  const handleDeleteItem = (collectionName: string, id: string) => {
    setDeleteCollection(collectionName);
    setDeleteItemId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCollection || !deleteItemId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, deleteCollection, deleteItemId));
      toast.success("Item deleted successfully");
      setDeleteItemId(null);
      setDeleteCollection(null);
    } catch (err: any) {
      toast.danger("Failed to delete item", { description: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const getFilteredData = () => {
    const queryLower = searchQuery.toLowerCase().trim();

    if (mode === 'activity') {
      const data = activities;
      if (!queryLower) return data;
      return data.filter(a => 
        a.message.toLowerCase().includes(queryLower) || 
        (a.userName && a.userName.toLowerCase().includes(queryLower)) ||
        (a.details && a.details.toLowerCase().includes(queryLower))
      );
    }
    if (mode === 'errors') {
      const data = errors;
      if (!queryLower) return data;
      return data.filter(e => 
        e.message.toLowerCase().includes(queryLower) || 
        (e.details && e.details.toLowerCase().includes(queryLower))
      );
    }
    if (mode === 'bugs') {
      const data = bugs;
      if (!queryLower) return data;
      return data.filter(b => 
        b.title.toLowerCase().includes(queryLower) || 
        b.description.toLowerCase().includes(queryLower) ||
        (b.userName && b.userName.toLowerCase().includes(queryLower))
      );
    }
    if (mode === 'moderation') {
      const data = moderation;
      if (!queryLower) return data;
      return data.filter(m => 
        m.reason.toLowerCase().includes(queryLower) || 
        m.contentType.toLowerCase().includes(queryLower) ||
        m.reporterName.toLowerCase().includes(queryLower)
      );
    }
    if (mode === 'users') {
      const data = users;
      if (!queryLower) return data;
      return data.filter(u => 
        u.displayName.toLowerCase().includes(queryLower) || 
        u.email.toLowerCase().includes(queryLower) || 
        (u.username && u.username.toLowerCase().includes(queryLower)) ||
        u.role.toLowerCase().includes(queryLower)
      );
    }
    if (mode === 'contributors') {
      const data = contributors;
      if (!queryLower) return data;
      return data.filter(c =>
        c.name.toLowerCase().includes(queryLower) ||
        c.email.toLowerCase().includes(queryLower) ||
        c.department.toLowerCase().includes(queryLower) ||
        c.skills.toLowerCase().includes(queryLower) ||
        c.message.toLowerCase().includes(queryLower) ||
        (c.github && c.github.toLowerCase().includes(queryLower))
      );
    }
    if (mode === 'ats-payments') {
      const data = atsPayments;
      if (!queryLower) return data;
      return data.filter(p =>
        p.email?.toLowerCase().includes(queryLower) ||
        p.utr?.toLowerCase().includes(queryLower) ||
        p.status?.toLowerCase().includes(queryLower)
      );
    }
    const data = pullRequests;
    if (!queryLower) return data;
    return data.filter(p =>
      p.title.toLowerCase().includes(queryLower) ||
      p.description.toLowerCase().includes(queryLower) ||
      p.name.toLowerCase().includes(queryLower) ||
      p.email.toLowerCase().includes(queryLower) ||
      p.branchName.toLowerCase().includes(queryLower) ||
      p.prLink.toLowerCase().includes(queryLower)
    );
  };

  const filteredItems = getFilteredData();

  const getTitleAndDesc = () => {
    switch (mode) {
      case 'activity':
        return {
          title: "System Activity Logs",
          desc: "Live feed of club registrations, settings changes, and admin operations",
          icon: <Activity className="h-5 w-5 text-[#4285F4]" />
        };
      case 'errors':
        return {
          title: "System Error Reports",
          desc: "Real-time logging of database failures and server exceptions",
          icon: <AlertCircle className="h-5 w-5 text-red-500" />
        };
      case 'bugs':
        return {
          title: "Bug Tickets & Feedback",
          desc: "User-submitted bug reports and feature requests from the public site",
          icon: <Bug className="h-5 w-5 text-amber-500" />
        };
      case 'moderation':
        return {
          title: "Community Moderation Flags",
          desc: "Reported comments and posts pending moderator actions",
          icon: <ShieldAlert className="h-5 w-5 text-purple-500" />
        };
      case 'users':
        return {
          title: "Latest Registered Users",
          desc: "Live list of student profiles newly onboarding onto the portal",
          icon: <Users className="h-5 w-5 text-emerald-500" />
        };
      case 'contributors':
        return {
          title: "Contributor Requests",
          desc: "Applications from students interested in open-source contribution",
          icon: <Users className="h-5 w-5 text-indigo-500" />
        };
      case 'pullrequests':
        return {
          title: "PR Merge Requests",
          desc: "Pull request review and merge requests submitted by open-source contributors",
          icon: <GitPullRequest className="h-5 w-5 text-[#34A853]" />
        };
      case 'ats-payments':
        return {
          title: "ATS Credit Payments",
          desc: "Verify and approve UPI transaction UTR codes to unlock ATS Resume evaluation credits",
          icon: <CreditCard className="h-5 w-5 text-indigo-500" />
        };
    }
  };

  const config = getTitleAndDesc();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/50">
            {config.icon}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">
              {config.title}
            </h2>
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
              {config.desc}
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder={`Filter results...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-[#4285F4] focus:border-transparent transition-all text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Dynamic contents list */}
      <div className="min-h-[350px] max-h-[600px] overflow-y-auto pr-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-zinc-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4] mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Listening to database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-zinc-500 border border-dashed border-slate-100 dark:border-zinc-800/80 rounded-xl">
            <Clock className="h-8 w-8 opacity-40 mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">No logs found</p>
            <p className="text-[10px] opacity-80 mt-1">Real-time listeners are active and waiting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === 'activity' && (filteredItems as LogEntry[]).map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{log.message}</p>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 pl-3.5 font-medium leading-relaxed">
                      {log.details}
                    </p>
                  )}
                  {log.userName && (
                    <p className="text-[9px] text-slate-400 dark:text-zinc-650 pl-3.5 font-bold uppercase">
                      By: {log.userName} {log.userEmail ? `(${log.userEmail})` : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-650 select-none">
                    {formatTime(log.timestamp)}
                  </span>
                  <Button
                    onClick={() => handleDeleteItem('systemLogs', log.id)}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    title="Delete Log"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'errors' && (filteredItems as LogEntry[]).map((err) => (
              <div key={err.id} className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-red-500/10 bg-red-500/[0.02] hover:border-red-500/20 transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <p className="text-xs font-bold text-red-500">{err.message}</p>
                  </div>
                  {err.details && (
                    <pre className="text-[10px] text-slate-400 dark:text-zinc-500 pl-3.5 font-mono bg-black/40 p-2.5 rounded-md overflow-x-auto mt-2 max-w-full">
                      <code>{err.details}</code>
                    </pre>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[9px] font-bold text-red-400 dark:text-red-900/60 select-none">
                    {formatTime(err.timestamp)}
                  </span>
                  <Button
                    onClick={() => handleDeleteItem('systemLogs', err.id)}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    title="Delete Error Log"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'bugs' && (filteredItems as BugReport[]).map((bug) => (
              <div key={bug.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Badge variant={bug.status === 'open' ? 'destructive' : 'secondary'} className="text-[9px] uppercase tracking-wider font-bold h-4.5 px-2">
                      {bug.status}
                    </Badge>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{bug.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed font-medium">
                    {bug.description}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-400 dark:text-zinc-650 font-bold uppercase">
                    <span>Reporter: {bug.userName} ({bug.userEmail})</span>
                    <span>•</span>
                    <span>Reported: {formatTime(bug.createdAt)}</span>
                    {bug.resolvedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-500">Resolved: {formatTime(bug.resolvedAt)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  {bug.status === 'open' && (
                    <Button
                      onClick={() => handleResolveBug(bug.id)}
                      size="sm"
                      variant="outline"
                      className="h-8 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-xs font-bold uppercase tracking-wider shrink-0 gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolve
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteItem('bugReports', bug.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    title="Delete Bug Ticket"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'moderation' && (filteredItems as CommunityReport[]).map((report) => (
              <div key={report.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Badge variant={report.resolved ? 'secondary' : 'outline'} className={cn("text-[9px] uppercase tracking-wider font-bold h-4.5 px-2", !report.resolved && "border-purple-500/30 text-purple-500 bg-purple-500/5")}>
                      {report.resolved ? 'Resolved' : 'Active Flag'}
                    </Badge>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Reported {report.contentType}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed font-medium">
                    Reason: <span className="text-slate-800 dark:text-zinc-300 font-semibold">"{report.reason}"</span>
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-400 dark:text-zinc-650 font-bold uppercase">
                    <span>Flagged content ID: {report.contentId}</span>
                    <span>•</span>
                    <span>Flagged By: {report.reporterName}</span>
                    <span>•</span>
                    <span>Date: {formatTime(report.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!report.resolved && (
                    <Button
                      onClick={() => handleResolveReport(report.id)}
                      size="sm"
                      variant="outline"
                      className="h-8 border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-850 hover:border-slate-300 text-xs font-bold uppercase tracking-wider gap-1.5 text-slate-600 dark:text-zinc-300"
                    >
                      Dismiss Flag
                    </Button>
                  )}
                  <Button
                    onClick={() => window.open(`/community/${report.postId}`, '_blank')}
                    size="sm"
                    variant="outline"
                    className="h-8 border-[#4285F4]/20 text-[#4285F4] bg-[#4285F4]/5 hover:bg-[#4285F4]/10 hover:border-[#4285F4]/30 text-xs font-bold uppercase tracking-wider gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Moderate
                  </Button>
                  <Button
                    onClick={() => handleDeleteItem('communityReports', report.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    title="Delete Flag"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'users' && (filteredItems as UserProfile[]).map((user) => (
              <div key={user.uid} className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="h-8 w-8 rounded-full border border-slate-200 dark:border-zinc-800 select-none object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/25 flex items-center justify-center select-none text-xs font-black text-[#4285F4] uppercase">
                      {user.displayName.substring(0, 2)}
                    </div>
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{user.displayName}</p>
                      <Badge className={cn("text-[8px] uppercase tracking-wider font-extrabold px-1.5 h-4 select-none", 
                        user.role === 'super_admin' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                        user.role === 'admin' ? "bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20" :
                        "bg-slate-100 dark:bg-zinc-850 text-slate-500 dark:text-zinc-400"
                      )}>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium truncate">
                      {user.email} {user.username ? `• @${user.username}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right select-none">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-650">Registered</p>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-0.5">
                      {formatTime(user.createdAt)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteItem('users', user.uid)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'contributors' && (filteredItems as ContributorApplication[]).map((app) => (
              <div key={app.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Badge 
                      variant={app.status === 'approved' ? 'secondary' : 'destructive'} 
                      className={cn(
                        "text-[9px] uppercase tracking-wider font-bold h-4.5 px-2 border-none select-none",
                        app.status === 'approved' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                        app.status === 'pending' && "bg-red-500/10 text-red-400 border border-red-500/20",
                        app.status === 'resubmitted' && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
                        app.status === 'insufficient' && "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      )}
                    >
                      {app.status === 'insufficient' ? 'details requested' : app.status}
                    </Badge>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{app.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-zinc-350 leading-relaxed font-semibold">
                    Department: <span className="text-[#4285F4]">{app.department}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                    Skills: {app.skills}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed">
                    Message: "{app.message}"
                  </p>
                  {app.feedback && (
                    <div className="text-[11px] text-amber-500 dark:text-amber-400 bg-amber-500/[0.02] border border-amber-500/10 rounded-lg p-2.5 mt-2 max-w-lg font-medium leading-relaxed">
                      <strong>Admin Feedback:</strong> "{app.feedback}"
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-400 dark:text-zinc-650 font-bold uppercase mt-2">
                    <span>Email: {app.email}</span>
                    {app.github && (
                      <>
                        <span>•</span>
                        <a href={`https://github.com/${app.github}`} target="_blank" rel="noreferrer" className="text-[#4285F4] hover:underline inline-flex items-center gap-0.5 lowercase normal-case tracking-normal">
                          GitHub: @{app.github} <ExternalLink className="h-2 w-2" />
                        </a>
                      </>
                    )}
                    <span>•</span>
                    <span>Submitted: {formatTime(app.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  {(app.status === 'pending' || app.status === 'resubmitted') && (
                    <>
                      <Button
                        onClick={() => setFeedbackAppId(app.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 border-amber-500/20 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/30 text-xs font-bold uppercase tracking-wider gap-1.5"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        Request Updates
                      </Button>
                      <Button
                        onClick={() => handleReviewContribution(app.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 border-indigo-500/20 text-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-xs font-bold uppercase tracking-wider gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve Request
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleDeleteItem('contributions', app.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg animate-in fade-in duration-200"
                    title="Delete Contributor Application"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'pullrequests' && (filteredItems as PRSubmission[]).map((pr) => (
              <div key={pr.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Badge variant={pr.status === 'merged' ? 'secondary' : 'destructive'} className="text-[9px] uppercase tracking-wider font-bold h-4.5 px-2 bg-white/5 text-white" style={{ backgroundColor: pr.status === 'merged' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: pr.status === 'merged' ? '#10b981' : '#ef4444' }}>
                      {pr.status === 'merged' ? 'Merged' : 'Pending'}
                    </Badge>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pr.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-750 dark:text-zinc-350 leading-relaxed font-semibold">
                    Branch: <code className="bg-slate-100 dark:bg-zinc-800 px-1 rounded text-slate-800 dark:text-zinc-200">{pr.branchName}</code>
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed">
                    Description: "{pr.description}"
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-400 dark:text-zinc-650 font-bold uppercase mt-2">
                    <span>By: {pr.name} ({pr.email})</span>
                    <span>•</span>
                    <a href={pr.prLink} target="_blank" rel="noreferrer" className="text-[#4285F4] hover:underline inline-flex items-center gap-0.5 lowercase normal-case tracking-normal">
                      PR Link: {pr.prLink} <ExternalLink className="h-2 w-2" />
                    </a>
                    <span>•</span>
                    <span>Submitted: {formatTime(pr.createdAt)}</span>
                    {pr.mergedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-500 font-bold">Merged: {formatTime(pr.mergedAt)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  {pr.status === 'pending' && (
                    <Button
                      onClick={() => handleMergePR(pr.id)}
                      size="sm"
                      variant="outline"
                      className="h-8 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-xs font-bold uppercase tracking-wider shrink-0 gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Merge / Accept
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteItem('pullRequests', pr.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    title="Delete PR Submission"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'ats-payments' && (filteredItems as any[]).map((pay) => (
              <div key={pay.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors animate-in fade-in duration-300">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Badge variant={pay.status === 'approved' ? 'secondary' : 'destructive'} className="text-[9px] uppercase tracking-wider font-bold h-4.5 px-2 bg-white/5 text-white" style={{ backgroundColor: pay.status === 'approved' ? 'rgba(16,185,129,0.1)' : pay.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: pay.status === 'approved' ? '#10b981' : pay.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                      {pay.status}
                    </Badge>
                    <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white">UTR Reference: {pay.utr}</h4>
                  </div>
                  <p className="text-[11px] text-slate-750 dark:text-zinc-350 leading-relaxed font-semibold">
                    Credit Amount: <span className="text-emerald-500 font-black">₹{pay.amount}.00</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                    Purchaser: {pay.email}
                  </p>
                  <div className="text-[9px] text-slate-400 dark:text-zinc-650 font-bold uppercase mt-1">
                    Submitted: {formatTime(pay.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  {pay.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleVerifyPayment(pay.id, false)}
                        size="sm"
                        variant="outline"
                        className="h-8 border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-bold uppercase tracking-wider gap-1.5"
                      >
                        Reject Reference
                      </Button>
                      <Button
                        onClick={() => handleVerifyPayment(pay.id, true)}
                        size="sm"
                        variant="outline"
                        className="h-8 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-xs font-bold uppercase tracking-wider gap-1.5"
                      >
                        Verify & Approve
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleDeleteItem('atsPayments', pay.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg animate-in fade-in duration-200"
                    title="Delete Payment Reference"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Request Details Dialog */}
      <Dialog open={feedbackAppId !== null} onOpenChange={(open) => { if(!open) setFeedbackAppId(null); }}>
        <DialogContent className="max-w-md bg-[#080808]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-black tracking-tight text-white uppercase italic flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-amber-500" /> Request Application Update
            </DialogTitle>
            <DialogDescription className="text-[11px] text-zinc-400 font-medium">
              Explain what details are missing (e.g. GitHub URL, portfolio details). The applicant will receive this feedback via email along with a reverification link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Admin Feedback</label>
              <textarea
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="Your GitHub link is incorrect, or we need more details about your Next.js experience..."
                rows={4}
                className="w-full bg-black border border-white/10 hover:border-white/20 focus:border-white/30 transition-all rounded-xl p-3 text-xs text-white focus:outline-none placeholder-white/20 resize-none"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => { setFeedbackAppId(null); setAdminFeedback(''); }} 
                className="rounded-xl h-9 text-xs"
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!feedbackAppId || !adminFeedback.trim()) {
                    toast.warning("Empty feedback", { description: "Please enter feedback details." });
                    return;
                  }
                  setSubmittingFeedback(true);
                  try {
                    const res = await requestMoreDetailsAction(feedbackAppId, adminFeedback);
                    if (res.success) {
                      toast.success("Feedback sent successfully!", {
                        description: "Candidate has been notified to resubmit details."
                      });
                      setFeedbackAppId(null);
                      setAdminFeedback('');
                    } else {
                      toast.danger("Action failed", { description: res.error });
                    }
                  } catch (err: any) {
                    toast.danger("An error occurred", { description: err.message });
                  } finally {
                    setSubmittingFeedback(false);
                  }
                }}
                disabled={submittingFeedback}
                className="rounded-xl h-9 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-40"
              >
                {submittingFeedback ? "Sending Request..." : "Send Feedback Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={deleteItemId !== null}
        onClose={() => {
          setDeleteItemId(null);
          setDeleteCollection(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Item?"
        description={`This action cannot be undone. This will permanently delete this record from ${deleteCollection || "the database"}.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
