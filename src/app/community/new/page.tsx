'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createCommunityPost } from '@/app/community-actions';
import { RichTextEditor } from '@/components/community/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [plainText, setPlainText] = useState('');
  const [postType, setPostType] = useState<'discussion' | 'question' | 'announcement'>('discussion');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">You need to sign in to create a post.</p>
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
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
    const result = await createCommunityPost({
      title: title.trim(),
      content,
      contentPlainText: plainText,
      type: postType,
      tags,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      authorPhotoURL: user.photoURL || '',
    });

    if (result.success) {
      toast({ title: 'Post Created', description: 'Your post has been published.' });
      router.push(`/community/${result.postId}`);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setSubmitting(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Create a New Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Post Type</Label>
            <Select value={postType} onValueChange={(v) => setPostType(v as any)}>
              <SelectTrigger className="bg-background/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="react, nextjs, firebase"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="bg-background/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor
            onChange={(html, text) => {
              setContent(html);
              setPlainText(text);
            }}
            placeholder="Share your thoughts..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
