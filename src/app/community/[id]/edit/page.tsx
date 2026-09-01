'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCommunityPostById, updateCommunityPost } from '@/app/community-actions';
import { RichTextEditor } from '@/components/community/rich-text-editor';
import { useAuth } from '@/lib/auth-context';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, Pencil } from 'lucide-react';
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
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  if (!user || !post || post.authorId !== user.uid) {
    return (
      <div className="bg-white border-2 border-black p-12 text-center shadow-[6px_6px_0px_0px_#000000] space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-black uppercase tracking-tight">NOT AUTHORIZED</h2>
        <p className="text-xs text-zinc-600">You do not have permission to edit this post.</p>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4285F4] text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          Back to Feed
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
    const result = await updateCommunityPost(postId, user.uid, {
      title: title.trim(),
      content,
      contentPlainText: plainText,
      tags,
    });

    if (result.success) {
      toast({ title: 'Post Updated', description: 'Your revisions are now live.' });
      router.push(`/community/${postId}`);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href={`/community/${postId}`}
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-zinc-100 border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
      >
        <ArrowLeft className="h-3.5 w-3.5 stroke-[3]" />
        CANCEL & RETURN
      </Link>

      <div className="bg-white text-black border-2 border-black shadow-[8px_8px_0px_0px_#4285F4] p-6 md:p-8 space-y-6">
        <div className="border-b-2 border-black pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-black text-black uppercase tracking-tight flex items-center gap-2">
              <span className="p-1.5 bg-[#4285F4] text-white border-2 border-black">
                <Pencil className="h-5 w-5 stroke-[2.5]" />
              </span>
              Edit Post
            </h1>
            <p className="text-xs text-zinc-600 mt-1 font-medium">
              Update your post title, tags, or content.
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3 text-sm md:text-base font-bold text-black bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] placeholder:text-zinc-400 font-sans shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-xs font-black uppercase tracking-wider text-black">
              Tags (comma-separated)
            </Label>
            <input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full h-11 px-3 text-xs md:text-sm font-bold text-black bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] placeholder:text-zinc-400 font-sans shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-wider text-black">
              Content *
            </Label>
            <RichTextEditor
              content={post.content}
              onChange={(html, text) => {
                setContent(html);
                setPlainText(text);
              }}
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
                <Save className="h-4 w-4 stroke-[2.5]" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

