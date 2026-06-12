'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  Bug, Search, CheckCircle2, Clock, AlertTriangle, Plus, 
  ThumbsUp, MessageSquare, Calendar, User, Filter, ArrowUpDown, 
  ChevronRight, Send, AlertCircle, X, GitPullRequest, ExternalLink, GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BugReportForm } from '@/components/bug-report-form';
import { useAuth } from '@/lib/auth-context';
import { toggleBugUpvoteAction, addBugReportCommentAction } from '@/app/actions/log-actions';
import { toast } from '@/hooks/use-toast';

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
    id: string;
    userName: string;
    userEmail: string;
    content: string;
    createdAt: string;
  }>;
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

const SEVERITY_COLORS = {
  low: {
    bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    text: 'Low severity',
    badge: 'bg-blue-500/20 text-blue-300'
  },
  medium: {
    bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    text: 'Medium severity',
    badge: 'bg-yellow-500/20 text-yellow-300'
  },
  high: {
    bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    text: 'High severity',
    badge: 'bg-orange-500/20 text-orange-300'
  },
  critical: {
    bg: 'bg-red-500/15 border-red-500/30 text-red-400 animate-pulse border',
    text: 'Critical severity',
    badge: 'bg-red-500/30 text-red-300 border border-red-500/40'
  }
};

const CATEGORY_LABELS = {
  frontend: 'Frontend UI',
  backend: 'Backend & APIs',
  'ui-ux': 'UI/UX & Design',
  database: 'Database Storage',
  auth: 'Authentication',
  other: 'General / Other'
};

