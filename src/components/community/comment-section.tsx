'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { addComment, getComments, deleteComment } from '@/app/community-actions';
import { ReportDialog } from './report-dialog';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Send, MessageSquare } from 'lucide-react';
import type { Comment } from '@/types/community';
import Link from 'next/link';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { comments: fetched } = await getComments(postId);
      setComments(fetched || []);
      setLoading(false);
    })();
  }, [postId]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    const result = await addComment({
      postId,
      content: newComment.trim(),
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      authorPhotoURL: user.photoURL || '',
    });
    if (result.success) {
      setComments((prev) => [
        ...prev,
        {
          id: result.commentId!,
          postId,
          content: newComment.trim(),
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
          authorPhotoURL: user.photoURL || '',
          deleted: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewComment('');
      toast({ title: 'Comment Posted' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    setDeletingId(commentId);
    const result = await deleteComment(postId, commentId, user.uid);
    if (result.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast({ title: 'Comment Deleted' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setDeletingId(null);
  };

  return (
    <div className="bg-white text-black border-2 border-black shadow-[6px_6px_0px_0px_#000000] p-6 space-y-6">
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <span className="p-1.5 bg-[#4285F4] text-white border-2 border-black">
            <MessageSquare className="h-4 w-4 stroke-[2.5]" />
          </span>
          Replies ({comments.length})
        </h3>
        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
          THREAD DISCUSSION
        </span>
      </div>

      {user ? (
        <div className="flex gap-4 p-4 border-2 border-black bg-[#F9F9FB] shadow-[3px_3px_0px_0px_#000000]">
          <Avatar className="h-10 w-10 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback className="bg-[#FFE600] text-black font-black">
              {user.displayName?.[0]?.toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <textarea
              placeholder="Write a constructive response or insight..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full min-h-[90px] p-3 text-xs md:text-sm text-black bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] placeholder:text-zinc-400 font-sans"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500 font-bold">
                {newComment.length} characters
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !newComment.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black uppercase tracking-wider bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                )}
                POST RESPONSE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-black bg-[#F9F9FB] p-6 space-y-2">
          <p className="text-sm font-black uppercase tracking-wider text-black">
            JOIN THE CONVERSATION
          </p>
          <p className="text-xs text-zinc-600">
            Please{' '}
            <Link href="/auth/login" className="text-[#4285F4] underline font-black">
              sign in
            </Link>{' '}
            to post a response.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-zinc-300">
          <p className="text-xs font-mono font-bold text-zinc-500 uppercase">
            NO RESPONSES YET. BE THE FIRST TO WEIGH IN.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 p-4 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000]"
            >
              <Avatar className="h-9 w-9 border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                <AvatarImage src={comment.authorPhotoURL} alt={comment.authorName} />
                <AvatarFallback className="bg-[#4285F4] text-white font-black text-xs">
                  {comment.authorName?.[0]?.toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                  <span className="text-xs md:text-sm font-black text-black">{comment.authorName}</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-zinc-800 mt-2 leading-relaxed whitespace-pre-wrap font-sans">
                  {comment.content}
                </p>
                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-black/5">
                  {user && user.uid === comment.authorId && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#FF0055] hover:underline cursor-pointer"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </button>
                  )}
                  <ReportDialog contentType="comment" contentId={comment.id} postId={postId} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

