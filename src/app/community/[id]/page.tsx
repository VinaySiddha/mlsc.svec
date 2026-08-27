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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
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
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Post not found.</p>
        <Button asChild variant="ghost" className="mt-2 text-primary hover:underline">
          <Link href="/community">Back to Community</Link>
        </Button>
      </div>
    );
  }

  const isAuthor = user?.uid === post.authorId;

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2">
              <PostTypeBadge type={post.type} />
              <h1 className="text-2xl font-bold">{post.title}</h1>
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/community/${post.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
              <AvatarFallback>{post.authorName?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm font-medium">{post.authorName}</span>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RichTextDisplay content={post.content} />

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex items-center gap-3">
            <LikeButton postId={post.id} initialLiked={post.hasLiked || false} initialCount={post.likeCount} />
            <ReportDialog contentType="post" contentId={post.id} postId={post.id} />
          </div>
        </CardContent>
      </Card>

      <CommentSection postId={post.id} />
    </div>
  );
}
