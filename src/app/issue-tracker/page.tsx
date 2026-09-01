'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
  Bug, Search, CheckCircle2, Clock, AlertTriangle, Plus,
  ThumbsUp, MessageSquare, Calendar, User, ArrowUpDown,
  ChevronRight, Circle, GitPullRequest, ExternalLink, GitBranch,
  AlertCircle, Tag, Filter, TrendingUp, Activity, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BugReportForm } from '@/components/bug-report-form';
import { useAuth } from '@/lib/auth-context';
import { toggleBugUpvoteAction } from '@/app/actions/log-actions';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

interface BugReport {
  id: string;
  title: string;
  description: string;
  userName: string;
  userEmail?: string;
  userId?: string;
  createdAt: string;
  status: 'open' | 'resolved';
  resolvedAt?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'frontend' | 'backend' | 'ui-ux' | 'database' | 'auth' | 'other';
  upvotedBy?: string[];
  comments?: Array<{
    id: string; userName: string; userEmail: string; content: string; createdAt: string;
  }>;
  issueNumber?: number;
  imageUrl?: string;
}

interface PRSubmission {
  id: string; name: string; email: string; prLink: string; branchName: string;
  title: string; description: string; status: 'pending' | 'merged' | 'rejected';
  createdAt: string; mergedAt?: string;
}

const SEVERITY_CONFIG = {
  low: { color: 'bg-[#4285F4]/20 text-black border-black', label: 'Low', dot: 'bg-[#4285F4]' },
  medium: { color: 'bg-[#FFE600] text-black border-black', label: 'Medium', dot: 'bg-black' },
  high: { color: 'bg-orange-300 text-black border-black', label: 'High', dot: 'bg-orange-600' },
  critical: { color: 'bg-[#EA4335] text-white border-black', label: 'Critical', dot: 'bg-white' },
};

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend UI', backend: 'Backend & APIs', 'ui-ux': 'UI/UX Design',
  database: 'Database', auth: 'Authentication', other: 'General',
};
const CATEGORY_COLORS: Record<string, string> = {
  frontend: 'bg-purple-100 text-black border-black',
  backend: 'bg-cyan-100 text-black border-black',
  'ui-ux': 'bg-pink-100 text-black border-black',
  database: 'bg-amber-100 text-black border-black',
  auth: 'bg-emerald-100 text-black border-black',
  other: 'bg-zinc-100 text-black border-black',
};

