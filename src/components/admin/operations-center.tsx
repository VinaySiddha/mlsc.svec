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
  updateDoc
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
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { resolveBugReportAction } from '@/app/actions/log-actions';

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

interface OperationsCenterProps {
  mode: 'activity' | 'errors' | 'bugs' | 'moderation' | 'users';
}

export function OperationsCenter({ mode }: OperationsCenterProps) {
  const [activities, setActivities] = useState<LogEntry[]>([]);
  const [errors, setErrors] = useState<LogEntry[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [moderation, setModeration] = useState<CommunityReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return timeStr;
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
    const data = users;
    if (!queryLower) return data;
    return data.filter(u => 
      u.displayName.toLowerCase().includes(queryLower) || 
      u.email.toLowerCase().includes(queryLower) || 
      (u.username && u.username.toLowerCase().includes(queryLower)) ||
      u.role.toLowerCase().includes(queryLower)
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
                <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-650 shrink-0 select-none">
                  {formatTime(log.timestamp)}
                </span>
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
                <span className="text-[9px] font-bold text-red-400 dark:text-red-900/60 shrink-0 select-none">
                  {formatTime(err.timestamp)}
                </span>
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

                <div className="text-right shrink-0 select-none">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-650">Registered</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-0.5">
                    {formatTime(user.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
