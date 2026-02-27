'use client';

import { useState } from 'react';
import { moderatePost } from '@/app/community-actions';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Trash2 } from 'lucide-react';
import type { CommunityPost } from '@/types/community';

export function ModerationTable({ posts: initialPosts }: { posts: CommunityPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAction = async (postId: string, action: 'dismiss' | 'delete') => {
    setLoadingId(postId);
    const result = await moderatePost(postId, action);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({
        title: action === 'dismiss' ? 'Report Dismissed' : 'Post Deleted',
        description: action === 'dismiss' ? 'The flag has been removed.' : 'The post has been removed.',
      });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingId(null);
  };

  if (posts.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No flagged posts. The community is clean!</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{post.authorName}</TableCell>
              <TableCell className="text-sm capitalize">{post.type}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(post.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(post.id, 'dismiss')}
                    disabled={loadingId === post.id}
                  >
                    {loadingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                    Dismiss
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction(post.id, 'delete')}
                    disabled={loadingId === post.id}
                  >
                    {loadingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
