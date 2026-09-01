'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
  Bug, Search, CheckCircle2, Clock, AlertTriangle, Plus,
  ThumbsUp, MessageSquare, Calendar, User, ArrowUpDown,
  ChevronRight, Circle, GitPullRequest, ExternalLink, GitBranch,
  AlertCircle, Tag, Filter, TrendingUp, Activity
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
  low: { color: 'bg-blue-500/15 text-blue-300 border-blue-500/30', label: 'Low', dot: 'bg-blue-400' },
  medium: { color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', label: 'Medium', dot: 'bg-yellow-400' },
  high: { color: 'bg-orange-500/15 text-orange-300 border-orange-500/30', label: 'High', dot: 'bg-orange-400' },
  critical: { color: 'bg-red-500/15 text-red-300 border-red-500/30', label: 'Critical', dot: 'bg-red-400' },
};

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend UI', backend: 'Backend & APIs', 'ui-ux': 'UI/UX Design',
  database: 'Database', auth: 'Authentication', other: 'General',
};
const CATEGORY_COLORS: Record<string, string> = {
  frontend: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  backend: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'ui-ux': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  database: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  auth: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  other: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
};

// ─── Activity Graph Component ─────────────────────────────────────────────────
function ActivityGraph({ bugs }: { bugs: BugReport[] }) {
  const weeks = 24;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a map: dateStr -> { raised, resolved }
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

  // Build grid of last N weeks
  const cells = useMemo(() => {
    const grid: { date: Date; key: string; raised: number; resolved: number; total: number }[][] = [];
    // Start from the beginning of the week `weeks` weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - (weeks * 7) + 1);
    // Align to Monday
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
        col.push({ date: new Date(current), key: '', raised: 0, resolved: 0, total: -1 }); // filler
        current.setDate(current.getDate() + 1);
      }
      grid.push(col);
    }
    return grid;
  }, [activityMap, today, weeks]);

  const maxActivity = useMemo(() => Math.max(...Object.values(activityMap).map(v => v.raised + v.resolved), 1), [activityMap]);

  const getCellColor = (cell: { total: number; resolved: number; raised: number }) => {
    if (cell.total < 0) return 'bg-transparent'; // filler
    if (cell.total === 0) return 'bg-white/[0.04] border-white/[0.04]';
    const ratio = cell.total / maxActivity;
    if (cell.resolved > 0 && cell.raised === 0) {
      // Pure resolved day
      if (ratio > 0.75) return 'bg-emerald-500 border-emerald-400/50';
      if (ratio > 0.4) return 'bg-emerald-500/70 border-emerald-400/30';
      return 'bg-emerald-500/40 border-emerald-400/20';
    }
    if (ratio > 0.75) return 'bg-[#4285F4] border-[#4285F4]/50';
    if (ratio > 0.4) return 'bg-[#4285F4]/60 border-[#4285F4]/30';
    return 'bg-[#4285F4]/25 border-[#4285F4]/15';
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
    <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Issue Activity
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            {totalResolved} issues resolved · {totalRaisedLast30} raised in the last 30 days
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-white/40 font-medium">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#4285F4]/60 border border-[#4285F4]/30 inline-block" /> Raised</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/60 border border-emerald-400/30 inline-block" /> Resolved</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-white/[0.02] border border-white/5 inline-block" /> None</div>
        </div>
      </div>

      {/* Month labels */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${cells.length * 14}px` }}>
          <div className="flex gap-0.5 mb-1">
            <div className="w-6 shrink-0" />
            {cells.map((col, i) => {
              const ml = monthLabels.find(m => m.colIndex === i);
              return (
                <div key={i} className="w-3 flex-shrink-0 flex items-center justify-center">
                  {ml && <span className="text-[8px] text-white/30 font-bold whitespace-nowrap -ml-1">{ml.label}</span>}
                </div>
              );
            })}
          </div>

          {/* Day labels + Grid */}
          {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((day, dayIdx) => (
            <div key={dayIdx} className="flex gap-0.5 mb-0.5">
              <div className="w-6 shrink-0 flex items-center">
                <span className="text-[8px] text-white/20 font-bold">{day}</span>
              </div>
              {cells.map((col, colIdx) => {
                const cell = col[dayIdx];
                if (!cell) return <div key={colIdx} className="w-3 h-3 flex-shrink-0" />;
                const color = getCellColor(cell);
                const isFuture = cell.date > today;
                return (
                  <div
                    key={colIdx}
                    className={cn(
                      'w-3 h-3 rounded-sm border flex-shrink-0 transition-transform hover:scale-125 cursor-default',
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

      {/* Monthly breakdown bar */}
      <div className="pt-3 border-t border-white/[0.06]">
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-3">Monthly Resolution Rate</p>
        {(() => {
          const months: Record<string, { resolved: number; raised: number }> = {};
          bugs.forEach(b => {
            const d = new Date(b.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!months[key]) months[key] = { raised: 0, resolved: 0 };
            months[key].raised++;
            if (b.status === 'resolved') months[key].resolved++;
          });
          const sorted = Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
          const maxVal = Math.max(...sorted.map(([, v]) => v.raised), 1);
          return (
            <div className="flex items-end gap-2 h-16">
              {sorted.map(([key, val]) => {
                const [year, month] = key.split('-');
                const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
                const resolvedPct = val.raised > 0 ? (val.resolved / val.raised) * 100 : 0;
                const heightPct = (val.raised / maxVal) * 100;
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '44px' }}>
                      <div
                        className="w-full max-w-8 bg-white/[0.06] rounded-t-sm relative overflow-hidden"
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-emerald-500/70 rounded-t-sm transition-all"
                          style={{ height: `${resolvedPct}%` }}
                        />
                        <div className="absolute inset-0 bg-[#4285F4]/30" style={{ bottom: `${resolvedPct}%` }} />
                      </div>
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1c2128] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white whitespace-nowrap z-10">
                        {val.raised} raised · {val.resolved} fixed
                      </div>
                    </div>
                    <span className="text-[8px] text-white/30 font-bold">{label}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function AvatarInitial({ name }: { name: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const colors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-600', 'bg-pink-600', 'bg-cyan-600'];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0', colors[idx])}>
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

  // Bug reports stream
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
      // Re-sort by createdAt desc for display
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBugs(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  // PR stream
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
    <div className="min-h-screen bg-black text-white">
      {/* Page Header */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-400 mb-3">
                <Bug className="h-3 w-3" /> Issue Tracker
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                MLSC SVEC <span className="text-white/40">/</span> <span className="text-[#4285F4]">mlsc.svec</span>
              </h1>
              <p className="text-white/40 text-sm mt-2 max-w-lg">
                Track bugs, feature requests, and contributions to the MLSC SVEC open-source platform.
              </p>
              <div className="flex flex-wrap gap-3 mt-4 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><Circle className="h-3 w-3 fill-green-400 text-green-400" /> {openCount} open</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-purple-400" /> {closedCount} closed</span>
                <span className="flex items-center gap-1.5"><GitMerge className="h-3 w-3 text-purple-400" /> {mergedPrCount} merged PRs</span>
              </div>
            </div>
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg h-10 px-5 text-sm font-semibold flex items-center gap-2 transition-colors shrink-0">
                  <Plus className="h-4 w-4" /> New issue
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto bg-[#080808]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 sm:p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
                <DialogHeader className="mb-3">
                  <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-400" /> Open a new issue
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-400">
                    Describe the bug clearly. Confirmation will be sent to your email.
                  </DialogDescription>
                </DialogHeader>
                <BugReportForm isDialog onSuccess={() => setReportOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Activity Graph */}
        {!loading && bugs.length > 0 && (
          <ActivityGraph bugs={bugs} />
        )}

        {/* Tab bar */}
        <div className="flex gap-2 border-b border-white/5">
          <button
            onClick={() => { setActiveTab('issues'); setSearch(''); }}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors',
              activeTab === 'issues' ? 'border-[#4285F4] text-white' : 'border-transparent text-white/40 hover:text-white/70'
            )}
          >
            <Bug className="h-4 w-4" /> Issues
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', activeTab === 'issues' ? 'bg-white/10' : 'bg-white/5 text-white/40')}>
              {bugs.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('prs'); setSearch(''); }}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors',
              activeTab === 'prs' ? 'border-[#4285F4] text-white' : 'border-transparent text-white/40 hover:text-white/70'
            )}
          >
            <GitPullRequest className="h-4 w-4" /> Pull Requests
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', activeTab === 'prs' ? 'bg-white/10' : 'bg-white/5 text-white/40')}>
              {prs.length}
            </span>
          </button>
        </div>

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="space-y-3">
            {/* Issues toolbar */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden">
              {/* Top bar: search + filter toggle */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-black border border-white/5 rounded-lg pl-9 pr-3 h-9 text-sm text-white focus:outline-none focus:border-[#4285F4]/50 placeholder-white/20 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-semibold transition-all',
                    showFilters ? 'bg-[#4285F4]/15 border-[#4285F4]/30 text-[#4285F4]' : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white'
                  )}
                >
                  <Filter className="h-3.5 w-3.5" /> Filters
                </button>
              </div>

              {/* Filter row */}
              {showFilters && (
                <div className="px-4 py-3 border-b border-white/5 flex flex-wrap gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Severity</label>
                    <select
                      value={severityFilter}
                      onChange={e => setSeverityFilter(e.target.value)}
                      className="bg-black border border-white/5 rounded-lg px-2 h-8 text-xs text-white/70 focus:outline-none focus:border-[#4285F4]/40"
                    >
                      <option value="all">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="bg-black border border-white/5 rounded-lg px-2 h-8 text-xs text-white/70 focus:outline-none focus:border-[#4285F4]/40"
                    >
                      <option value="all">All</option>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="bg-black border border-white/5 rounded-lg px-2 h-8 text-xs text-white/70 focus:outline-none focus:border-[#4285F4]/40"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="upvotes">Most upvoted</option>
                      <option value="comments">Most commented</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Open/Closed tab inside */}
              <div className="px-4 py-2 flex items-center gap-1">
                <button
                  onClick={() => setIssueState('open')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    issueState === 'open' ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  <Circle className="h-3.5 w-3.5 fill-green-400 text-green-400" />
                  {openCount} Open
                </button>
                <button
                  onClick={() => setIssueState('closed')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    issueState === 'closed' ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  {closedCount} Closed
                </button>
              </div>

              {/* Issues list */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-[#4285F4]/30 border-t-[#4285F4] rounded-full animate-spin mb-3" />
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Loading issues...</p>
                </div>
              ) : processedBugs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-3">
                    <Bug className="h-5 w-5 text-white/20" />
                  </div>
                  <p className="text-white/50 font-semibold text-sm">No {issueState} issues found</p>
                  <p className="text-white/30 text-xs mt-1">
                    {search ? 'Try different search terms.' : issueState === 'open' ? 'All issues are resolved! 🎉' : 'No issues closed yet.'}
                  </p>
                  {issueState === 'open' && !search && (
                    <button onClick={() => setReportOpen(true)} className="mt-4 text-[#4285F4] text-sm hover:underline flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" /> Open new issue
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {processedBugs.map((bug) => {
                    const hasUpvoted = user?.email ? bug.upvotedBy?.includes(user.email) : false;
                    const sevInfo = SEVERITY_CONFIG[bug.severity] || SEVERITY_CONFIG.medium;
                    const catColor = CATEGORY_COLORS[bug.category] || CATEGORY_COLORS.other;

                    return (
                      <Link
                        key={bug.id}
                        href={`/issue-tracker/${bug.id}`}
                        className="flex items-start gap-3 px-4 py-4 hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Status icon */}
                        <div className="mt-0.5 shrink-0">
                          {bug.status === 'open'
                            ? <Circle className="h-4.5 w-4.5 text-green-400 fill-green-400" />
                            : <CheckCircle2 className="h-4.5 w-4.5 text-purple-400" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-white group-hover:text-[#4285F4] transition-colors">
                              {bug.title}
                            </h3>
                            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', sevInfo.color)}>
                              {sevInfo.label}
                            </span>
                            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', catColor)}>
                              {CATEGORY_LABELS[bug.category] || bug.category}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 flex flex-wrap items-center gap-1.5">
                            <span>#{bug.issueNumber}</span>
                            <span>·</span>
                            <span>
                              {bug.status === 'open'
                                ? <>opened {formatRelative(bug.createdAt)} by <span className="text-white/60">{bug.userName}</span></>
                                : <>closed {formatRelative(bug.resolvedAt || bug.createdAt)} · opened by <span className="text-white/60">{bug.userName}</span></>
                              }
                            </span>
                          </p>
                        </div>

                        {/* Right meta */}
                        <div className="flex items-center gap-3 shrink-0">
                          {(bug.upvotedBy?.length || 0) > 0 && (
                            <button
                              onClick={e => handleUpvote(bug.id, e)}
                              className={cn(
                                'flex items-center gap-1 text-xs transition-colors',
                                hasUpvoted ? 'text-[#4285F4]' : 'text-white/30 hover:text-white/60'
                              )}
                            >
                              <ThumbsUp className={cn('h-3.5 w-3.5', hasUpvoted && 'fill-[#4285F4]')} />
                              {bug.upvotedBy?.length}
                            </button>
                          )}
                          {(bug.comments?.length || 0) > 0 && (
                            <div className="flex items-center gap-1 text-xs text-white/30">
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
          <div className="space-y-3">
            {/* PR toolbar */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search pull requests..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-black border border-white/5 rounded-lg pl-9 pr-3 h-9 text-sm text-white focus:outline-none focus:border-[#4285F4]/50 placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

              {/* Status tabs */}
              <div className="px-4 py-2 flex items-center gap-1">
                {[
                  { value: 'all', label: `All (${prs.length})`, icon: <GitPullRequest className="h-3.5 w-3.5" /> },
                  { value: 'pending', label: `In Review (${prs.filter(p => p.status === 'pending').length})`, icon: <Clock className="h-3.5 w-3.5 text-yellow-400" /> },
                  { value: 'merged', label: `Merged (${mergedPrCount})`, icon: <GitMerge className="h-3.5 w-3.5 text-purple-400" /> },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setPrStatusFilter(tab.value as any)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      prStatusFilter === tab.value ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70'
                    )}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {processedPRs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <GitPullRequest className="h-8 w-8 text-white/10 mb-3" />
                  <p className="text-white/40 font-semibold text-sm">No pull requests found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {processedPRs.map(pr => (
                    <div key={pr.id} className="flex items-start gap-3 px-4 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="mt-0.5 shrink-0">
                        {pr.status === 'merged'
                          ? <GitMerge className="h-4.5 w-4.5 text-purple-400" />
                          : pr.status === 'rejected'
                          ? <Circle className="h-4.5 w-4.5 text-red-400" />
                          : <GitPullRequest className="h-4.5 w-4.5 text-green-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white">{pr.title}</h3>
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                            pr.status === 'merged' ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' :
                            pr.status === 'rejected' ? 'bg-red-500/15 text-red-300 border-red-500/30' :
                            'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                          )}>
                            {pr.status === 'merged' ? 'Merged' : pr.status === 'rejected' ? 'Changes Requested' : 'In Review'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-500/15 text-indigo-300 border-indigo-500/30 flex items-center gap-1">
                            <GitBranch className="h-2.5 w-2.5" />{pr.branchName}
                          </span>
                        </div>
                        <p className="text-xs text-white/40">
                          #{pr.id.substring(0, 6).toUpperCase()} · opened {formatRelative(pr.createdAt)} by <span className="text-white/60">{pr.name}</span>
                          {pr.mergedAt && <> · merged {formatRelative(pr.mergedAt)}</>}
                        </p>
                        {pr.description && <p className="text-xs text-white/40 mt-1 line-clamp-1">{pr.description}</p>}
                      </div>
                      <a
                        href={pr.prLink}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-xs text-white/50 hover:text-white transition-all"
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

// Need GitMerge icon
function GitMerge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z" />
    </svg>
  );
}
