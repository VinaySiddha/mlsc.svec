'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import {
  Bug, ArrowLeft, ThumbsUp, MessageSquare, Calendar, User,
  CheckCircle2, Clock, AlertTriangle, Tag, Send, ChevronRight,
  Circle, Copy, ExternalLink, RefreshCw, Sparkles, ShieldAlert
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
  low: { color: 'bg-[#4285F4]/20 text-black border-black', dot: 'bg-[#4285F4]', label: 'Low' },
  medium: { color: 'bg-[#FFE600] text-black border-black', dot: 'bg-black', label: 'Medium' },
  high: { color: 'bg-orange-300 text-black border-black', dot: 'bg-orange-600', label: 'High' },
  critical: { color: 'bg-[#EA4335] text-white border-black', dot: 'bg-white', label: 'Critical' },
};

const CATEGORY_CONFIG = {
  frontend: { label: 'Frontend UI', color: 'bg-purple-100 text-black border-black' },
  backend: { label: 'Backend & APIs', color: 'bg-cyan-100 text-black border-black' },
  'ui-ux': { label: 'UI/UX Design', color: 'bg-pink-100 text-black border-black' },
  database: { label: 'Database', color: 'bg-amber-100 text-black border-black' },
  auth: { color: 'bg-emerald-100 text-black border-black', label: 'Authentication' },
  other: { color: 'bg-zinc-100 text-black border-black', label: 'General' },
};

