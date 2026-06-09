'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCommunityPostById, updateCommunityPost } from '@/app/community-actions';
import { RichTextEditor } from '@/components/community/rich-text-editor';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { CommunityPost } from '@/types/community';

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [plainText, setPlainText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { post: fetched } = await getCommunityPostById(postId);
      if (fetched) {
        setPost(fetched);
        setTitle(fetched.title);
        setContent(fetched.content);
        setPlainText(fetched.contentPlainText);
        setTagsInput(fetched.tags.join(', '));
      }
      setLoading(false);
    })();
  }, [postId]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !post || post.authorId !== user.uid) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Not authorized to edit this post.</p>
        <Button asChild variant="ghost" className="mt-2 text-primary hover:underline">
          <Link href="/community">Back to Community</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() || !plainText.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please add a title and content.' });
      return;
    }

    setSubmitting(true);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const result = await updateCommunityPost(postId, user.uid, {
      title: title.trim(),
      content,
      contentPlainText: plainText,
      tags,
    });

    if (result.success) {
      toast({ title: 'Post Updated' });
      router.push(`/community/${postId}`);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setSubmitting(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Edit Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="bg-background/20"
          />
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor
            content={post.content}
            onChange={(html, text) => {
              setContent(html);
              setPlainText(text);
            }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
