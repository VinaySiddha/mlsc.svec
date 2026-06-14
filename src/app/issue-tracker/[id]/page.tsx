'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import {
  Bug, ArrowLeft, ThumbsUp, MessageSquare, Calendar, User,
  CheckCircle2, Clock, AlertTriangle, Tag, Send, ChevronRight,
  GitMerge, Circle, Pencil, Lock, Smile, Copy, Share2, ExternalLink, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { toggleBugUpvoteAction, addBugReportCommentAction, reopenBugReportAction } from '@/app/actions/log-actions';
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
    id: string;
    userName: string;
    userEmail: string;
    content: string;
    createdAt: string;
  }>;
  issueNumber?: number;
  imageUrl?: string;
}

const SEVERITY_CONFIG = {
  low: { color: 'bg-blue-500/15 text-blue-300 border-blue-500/30', dot: 'bg-blue-400', label: 'Low' },
  medium: { color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', dot: 'bg-yellow-400', label: 'Medium' },
  high: { color: 'bg-orange-500/15 text-orange-300 border-orange-500/30', dot: 'bg-orange-400', label: 'High' },
  critical: { color: 'bg-red-500/15 text-red-300 border-red-500/30', dot: 'bg-red-400', label: 'Critical' },
};

const CATEGORY_CONFIG = {
  frontend: { label: 'Frontend UI', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  backend: { label: 'Backend & APIs', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  'ui-ux': { label: 'UI/UX Design', color: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  database: { label: 'Database', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  auth: { color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Authentication' },
  other: { color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30', label: 'General' },
};

function TimelineEvent({ icon: Icon, color, text, time, isFirst }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex flex-col items-center">
        {!isFirst && <div className="w-px h-6 bg-white/5 -mt-3 mb-1" />}
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border shrink-0", color)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex-1 pb-4 pt-1">
        <p className="text-xs text-white/50 font-medium">{text}</p>
        <p className="text-[10px] text-white/25 font-bold uppercase tracking-wider mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function AvatarInitial({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const colors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-600', 'bg-pink-600', 'bg-cyan-600'];
  const colorIndex = name?.charCodeAt(0) % colors.length || 0;
  const sizeClass = size === 'lg' ? 'w-10 h-10 text-base' : size === 'md' ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs';

  return (
    <div className={cn('rounded-full flex items-center justify-center font-bold text-white shrink-0', colors[colorIndex], sizeClass)}>
      {initial}
    </div>
  );
}

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [bug, setBug] = useState<BugReport | null>(null);
  const [allBugs, setAllBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reopenEmail, setReopenEmail] = useState('');
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [reopening, setReopening] = useState(false);

  useEffect(() => {
    if (user) {
      setCommentEmail(user.email || '');
      setCommentName(user.displayName || 'Community Member');
    }
  }, [user]);

  // Fetch all bugs to compute issue numbers
  useEffect(() => {
    const q = query(collection(db, 'bugReports'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: BugReport[] = [];
      let idx = 0;
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
          issueNumber: idx + 1,
          imageUrl: data.imageUrl || '',
        });
        idx++;
      });
      setAllBugs(list);
      const found = list.find(b => b.id === params.id);
      if (found) { setBug(found); setLoading(false); }
      else if (list.length > 0) setLoading(false);
    });
    return () => unsub();
  }, [params.id]);

  const handleReopen = async (verifyEmail?: string) => {
    if (!bug) return;
    
    let identifier = '';
    if (user) {
      identifier = user.email || user.uid;
    } else if (verifyEmail) {
      identifier = verifyEmail.trim();
    } else {
      identifier = reopenEmail.trim();
    }

    if (!identifier) {
      toast.warning('Verification required', { description: 'Please provide the email you used to report this bug.' });
      return;
    }

    // Verify at client level for immediate feedback (if email matched)
    const isMatched = 
      (bug.userId && bug.userId !== 'anonymous' && user && user.uid === bug.userId) ||
      (bug.userEmail && bug.userEmail.toLowerCase() === identifier.toLowerCase());

    if (!isMatched) {
      toast.danger('Verification failed', { description: 'The email or account does not match the original reporter.' });
      return;
    }

    setReopening(true);
    try {
      const result = await reopenBugReportAction(bug.id, identifier);
      if (result.success) {
        toast.success('Issue reopened successfully!');
        setShowReopenConfirm(false);
        setReopenEmail('');
      } else {
        toast.danger('Failed to reopen issue', { description: result.error });
      }
    } catch (err: any) {
      toast.danger('An error occurred', { description: err.message });
    } finally {
      setReopening(false);
    }
  };

  const handleUpvote = async () => {
    if (!bug) return;
    const email = user?.email || commentEmail;
    if (!email) { toast.warning('Sign in to upvote', { description: 'Please log in to vote on issues.' }); return; }
    const result = await toggleBugUpvoteAction(bug.id, email);
    if (!result.success) toast.danger('Failed to upvote');
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bug || !commentContent.trim()) return;
    const name = commentName.trim() || user?.displayName || 'Anonymous';
    const email = commentEmail.trim() || user?.email || '';
    if (!email) { toast.warning('Email required', { description: 'Please enter your email to comment.' }); return; }

    setSubmitting(true);
    try {
      const result = await addBugReportCommentAction(bug.id, name, email, commentContent);
      if (result.success) {
        setCommentContent('');
        toast.success('Comment posted!');
      } else {
        toast.danger('Failed to post comment', { description: result.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return s; }
  };

  const formatRelative = (s: string) => {
    try {
      const now = Date.now();
      const d = new Date(s).getTime();
      const diff = now - d;
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);
      if (days > 30) return formatDate(s);
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (mins > 0) return `${mins}m ago`;
      return 'just now';
    } catch { return s; }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#4285F4]/30 border-t-[#4285F4] rounded-full animate-spin" />
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-white/20" />
        <p className="text-white/50 font-bold">Issue not found</p>
        <Link href="/issue-tracker" className="text-[#4285F4] text-sm hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Issue Tracker
        </Link>
      </div>
    );
  }

  const hasUpvoted = user?.email ? bug.upvotedBy?.includes(user.email) : false;
  const isReporter = user
    ? (user.uid === bug.userId || !!(user.email && bug.userEmail && user.email.toLowerCase() === bug.userEmail.toLowerCase()))
    : false;
  const severityInfo = SEVERITY_CONFIG[bug.severity] || SEVERITY_CONFIG.medium;
  const categoryInfo = CATEGORY_CONFIG[bug.category] || CATEGORY_CONFIG.other;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Nav Bar */}
      <div className="border-b border-white/5 bg-black/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/issue-tracker"
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Issues</span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-wider">
            <Bug className="h-3.5 w-3.5" />
            <span>MLSC SVEC</span>
            <ChevronRight className="h-3 w-3" />
            <span>Issue Tracker</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">#{bug.issueNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all"
            >
              {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Issue Header */}
        <div className="mb-6 pb-6 border-b border-white/5">
          <div className="flex items-start gap-3 mb-3">
            {/* Status Icon */}
            <div className={cn(
              'mt-1 flex items-center justify-center w-6 h-6 rounded-full shrink-0',
              bug.status === 'open' ? 'bg-green-500/15 text-green-400' : 'bg-purple-500/15 text-purple-400'
            )}>
              {bug.status === 'open' ? <Circle className="h-3.5 w-3.5 fill-green-400" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug">
              {bug.title}{' '}
              <span className="text-white/30 font-normal">#{bug.issueNumber}</span>
            </h1>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 ml-9">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
              bug.status === 'open' ? 'bg-green-500/15 text-green-300 border-green-500/25' : 'bg-purple-500/15 text-purple-300 border-purple-500/25'
            )}>
              {bug.status === 'open'
                ? <><Circle className="h-3 w-3 fill-green-400 text-green-400" /> Open</>
                : <><CheckCircle2 className="h-3 w-3" /> Closed</>}
            </span>
            <span className="text-sm text-white/40">
              <span className="text-white/70 font-medium">{bug.userName}</span> opened this issue on {formatDate(bug.createdAt)}
            </span>
            <span className="text-white/25">·</span>
            <span className="text-sm text-white/40">{bug.comments?.length || 0} comments</span>
            {bug.status === 'resolved' && bug.resolvedAt && (
              <>
                <span className="text-white/25">·</span>
                <span className="text-sm text-purple-400/80">Resolved {formatRelative(bug.resolvedAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* Main Layout: Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Description + Comments Thread */}
          <div className="flex-1 min-w-0 space-y-0">

            {/* Opening comment (description) */}
            <div className="flex gap-3 md:gap-4">
              <AvatarInitial name={bug.userName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden">
                  {/* Comment header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#121212]">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-white">{bug.userName}</span>
                      <span className="text-white/40 text-xs">opened this issue {formatRelative(bug.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/25 font-mono bg-white/5 px-2 py-0.5 rounded">
                        #{bug.id.substring(0, 7)}
                      </span>
                    </div>
                  </div>
                  {/* Comment body */}
                  <div className="px-4 py-4 space-y-4">
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-mono bg-transparent">
                      {bug.description}
                    </p>
                    {bug.imageUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black/50 p-2 max-w-2xl mt-4">
                        <img 
                          src={bug.imageUrl} 
                          alt="Screenshot of the issue" 
                          className="max-h-[400px] object-contain rounded-lg w-auto" 
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-white/40 font-semibold">Screenshot Attached</span>
                          <a 
                            href={bug.imageUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-[#4285F4] hover:underline flex items-center gap-1 font-bold"
                          >
                            View original <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Reactions bar */}
                  <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-2">
                    <button
                      onClick={handleUpvote}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all',
                        hasUpvoted
                          ? 'bg-[#4285F4]/15 border-[#4285F4]/40 text-[#4285F4]'
                          : 'bg-white/[0.03] border-white/10 text-white/50 hover:border-white/25 hover:text-white'
                      )}
                    >
                      <ThumbsUp className={cn('h-3 w-3', hasUpvoted && 'fill-[#4285F4]')} />
                      {bug.upvotedBy?.length || 0}
                    </button>
                    <span className="text-[10px] text-white/20 font-medium">
                      {(bug.upvotedBy?.length || 0) === 1 ? '1 person found this helpful' : `${bug.upvotedBy?.length || 0} people found this helpful`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline + Comments */}
            {bug.comments && bug.comments.length > 0 && (
              <div className="space-y-0 mt-4">
                {bug.comments.map((comment, i) => {
                  const isSystem = comment.userEmail === 'system@mlscsvec.org';
                  
                  if (isSystem) {
                    return (
                      <div key={comment.id} className="flex items-center gap-3 md:gap-4 pt-4 pl-1">
                        <div className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center shrink-0">
                          <RefreshCw className="h-3.5 w-3.5 text-green-400" />
                        </div>
                        <p className="text-sm text-white/50">
                          <span className="text-white/70 font-semibold">{comment.userName}</span> {comment.content}{' '}
                          <span className="text-white/30 text-xs ml-1">{formatRelative(comment.createdAt)}</span>
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div key={comment.id} className="flex gap-3 md:gap-4 pt-4">
                      <AvatarInitial name={comment.userName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#121212]">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-white">{comment.userName}</span>
                              <span className="text-white/40 text-xs">commented {formatRelative(comment.createdAt)}</span>
                            </div>
                          </div>
                          <div className="px-4 py-4">
                            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Status change event */}
            {bug.status === 'resolved' && (
              <div className="flex items-center gap-3 mt-4 py-3 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                </div>
                <p className="text-sm text-white/50">
                  <span className="text-white/70 font-semibold">MLSC Dev Team</span> closed this as completed{' '}
                  {bug.resolvedAt ? formatRelative(bug.resolvedAt) : ''}
                </p>
              </div>
            )}

            {/* Add Comment Box */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex gap-3 md:gap-4">
                <AvatarInitial name={user?.displayName || commentName || '?'} size="md" />
                <div className="flex-1 min-w-0">
                  <form onSubmit={handleComment}>
                    {!user && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block mb-1">Name</label>
                          <input
                            type="text"
                            value={commentName}
                            onChange={e => setCommentName(e.target.value)}
                            placeholder="Your name"
                            className="w-full bg-black border border-white/5 rounded-lg px-3 h-9 text-sm text-white focus:outline-none focus:border-[#4285F4]/40 transition-colors placeholder-white/20"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block mb-1">Email</label>
                          <input
                            type="email"
                            value={commentEmail}
                            onChange={e => setCommentEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full bg-black border border-white/5 rounded-lg px-3 h-9 text-sm text-white focus:outline-none focus:border-[#4285F4]/40 transition-colors placeholder-white/20"
                            required
                          />
                        </div>
                      </div>
                    )}
                    {user && (
                      <div className="mb-2 text-xs text-white/40 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Commenting as <span className="text-white/70 font-semibold">{user.displayName || user.email}</span>
                      </div>
                    )}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#4285F4]/40 transition-colors">
                      <div className="px-3 pt-1 border-b border-white/5 flex gap-3">
                        <button type="button" className="text-[10px] py-2 font-black uppercase tracking-wider text-white border-b-2 border-[#4285F4]">Write</button>
                      </div>
                      <textarea
                        value={commentContent}
                        onChange={e => setCommentContent(e.target.value)}
                        placeholder="Leave a comment — share findings, repro steps, or fixes..."
                        rows={4}
                        className="w-full bg-transparent px-4 py-3 text-sm text-white focus:outline-none placeholder-white/20 resize-none"
                      />
                    </div>
                    <div className="mt-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs text-white/30">
                            {bug.status === 'open' ? 'This issue is currently open.' : 'This issue is resolved.'}
                          </p>
                          {bug.status === 'resolved' && (!user || isReporter) && !showReopenConfirm && (
                            <button
                              type="button"
                              onClick={() => {
                                if (user && isReporter) {
                                  handleReopen();
                                } else {
                                  setShowReopenConfirm(true);
                                }
                              }}
                              className="text-xs font-semibold text-green-400 hover:text-green-300 hover:underline flex items-center gap-1 transition-colors ml-1"
                            >
                              <RefreshCw className="h-3 w-3 animate-spin-once" /> Reopen Issue
                            </button>
                          )}
                        </div>
                        <Button
                          type="submit"
                          disabled={submitting || !commentContent.trim()}
                          className="bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg h-9 px-4 text-sm font-semibold disabled:opacity-40 transition-colors"
                        >
                          {submitting ? 'Posting...' : 'Comment'}
                        </Button>
                      </div>

                      {bug.status === 'resolved' && showReopenConfirm && (
                        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
                          <p className="text-xs text-white/70 font-medium">
                            Only the original reporter can reopen this bug. Please enter the email you used to report this bug to verify ownership:
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="email"
                              placeholder="Enter reporter email"
                              value={reopenEmail}
                              onChange={(e) => setReopenEmail(e.target.value)}
                              className="bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-green-500/40 flex-1"
                            />
                            <div className="flex gap-2 shrink-0">
                              <Button
                                type="button"
                                size="sm"
                                disabled={reopening || !reopenEmail.trim()}
                                onClick={() => handleReopen()}
                                className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 h-8 flex-1 sm:flex-none"
                              >
                                {reopening ? 'Verifying...' : 'Verify & Reopen'}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setShowReopenConfirm(false);
                                  setReopenEmail('');
                                }}
                                className="text-white/40 hover:text-white text-xs px-2.5 h-8 border border-white/10 flex-1 sm:flex-none"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-72 xl:w-80 shrink-0 space-y-4">

            {/* Labels */}
            <div className="border border-white/5 bg-[#0A0A0A] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">Labels</span>
              </div>
              <div className="px-4 py-3 flex flex-wrap gap-2">
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', severityInfo.color)}>
                  {severityInfo.label} severity
                </span>
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', categoryInfo.color)}>
                  {categoryInfo.label}
                </span>
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                  bug.status === 'open' ? 'bg-green-500/15 text-green-300 border-green-500/25' : 'bg-purple-500/15 text-purple-300 border-purple-500/25'
                )}>
                  {bug.status}
                </span>
              </div>
            </div>

            {/* Assignees / Reporter */}
            <div className="border border-white/5 bg-[#0A0A0A] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <span className="text-xs font-semibold text-white/60">Reporter</span>
              </div>
              <div className="px-4 py-3 flex items-center gap-2">
                <AvatarInitial name={bug.userName} size="sm" />
                <span className="text-sm text-white/80 font-medium">{bug.userName}</span>
              </div>
            </div>

            {/* Participants */}
            {bug.comments && bug.comments.length > 0 && (
              <div className="border border-white/5 bg-[#0A0A0A] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <span className="text-xs font-semibold text-white/60">Participants</span>
                </div>
                <div className="px-4 py-3 flex flex-wrap gap-1.5">
                  {Array.from(new Set(bug.comments.map(c => c.userName))).map(name => (
                    <div key={name} title={name}>
                      <AvatarInitial name={name} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upvotes */}
            <div className="border border-white/5 bg-[#0A0A0A] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <span className="text-xs font-semibold text-white/60">Community Impact</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <button
                  onClick={handleUpvote}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-all',
                    hasUpvoted
                      ? 'bg-[#4285F4]/15 border-[#4285F4]/40 text-[#4285F4]'
                      : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:border-white/25'
                  )}
                >
                  <ThumbsUp className={cn('h-4 w-4', hasUpvoted && 'fill-[#4285F4]')} />
                  {hasUpvoted ? 'You upvoted this' : 'Upvote this issue'}
                </button>
                <p className="text-[11px] text-white/35 text-center">
                  {bug.upvotedBy?.length || 0} {(bug.upvotedBy?.length || 0) === 1 ? 'person' : 'people'} affected
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="border border-white/5 bg-[#0A0A0A] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <span className="text-xs font-semibold text-white/60">Timeline</span>
              </div>
              <div className="px-4 py-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white/50">
                  <Calendar className="h-3.5 w-3.5 text-white/25" />
                  <span>Opened: <span className="text-white/70">{formatDate(bug.createdAt)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-white/50">
                  <MessageSquare className="h-3.5 w-3.5 text-white/25" />
                  <span>Comments: <span className="text-white/70">{bug.comments?.length || 0}</span></span>
                </div>
                {bug.resolvedAt && (
                  <div className="flex items-center gap-2 text-purple-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Resolved: <span className="text-purple-300">{formatDate(bug.resolvedAt)}</span></span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation links */}
            <div className="border border-white/5 bg-[#0A0A0A] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <span className="text-xs font-semibold text-white/60">Navigate Issues</span>
              </div>
              <div className="px-3 py-2 space-y-1">
                {allBugs.filter(b => b.id !== bug.id).slice(0, 4).map(b => (
                  <Link
                    key={b.id}
                    href={`/issue-tracker/${b.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors group"
                  >
                    <span className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      b.status === 'open' ? 'bg-green-400' : 'bg-purple-400'
                    )} />
                    <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors truncate">{b.title}</span>
                    <span className="text-[10px] text-white/25 shrink-0">#{b.issueNumber}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
