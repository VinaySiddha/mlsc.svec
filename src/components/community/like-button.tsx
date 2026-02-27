'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
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
    setLoading(true);
    const result = await toggleLike(postId, user.uid);
    if ('error' in result) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      setLiked(result.liked);
      setCount(result.likeCount);
    }
    setLoading(false);
  };

  return (
    <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleToggle} disabled={loading}>
      <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
      {count}
    </Button>
  );
}
