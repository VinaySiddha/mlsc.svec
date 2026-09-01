'use client';

import { useEffect, useState } from 'react';
import { getCommunityPosts, createCommunityPost } from '@/app/community-actions';
import { getTeamMembers, getEvents } from '@/app/actions';
import { PostCard } from '@/components/community/post-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/community/rich-text-editor';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  MessageSquare,
  HelpCircle,
  Megaphone,
  Image as ImageIcon,
  Video,
  Globe,
  Bookmark,
  Users,
  Calendar,
  TrendingUp,
  LogIn,
  ExternalLink,
  Sparkles,
  Plus,
} from 'lucide-react';
import type { CommunityPost } from '@/types/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface LeadItem {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  linkedinUrl?: string;
}

interface EventBulletin {
  id: string;
  title: string;
  date?: string;
  mode?: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Feed states
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Real sidebar data states
  const [chapterLeads, setChapterLeads] = useState<LeadItem[]>([]);
  const [bulletins, setBulletins] = useState<EventBulletin[]>([]);
  const [loadingSidebar, setLoadingSidebar] = useState(true);

  // Create Post dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPlainText, setPostPlainText] = useState('');
  const [postType, setPostType] = useState<'discussion' | 'question' | 'announcement'>('discussion');
  const [postTags, setPostTags] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Fetch posts from database
  const fetchPosts = async (append = false, lastDate?: string) => {
    if (append) setLoadingMore(true); else setLoading(true);
    setFetchError(null);

    try {
      const type = typeFilter === 'all' ? undefined : (typeFilter as any);
      const result = await getCommunityPosts({
        type,
        lastPostDate: lastDate,
        authorId: undefined,
      });

      if (result.error) {
        setFetchError(result.error);
      }

      if (append) {
        setPosts((prev) => [...prev, ...result.posts]);
      } else {
        setPosts(result.posts);
      }
      setHasMore(result.hasMore);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to sync community transmissions.');
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  };

  // Fetch real team members & real event announcements
  useEffect(() => {
    async function loadSidebarData() {
      try {
        setLoadingSidebar(true);
        const [teamRes, eventRes] = await Promise.all([
          getTeamMembers(),
          getEvents(),
        ]);

        if (teamRes.membersByCategory && Array.isArray(teamRes.membersByCategory)) {
          const allMembers: LeadItem[] = [];
          for (const cat of teamRes.membersByCategory) {
            if (cat.members) {
              for (const m of cat.members) {
                allMembers.push({
                  id: m.id,
                  name: m.name,
                  role: m.role || cat.name,
                  avatarUrl: m.image,
                  linkedinUrl: m.linkedin,
                });
              }
            }
          }
          setChapterLeads(allMembers.slice(0, 5));
        }

        if (eventRes.events && Array.isArray(eventRes.events)) {
          const evts: EventBulletin[] = eventRes.events.slice(0, 4).map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            mode: e.mode || e.location,
          }));
          setBulletins(evts);
        }
      } catch (e) {
        console.error('Error loading sidebar data:', e);
      } finally {
        setLoadingSidebar(false);
      }
    }

