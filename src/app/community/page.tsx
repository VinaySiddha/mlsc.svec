'use client';

import { useEffect, useState } from 'react';
import { getCommunityPosts } from '@/app/community-actions';
import { PostCard } from '@/components/community/post-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MessageSquare } from 'lucide-react';
import type { CommunityPost } from '@/types/community';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { motion } from 'framer-motion';

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
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1">
        <section className="relative w-full py-24 md:py-40 text-center overflow-hidden border-b border-white/5">
            <div className="glow-sphere top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#34A853]/10" />
            <div className="container mx-auto px-6 relative z-10">
                <h1 className="hero-heading">
                    OUR <br/> <span className="text-[#34A853]">FEED.</span>
                </h1>
                <p className="max-w-xl mx-auto mt-8 text-white/50 text-xl font-medium leading-relaxed">
                    A vibrant space for discussions, questions, and announcements within the MLSC SVEC ecosystem.
                </p>
            </div>
        </section>

        <section className="py-24 md:py-32 container mx-auto px-6 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#34A853]/10 border border-[#34A853]/20 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-[#34A853]" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Community Hub.</h2>
                </div>
                <div className="bg-[#0A0A0A] p-2 rounded-2xl border border-white/5">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[200px] bg-transparent border-none text-white font-bold uppercase tracking-widest text-[0.6rem] h-12 focus:ring-0">
                        <SelectValue placeholder="Filter Feed" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10 rounded-2xl">
                        <SelectItem value="all" className="text-xs font-bold uppercase py-3 focus:bg-[#34A853] focus:text-white">All Posts</SelectItem>
                        <SelectItem value="discussion" className="text-xs font-bold uppercase py-3 focus:bg-[#34A853] focus:text-white">Discussions</SelectItem>
                        <SelectItem value="question" className="text-xs font-bold uppercase py-3 focus:bg-[#34A853] focus:text-white">Questions</SelectItem>
                        <SelectItem value="announcement" className="text-xs font-bold uppercase py-3 focus:bg-[#34A853] focus:text-white">Announcements</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>

            {fetchError && (
                <div className="bento-card border-[#EA4335]/20 bg-[#EA4335]/5 p-8 text-center">
                <p className="text-[#EA4335] font-black uppercase tracking-widest text-xs">Sync Error.</p>
                <p className="mt-4 text-white/50">{fetchError}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-32">
                <Loader2 className="h-12 w-12 animate-spin text-[#34A853]" />
                </div>
            ) : posts.length === 0 && !fetchError ? (
                <div className="bento-card p-32 text-center border-white/5">
                <p className="text-white/30 font-black uppercase italic tracking-widest text-xl">No transmissions yet.</p>
                </div>
            ) : (
                <div className="space-y-8">
                {posts.map((post) => (
                    <div key={post.id} className="bento-card border-white/5 hover:border-white/10 transition-all p-10 md:p-12">
                        <PostCard post={post} />
                    </div>
                ))}
                {hasMore && (
                    <div className="flex justify-center pt-16">
                    <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/5 px-12 h-14 font-black uppercase tracking-widest text-xs" onClick={loadMore} disabled={loadingMore}>
                        {loadingMore && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                        Load More
                    </Button>
                    </div>
                )}
                </div>
            )}
        </section>
      </main>
    </div>
  );
}
