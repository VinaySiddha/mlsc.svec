'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCommunityPostById, deleteCommunityPost } from '@/app/community-actions';
import { RichTextDisplay } from '@/components/community/rich-text-display';
import { PostTypeBadge } from '@/components/community/post-type-badge';
import { LikeButton } from '@/components/community/like-button';
import { CommentSection } from '@/components/community/comment-section';
import { ReportDialog } from '@/components/community/report-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Trash2, ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import type { CommunityPost } from '@/types/community';

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const { post: fetched } = await getCommunityPostById(postId, user?.uid);
      setPost(fetched);
      setLoading(false);
    })();
  }, [postId, user?.uid]);

  const handleDelete = async () => {
    if (!user || !post) return;
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);
    const result = await deleteCommunityPost(postId, user.uid);
    if (result.success) {
      toast({ title: 'Post Deleted' });
      router.push('/community');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-white border-2 border-black p-12 text-center shadow-[6px_6px_0px_0px_#000000] space-y-4 max-w-lg mx-auto">
        <h2 className="text-xl font-black uppercase tracking-tight">TRANSMISSION NOT FOUND</h2>
        <p className="text-xs text-zinc-600">The requested post does not exist or has been removed from the platform.</p>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          <ArrowLeft className="h-4 w-4 stroke-[3]" />
          Back to Feed
        </Link>
      </div>
    );
  }

  const isAuthor = user?.uid === post.authorId;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-zinc-100 border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
      >
        <ArrowLeft className="h-3.5 w-3.5 stroke-[3]" />
        BACK TO COMMUNITY
      </Link>

      {/* Main Post Card */}
      <div className="bg-white text-black border-2 border-black shadow-[8px_8px_0px_0px_#4285F4] p-6 md:p-8 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-black pb-6">
          <div className="space-y-3">
            <PostTypeBadge type={post.type} />
            <h1 className="text-2xl md:text-3xl font-display font-black text-black leading-tight uppercase">
              {post.title}
            </h1>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/community/${post.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-zinc-100 transition-all"
              >
                <Pencil className="h-3.5 w-3.5 stroke-[2.5]" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider bg-[#FF0055] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 transition-all cursor-pointer"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Author metadata banner */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-[#F9F9FB] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
              <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
              <AvatarFallback className="bg-[#FFE600] text-black font-black">
                {post.authorName?.[0]?.toUpperCase() || 'M'}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm font-black text-black block">{post.authorName}</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {isAuthor ? 'AUTHOR (YOU)' : 'COMMUNITY MEMBER'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <div className="py-2 text-black leading-relaxed font-sans">
          <RichTextDisplay content={post.content} />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-black/10">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-black uppercase text-black bg-[#FFE600] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0px_0px_#000000]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t-2 border-black">
          <LikeButton postId={post.id} initialLiked={post.hasLiked || false} initialCount={post.likeCount} />
          <ReportDialog contentType="post" contentId={post.id} postId={post.id} />
        </div>
      </div>

      {/* Comment Section */}
      <CommentSection postId={post.id} />
    </div>
  );
}

