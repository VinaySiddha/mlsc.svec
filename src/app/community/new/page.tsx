'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createCommunityPost } from '@/app/community-actions';
import { RichTextEditor } from '@/components/community/rich-text-editor';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Send, Sparkles } from 'lucide-react';
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
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white border-2 border-black p-12 text-center shadow-[6px_6px_0px_0px_#000000] space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-black uppercase tracking-tight">SIGN IN REQUIRED</h2>
        <p className="text-xs text-zinc-600">You must be logged into your MLSC account to publish a community post.</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4285F4] text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() || !plainText.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please add a title and content.' });
      return;
    }

    setSubmitting(true);
    const tags = tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
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
      toast({ title: 'Post Created', description: 'Your post has been broadcasted.' });
      router.push(`/community/${result.postId}`);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setSubmitting(false);
  };

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

      <div className="bg-white text-black border-2 border-black shadow-[8px_8px_0px_0px_#FFE600] p-6 md:p-8 space-y-6">
        <div className="border-b-2 border-black pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-black text-black uppercase tracking-tight flex items-center gap-2">
              <span className="p-1.5 bg-[#FFE600] text-black border-2 border-black">
                <Sparkles className="h-5 w-5 stroke-[2.5]" />
              </span>
              Broadcast New Post
            </h1>
            <p className="text-xs text-zinc-600 mt-1 font-medium">
              Share knowledge, launch a discussion, ask questions, or announce something new to the chapter.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-black uppercase tracking-wider text-black">
              Post Title *
            </Label>
            <input
              id="title"
              placeholder="e.g. Building with Gemini Flash on Next.js 15"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3 text-sm md:text-base font-bold text-black bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] placeholder:text-zinc-400 font-sans shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-wider text-black">Post Type</Label>
              <Select value={postType} onValueChange={(v) => setPostType(v as any)}>
                <SelectTrigger className="h-11 bg-white border-2 border-black text-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000000]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] text-black">
                  <SelectItem value="discussion" className="text-xs font-bold uppercase cursor-pointer">Discussion</SelectItem>
                  <SelectItem value="question" className="text-xs font-bold uppercase cursor-pointer">Question</SelectItem>
                  <SelectItem value="announcement" className="text-xs font-bold uppercase cursor-pointer">Bulletin / Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-xs font-black uppercase tracking-wider text-black">
                Tags (comma-separated)
              </Label>
              <input
                id="tags"
                placeholder="ai, nextjs, react, web3"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full h-11 px-3 text-xs md:text-sm font-bold text-black bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] placeholder:text-zinc-400 font-sans shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-wider text-black">
              Content *
            </Label>
            <RichTextEditor
              onChange={(html, text) => {
                setContent(html);
                setPlainText(text);
              }}
              placeholder="Describe your ideas, ask questions, or provide updates..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !plainText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 stroke-[2.5]" />
              )}
              Broadcast Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

