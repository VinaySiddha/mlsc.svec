'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { PostTypeBadge } from './post-type-badge';
import { ThumbsUp, MessageSquare, Share2, MoreVertical, Trash2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { InputGroup, InputGroupTextarea, InputGroupAddon, InputGroupText } from '@/components/ui/input-group';
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
        // Rollback on error
        setLiked(prevLiked);
        setLikeCount(prevCount);
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        setLiked(result.liked);
        setLikeCount(result.likeCount);
      }
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    <Card className="glass-card overflow-hidden border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl bg-zinc-950/40 backdrop-blur-md rounded-2xl">
      {/* Header */}
      <CardHeader className="p-4 md:p-6 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-primary/20">
              <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {post.authorName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm md:text-base hover:text-primary transition-colors cursor-pointer">
                  {post.authorName}
                </span>
                <PostTypeBadge type={post.type} />
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                {isAuthor ? 'You • ' : 'MLSC Member • '}
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-xl">
                  <DropdownMenuItem
                    onClick={handlePostDelete}
                    disabled={deletingPost}
                    className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer flex items-center gap-2 font-medium"
                  >
                    {deletingPost ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="px-4 md:px-6 py-2 space-y-3">
        <Link href={`/community/${post.id}`} className="block">
          <h3 className="text-lg md:text-xl font-bold text-white leading-snug hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>

        <div className="text-sm md:text-base text-white/80 leading-relaxed break-words whitespace-pre-wrap">
          {expanded ? (
            <RichTextDisplay content={post.content} />
          ) : (
            <p>{displayContent}</p>
          )}

          {showSeeMore && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-primary hover:underline font-semibold ml-1 focus:outline-none text-xs md:text-sm"
            >
              ...see more
            </button>
          )}
          {expanded && showSeeMore && (
            <button
              onClick={() => setExpanded(false)}
              className="text-primary hover:underline font-semibold ml-1 block mt-2 focus:outline-none text-xs md:text-sm"
            >
              show less
            </button>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-full cursor-pointer transition-all duration-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      {/* Action Stats */}
      <div className="px-4 md:px-6 py-2 flex items-center justify-between text-xs text-white/40 border-b border-white/5">
        <div className="flex items-center gap-1">
          <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold">
            👍
          </span>
          <span>{likeCount} likes</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="hover:text-primary hover:underline transition-colors"
          >
            {commentCount} comments
          </button>
        </div>
      </div>

      {/* Actions Footer */}
      <CardFooter className="p-2 flex items-center justify-between gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={liking}
          className={`flex-1 gap-2 rounded-xl h-10 text-xs md:text-sm transition-all duration-200 ${
            liked
              ? 'text-primary bg-primary/10 hover:bg-primary/20 font-bold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-primary text-primary' : ''}`} />
          Like
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCommentsOpen(!commentsOpen)}
          className={`flex-1 gap-2 rounded-xl h-10 text-xs md:text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 ${
            commentsOpen ? 'text-primary bg-primary/5' : ''
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Comment
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="flex-1 gap-2 rounded-xl h-10 text-xs md:text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </CardFooter>

      {/* Inline Comments Section */}
      {commentsOpen && (
        <div className="bg-black/40 border-t border-white/5 p-4 md:p-6 space-y-4 transition-all duration-300">
          {/* Write comment input */}
          {user ? (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 mt-1 border border-white/10 ring-1 ring-primary/20">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {user.displayName?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <InputGroup className="bg-zinc-900/40 border-white/5 focus-within:border-primary/30 transition-all rounded-xl">
                  <InputGroupTextarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] text-sm text-white focus-visible:ring-0 placeholder:text-white/30 px-3 py-2 bg-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit();
                      }
                    }}
                  />
                  <InputGroupAddon className="border-white/5 bg-transparent px-3 py-1 flex items-center justify-between">
                    <InputGroupText className="text-white/30 text-[10px] tabular-nums">
                      {newComment.length} chars
                    </InputGroupText>
                    <span className="text-[10px] text-white/20 italic">Press Enter to post</span>
                  </InputGroupAddon>
                </InputGroup>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleCommentSubmit}
                    disabled={submittingComment || !newComment.trim()}
                    className="rounded-full h-8 text-xs font-bold bg-primary text-black hover:bg-primary/80 transition-colors"
                  >
                    {submittingComment ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Send className="h-3 w-3 mr-1" />
                    )}
                    Post
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 border border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="text-xs text-white/50">
                Please{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-bold">
                  sign in
                </Link>{' '}
                to leave a comment.
              </p>
            </div>
          )}

          {/* Comments list */}
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-2">
              Be the first to comment on this transmission!
            </p>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 text-xs md:text-sm">
                  <Avatar className="h-8 w-8 border border-white/5">
                    <AvatarImage src={comment.authorPhotoURL} alt={comment.authorName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {comment.authorName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-zinc-900/60 rounded-2xl px-4 py-3 border border-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">{comment.authorName}</span>
                      <div className="flex items-center gap-2 text-[10px] text-white/40">
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
                            className="text-red-400 hover:text-red-500 transition-colors"
                            title="Delete comment"
                          >
                            {deletingCommentId === comment.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-white/80 mt-1 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
