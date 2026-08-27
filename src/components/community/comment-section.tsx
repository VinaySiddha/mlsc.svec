'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { addComment, getComments, deleteComment } from '@/app/community-actions';
import { ReportDialog } from './report-dialog';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import type { Comment } from '@/types/community';

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
      setComments(fetched);
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
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>

      {user && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback>{user.displayName?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <InputGroup className="bg-white/5 border-white/10">
              <InputGroupTextarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-20 text-sm text-white focus-visible:ring-0 placeholder:text-white/30"
              />
              <InputGroupAddon align="block-end" className="border-white/10 bg-white/5">
                <InputGroupText className="text-white/40 tabular-nums">
                  {(newComment || "").length} characters
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <Button size="sm" onClick={handleSubmit} disabled={submitting || !newComment.trim()}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Comment
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-background/20">
              <Avatar className="h-7 w-7 mt-0.5">
                <AvatarImage src={comment.authorPhotoURL} alt={comment.authorName} />
                <AvatarFallback className="text-xs">{comment.authorName?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  {user && user.uid === comment.authorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-muted-foreground text-xs"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                    >
                      {deletingId === comment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Delete
                    </Button>
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