// ─── Activity Graph Component ─────────────────────────────────────────────────
function ActivityGraph({ bugs }: { bugs: BugReport[] }) {
  const weeks = 24;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activityMap = useMemo(() => {
    const map: Record<string, { raised: number; resolved: number }> = {};
    bugs.forEach(bug => {
      const raisedDate = new Date(bug.createdAt);
      raisedDate.setHours(0, 0, 0, 0);
      const raisedKey = raisedDate.toISOString().split('T')[0];
      if (!map[raisedKey]) map[raisedKey] = { raised: 0, resolved: 0 };
      map[raisedKey].raised++;

      if (bug.resolvedAt) {
        const resolvedDate = new Date(bug.resolvedAt);
        resolvedDate.setHours(0, 0, 0, 0);
        const resolvedKey = resolvedDate.toISOString().split('T')[0];
        if (!map[resolvedKey]) map[resolvedKey] = { raised: 0, resolved: 0 };
        map[resolvedKey].resolved++;
      }
    });
    return map;
  }, [bugs]);

  const cells = useMemo(() => {
    const grid: { date: Date; key: string; raised: number; resolved: number; total: number }[][] = [];
    const start = new Date(today);
    start.setDate(start.getDate() - (weeks * 7) + 1);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    let col: typeof grid[0] = [];
    let current = new Date(start);

    while (current <= today || col.length > 0) {
      const key = current.toISOString().split('T')[0];
      const data = activityMap[key] || { raised: 0, resolved: 0 };
      col.push({ date: new Date(current), key, raised: data.raised, resolved: data.resolved, total: data.raised + data.resolved });

      if (col.length === 7) {
        grid.push(col);
        col = [];
      }

      current.setDate(current.getDate() + 1);
      if (current > today && col.length === 0) break;
    }
    if (col.length > 0) {
      while (col.length < 7) {
        col.push({ date: new Date(current), key: '', raised: 0, resolved: 0, total: -1 });
        current.setDate(current.getDate() + 1);
      }
      grid.push(col);
    }
    return grid;
  }, [activityMap, today, weeks]);

  const maxActivity = useMemo(() => Math.max(...Object.values(activityMap).map(v => v.raised + v.resolved), 1), [activityMap]);

  const getCellColor = (cell: { total: number; resolved: number; raised: number }) => {
    if (cell.total < 0) return 'bg-transparent';
    if (cell.total === 0) return 'bg-zinc-100 border-zinc-300';
    const ratio = cell.total / maxActivity;
    if (cell.resolved > 0 && cell.raised === 0) {
      if (ratio > 0.75) return 'bg-[#00FF66] border-black';
      if (ratio > 0.4) return 'bg-[#00FF66]/70 border-black';
      return 'bg-[#00FF66]/40 border-black';
    }
    if (ratio > 0.75) return 'bg-[#4285F4] border-black';
    if (ratio > 0.4) return 'bg-[#4285F4]/70 border-black';
    return 'bg-[#4285F4]/40 border-black';
  };

  const monthLabels = useMemo(() => {
    const labels: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;
    cells.forEach((col, i) => {
      if (col[0] && col[0].date) {
        const m = col[0].date.getMonth();
        if (m !== lastMonth) {
          labels.push({ label: col[0].date.toLocaleString('default', { month: 'short' }), colIndex: i });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [cells]);

  const totalResolved = bugs.filter(b => b.status === 'resolved').length;
  const totalRaisedLast30 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return bugs.filter(b => new Date(b.createdAt) >= cutoff).length;
  }, [bugs]);

  return (
    <div className="border-2 border-black bg-white p-5 space-y-4 shadow-[5px_5px_0px_0px_#000000]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div>
          <h3 className="text-sm font-black uppercase italic tracking-tight text-black flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#4285F4]" />
            Telemetry & Issue Velocity
          </h3>
          <p className="text-xs text-zinc-600 font-bold mt-0.5">
            {totalResolved} issues resolved · {totalRaisedLast30} raised in the last 30 days
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-black">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#4285F4] border border-black inline-block shadow-[1px_1px_0px_0px_#000000]" /> Raised</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#00FF66] border border-black inline-block shadow-[1px_1px_0px_0px_#000000]" /> Resolved</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-zinc-100 border border-black inline-block" /> Idle</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${cells.length * 15}px` }}>
          <div className="flex gap-0.5 mb-1">
            <div className="w-6 shrink-0" />
            {cells.map((col, i) => {
              const ml = monthLabels.find(m => m.colIndex === i);
              return (
                <div key={i} className="w-3 flex-shrink-0 flex items-center justify-center">
                  {ml && <span className="text-[8px] text-black font-black uppercase whitespace-nowrap -ml-1 font-mono">{ml.label}</span>}
                </div>
              );
            })}
          </div>

          {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((day, dayIdx) => (
            <div key={dayIdx} className="flex gap-0.5 mb-0.5">
              <div className="w-6 shrink-0 flex items-center">
                <span className="text-[8px] text-zinc-600 font-mono font-black uppercase">{day}</span>
              </div>
              {cells.map((col, colIdx) => {
                const cell = col[dayIdx];
                if (!cell) return <div key={colIdx} className="w-3.5 h-3.5 flex-shrink-0" />;
                const color = getCellColor(cell);
                const isFuture = cell.date > today;
                return (
                  <div
                    key={colIdx}
                    className={cn(
                      'w-3.5 h-3.5 border flex-shrink-0 transition-transform hover:scale-125 cursor-default',
                      color,
                      isFuture && 'opacity-0 pointer-events-none'
                    )}
                    title={cell.total > 0 ? `${cell.date.toDateString()}: ${cell.raised} raised, ${cell.resolved} resolved` : cell.date.toDateString()}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function AvatarInitial({ name }: { name: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="w-7 h-7 border-2 border-black bg-[#FFE600] flex items-center justify-center font-black text-black text-xs shrink-0 shadow-[1px_1px_0px_0px_#000000]">
      {initial}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IssueTrackerPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'issues' | 'prs'>('issues');
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [prs, setPrs] = useState<PRSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [issueState, setIssueState] = useState<'open' | 'closed'>('open');
  const [prStatusFilter, setPrStatusFilter] = useState<'all' | 'pending' | 'merged'>('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'upvotes' | 'comments'>('newest');
  const [reportOpen, setReportOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'bugReports'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: BugReport[] = [];
      let issueIdx = 0;
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || '',
          description: data.description || '',
          userName: data.userName || 'Anonymous',
          userEmail: data.userEmail || '',
          userId: data.userId || '',
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'open',
          resolvedAt: data.resolvedAt,
          severity: data.severity || 'medium',
          category: data.category || 'other',
          upvotedBy: data.upvotedBy || [],
          comments: data.comments || [],
          issueNumber: issueIdx + 1,
          imageUrl: data.imageUrl || '',
        });
        issueIdx++;
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBugs(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'pullRequests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: PRSubmission[] = [];
      snap.forEach(d => {
        const data = d.data();
        list.push({ id: d.id, name: data.name || '', email: data.email || '', prLink: data.prLink || '', branchName: data.branchName || '', title: data.title || '', description: data.description || '', status: data.status || 'pending', createdAt: data.createdAt || new Date().toISOString(), mergedAt: data.mergedAt });
      });
      setPrs(list);
    });
    return () => unsub();
  }, []);

  const openCount = bugs.filter(b => b.status === 'open').length;
  const closedCount = bugs.filter(b => b.status === 'resolved').length;
  const mergedPrCount = prs.filter(p => p.status === 'merged').length;

  const processedBugs = bugs
    .filter(bug => {
      const s = search.toLowerCase();
      const matchSearch = !s || bug.title.toLowerCase().includes(s) || bug.description.toLowerCase().includes(s) || bug.userName.toLowerCase().includes(s) || String(bug.issueNumber).includes(s);
      const matchState = issueState === 'open' ? bug.status === 'open' : bug.status === 'resolved';
      const matchSev = severityFilter === 'all' || bug.severity === severityFilter;
      const matchCat = categoryFilter === 'all' || bug.category === categoryFilter;
      return matchSearch && matchState && matchSev && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'upvotes') return (b.upvotedBy?.length || 0) - (a.upvotedBy?.length || 0);
      if (sortBy === 'comments') return (b.comments?.length || 0) - (a.comments?.length || 0);
      return 0;
    });

  const processedPRs = prs.filter(pr => {
    const s = search.toLowerCase();
    const matchSearch = !s || pr.title.toLowerCase().includes(s) || pr.name.toLowerCase().includes(s) || pr.branchName.toLowerCase().includes(s);
    const matchStatus = prStatusFilter === 'all' || pr.status === prStatusFilter || (prStatusFilter === 'merged' && pr.status === 'merged');
    return matchSearch && matchStatus;
  });

  const formatRelative = (s: string) => {
    try {
      const diff = Date.now() - new Date(s).getTime();
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor(diff / 60000);
      if (days > 30) return new Date(s).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (mins > 0) return `${mins}m ago`;
      return 'just now';
    } catch { return s; }
  };

  const handleUpvote = async (bugId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user?.email) { toast.warning('Sign in to upvote'); return; }
    await toggleBugUpvoteAction(bugId, user.email);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 Developer Issue Tracker & Open Source Pipeline
      </div>

      {/* Header */}
      <div className="border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] border-2 border-black text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_#000000]">
                <Bug className="h-3.5 w-3.5" /> [ ISSUE TRACKER // REPO RADAR ]
              </div>
              <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-black">
                MLSC SVEC <span className="text-zinc-400">/</span> <span className="text-[#4285F4]">mlsc.svec</span>
              </h1>
              <p className="text-zinc-700 text-xs sm:text-sm font-bold max-w-xl">
                Report bugs, submit feature proposals, and track open pull requests across the official platform codebase.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-xs font-black uppercase font-mono">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-black bg-[#00FF66]">
                  <Circle className="h-3 w-3 fill-black text-black" /> {openCount} Open
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-black bg-purple-200">
                  <CheckCircle2 className="h-3 w-3 text-black" /> {closedCount} Closed
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-black bg-[#FFE600]">
                  <GitBranch className="h-3 w-3 text-black" /> {mergedPrCount} Merged PRs
                </span>
              </div>
            </div>

            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[4px_4px_0px_0px_#000000] h-12 px-6 text-xs font-black uppercase tracking-wider flex items-center gap-2 active:translate-x-[2px] active:translate-y-[2px] shrink-0">
                  <Plus className="h-4 w-4" /> Open New Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white border-2 border-black p-6 sm:p-8 text-black shadow-[8px_8px_0px_0px_#000000]">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-black uppercase italic tracking-tight text-black flex items-center gap-2">
                    <Bug className="h-5 w-5 text-[#EA4335]" /> Open a New Issue
                  </DialogTitle>
                  <DialogDescription className="text-xs font-bold text-zinc-600">
                    Describe the bug clearly. Live confirmation will be dispatched to your email.
                  </DialogDescription>
                </DialogHeader>
                <BugReportForm isDialog onSuccess={() => setReportOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Activity Graph */}
        {!loading && bugs.length > 0 && (
          <ActivityGraph bugs={bugs} />
        )}

        {/* Tab switcher */}
        <div className="flex gap-3 border-b-2 border-black pb-1">
          <button
            onClick={() => { setActiveTab('issues'); setSearch(''); }}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider border-2 border-black transition-all shadow-[3px_3px_0px_0px_#000000]',
              activeTab === 'issues' ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-600 hover:bg-zinc-100'
            )}
          >
            <Bug className="h-4 w-4" /> Issues
            <span className="px-2 py-0.5 border border-black bg-white text-black text-[10px] font-mono font-black">
              {bugs.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('prs'); setSearch(''); }}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider border-2 border-black transition-all shadow-[3px_3px_0px_0px_#000000]',
              activeTab === 'prs' ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-600 hover:bg-zinc-100'
            )}
          >
            <GitPullRequest className="h-4 w-4" /> Pull Requests
            <span className="px-2 py-0.5 border border-black bg-white text-black text-[10px] font-mono font-black">
              {prs.length}
            </span>
          </button>
        </div>

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            <div className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]">
              
              {/* Search + filter toggle */}
              <div className="flex items-center gap-3 p-4 border-b-2 border-black bg-zinc-50">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
                  <input
                    type="text"
                    placeholder="Search issues by title, reporter, or ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border-2 border-black pl-10 pr-3 h-10 text-xs font-bold text-black focus:outline-none focus:bg-[#FFE600]/10 placeholder-zinc-500 shadow-[2px_2px_0px_0px_#000000]"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 h-10 border-2 border-black text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000]',
                    showFilters ? 'bg-[#FFE600] text-black' : 'bg-white text-black hover:bg-zinc-100'
                  )}
                >
                  <Filter className="h-3.5 w-3.5" /> Filters
                </button>
              </div>

              {/* Filter drawer */}
              {showFilters && (
                <div className="p-4 border-b-2 border-black bg-zinc-100 flex flex-wrap gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black">Severity</label>
                    <select
                      value={severityFilter}
                      onChange={e => setSeverityFilter(e.target.value)}
                      className="bg-white border-2 border-black px-3 h-8 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    >
                      <option value="all">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="bg-white border-2 border-black px-3 h-8 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    >
                      <option value="all">All</option>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="bg-white border-2 border-black px-3 h-8 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="upvotes">Most upvoted</option>
                      <option value="comments">Most commented</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Status toggle tabs */}
              <div className="px-4 py-3 border-b-2 border-black flex items-center gap-2 bg-zinc-50">
                <button
                  onClick={() => setIssueState('open')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider transition-all',
                    issueState === 'open' ? 'bg-[#00FF66] text-black shadow-[2px_2px_0px_0px_#000000]' : 'bg-white text-zinc-600 hover:bg-zinc-100'
                  )}
                >
                  <Circle className="h-3.5 w-3.5 fill-black text-black" />
                  {openCount} Open
                </button>
                <button
                  onClick={() => setIssueState('closed')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider transition-all',
                    issueState === 'closed' ? 'bg-purple-200 text-black shadow-[2px_2px_0px_0px_#000000]' : 'bg-white text-zinc-600 hover:bg-zinc-100'
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                  {closedCount} Closed
                </button>
              </div>

              {/* Issues list */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mb-3" />
                  <p className="text-xs text-black font-black uppercase tracking-widest">Polling live issues...</p>
                </div>
              ) : processedBugs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 space-y-3">
                  <Bug className="h-10 w-10 text-zinc-400" />
                  <p className="text-black font-black uppercase italic tracking-tight text-base">No {issueState} issues found</p>
                  <p className="text-zinc-600 text-xs font-bold">
                    {search ? 'Try adjusting your search criteria.' : issueState === 'open' ? 'All reported issues resolved!' : 'No archived issues.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y-2 divide-black">
                  {processedBugs.map((bug) => {
                    const hasUpvoted = user?.email ? bug.upvotedBy?.includes(user.email) : false;
                    const sevInfo = SEVERITY_CONFIG[bug.severity] || SEVERITY_CONFIG.medium;
                    const catColor = CATEGORY_COLORS[bug.category] || CATEGORY_COLORS.other;

                    return (
                      <Link
                        key={bug.id}
                        href={`/issue-tracker/${bug.id}`}
                        className="flex items-start gap-3.5 p-4 hover:bg-zinc-50 transition-colors group"
                      >
                        <div className="mt-1 shrink-0">
                          {bug.status === 'open'
                            ? <Circle className="h-4 w-4 text-black fill-[#00FF66]" />
                            : <CheckCircle2 className="h-4 w-4 text-purple-700" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm font-black uppercase italic tracking-tight text-black group-hover:text-[#4285F4] transition-colors">
                              {bug.title}
                            </h3>
                            <span className={cn('px-2 py-0.5 text-[10px] font-black uppercase border', sevInfo.color)}>
                              {sevInfo.label}
                            </span>
                            <span className={cn('px-2 py-0.5 text-[10px] font-black uppercase border', catColor)}>
                              {CATEGORY_LABELS[bug.category] || bug.category}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 font-bold flex flex-wrap items-center gap-1.5 font-mono">
                            <span className="text-black font-black">#{bug.issueNumber}</span>
                            <span>·</span>
                            <span>
                              {bug.status === 'open'
                                ? <>opened {formatRelative(bug.createdAt)} by <span className="text-black font-sans">{bug.userName}</span></>
                                : <>closed {formatRelative(bug.resolvedAt || bug.createdAt)} · opened by <span className="text-black font-sans">{bug.userName}</span></>
                              }
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {(bug.upvotedBy?.length || 0) > 0 && (
                            <button
                              onClick={e => handleUpvote(bug.id, e)}
                              className={cn(
                                'flex items-center gap-1 px-2.5 py-1 border border-black text-xs font-black uppercase transition-colors shadow-[1px_1px_0px_0px_#000000]',
                                hasUpvoted ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-600 hover:bg-zinc-100'
                              )}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              {bug.upvotedBy?.length}
                            </button>
                          )}
                          {(bug.comments?.length || 0) > 0 && (
                            <div className="flex items-center gap-1 text-xs text-zinc-700 font-bold">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {bug.comments?.length}
                            </div>
                          )}
                          <AvatarInitial name={bug.userName} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRs Tab */}
        {activeTab === 'prs' && (
          <div className="space-y-4">
            <div className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]">
              
              <div className="flex items-center gap-3 p-4 border-b-2 border-black bg-zinc-50">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
                  <input
                    type="text"
                    placeholder="Search pull requests..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border-2 border-black pl-10 pr-3 h-10 text-xs font-bold text-black focus:outline-none focus:bg-[#FFE600]/10 placeholder-zinc-500 shadow-[2px_2px_0px_0px_#000000]"
                  />
                </div>
              </div>

              <div className="px-4 py-3 border-b-2 border-black flex items-center gap-2 bg-zinc-50">
                {[
                  { value: 'all', label: `All (${prs.length})`, icon: <GitPullRequest className="h-3.5 w-3.5" /> },
                  { value: 'pending', label: `In Review (${prs.filter(p => p.status === 'pending').length})`, icon: <Clock className="h-3.5 w-3.5 text-black" /> },
                  { value: 'merged', label: `Merged (${mergedPrCount})`, icon: <GitBranch className="h-3.5 w-3.5 text-black" /> },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setPrStatusFilter(tab.value as any)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider transition-all',
                      prStatusFilter === tab.value ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]' : 'bg-white text-zinc-600 hover:bg-zinc-100'
                    )}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {processedPRs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <GitPullRequest className="h-10 w-10 text-zinc-400" />
                  <p className="text-black font-black uppercase italic tracking-tight text-base">No pull requests found</p>
                </div>
              ) : (
                <div className="divide-y-2 divide-black">
                  {processedPRs.map(pr => (
                    <div key={pr.id} className="flex items-start justify-between gap-3 p-4 hover:bg-zinc-50 transition-colors">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-1 shrink-0">
                          {pr.status === 'merged'
                            ? <GitBranch className="h-4 w-4 text-purple-700" />
                            : <GitPullRequest className="h-4 w-4 text-[#00FF66]" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-black uppercase italic tracking-tight text-black">{pr.title}</h3>
                            <span className={cn(
                              'px-2 py-0.5 text-[10px] font-black uppercase border border-black',
                              pr.status === 'merged' ? 'bg-purple-200 text-black' :
                              pr.status === 'rejected' ? 'bg-[#EA4335] text-white' :
                              'bg-[#FFE600] text-black'
                            )}>
                              {pr.status === 'merged' ? 'Merged' : pr.status === 'rejected' ? 'Changes Requested' : 'In Review'}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-mono font-black border border-black bg-zinc-100 text-black flex items-center gap-1">
                              <GitBranch className="h-2.5 w-2.5" />{pr.branchName}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 font-bold font-mono">
                            #{pr.id.substring(0, 6).toUpperCase()} · opened {formatRelative(pr.createdAt)} by <span className="text-black font-sans">{pr.name}</span>
                            {pr.mergedAt && <> · merged {formatRelative(pr.mergedAt)}</>}
                          </p>
                          {pr.description && <p className="text-xs text-zinc-700 font-semibold line-clamp-1">{pr.description}</p>}
                        </div>
                      </div>
                      <a
                        href={pr.prLink}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white hover:bg-[#FFE600] text-xs font-black uppercase tracking-wider text-black transition-all shadow-[2px_2px_0px_0px_#000000]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View PR</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
