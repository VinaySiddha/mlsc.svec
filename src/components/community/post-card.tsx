'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostTypeBadge } from './post-type-badge';
import { ThumbsUp, MessageSquare, Share2, MoreVertical, Trash2, Loader2, Send } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RichTextDisplay } from './rich-text-display';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  toggleLike,
  getComments,
  addComment,
  deleteComment,
  deleteCommunityPost,
} from '@/app/community-actions';
import type { CommunityPost, Comment } from '@/types/community';
import Link from 'next/link';

interface PostCardProps {
  post: CommunityPost;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Like state
  const [liked, setLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [liking, setLiking] = useState(false);

  // Expand state for long post bodies
  const [expanded, setExpanded] = useState(false);

  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  // Deleting post state
  const [deletingPost, setDeletingPost] = useState(false);

  // Sync initial props
  useEffect(() => {
    setLiked(post.hasLiked || false);
    setLikeCount(post.likeCount || 0);
    setCommentCount(post.commentCount || 0);
  }, [post.hasLiked, post.likeCount, post.commentCount]);

  // Load comments when comments section is opened
  useEffect(() => {
    if (commentsOpen) {
      loadComments();
    }
  }, [commentsOpen]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const result = await getComments(post.id);
      setComments(result.comments || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Sign in required',
        description: 'Please sign in to like posts.',
      });
      return;
    }
    if (liking) return;
    setLiking(true);
    // Optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const result = await toggleLike(post.id, user.uid);
      if ('error' in result) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        setLiked(result.liked);
        setLikeCount(result.likeCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLiking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const result = await addComment({
        postId: post.id,
        content: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
      });

      if (result.success) {
        const newCommentObj: Comment = {
          id: result.commentId!,
          postId: post.id,
          content: newComment.trim(),
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
          authorPhotoURL: user.photoURL || '',
          deleted: false,
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [...prev, newCommentObj]);
        setNewComment('');
        setCommentCount((prev) => prev + 1);
        toast({ title: 'Comment Posted', description: 'Your comment has been added.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to post comment.' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!user) return;
    setDeletingCommentId(commentId);
    try {
      const result = await deleteComment(post.id, commentId, user.uid);
      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentCount((prev) => Math.max(0, prev - 1));
        toast({ title: 'Comment Deleted' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete comment.' });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handlePostDelete = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeletingPost(true);
    try {
      const result = await deleteCommunityPost(post.id, user.uid);
      if (result.success) {
        toast({ title: 'Post Deleted', description: 'Your post was successfully removed.' });
        if (onDelete) {
          onDelete(post.id);
        }
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete post.' });
    } finally {
      setDeletingPost(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/community/${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link Copied',
      description: 'Post link copied to your clipboard!',
    });
  };

  const showSeeMore = post.contentPlainText && post.contentPlainText.length > 240;
  const displayContent =
    showSeeMore && !expanded
      ? `${post.contentPlainText.substring(0, 240)}...`
      : post.contentPlainText;

  const isAuthor = user?.uid === post.authorId;

  return (
    <div className="bg-white text-black border-2 border-black shadow-[6px_6px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#000000] transition-all duration-200">
      {/* Header */}
      <div className="p-4 md:p-6 pb-3 border-b-2 border-black/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
              <AvatarFallback className="bg-[#FFE600] text-black font-black text-sm">
                {post.authorName?.[0]?.toUpperCase() || 'M'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-black text-sm md:text-base hover:text-[#4285F4] transition-colors">
                  {post.authorName}
                </span>
                <PostTypeBadge type={post.type} />
              </div>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                {isAuthor ? 'YOU • ' : 'MEMBER • '}
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 flex items-center justify-center border-2 border-black bg-white hover:bg-zinc-100 shadow-[1px_1px_0px_0px_#000000] transition-all cursor-pointer">
                    <MoreVertical className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-1">
                  <DropdownMenuItem
                    onClick={handlePostDelete}
                    disabled={deletingPost}
                    className="text-[#FF0055] font-black text-xs uppercase cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-red-50 focus:bg-red-50"
                  >
                    {deletingPost ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-3">
        <Link href={`/community/${post.id}`} className="block group">
          <h3 className="text-lg md:text-xl font-display font-black text-black leading-snug group-hover:text-[#4285F4] transition-colors">
            {post.title}
          </h3>
        </Link>

        <div className="text-xs md:text-sm text-zinc-800 leading-relaxed break-words whitespace-pre-wrap font-sans">
          {expanded ? (
            <RichTextDisplay content={post.content} />
          ) : (
            <p>{displayContent}</p>
          )}

          {showSeeMore && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-[#4285F4] hover:underline font-black ml-1 text-xs cursor-pointer inline-block"
            >
              [READ MORE +]
            </button>
          )}
          {expanded && showSeeMore && (
            <button
              onClick={() => setExpanded(false)}
              className="text-[#4285F4] hover:underline font-black ml-1 block mt-2 text-xs cursor-pointer"
            >
              [COLLAPSE -]
            </button>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-black uppercase text-black bg-[#FFE600] border-2 border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="px-4 md:px-6 py-2 flex items-center justify-between text-xs font-mono font-bold text-zinc-600 border-t-2 border-b-2 border-black bg-[#F9F9FB]">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center h-4 w-4 border border-black bg-[#4285F4] text-white text-[9px] font-black">
            ✓
          </span>
          <span>{likeCount} {likeCount === 1 ? 'INTERACTION' : 'INTERACTIONS'}</span>
        </div>
        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="hover:text-black hover:underline cursor-pointer"
        >
          {commentCount} {commentCount === 1 ? 'REPLY' : 'REPLIES'}
        </button>
      </div>

      {/* Action Buttons Bar */}
      <div className="p-2 md:p-3 flex items-center gap-2 bg-white">
        <button
          type="button"
          onClick={handleLike}
          disabled={liking}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
            liked
              ? 'bg-[#4285F4] text-white shadow-[2px_2px_0px_0px_#000000]'
              : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]'
          } hover:translate-x-[1px] hover:translate-y-[1px]`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 stroke-[2.5] ${liked ? 'fill-white' : ''}`} />
          <span>{liked ? 'LIKED' : 'LIKE'}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommentsOpen(!commentsOpen)}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
            commentsOpen
              ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]'
              : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]'
          } hover:translate-x-[1px] hover:translate-y-[1px]`}
        >
          <MessageSquare className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>REPLY</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider bg-white text-black hover:bg-zinc-100 border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>SHARE</span>
        </button>
      </div>

      {/* Inline Comments Section */}
      {commentsOpen && (
        <div className="bg-[#F9F9FB] border-t-2 border-black p-4 md:p-6 space-y-4">
          {/* Write comment input */}
          {user ? (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback className="bg-[#FFE600] text-black font-black text-xs">
                  {user.displayName?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <textarea
                  placeholder="Type your response or comment here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full min-h-[60px] p-3 text-xs md:text-sm text-black bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] placeholder:text-zinc-400 font-sans"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">
                    {newComment.length} chars (Press Enter to post)
                  </span>
                  <button
                    type="button"
                    onClick={handleCommentSubmit}
                    disabled={submittingComment || !newComment.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black uppercase tracking-wider bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submittingComment ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Send className="h-3 w-3 stroke-[2.5]" />
                    )}
                    POST REPLY
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-3 border-2 border-dashed border-black bg-white p-4">
              <p className="text-xs font-black text-black uppercase">
                AUTHENTICATION REQUIRED
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Please{' '}
                <Link href="/auth/login" className="text-[#4285F4] underline font-black">
                  sign in
                </Link>{' '}
                to participate in community discussions.
              </p>
            </div>
          )}

          {/* Comments list */}
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-black" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs font-mono text-zinc-500 text-center py-3 border-2 border-dashed border-zinc-300">
              NO REPLIES YET. BE THE FIRST TO CONTRIBUTE!
            </p>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 text-xs md:text-sm">
                  <Avatar className="h-8 w-8 border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                    <AvatarImage src={comment.authorPhotoURL} alt={comment.authorName} />
                    <AvatarFallback className="bg-[#4285F4] text-white font-black text-xs">
                      {comment.authorName?.[0]?.toUpperCase() || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                    <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-1">
                      <span className="font-black text-black text-xs">{comment.authorName}</span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                        <span>
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {user && user.uid === comment.authorId && (
                          <button
                            onClick={() => handleCommentDelete(comment.id)}
                            disabled={deletingCommentId === comment.id}
                            className="text-[#FF0055] hover:underline font-black cursor-pointer"
                            title="Delete reply"
                          >
                            {deletingCommentId === comment.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              '[DEL]'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-zinc-800 mt-2 text-xs leading-relaxed whitespace-pre-wrap break-words font-sans">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

