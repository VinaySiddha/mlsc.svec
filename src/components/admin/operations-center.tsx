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
          icon: <Activity className="h-5 w-5 text-black stroke-[2.5]" />
        };
      case 'errors':
        return {
          title: "System Error Reports",
          desc: "Real-time logging of database failures and server exceptions",
          icon: <AlertCircle className="h-5 w-5 text-black stroke-[2.5]" />
        };
      case 'bugs':
        return {
          title: "Bug Tickets & Feedback",
          desc: "User-submitted bug reports and feature requests from the public site",
          icon: <Bug className="h-5 w-5 text-black stroke-[2.5]" />
        };
      case 'moderation':
        return {
          title: "Community Moderation Flags",
          desc: "Reported comments and posts pending moderator actions",
          icon: <ShieldAlert className="h-5 w-5 text-black stroke-[2.5]" />
        };
      case 'users':
        return {
          title: "Latest Registered Users",
          desc: "Live list of student profiles newly onboarding onto the portal",
          icon: <Users className="h-5 w-5 text-black stroke-[2.5]" />
        };
      case 'contributors':
        return {
          title: "Contributor Requests",
          desc: "Applications from students interested in open-source contribution",
          icon: <Users className="h-5 w-5 text-black stroke-[2.5]" />
        };
      case 'pullrequests':
        return {
          title: "PR Merge Requests",
          desc: "Pull request review and merge requests submitted by open-source contributors",
          icon: <GitPullRequest className="h-5 w-5 text-black stroke-[2.5]" />
        };
      case 'ats-payments':
        return {
          title: "ATS Credit Payments",
          desc: "Verify and approve UPI transaction UTR codes to unlock ATS Resume evaluation credits",
          icon: <CreditCard className="h-5 w-5 text-black stroke-[2.5]" />
        };
    }
  };

  const config = getTitleAndDesc();

  return (
    <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000000] font-sans text-black">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            {config.icon}
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-tight font-display">
              {config.title}
            </h2>
            <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider mt-0.5">
              {config.desc}
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black stroke-[2.5]" />
          <input
            type="text"
            placeholder={`Filter results...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-black bg-white text-xs font-bold text-black focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#000000] transition-all placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Dynamic contents list */}
      <div className="min-h-[350px] max-h-[600px] overflow-y-auto pr-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-black">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-3" />
            <p className="text-xs font-black uppercase tracking-wider">Listening to database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-black border-4 border-dashed border-zinc-300 bg-zinc-50">
            <Clock className="h-8 w-8 text-zinc-400 mb-3 stroke-[2.5]" />
            <p className="text-xs font-black uppercase tracking-wider">No logs found</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Real-time listeners are active and waiting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === 'activity' && (filteredItems as LogEntry[]).map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 p-4 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-50 transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#4285F4] border border-black" />
                    <p className="text-xs font-black text-black">{log.message}</p>
                  </div>
                  {log.details && (
                    <p className="text-xs text-zinc-600 pl-4.5 font-medium leading-relaxed">
                      {log.details}
                    </p>
                  )}
                  {log.userName && (
                    <p className="text-[10px] text-zinc-500 pl-4.5 font-bold uppercase tracking-wider">
                      By: {log.userName} {log.userEmail ? `(${log.userEmail})` : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-zinc-600 select-none">
                    {formatTime(log.timestamp)}
                  </span>
                  <Button
                    onClick={() => handleDeleteItem('systemLogs', log.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[#FF0055] hover:bg-[#FF0055]/10 border border-transparent hover:border-black rounded-none transition-colors"
                    title="Delete Log"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'errors' && (filteredItems as LogEntry[]).map((err) => (
              <div key={err.id} className="flex items-start justify-between gap-4 p-4 border-2 border-black bg-[#FF0055]/5 shadow-[3px_3px_0px_0px_#000000] transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF0055] border border-black" />
                    <p className="text-xs font-black text-[#FF0055]">{err.message}</p>
                  </div>
                  {err.details && (
                    <pre className="text-[11px] text-black pl-4.5 font-mono bg-white border-2 border-black p-3 mt-2 max-w-full overflow-x-auto shadow-[2px_2px_0px_0px_#000000]">
                      <code>{err.details}</code>
                    </pre>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-[#FF0055] select-none">
                    {formatTime(err.timestamp)}
                  </span>
                  <Button
                    onClick={() => handleDeleteItem('systemLogs', err.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[#FF0055] hover:bg-[#FF0055]/10 border border-transparent hover:border-black rounded-none"
                    title="Delete Error Log"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'bugs' && (filteredItems as BugReport[]).map((bug) => (
              <div key={bug.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-50 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase tracking-wider ${
                      bug.status === 'open' ? 'bg-[#FF0055] text-white' : 'bg-[#00FF66] text-black'
                    }`}>
                      {bug.status}
                    </span>
                    <h4 className="text-xs font-black text-black">{bug.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed font-semibold">
                    {bug.description}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-600 font-bold uppercase">
                    <span>Reporter: {bug.userName} ({bug.userEmail})</span>
                    <span>•</span>
                    <span>Reported: {formatTime(bug.createdAt)}</span>
                    {bug.resolvedAt && (
                      <>
                        <span>•</span>
                        <span className="text-[#00AA44] font-black">Resolved: {formatTime(bug.resolvedAt)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  {bug.status === 'open' && (
                    <Button
                      onClick={() => handleResolveBug(bug.id)}
                      size="sm"
                      className="h-8 bg-[#00FF66] hover:bg-[#00dd55] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer rounded-none gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                      Resolve
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteItem('bugReports', bug.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[#FF0055] hover:bg-[#FF0055]/10 border border-transparent hover:border-black rounded-none"
                    title="Delete Bug Ticket"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'moderation' && (filteredItems as CommunityReport[]).map((report) => (
              <div key={report.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-50 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase tracking-wider ${
                      report.resolved ? 'bg-zinc-200 text-black' : 'bg-[#FFE600] text-black'
                    }`}>
                      {report.resolved ? 'Resolved' : 'Active Flag'}
                    </span>
                    <h4 className="text-xs font-black text-black uppercase tracking-wider">
                      Reported {report.contentType}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed font-semibold">
                    Reason: <span className="text-black font-black">"{report.reason}"</span>
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-600 font-bold uppercase">
                    <span>Content ID: {report.contentId}</span>
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
                      className="h-8 bg-white hover:bg-zinc-100 text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer rounded-none gap-1.5"
                    >
                      Dismiss Flag
                    </Button>
                  )}
                  <Button
                    onClick={() => window.open(`/community/${report.postId}`, '_blank')}
                    size="sm"
                    className="h-8 bg-[#4285F4] hover:bg-[#3367d6] text-white border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer rounded-none gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5 stroke-[2.5]" />
                    Moderate
                  </Button>
                  <Button
                    onClick={() => handleDeleteItem('communityReports', report.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[#FF0055] hover:bg-[#FF0055]/10 border border-transparent hover:border-black rounded-none"
                    title="Delete Flag"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'users' && (filteredItems as UserProfile[]).map((user) => (
              <div key={user.uid} className="flex items-center justify-between gap-4 p-4 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="h-9 w-9 rounded-full border-2 border-black select-none object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-[#FFE600] border-2 border-black flex items-center justify-center select-none text-xs font-black text-black uppercase">
                      {user.displayName.substring(0, 2)}
                    </div>
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-black text-black truncate">{user.displayName}</p>
                      <span className={`text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 border border-black ${ 
                        user.role === 'super_admin' ? "bg-[#FF0055] text-white" :
                        user.role === 'admin' ? "bg-[#4285F4] text-white" :
                        "bg-zinc-100 text-black"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-mono font-bold truncate">
                      {user.email} {user.username ? `• @${user.username}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right select-none">
                    <p className="text-[9px] font-black text-zinc-500 uppercase">Registered</p>
                    <p className="text-[10px] font-mono font-bold text-black mt-0.5">
                      {formatTime(user.createdAt)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteItem('users', user.uid)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[#FF0055] hover:bg-[#FF0055]/10 border border-transparent hover:border-black rounded-none"
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'contributors' && (filteredItems as ContributorApplication[]).map((app) => (
              <div key={app.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-50 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase tracking-wider ${
                      app.status === 'approved' ? "bg-[#00FF66] text-black" :
                      app.status === 'pending' ? "bg-[#FFE600] text-black" :
                      app.status === 'resubmitted' ? "bg-[#4285F4] text-white" :
                      "bg-[#FF0055] text-white"
                    }`}>
                      {app.status === 'insufficient' ? 'details requested' : app.status}
                    </span>
                    <h4 className="text-xs font-black text-black">{app.name}</h4>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed font-semibold">
                    Department: <span className="text-black font-black">{app.department}</span>
                  </p>
                  <p className="text-xs text-zinc-600 font-semibold">
                    Skills: {app.skills}
                  </p>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    Message: "{app.message}"
                  </p>
                  {app.feedback && (
                    <div className="text-xs text-black bg-[#FFE600]/20 border-2 border-black p-2.5 mt-2 max-w-lg font-bold leading-relaxed shadow-[2px_2px_0px_0px_#000000]">
                      <strong>Admin Feedback:</strong> "{app.feedback}"
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-600 font-bold uppercase mt-2">
                    <span>Email: {app.email}</span>
                    {app.github && (
                      <>
                        <span>•</span>
                        <a href={`https://github.com/${app.github}`} target="_blank" rel="noreferrer" className="text-[#4285F4] hover:underline inline-flex items-center gap-0.5 font-mono lowercase normal-case">
                          GitHub: @{app.github} <ExternalLink className="h-2.5 w-2.5" />
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
                        className="h-8 bg-[#FFE600] hover:bg-[#f5dc00] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer rounded-none gap-1.5"
                      >
                        <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                        Request Updates
                      </Button>
                      <Button
                        onClick={() => handleReviewContribution(app.id)}
                        size="sm"
                        className="h-8 bg-[#00FF66] hover:bg-[#00dd55] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer rounded-none gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        Approve Request
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleDeleteItem('contributions', app.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[#FF0055] hover:bg-[#FF0055]/10 border border-transparent hover:border-black rounded-none"
                    title="Delete Contributor Application"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'pullrequests' && (filteredItems as PRSubmission[]).map((pr) => (
              <div key={pr.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-50 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase tracking-wider ${
                      pr.status === 'merged' ? "bg-[#00FF66] text-black" : "bg-[#FFE600] text-black"
                    }`}>
                      {pr.status === 'merged' ? 'Merged' : 'Pending'}
                    </span>
                    <h4 className="text-xs font-black text-black">{pr.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed font-semibold">
                    Branch: <code className="bg-zinc-100 border border-black px-1.5 py-0.5 font-mono text-black font-bold">{pr.branchName}</code>
                  </p>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    Description: "{pr.description}"
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-600 font-bold uppercase mt-2">
                    <span>By: {pr.name} ({pr.email})</span>
                    <span>•</span>
                    <a href={pr.prLink} target="_blank" rel="noreferrer" className="text-[#4285F4] hover:underline inline-flex items-center gap-0.5 font-mono lowercase normal-case">
                      PR Link: {pr.prLink} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <span>•</span>
                    <span>Submitted: {formatTime(pr.createdAt)}</span>
                    {pr.mergedAt && (
                      <>
                        <span>•</span>
                        <span className="text-[#00AA44] font-black">Merged: {formatTime(pr.mergedAt)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  {pr.status === 'pending' && (
                    <Button
                      onClick={() => handleMergePR(pr.id)}
                      size="sm"
                      className="h-8 bg-[#00FF66] hover:bg-[#00dd55] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer rounded-none gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                      Merge / Accept
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteItem('pullRequests', pr.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[#FF0055] hover:bg-[#FF0055]/10 border border-transparent hover:border-black rounded-none"
                    title="Delete PR Submission"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            ))}

            {mode === 'ats-payments' && (filteredItems as any[]).map((pay) => (
              <div key={pay.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-50 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase tracking-wider ${
                      pay.status === 'approved' ? "bg-[#00FF66] text-black" : pay.status === 'pending' ? "bg-[#FFE600] text-black" : "bg-[#FF0055] text-white"
                    }`}>
                      {pay.status}
                    </span>
                    <h4 className="text-xs font-mono font-black text-black">UTR: {pay.utr}</h4>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed font-semibold">
                    Credit Amount: <span className="text-black font-black">₹{pay.amount}.00</span>
                  </p>
                  <p className="text-xs text-zinc-600 font-mono font-bold">
                    Purchaser: {pay.email}
                  </p>
                  <div className="text-[10px] text-zinc-600 font-bold uppercase mt-1">
                    Submitted: {formatTime(pay.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  {pay.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleVerifyPayment(pay.id, false)}
                        size="sm"
                        className="h-8 bg-[#FF0055] hover:bg-[#dd0044] text-white border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer rounded-none gap-1.5"
                      >
                        Reject Reference
                      </Button>
                      <Button
                        onClick={() => handleVerifyPayment(pay.id, true)}
                        size="sm"
                        className="h-8 bg-[#00FF66] hover:bg-[#00dd55] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] cursor-pointer rounded-none gap-1.5"
                      >
                        Verify & Approve
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleDeleteItem('atsPayments', pay.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[#FF0055] hover:bg-[#FF0055]/10 border border-transparent hover:border-black rounded-none"
                    title="Delete Payment Reference"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Request Details Dialog */}
      <Dialog open={feedbackAppId !== null} onOpenChange={(open) => { if(!open) setFeedbackAppId(null); }}>
        <DialogContent className="max-w-md bg-white border-4 border-black p-6 text-black shadow-[8px_8px_0px_0px_#000000] rounded-none font-sans">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-black tracking-tight text-black uppercase flex items-center gap-2 font-display">
              <AlertCircle className="h-5 w-5 text-black stroke-[2.5]" /> Request Application Update
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-600 font-semibold">
              Explain what details are missing (e.g. GitHub URL, portfolio details). The applicant will receive this feedback via email along with a reverification link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-black">Admin Feedback</label>
              <textarea
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="Your GitHub link is incorrect, or we need more details about your Next.js experience..."
                rows={4}
                className="w-full bg-white border-2 border-black p-3 text-xs font-bold text-black focus:outline-none placeholder:text-zinc-400 resize-none rounded-none shadow-[2px_2px_0px_0px_#000000]"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => { setFeedbackAppId(null); setAdminFeedback(''); }} 
                className="rounded-none h-9 text-xs font-black uppercase border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000000]"
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
                className="rounded-none h-9 bg-[#FFE600] hover:bg-[#f5dc00] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] disabled:opacity-50 cursor-pointer"
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
