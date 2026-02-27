'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { PostTypeBadge } from './post-type-badge';
import { LikeButton } from './like-button';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { CommunityPost } from '@/types/community';

interface PostCardProps {
  post: CommunityPost;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="glass-card hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/community/${post.id}`} className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          <PostTypeBadge type={post.type} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
            <AvatarFallback className="text-xs">{post.authorName?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{post.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.contentPlainText}
        </p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center gap-3">
          <LikeButton postId={post.id} initialLiked={post.hasLiked || false} initialCount={post.likeCount} />
          <Link href={`/community/${post.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="h-4 w-4" />
            {post.commentCount}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
