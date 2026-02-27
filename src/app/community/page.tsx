'use client';

import { useEffect, useState } from 'react';
import { getCommunityPosts } from '@/app/community-actions';
import { PostCard } from '@/components/community/post-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { CommunityPost } from '@/types/community';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPosts = async (append = false, lastDate?: string) => {
    if (append) setLoadingMore(true); else setLoading(true);
    setFetchError(null);

    const type = typeFilter === 'all' ? undefined : typeFilter as any;
    const result = await getCommunityPosts({ type, lastPostDate: lastDate });

    if (result.error) {
      setFetchError(result.error);
    }

    if (append) {
      setPosts((prev) => [...prev, ...result.posts]);
    } else {
      setPosts(result.posts);
    }
    setHasMore(result.hasMore);

    if (append) setLoadingMore(false); else setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [typeFilter]);

  const loadMore = () => {
    if (posts.length === 0) return;
    const lastPost = posts[posts.length - 1];
    fetchPosts(true, lastPost.createdAt);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Feed</h2>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="discussion">Discussions</SelectItem>
            <SelectItem value="question">Questions</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {fetchError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Error loading posts</p>
          <p className="mt-1 text-xs break-all">{fetchError}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 && !fetchError ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