    loadSidebarData();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [typeFilter]);

  const loadMore = () => {
    if (posts.length === 0) return;
    const lastPost = posts[posts.length - 1];
    fetchPosts(true, lastPost.createdAt);
  };

  // Callback to handle post deletion in child PostCards dynamically
  const handleDeletePostFromFeed = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  // Create post submit handler
  const handleCreatePost = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Auth Error', description: 'Please sign in to publish a post.' });
      return;
    }
    if (!postTitle.trim()) {
      toast({ variant: 'destructive', title: 'Missing Title', description: 'Please provide a title for your post.' });
      return;
    }
    if (!postPlainText.trim()) {
      toast({ variant: 'destructive', title: 'Missing Content', description: 'Please write some content for your post.' });
      return;
    }

    setSubmittingPost(true);
    try {
      const tags = postTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const result = await createCommunityPost({
        title: postTitle.trim(),
        content: postContent,
        contentPlainText: postPlainText,
        type: postType,
        tags,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
      });

      if (result.success) {
        toast({ title: 'Success', description: 'Your transmission is online.' });
        const newPostObj: CommunityPost = {
          id: result.postId!,
          title: postTitle.trim(),
          content: postContent,
          contentPlainText: postPlainText,
          type: postType,
          tags,
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
          authorPhotoURL: user.photoURL || '',
          likeCount: 0,
          commentCount: 0,
          flagged: false,
          deleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hasLiked: false,
        };

        setPosts((prev) => [newPostObj, ...prev]);

        // Reset inputs
        setPostTitle('');
        setPostContent('');
        setPostPlainText('');
        setPostTags('');
        setIsCreateOpen(false);
      } else {
        toast({ variant: 'destructive', title: 'Publish Error', description: result.error });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Publish Error', description: 'Failed to broadcast post.' });
    } finally {
      setSubmittingPost(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* 3-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Column 1: Left Profile & Links Sidebar (3 Cols) */}
        <aside className="lg:col-span-3 space-y-6">
          {user ? (
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] p-5 space-y-5">
              {/* Profile Card Header */}
              <div className="flex flex-col items-center text-center pb-4 border-b-2 border-black/10">
                <Avatar className="h-16 w-16 border-2 border-black shadow-[3px_3px_0px_0px_#FFE600] mb-3">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                  <AvatarFallback className="bg-[#FFE600] text-black font-black text-xl">
                    {user.displayName?.[0]?.toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-display font-black text-black text-lg uppercase tracking-tight">
                  {user.displayName || 'MLSC Member'}
                </h3>
                <p className="text-xs font-mono text-zinc-500 truncate max-w-full mt-0.5">
                  {user.email || 'student@mlscsvec.com'}
                </p>
                <span className="mt-2 text-[10px] font-black uppercase tracking-wider bg-[#00FF66] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000000]">
                  ACTIVE INNOVATOR
                </span>
              </div>

              {/* Quick Hub Navigation Links */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  FAST ACCESS
                </span>
                <Link
                  href="/profile/me"
                  className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <Bookmark className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>MY PROFILE</span>
                </Link>
                <Link
                  href="/events"
                  className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <Calendar className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>CHAPTER EVENTS</span>
                </Link>
                <Link
                  href="/projects"
                  className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>PROJECT SHOWCASE</span>
                </Link>
                <Link
                  href="/team"
                  className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <Users className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>MEET THE TEAM</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000000] text-center space-y-4">
              <div className="h-12 w-12 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center mx-auto text-black">
                <LogIn className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-black text-lg uppercase tracking-tight">JOIN THE FORUM</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Sign in to publish posts, reply to threads, and engage with student developers.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="block w-full py-2.5 bg-[#4285F4] text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                SIGN IN / REGISTER
              </Link>
            </div>
          )}
          
          <div className="hidden lg:block text-[10px] font-mono text-zinc-500 text-center px-2 space-y-1">
            <p>MLSC SVEC CHAPTER 4.0</p>
            <p>OPEN DISCUSSIONS • CAMPUS WIDE</p>
          </div>
        </aside>

        {/* Column 2: Center Interactive Feed (6 Cols) */}
        <main className="lg:col-span-6 space-y-6">
          
          {/* Start a Post Card */}
          {user && (
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] p-4 md:p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                  <AvatarFallback className="bg-[#FFE600] text-black font-black text-sm">
                    {user.displayName?.[0]?.toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="flex-1 text-left px-4 h-11 border-2 border-black bg-[#F9F9FB] hover:bg-zinc-100 transition-all text-xs md:text-sm text-zinc-500 font-bold flex items-center justify-between cursor-pointer"
                >
                  <span>Share thoughts, questions, or ideas...</span>
                  <Plus className="h-4 w-4 stroke-[3] text-black" />
                </button>
              </div>

              {/* Feed media shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPostType('discussion');
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                >
                  <ImageIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Discussion</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostType('question');
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-amber-50 text-amber-700 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Question</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostType('announcement');
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-pink-50 text-pink-700 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                >
                  <Megaphone className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Bulletin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center justify-center gap-1.5 p-2 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Post +</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Neo-Brutalist Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-[#F9F9FB] p-2 border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`flex items-center gap-1.5 px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-white text-black hover:bg-zinc-100'
              }`}
            >
              <Globe className="h-3.5 w-3.5 stroke-[2.5]" />
              All
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('discussion')}
              className={`flex items-center gap-1.5 px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                typeFilter === 'discussion'
                  ? 'bg-[#00FF66] text-black shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-white text-black hover:bg-zinc-100'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 stroke-[2.5]" />
              Discussions
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('question')}
              className={`flex items-center gap-1.5 px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                typeFilter === 'question'
                  ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-white text-black hover:bg-zinc-100'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5 stroke-[2.5]" />
              Questions
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('announcement')}
              className={`flex items-center gap-1.5 px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                typeFilter === 'announcement'
                  ? 'bg-[#FF0055] text-white shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-white text-black hover:bg-zinc-100'
              }`}
            >
              <Megaphone className="h-3.5 w-3.5 stroke-[2.5]" />
              Bulletins
            </button>
          </div>

          {/* Sync Errors */}
          {fetchError && (
            <div className="bg-red-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#FF0055] text-center space-y-1">
              <p className="text-[#FF0055] font-black text-sm uppercase">Synchronization Error</p>
              <p className="text-xs text-black font-medium">{fetchError}</p>
            </div>
          )}

          {/* Posts Feed list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-black" />
            </div>
          ) : posts.length === 0 && !fetchError ? (
            <div className="bg-white border-2 border-dashed border-black p-16 text-center space-y-3">
              <Globe className="h-10 w-10 text-zinc-400 mx-auto" />
              <p className="text-black font-black uppercase tracking-widest text-sm">
                NO TRANSMISSIONS RECORDED IN THIS CATEGORY.
              </p>
              <p className="text-xs text-zinc-500">Be the first innovator to broadcast a topic!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={handleDeletePostFromFeed} />
              ))}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                    LOAD OLDER BROADCASTS
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Column 3: Right Sidebar Bulletins & Chapter Leads (3 Cols) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Widget 1: Real Chapter Bulletins & Events */}
          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="font-display font-black text-black uppercase tracking-tight flex items-center gap-2 text-sm md:text-base">
                <span className="p-1 bg-[#FFE600] border border-black">
                  <TrendingUp className="h-3.5 w-3.5 stroke-[3]" />
                </span>
                Chapter Bulletins
              </h3>
              <Link href="/events" className="text-[10px] font-black uppercase text-[#4285F4] hover:underline">
                ALL ↗
              </Link>
            </div>
            
            {loadingSidebar ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-black" />
              </div>
            ) : bulletins.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 text-center py-4">No active bulletins right now.</p>
            ) : (
              <div className="space-y-3">
                {bulletins.map((bulletin) => (
                  <Link
                    key={bulletin.id}
                    href={`/events/${bulletin.id}`}
                    className="block group p-2.5 bg-[#F9F9FB] hover:bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                  >
                    <h4 className="font-black text-black text-xs leading-snug line-clamp-2">
                      {bulletin.title}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-600 mt-1 flex items-center justify-between">
                      <span>{bulletin.date || 'Upcoming'}</span>
                      <span className="uppercase font-bold">{bulletin.mode || 'CAMPUS'}</span>
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Widget 2: Real Chapter Leads & Core Team */}
          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="font-display font-black text-black uppercase tracking-tight flex items-center gap-2 text-sm md:text-base">
                <span className="p-1 bg-[#00FF66] border border-black">
                  <Users className="h-3.5 w-3.5 stroke-[3]" />
                </span>
                Chapter Leads
              </h3>
              <Link href="/team" className="text-[10px] font-black uppercase text-[#4285F4] hover:underline">
                TEAM ↗
              </Link>
            </div>

            {loadingSidebar ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-black" />
              </div>
            ) : chapterLeads.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 text-center py-4">No lead records found.</p>
            ) : (
              <div className="space-y-3">
                {chapterLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between gap-3 p-2 bg-[#F9F9FB] border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8 w-8 border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                        <AvatarImage src={lead.avatarUrl} alt={lead.name} />
                        <AvatarFallback className="bg-[#4285F4] text-white text-xs font-black">
                          {lead.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-black text-black text-xs truncate">{lead.name}</h4>
                        <p className="text-[10px] font-mono text-zinc-500 truncate">{lead.role}</p>
                      </div>
                    </div>
                    
                    {lead.linkedinUrl ? (
                      <a
                        href={lead.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white hover:bg-[#FFE600] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                        title="LinkedIn Profile"
                      >
                        <ExternalLink className="h-3 w-3 stroke-[2.5]" />
                      </a>
                    ) : (
                      <Link
                        href="/team"
                        className="p-1.5 bg-white hover:bg-[#FFE600] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000] transition-all"
                        title="View Team"
                      >
                        <ExternalLink className="h-3 w-3 stroke-[2.5]" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </aside>
      </div>

      {/* Start a Post Dialog Form (Modal) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-white text-black border-4 border-black shadow-[12px_12px_0px_0px_#000000] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b-2 border-black bg-[#FFE600]">
            <DialogTitle className="text-lg md:text-xl font-display font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 stroke-[3]" />
              Broadcast to Community
            </DialogTitle>
          </DialogHeader>

          {/* User Details Row */}
          {user && (
            <div className="px-6 py-3 flex items-center justify-between gap-3 bg-[#F9F9FB] border-b-2 border-black">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                  <AvatarFallback className="bg-[#4285F4] text-white font-black text-xs">
                    {user.displayName?.[0]?.toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-black text-black text-xs block">
                    {user.displayName || 'MLSC Innovator'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    AUTHORED POST
                  </span>
                </div>
              </div>

              {/* Type Selection */}
              <div className="flex items-center gap-2">
                <Select value={postType} onValueChange={(v: any) => setPostType(v)}>
                  <SelectTrigger className="h-8 text-xs font-black uppercase bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000]">
                    <SelectValue placeholder="Post Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] text-black">
                    <SelectItem value="discussion" className="text-xs font-bold uppercase cursor-pointer">Discussion</SelectItem>
                    <SelectItem value="question" className="text-xs font-bold uppercase cursor-pointer">Question</SelectItem>
                    <SelectItem value="announcement" className="text-xs font-bold uppercase cursor-pointer">Bulletin / Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto pr-4 font-sans">
            <div className="space-y-2">
              <Label htmlFor="post-title" className="text-xs font-black uppercase text-black tracking-wider">
                Post Title *
              </Label>
              <input
                id="post-title"
                placeholder="What is your discussion, question, or announcement about?"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full h-11 px-3 text-sm md:text-base font-bold text-black bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] placeholder:text-zinc-400 font-sans shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-tags" className="text-xs font-black uppercase text-black tracking-wider">
                Tags (comma-separated)
              </Label>
              <input
                id="post-tags"
                placeholder="e.g. hackathon, react, ai, web3"
                value={postTags}
                onChange={(e) => setPostTags(e.target.value)}
                className="w-full h-10 px-3 text-xs md:text-sm font-bold text-black bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] placeholder:text-zinc-400 font-sans shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-black tracking-wider">
                Content *
              </Label>
              <RichTextEditor
                content={postContent}
                onChange={(html, text) => {
                  setPostContent(html);
                  setPostPlainText(text);
                }}
                placeholder="Share details, ask questions, or provide updates here..."
              />
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="px-6 py-4 border-t-2 border-black bg-[#F9F9FB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-white text-black border-2 border-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreatePost}
              disabled={submittingPost || !postTitle.trim() || !postPlainText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-wider bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 transition-all cursor-pointer"
            >
              {submittingPost && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish Broadcast
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

