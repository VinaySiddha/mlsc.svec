'use client';

import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { toggleLike } from '@/app/community-actions';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleToggle = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Sign in required', description: 'Please sign in to like posts.' });
      return;
    }
    if (loading) return;
    setLoading(true);

    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const result = await toggleLike(postId, user.uid);
      if ('error' in result) {
        setLiked(prevLiked);
        setCount(prevCount);
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        setLiked(result.liked);
        setCount(result.likeCount);
      }
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
        liked
          ? 'bg-[#FF0055] text-white shadow-[2px_2px_0px_0px_#000000]'
          : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]'
      } hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Heart className={`h-3.5 w-3.5 stroke-[2.5] ${liked ? 'fill-white text-white' : 'text-black'}`} />
      )}
      <span>{count} {count === 1 ? 'LIKE' : 'LIKES'}</span>
    </button>
  );
}