export default function IssueTrackerPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'issues' | 'prs'>('issues');
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [prs, setPrs] = useState<PRSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Advanced filters state
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [prStatusFilter, setPrStatusFilter] = useState<'all' | 'pending' | 'merged'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'upvotes'>('newest');
  
  // Interactive UI state
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [upvoteEmailPromptOpen, setUpvoteEmailPromptOpen] = useState(false);
  const [promptBugId, setPromptBugId] = useState<string | null>(null);
  const [promptEmail, setPromptEmail] = useState('');
  
  // Comment Form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load name and email from active auth session if available (automatically)
  useEffect(() => {
    if (user) {
      setCommentEmail(user.email || '');
      setCommentName(user.displayName || 'Community Member');
    } else {
      setCommentEmail('');
      setCommentName('');
    }
  }, [user]);

  // Real-time Firestore stream for bug reports
  useEffect(() => {
    const q = query(collection(db, 'bugReports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bugList: BugReport[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        bugList.push({ 
          id: doc.id, 
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
          comments: data.comments || []
        } as BugReport);
      });
      setBugs(bugList);
      setLoading(false);

      // Keep the active details view updated with Firestore sync
      if (selectedBug) {
        const updated = bugList.find(b => b.id === selectedBug.id);
        if (updated) {
          setSelectedBug(updated);
        }
      }
    }, (err) => {
      console.error("Bugs listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedBug]);

  // Real-time Firestore stream for Pull Requests
  useEffect(() => {
    const q = query(collection(db, 'pullRequests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prList: PRSubmission[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        prList.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          prLink: data.prLink || '',
          branchName: data.branchName || '',
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'pending',
          createdAt: data.createdAt || new Date().toISOString(),
          mergedAt: data.mergedAt
        } as PRSubmission);
      });
      setPrs(prList);
    }, (err) => {
      console.error("PRs listener error:", err);
    });

    return () => unsubscribe();
  }, []);

  const totalCount = bugs.length;
  const openCount = bugs.filter(b => b.status === 'open').length;
  const resolvedCount = bugs.filter(b => b.status === 'resolved').length;
  const totalPrCount = prs.length;

  // Filter & sort issues
  const processedBugs = bugs
    .filter(bug => {
      const matchesSearch = 
        bug.title.toLowerCase().includes(search.toLowerCase()) || 
        bug.description.toLowerCase().includes(search.toLowerCase()) ||
        bug.userName.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter;
      const matchesCategory = categoryFilter === 'all' || bug.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesSeverity && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'upvotes') {
        const upvotesA = a.upvotedBy?.length || 0;
        const upvotesB = b.upvotedBy?.length || 0;
        return upvotesB - upvotesA;
      }
      return 0;
    });

  // Filter & sort pull requests
  const processedPRs = prs
    .filter(pr => {
      const matchesSearch = 
        pr.title.toLowerCase().includes(search.toLowerCase()) || 
        pr.description.toLowerCase().includes(search.toLowerCase()) || 
        pr.name.toLowerCase().includes(search.toLowerCase()) ||
        pr.branchName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = 
        prStatusFilter === 'all' || 
        pr.status === prStatusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  // Upvote Handler
  const handleUpvote = async (bugId: string) => {
    const activeEmail = user?.email || promptEmail;
    
    if (!activeEmail) {
      setPromptBugId(bugId);
      setUpvoteEmailPromptOpen(true);
      return;
    }

    try {
      const result = await toggleBugUpvoteAction(bugId, activeEmail);
      if (result.success) {
        toast.success("Upvote updated", {
          description: "Thank you for indicating your interest in this ticket."
        });
        setUpvoteEmailPromptOpen(false);
        setPromptEmail('');
      } else {
        toast.danger("Upvote failed", {
          description: result.error || "Please try again later."
        });
      }
    } catch (err: any) {
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Failed to upvote bug report: ${bugId}`,
        err,
        "IssueTrackerPage",
        activeEmail || "unknown"
      );
      toast.danger("An error occurred", {
        description: err.message
      });
    }
  };

  // Comment Submitter
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBug) return;
    if (!commentContent.trim()) {
      toast.warning("Empty comment", { description: "Please enter some comment text." });
      return;
    }
    if (!commentName.trim() || !commentEmail.trim()) {
      toast.warning("Missing fields", { description: "Please provide your name and email." });
      return;
    }

    setSubmittingComment(true);
    try {
      const result = await addBugReportCommentAction(
        selectedBug.id,
        commentName,
        commentEmail,
        commentContent
      );

      if (result.success) {
        toast.success("Comment posted", {
          description: "Your comment has been added to the ticket log."
        });
        setCommentContent('');
      } else {
        toast.danger("Comment failed", {
          description: result.error || "Please try again later."
        });
      }
    } catch (err: any) {
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Failed to add comment to bug report ${selectedBug.id}`,
        err,
        "IssueTrackerPage",
        commentEmail || "unknown"
      );
      toast.danger("An error occurred", {
        description: err.message
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="w-full bg-black min-h-screen py-24 md:py-32 text-white">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.08] pb-10 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500 italic">
              <Bug className="h-3.5 w-3.5" /> Operations Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              Platform <span className="text-[#4285F4]">Issue Tracker</span>
            </h1>
            <p className="text-white/40 font-medium text-sm max-w-xl">
              Track open-source development in real-time. Inspect reported bug tickets, review submitted pull requests, or log comment validations.
            </p>
          </div>

          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold px-6 h-11 text-xs tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-blue-500/15">
                <Plus className="h-4 w-4" /> Report an Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-[#080808]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-lg font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                  <Bug className="h-5 w-5 text-red-500 animate-pulse" />
                  Raise Ticket / <span className="text-[#4285F4]">Report Bug</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 font-medium">
                  Submit details of the bug. The reporter receives confirmation and resolution emails.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-transparent border-none p-0">
                <BugReportForm isDialog={true} onSuccess={() => setReportOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 mb-8">
          <button
            onClick={() => { setActiveTab('issues'); setSearch(''); }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all select-none",
              activeTab === 'issues' 
                ? "border-[#4285F4] text-white" 
                : "border-transparent text-white/45 hover:text-white"
            )}
          >
            <Bug className="h-4 w-4" /> Bug Tickets ({totalCount})
          </button>
          <button
            onClick={() => { setActiveTab('prs'); setSearch(''); }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all select-none",
              activeTab === 'prs' 
                ? "border-[#4285F4] text-white" 
                : "border-transparent text-white/45 hover:text-white"
            )}
          >
            <GitPullRequest className="h-4 w-4" /> Pull Requests ({totalPrCount})
          </button>
        </div>

        {/* Stats Grid */}
        {activeTab === 'issues' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-in fade-in duration-300">
            <div className="bg-[#050505] border border-white/5 rounded-2xl p-5 flex flex-col justify-between aspect-[16/9] hover:border-white/10 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Tickets Raised</p>
              <span className="text-4xl md:text-5xl font-black tracking-tight">{totalCount}</span>
            </div>
            <div className="bg-[#050505] border border-white/5 rounded-2xl p-5 flex flex-col justify-between aspect-[16/9] hover:border-red-500/10 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60 flex items-center gap-1.5">
                <Clock className="h-3 w-3 animate-pulse" /> Fixing / Open
              </p>
              <span className="text-4xl md:text-5xl font-black text-red-500 tracking-tight">{openCount}</span>
            </div>
            <div className="bg-[#050505] border border-white/5 rounded-2xl p-5 flex flex-col justify-between aspect-[16/9] hover:border-emerald-500/10 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" /> Resolved / Deployed
              </p>
              <span className="text-4xl md:text-5xl font-black text-emerald-500 tracking-tight">{resolvedCount}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-in fade-in duration-300">
            <div className="bg-[#050505] border border-white/5 rounded-2xl p-5 flex flex-col justify-between aspect-[16/5] hover:border-white/10 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Total PRs Requested</p>
              <span className="text-3xl md:text-4xl font-black tracking-tight">{totalPrCount}</span>
            </div>
            <div className="bg-[#050505] border border-white/5 rounded-2xl p-5 flex flex-col justify-between aspect-[16/5] hover:border-emerald-500/10 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" /> Merged Contributions
              </p>
              <span className="text-3xl md:text-4xl font-black text-emerald-500 tracking-tight">
                {prs.filter(p => p.status === 'merged').length}
              </span>
            </div>
          </div>
        )}

        {/* Search & Complex Filter Toolbar */}
        <div className="bg-[#050505] border border-white/5 p-4 rounded-2xl mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <input
                type="text"
                placeholder={activeTab === 'issues' ? "Search issues by title, description, or submitter..." : "Search PRs by title, branch, or contributor..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black border border-white/5 hover:border-white/10 focus:border-white/20 transition-all rounded-xl pl-12 pr-4 h-11 text-xs text-white focus:outline-none placeholder-white/20"
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-black border border-white/5 px-3 py-1 rounded-xl h-11 shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-white/70 focus:outline-none cursor-pointer pr-2"
              >
                <option value="newest" className="bg-black text-white">Newest First</option>
                <option value="oldest" className="bg-black text-white">Oldest First</option>
                {activeTab === 'issues' && <option value="upvotes" className="bg-black text-white">Most Upvoted</option>}
              </select>
            </div>
          </div>

          {activeTab === 'issues' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5 animate-in fade-in duration-200">
              {/* Status Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Status</label>
                <div className="flex bg-black border border-white/5 p-1 rounded-xl w-full">
                  {(['all', 'open', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "flex-1 h-8 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                        statusFilter === status 
                          ? "bg-white text-black" 
                          : "text-white/55 hover:text-white hover:bg-white/[0.03]"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-xl px-3 h-10 text-[10px] font-black uppercase tracking-wider text-white/70 focus:outline-none focus:border-white/20 cursor-pointer"
                >
                  <option value="all" className="bg-black text-white">All Severities</option>
                  <option value="low" className="bg-black text-white">Low Severity</option>
                  <option value="medium" className="bg-black text-white">Medium Severity</option>
                  <option value="high" className="bg-black text-white">High Severity</option>
                  <option value="critical" className="bg-black text-white">Critical Severity</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-xl px-3 h-10 text-[10px] font-black uppercase tracking-wider text-white/70 focus:outline-none focus:border-white/20 cursor-pointer"
                >
                  <option value="all" className="bg-black text-white">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key} className="bg-black text-white">{label}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 pt-2 border-t border-white/5 animate-in fade-in duration-200">
              {/* PR Status Filter */}
              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">PR Review Status</label>
                <div className="flex bg-black border border-white/5 p-1 rounded-xl w-full">
                  {(['all', 'pending', 'merged'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setPrStatusFilter(status)}
                      className={cn(
                        "flex-1 h-8 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                        prStatusFilter === status 
                          ? "bg-white text-black" 
                          : "text-white/55 hover:text-white hover:bg-white/[0.03]"
                      )}
                    >
                      {status === 'pending' ? 'In Review' : status === 'merged' ? 'Merged' : 'All PRs'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic List Render */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/30 border border-white/5 rounded-2xl bg-[#050505]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4] mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">Streaming database logs...</p>
            </div>
          ) : activeTab === 'issues' ? (
            // Issues Tab Content
            processedBugs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/30 border border-dashed border-white/10 rounded-2xl bg-[#050505]/40">
                <AlertTriangle className="h-8 w-8 text-white/20 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">No issues match current filters</p>
                <p className="text-xs text-white/40 mt-1">Try resetting the status/category queries or search parameters.</p>
              </div>
            ) : (
              processedBugs.map((bug) => {
                const severityInfo = SEVERITY_COLORS[bug.severity] || SEVERITY_COLORS.medium;
                const hasUpvoted = user?.email ? bug.upvotedBy?.includes(user.email) : false;
                const commentsCount = bug.comments?.length || 0;
                const upvoteCount = bug.upvotedBy?.length || 0;

                return (
                  <div
                    key={bug.id}
                    className={cn(
                      "group p-5 rounded-2xl border bg-[#050505]/40 hover:bg-[#070707] transition-all duration-300 flex items-start gap-4 cursor-pointer animate-in fade-in duration-300",
                      bug.status === 'open' 
                        ? bug.severity === 'critical' 
                          ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
                          : 'border-white/5 hover:border-white/10'
                        : "border-white/5 opacity-70 hover:opacity-100"
                    )}
                    onClick={() => setSelectedBug(bug)}
                  >
                    {/* Upvote Widget */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpvote(bug.id);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center border rounded-xl py-2 px-3 min-w-11 transition-all h-fit",
                        hasUpvoted 
                          ? "bg-[#4285F4]/15 border-[#4285F4]/40 text-[#4285F4]" 
                          : "border-white/5 bg-black hover:border-white/10 text-white/45 hover:text-white"
                      )}
                    >
                      <ThumbsUp className={cn("h-3.5 w-3.5 mb-1 transition-transform", hasUpvoted && "fill-[#4285F4]")} />
                      <span className="text-xs font-black tracking-tighter">{upvoteCount}</span>
                    </button>

                    {/* Main Ticket Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status badge */}
                        <Badge 
                          className={cn(
                            "text-[9px] uppercase tracking-wider font-extrabold px-2 h-5 border-none",
                            bug.status === 'open' 
                              ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          )}
                        >
                          {bug.status === 'open' ? 'Fixing / Active' : 'Resolved'}
                        </Badge>
                        
                        {/* Severity badge */}
                        <Badge className={cn("text-[9px] uppercase tracking-wider font-extrabold px-2 h-5 border-none", severityInfo.badge)}>
                          {bug.severity}
                        </Badge>

                        {/* Category Badge */}
                        <Badge className="text-[9px] uppercase tracking-wider font-extrabold px-2 h-5 border-none bg-white/5 text-white/60">
                          {CATEGORY_LABELS[bug.category] || bug.category}
                        </Badge>
                        
                        <span className="text-[10px] font-bold text-white/20 select-none hidden sm:inline">
                          ID: #{bug.id.substring(0, 6).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-[#4285F4] transition-colors uppercase tracking-wide truncate">
                        {bug.title}
                      </h3>
                      <p className="text-white/50 text-xs leading-relaxed font-medium line-clamp-2">
                        {bug.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.03] text-[9px] text-white/30 font-black uppercase tracking-wider">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {bug.userName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(bug.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-white/40 group-hover:text-white transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="font-bold">{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            // PRs Tab Content
            processedPRs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/30 border border-dashed border-white/10 rounded-2xl bg-[#050505]/40 animate-in fade-in duration-300">
                <GitPullRequest className="h-8 w-8 text-white/20 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">No pull requests found</p>
                <p className="text-xs text-white/40 mt-1">Try resetting the status filter or search queries.</p>
              </div>
            ) : (
              processedPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="p-5 rounded-2xl border border-white/5 bg-[#050505]/40 hover:bg-[#070707] hover:border-white/10 transition-all duration-300 flex flex-col md:flex-row md:items-start justify-between gap-4 animate-in fade-in duration-300"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <Badge 
                        className="text-[9px] uppercase tracking-wider font-extrabold h-5 px-2 select-none border-none text-white"
                        style={{
                          backgroundColor: pr.status === 'merged' ? 'rgba(16,185,129,0.1)' : pr.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                          color: pr.status === 'merged' ? '#10b981' : pr.status === 'rejected' ? '#ef4444' : '#fbbf24',
                        }}
                      >
                        {pr.status === 'merged' ? 'Merged' : pr.status === 'rejected' ? 'Changes Requested' : 'In Review'}
                      </Badge>
                      <Badge className="text-[9px] uppercase tracking-wider font-extrabold px-2 h-5 border-none bg-indigo-500/10 text-indigo-400">
                        <GitBranch className="h-3 w-3 mr-1 inline" /> {pr.branchName}
                      </Badge>
                      <span className="text-[10px] font-bold text-white/20 select-none">
                        PR #{pr.id.substring(0, 6).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white uppercase tracking-wide truncate">
                      {pr.title}
                    </h3>
                    <p className="text-white/60 text-xs leading-relaxed font-medium">
                      {pr.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-white/30 font-black uppercase tracking-wider pt-1">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> Contributor: {pr.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Submitted: {formatDate(pr.createdAt)}</span>
                      {pr.mergedAt && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Merged: {formatDate(pr.mergedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <a
                    href={pr.prLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-white/5 hover:border-white/10 bg-[#0A0A0A] hover:bg-[#111] transition-all rounded-xl px-4 h-10 text-[10px] font-black uppercase tracking-wider text-white shrink-0 mt-3 md:mt-0"
                  >
                    View PR on GitHub <ExternalLink className="h-3.5 w-3.5 text-white/30" />
                  </a>
                </div>
              ))
            )
          )}
        </div>

        {/* Detailed Bug Ticket Dialog */}
        <Dialog open={selectedBug !== null} onOpenChange={(open) => { if(!open) setSelectedBug(null); }}>
          <DialogContent className="max-w-2xl bg-[#080808]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.95)] overflow-hidden max-h-[85vh] flex flex-col">
            {selectedBug && (
              <>
                {/* Header Section */}
                <div className="p-6 border-b border-white/5 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        className={cn(
                          "text-[9px] uppercase tracking-wider font-extrabold px-2 h-5 border-none",
                          selectedBug.status === 'open' 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        )}
                      >
                        {selectedBug.status === 'open' ? 'Fixing / Active' : 'Resolved'}
                      </Badge>
                      <Badge className={cn("text-[9px] uppercase tracking-wider font-extrabold px-2 h-5 border-none", SEVERITY_COLORS[selectedBug.severity]?.badge)}>
                        {selectedBug.severity}
                      </Badge>
                      <Badge className="text-[9px] uppercase tracking-wider font-extrabold px-2 h-5 border-none bg-white/5 text-white/60">
                        {CATEGORY_LABELS[selectedBug.category] || selectedBug.category}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-bold text-white/20 select-none">
                      ID: #{selectedBug.id.toUpperCase()}
                    </span>
                  </div>

                  <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-wide text-white italic">
                    {selectedBug.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Ticket details and discussion log for #{selectedBug.id}
                  </DialogDescription>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-white/40 font-black uppercase tracking-wider">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Raised by: {selectedBug.userName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Opened: {formatDate(selectedBug.createdAt)}</span>
                    {selectedBug.resolvedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Resolved: {formatDate(selectedBug.resolvedAt)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Section (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Description Box */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Description</h4>
                    <p className="text-sm text-white/80 leading-relaxed font-medium bg-white/[0.02] border border-white/5 p-4 rounded-xl whitespace-pre-wrap">
                      {selectedBug.description}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-4 border-t border-b border-white/5 py-4">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Community Priority</h4>
                      <p className="text-xs text-white/60 font-medium">Upvote if you are also encountering this issue.</p>
                    </div>
                    <Button
                      onClick={() => handleUpvote(selectedBug.id)}
                      className={cn(
                        "rounded-xl h-10 px-5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border",
                        (user?.email && selectedBug.upvotedBy?.includes(user.email))
                          ? "bg-[#4285F4]/15 border-[#4285F4]/40 text-[#4285F4]" 
                          : "border-white/10 bg-[#0A0A0A] hover:bg-white hover:text-black"
                      )}
                    >
                      <ThumbsUp className={cn("h-4 w-4", (user?.email && selectedBug.upvotedBy?.includes(user.email)) && "fill-[#4285F4]")} />
                      Upvote Ticket ({selectedBug.upvotedBy?.length || 0})
                    </Button>
                  </div>

                  {/* Comments Log */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Comments Log</h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/35">
                        {selectedBug.comments?.length || 0} {selectedBug.comments?.length === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {!selectedBug.comments || selectedBug.comments.length === 0 ? (
                        <div className="text-center py-6 border border-white/5 bg-white/[0.01] rounded-xl">
                          <MessageSquare className="h-6 w-6 text-white/10 mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">No verification log comments</p>
                          <p className="text-xs text-white/40 mt-0.5">Be the first to leave a comment on this issue.</p>
                        </div>
                      ) : (
                        selectedBug.comments.map((comment) => (
                          <div key={comment.id} className="border border-white/5 bg-white/[0.01] rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-[9px] text-white/30 font-black uppercase tracking-wider">
                              <span className="text-white/70">{comment.userName}</span>
                              <span>{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-xs text-white/70 leading-relaxed font-medium">
                              {comment.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="border-t border-white/5 pt-4 space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4285F4] flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> Submit Log / Comment
                      </h4>

                      {/* Guest details inputs if not logged in */}
                      {!user && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Your Name</label>
                            <input
                              type="text"
                              value={commentName}
                              onChange={(e) => setCommentName(e.target.value)}
                              placeholder="Alex Smith"
                              className="w-full bg-black border border-white/10 hover:border-white/20 focus:border-white/30 transition-all rounded-lg px-3 h-9 text-xs text-white focus:outline-none placeholder-white/20"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Email (For Updates)</label>
                            <input
                              type="email"
                              value={commentEmail}
                              onChange={(e) => setCommentEmail(e.target.value)}
                              placeholder="alex@example.com"
                              className="w-full bg-black border border-white/10 hover:border-white/20 focus:border-white/30 transition-all rounded-lg px-3 h-9 text-xs text-white focus:outline-none placeholder-white/20"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {user && (
                        <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Posting as: {user.displayName || 'Developer'} ({user.email})
                        </div>
                      )}

                      <div className="relative">
                        <textarea
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Provide details, logs, screenshot links, or reproduction findings..."
                          rows={3}
                          className="w-full bg-black border border-white/10 hover:border-white/20 focus:border-white/30 transition-all rounded-xl p-3 text-xs text-white focus:outline-none placeholder-white/20 resize-none pr-12"
                          required
                        />
                        <Button
                          type="submit"
                          disabled={submittingComment}
                          className="absolute right-3 bottom-3 h-8 w-8 rounded-lg bg-[#4285F4] hover:bg-[#4285F4]/90 text-white p-0 flex items-center justify-center transition-all disabled:opacity-40"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Upvote Email Prompt Dialog for Guest Users */}
        <Dialog open={upvoteEmailPromptOpen} onOpenChange={setUpvoteEmailPromptOpen}>
          <DialogContent className="max-w-sm bg-[#080808]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-sm font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-[#4285F4]" /> Upvote Verification
              </DialogTitle>
              <DialogDescription className="text-[11px] text-zinc-400 font-medium">
                Enter your email address to register your upvote on this ticket.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Email Address</label>
                <input
                  type="email"
                  value={promptEmail}
                  onChange={(e) => setPromptEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-black border border-white/10 hover:border-white/20 focus:border-white/30 transition-all rounded-xl px-4 h-11 text-xs text-white focus:outline-none placeholder-white/20"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => { setUpvoteEmailPromptOpen(false); setPromptEmail(''); }} 
                  className="rounded-xl h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (promptBugId) {
                      handleUpvote(promptBugId);
                    }
                  }} 
                  className="rounded-xl h-9 bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Verify Upvote
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