function AvatarInitial({ name }: { name: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="w-8 h-8 border-2 border-black bg-[#FFE600] flex items-center justify-center font-black text-black text-xs shrink-0 shadow-[2px_2px_0px_0px_#000000]">
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
      const diff = Date.now() - new Date(s).getTime();
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin" />
          <p className="text-xs text-black font-black uppercase tracking-widest">Loading issue report...</p>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-[#EA4335]" />
        <h2 className="text-2xl font-black uppercase italic tracking-tight text-black">Issue Record Not Found</h2>
        <Button asChild className="bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-10 px-4">
          <Link href="/issue-tracker">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Issue Tracker
          </Link>
        </Button>
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
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Issue #{bug.issueNumber} Dossier — Real-Time Bug Lifecycle
      </div>

      {/* Top Nav Bar */}
      <div className="border-b-2 border-black bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link
            href="/issue-tracker"
            className="flex items-center gap-2 text-xs text-black hover:text-[#4285F4] transition-colors font-black uppercase tracking-wider border-2 border-black bg-zinc-100 hover:bg-white px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Issues</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-black uppercase font-mono">
            <Bug className="h-3.5 w-3.5 text-black" />
            <span className="hidden sm:inline">MLSC SVEC</span>
            <ChevronRight className="h-3 w-3" />
            <span className="bg-[#FFE600] px-2 py-0.5 border border-black">#{bug.issueNumber}</span>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white hover:bg-zinc-100 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#000000]"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-[#00A844]" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Issue Header */}
        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 shrink-0">
              {bug.status === 'open' 
                ? <span className="inline-block w-4 h-4 rounded-none border-2 border-black bg-[#00FF66] shadow-[1px_1px_0px_0px_#000000]" />
                : <CheckCircle2 className="h-5 w-5 text-purple-700" />}
            </div>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-black">
              {bug.title}{' '}
              <span className="text-zinc-400 font-normal font-mono">#{bug.issueNumber}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-black text-xs font-black uppercase font-mono">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000]',
              bug.status === 'open' ? 'bg-[#00FF66] text-black' : 'bg-purple-200 text-black'
            )}>
              {bug.status === 'open' ? '● Open Issue' : '✔ Resolved Issue'}
            </span>
            <span className="text-zinc-700">
              <span className="text-black font-black">{bug.userName}</span> opened {formatDate(bug.createdAt)}
            </span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-700">{bug.comments?.length || 0} Comments</span>
            {bug.status === 'resolved' && bug.resolvedAt && (
              <>
                <span className="text-zinc-400">·</span>
                <span className="text-purple-700">Resolved {formatRelative(bug.resolvedAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* Layout: Details + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Column */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Opening Description Box */}
            <div className="border-2 border-black bg-white shadow-[5px_5px_0px_0px_#000000]">
              <div className="flex items-center justify-between px-5 py-3 border-b-2 border-black bg-zinc-100">
                <div className="flex items-center gap-2 text-xs font-black uppercase">
                  <AvatarInitial name={bug.userName} />
                  <span>{bug.userName}</span>
                  <span className="text-zinc-500 font-bold font-mono">opened {formatRelative(bug.createdAt)}</span>
                </div>
                <span className="text-[10px] font-mono font-black border border-black bg-white px-2 py-0.5">
                  #{bug.id.substring(0, 7).toUpperCase()}
                </span>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-800 font-semibold leading-relaxed whitespace-pre-wrap">
                  {bug.description}
                </p>
                {bug.imageUrl && (
                  <div className="border-2 border-black bg-zinc-50 p-2 max-w-xl">
                    <img 
                      src={bug.imageUrl} 
                      alt="Screenshot" 
                      className="border border-black max-h-[350px] object-contain w-auto" 
                    />
                    <div className="mt-2 flex items-center justify-between px-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-black">Evidence Screenshot</span>
                      <a 
                        href={bug.imageUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-[#4285F4] hover:underline font-black uppercase flex items-center gap-1"
                      >
                        View Full Screen <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t-2 border-black bg-zinc-50 flex items-center gap-3">
                <button
                  onClick={handleUpvote}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_#000000]',
                    hasUpvoted ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  )}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {bug.upvotedBy?.length || 0} Upvotes
                </button>
              </div>
            </div>

            {/* Comment Thread */}
            {bug.comments && bug.comments.length > 0 && (
              <div className="space-y-4">
                {bug.comments.map((comment) => (
                  <div key={comment.id} className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000]">
                    <div className="flex items-center justify-between px-5 py-2.5 border-b-2 border-black bg-zinc-100">
                      <div className="flex items-center gap-2 text-xs font-black uppercase">
                        <AvatarInitial name={comment.userName} />
                        <span>{comment.userName}</span>
                        <span className="text-zinc-500 font-bold font-mono">commented {formatRelative(comment.createdAt)}</span>
                      </div>
                    </div>
                    <div className="p-5 text-sm text-zinc-800 font-semibold leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Status Change Notice */}
            {bug.status === 'resolved' && (
              <div className="border-2 border-black bg-purple-100 p-4 flex items-center gap-3 shadow-[4px_4px_0px_0px_#000000]">
                <CheckCircle2 className="h-5 w-5 text-purple-700 shrink-0" />
                <p className="text-xs font-black uppercase text-black">
                  MLSC Engineering Team closed this issue as completed {bug.resolvedAt ? formatRelative(bug.resolvedAt) : ''}
                </p>
              </div>
            )}

            {/* Comment Submission Form */}
            <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] space-y-4">
              <h3 className="text-sm font-black uppercase italic tracking-tight text-black flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Add Discussion Response
              </h3>
              <form onSubmit={handleComment} className="space-y-4">
                {!user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-black block mb-1">Your Name</label>
                      <input
                        type="text"
                        value={commentName}
                        onChange={e => setCommentName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full bg-white border-2 border-black px-3 h-10 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-black block mb-1">Your Email</label>
                      <input
                        type="email"
                        value={commentEmail}
                        onChange={e => setCommentEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full bg-white border-2 border-black px-3 h-10 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                        required
                      />
                    </div>
                  </div>
                )}

                <textarea
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  placeholder="Leave a comment — share reproduction steps, logs, or potential solutions..."
                  rows={4}
                  className="w-full bg-white border-2 border-black p-4 text-xs font-bold text-black focus:outline-none placeholder-zinc-500 shadow-[2px_2px_0px_0px_#000000] resize-none"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {bug.status === 'resolved' && (!user || isReporter) && !showReopenConfirm && (
                      <button
                        type="button"
                        onClick={() => {
                          if (user && isReporter) handleReopen();
                          else setShowReopenConfirm(true);
                        }}
                        className="text-xs font-black uppercase text-[#00A844] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Reopen Issue
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || !commentContent.trim()}
                    className="bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] h-11 px-6 text-xs font-black uppercase tracking-wider active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    {submitting ? 'Submitting...' : 'Post Comment'}
                  </Button>
                </div>

                {bug.status === 'resolved' && showReopenConfirm && (
                  <div className="border-2 border-black bg-zinc-100 p-4 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
                    <p className="text-xs font-bold text-black">
                      Only the original reporter can reopen this ticket. Please enter your email:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        placeholder="Reporter email"
                        value={reopenEmail}
                        onChange={(e) => setReopenEmail(e.target.value)}
                        className="bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black flex-1 shadow-[2px_2px_0px_0px_#000000]"
                      />
                      <Button
                        type="button"
                        disabled={reopening || !reopenEmail.trim()}
                        onClick={() => handleReopen()}
                        className="bg-[#00FF66] text-black border-2 border-black font-black uppercase text-xs h-10 px-4 shadow-[2px_2px_0px_0px_#000000]"
                      >
                        {reopening ? 'Verifying...' : 'Verify & Reopen'}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="lg:w-80 shrink-0 space-y-4">
            
            {/* Labels Card */}
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-2">Classification</h4>
              <div className="flex flex-wrap gap-2">
                <span className={cn('px-2.5 py-1 text-xs font-black uppercase border', severityInfo.color)}>
                  {severityInfo.label} Severity
                </span>
                <span className={cn('px-2.5 py-1 text-xs font-black uppercase border', categoryInfo.color)}>
                  {categoryInfo.label}
                </span>
              </div>
            </div>

            {/* Reporter Card */}
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-2">Reporter</h4>
              <div className="flex items-center gap-2.5">
                <AvatarInitial name={bug.userName} />
                <span className="text-xs font-black uppercase text-black">{bug.userName}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-2">Timeline</h4>
              <div className="space-y-2 text-xs font-bold font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Created:</span>
                  <span className="text-black">{formatDate(bug.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Responses:</span>
                  <span className="text-black">{bug.comments?.length || 0}</span>
                </div>
                {bug.resolvedAt && (
                  <div className="flex items-center justify-between text-purple-700">
                    <span>Resolved:</span>
                    <span>{formatDate(bug.resolvedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Issues */}
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-2">Recent Issues</h4>
              <div className="space-y-2">
                {allBugs.filter(b => b.id !== bug.id).slice(0, 4).map(b => (
                  <Link
                    key={b.id}
                    href={`/issue-tracker/${b.id}`}
                    className="flex items-center justify-between p-2 border border-black hover:bg-[#FFE600] text-black text-xs font-bold transition-all shadow-[1px_1px_0px_0px_#000000]"
                  >
                    <span className="truncate max-w-[180px]">{b.title}</span>
                    <span className="font-mono text-[10px]">#{b.issueNumber}</span>
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
