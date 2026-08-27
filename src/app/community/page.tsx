'use client';

import { useEffect, useState } from 'react';
import { getCommunityPosts, createCommunityPost } from '@/app/community-actions';
import { PostCard } from '@/components/community/post-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  Image,
  Video,
  UserPlus,
  Check,
  Globe,
  Bookmark,
  Users,
  Calendar,
  Info,
  TrendingUp,
  LogIn,
} from 'lucide-react';
import type { CommunityPost } from '@/types/community';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

// Mock Leads list for the right sidebar
const CHAPTER_LEADS = [
  {
    id: 'lead-1',
    name: 'Vinay Siddha',
    role: 'Tech Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    id: 'lead-2',
    name: 'Teja Varma',
    role: 'President',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    id: 'lead-3',
    name: 'Neha Roy',
    role: 'Design Lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  },
];

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Feed states
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Create Post dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPlainText, setPostPlainText] = useState('');
  const [postType, setPostType] = useState<'discussion' | 'question' | 'announcement'>('discussion');
  const [postTags, setPostTags] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Interactive Sidebar states
  const [connectingLeads, setConnectingLeads] = useState<Record<string, boolean>>({});
  const [connectedLeads, setConnectedLeads] = useState<Record<string, boolean>>({});

  // Fetch posts from database
  const fetchPosts = async (append = false, lastDate?: string) => {
    if (append) setLoadingMore(true); else setLoading(true);
    setFetchError(null);

    try {
      const type = typeFilter === 'all' ? undefined : typeFilter as any;
      const result = await getCommunityPosts({
        type,
        lastPostDate: lastDate,
        authorId: undefined,
      });

      if (result.error) {
        setFetchError(result.error);
      }

      // If user is logged in, map hasLiked state based on database subcollections
      // However, the query itself returns posts. Let's append
      if (append) {
        setPosts((prev) => [...prev, ...result.posts]);
      } else {
        setPosts(result.posts);
      }
      setHasMore(result.hasMore);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to sync transmissions.');
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  };

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
        // Local prepend to update list instantly
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
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Publish Error', description: 'Failed to broadcast post.' });
    } finally {
      setSubmittingPost(false);
    }
  };

  // Mock lead connection action
  const handleConnectLead = (leadId: string, leadName: string) => {
    if (connectedLeads[leadId]) return;
    setConnectingLeads((prev) => ({ ...prev, [leadId]: true }));

    setTimeout(() => {
      setConnectingLeads((prev) => ({ ...prev, [leadId]: false }));
      setConnectedLeads((prev) => ({ ...prev, [leadId]: true }));
      toast({
        title: 'Connection Requested',
        description: `You are now connected with ${leadName}!`,
      });
    }, 1000);
  };

  // Click handler for mock sidebar items
  const handleFeatureNotice = (featureName: string) => {
    toast({
      title: 'MLSC Feature',
      description: `The ${featureName} page is customized for MLSC ecosystem members.`,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans py-4 md:py-8">
      {/* 3-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Left Profile & Links Sidebar (3 Cols) */}
        <aside className="lg:col-span-3 space-y-6">
          {user ? (
            <div className="glass-card overflow-hidden bg-zinc-950/40 border-white/5 rounded-2xl shadow-xl flex flex-col">
              {/* Cover image gradient */}
              <div className="h-16 w-full bg-gradient-to-r from-primary/30 via-zinc-950 to-primary/10 relative" />
              
              {/* Profile body */}
              <div className="px-4 pb-4 flex flex-col items-center -mt-8 text-center border-b border-white/5">
                <Avatar className="h-16 w-16 border-2 border-black ring-2 ring-primary/45">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {user.displayName?.[0]?.toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-bold text-white mt-3 hover:underline cursor-pointer">
                  {user.displayName || 'MLSC Innovator'}
                </h3>
                <p className="text-xs text-white/50 truncate max-w-full mt-1">
                  {user.email || 'member@mlscsvec.com'}
                </p>
              </div>

              {/* Stats Box */}
              <div className="p-4 border-b border-white/5 text-xs text-white/60 space-y-3 bg-zinc-950/20">
                <div 
                  onClick={() => handleFeatureNotice('Profile Visitors')}
                  className="flex items-center justify-between hover:bg-white/5 p-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  <span className="text-white/40">Profile viewers</span>
                  <span className="font-bold text-primary tabular-nums">142</span>
                </div>
                <div 
                  onClick={() => handleFeatureNotice('Post Impressions')}
                  className="flex items-center justify-between hover:bg-white/5 p-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  <span className="text-white/40">Post impressions</span>
                  <span className="font-bold text-primary tabular-nums">1,840</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="p-2 space-y-1 text-xs text-white/70">
                <button
                  onClick={() => handleFeatureNotice('My Bookmarks')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Bookmark className="h-4 w-4 text-primary" />
                  <span className="font-medium text-left">My items</span>
                </button>
                <button
                  onClick={() => handleFeatureNotice('Community Groups')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium text-left">Groups</span>
                </button>
                <button
                  onClick={() => handleFeatureNotice('SVEC Events')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium text-left">Events</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card bg-zinc-950/40 border-white/5 p-6 rounded-2xl shadow-xl text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20">
                <LogIn className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white">Join the Community</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Sign in to unlock interactive feed features including posting, liking, and leaving comments.
                </p>
              </div>
              <Button asChild className="w-full rounded-xl bg-primary text-black font-bold hover:bg-primary/80 transition-all">
                <Link href="/auth/login">Log In / Sign Up</Link>
              </Button>
            </div>
          )}
          
          <div className="hidden lg:block text-[10px] text-white/30 text-center px-4 leading-relaxed">
            <p className="hover:underline cursor-pointer">About • Accessibility • Help Center</p>
            <p className="hover:underline cursor-pointer mt-1">Privacy & Terms • Advertising</p>
            <p className="mt-3">MLSC SVEC Corporation © 2026</p>
          </div>
        </aside>

        {/* Column 2: Center Interactive Feed (6 Cols) */}
        <main className="lg:col-span-6 space-y-6">
          
          {/* Start a Post Card */}
          {user && (
            <div className="glass-card bg-zinc-950/40 border-white/5 p-4 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-white/10">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {user.displayName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex-1 text-left px-4 h-10 rounded-full border border-white/10 hover:border-white/20 bg-zinc-900/50 hover:bg-zinc-900 transition-all text-xs md:text-sm text-white/40 font-medium"
                >
                  Start a post, share what's on your mind...
                </button>
              </div>

              {/* Feed media shortcuts */}
              <div className="flex items-center justify-between pt-1 text-xs md:text-sm text-white/60">
                <button
                  onClick={() => {
                    setPostType('discussion');
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <Image className="h-4 w-4" />
                  <span>Photo</span>
                </button>
                <button
                  onClick={() => {
                    setPostType('discussion');
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-purple-400 hover:text-purple-300 font-semibold"
                >
                  <Video className="h-4 w-4" />
                  <span>Video</span>
                </button>
                <button
                  onClick={() => {
                    setPostType('question');
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Question</span>
                </button>
                <button
                  onClick={() => {
                    setPostType('announcement');
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-pink-400 hover:text-pink-300 font-semibold"
                >
                  <Megaphone className="h-4 w-4" />
                  <span>Announcement</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Chips Filters */}
          <div className="flex flex-wrap items-center gap-2 bg-zinc-950/20 p-1.5 border border-white/5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                typeFilter === 'all'
                  ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              All
            </button>
            <button
              onClick={() => setTypeFilter('discussion')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                typeFilter === 'discussion'
                  ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Discussions
            </button>
            <button
              onClick={() => setTypeFilter('question')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                typeFilter === 'question'
                  ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Questions
            </button>
            <button
              onClick={() => setTypeFilter('announcement')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                typeFilter === 'announcement'
                  ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Megaphone className="h-3.5 w-3.5" />
              Bulletins
            </button>
          </div>

          {/* Sync Errors */}
          {fetchError && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center space-y-1">
              <p className="text-red-400 font-bold text-sm">Synchronization Error</p>
              <p className="text-xs text-white/55">{fetchError}</p>
            </div>
          )}

          {/* Posts Feed list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 && !fetchError ? (
            <div className="glass-card bg-zinc-950/20 border-dashed border-white/10 p-20 text-center rounded-2xl shadow-inner">
              <Globe className="h-10 w-10 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm">
                No transmissions found in this frequency.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <ScrollReveal key={post.id} direction="up" delay={0.05} duration={0.4}>
                  <PostCard post={post} onDelete={handleDeletePostFromFeed} />
                </ScrollReveal>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 hover:bg-white/5 px-10 h-12 font-bold uppercase tracking-wider text-xs"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Load Older Broadcasts
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Column 3: Right Sidebar Bulletins & Chapter Leads (3 Cols) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Widget 1: MLSC Bulletin */}
          <div className="glass-card bg-zinc-950/40 border-white/5 p-4 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                MLSC Bulletin
              </h3>
              <span title="Latest campus announcements">
                <Info className="h-3.5 w-3.5 text-white/30 cursor-help" />
              </span>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                <h4 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                  AI HackFest 2026 Registration Open!
                </h4>
                <p className="text-[10px] text-white/40 mt-1">2d ago • 140 readers</p>
              </div>
              <div className="group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                <h4 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                  Web Development Bootcamp Cohort 2 Start
                </h4>
                <p className="text-[10px] text-white/40 mt-1">4d ago • 290 readers</p>
              </div>
              <div className="group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                <h4 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                  Hiring: Admin Panel Panelist Positions
                </h4>
                <p className="text-[10px] text-white/40 mt-1">1w ago • 125 readers</p>
              </div>
              <div className="group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                <h4 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                  Gemini API Core Integration Tutorial
                </h4>
                <p className="text-[10px] text-white/40 mt-1">3d ago • 98 readers</p>
              </div>
            </div>
          </div>

          {/* Widget 2: Connect with Leads */}
          <div className="glass-card bg-zinc-950/40 border-white/5 p-4 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-bold text-white border-b border-white/5 pb-2 text-sm md:text-base">
              Connect with Leads
            </h3>
            <div className="space-y-3">
              {CHAPTER_LEADS.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={lead.avatar} alt={lead.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {lead.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white truncate">{lead.name}</h4>
                      <p className="text-[10px] text-white/40 truncate">{lead.role}</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={connectedLeads[lead.id] ? 'glass' : 'outline'}
                    disabled={connectingLeads[lead.id]}
                    onClick={() => handleConnectLead(lead.id, lead.name)}
                    className={`rounded-full h-7 text-[10px] font-bold px-3 transition-all duration-300 ${
                      connectedLeads[lead.id]
                        ? 'border-primary/20 text-primary'
                        : 'border-white/10 text-white hover:bg-white/5'
                    }`}
                  >
                    {connectingLeads[lead.id] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : connectedLeads[lead.id] ? (
                      <span className="flex items-center gap-1 text-primary">
                        <Check className="h-3 w-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <UserPlus className="h-3 w-3" />
                        Connect
                      </span>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
        </aside>
      </div>

      {/* Start a Post Dialog Form (Modal) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl text-white shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-white/5">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Broadcast to Community
            </DialogTitle>
          </DialogHeader>

          {/* User Details Row */}
          {user && (
            <div className="px-6 py-3 flex items-center gap-3 bg-zinc-900/10">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user.displayName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-bold text-white text-sm block">
                  {user.displayName}
                </span>
                
                {/* Type Selection */}
                <div className="flex items-center gap-2 mt-1">
                  <Select value={postType} onValueChange={(v: any) => setPostType(v)}>
                    <SelectTrigger className="h-6 text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border-white/10 rounded-full px-3 text-white/70">
                      <SelectValue placeholder="Post Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl text-white">
                      <SelectItem value="discussion" className="text-xs focus:bg-primary focus:text-black">Discussion</SelectItem>
                      <SelectItem value="question" className="text-xs focus:bg-primary focus:text-black">Question</SelectItem>
                      <SelectItem value="announcement" className="text-xs focus:bg-primary focus:text-black">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-2">
              <Label htmlFor="post-title" className="text-xs font-bold uppercase text-white/55 tracking-wider">
                Title
              </Label>
              <Input
                id="post-title"
                placeholder="What is your discussion, question, or announcement about?"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="bg-zinc-900 border-white/5 focus-visible:border-primary/20 text-white placeholder:text-white/20 h-11 rounded-xl text-base font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-tags" className="text-xs font-bold uppercase text-white/55 tracking-wider">
                Tags (comma-separated)
              </Label>
              <Input
                id="post-tags"
                placeholder="e.g. hackathon, react, query"
                value={postTags}
                onChange={(e) => setPostTags(e.target.value)}
                className="bg-zinc-900 border-white/5 focus-visible:border-primary/20 text-white placeholder:text-white/20 h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-white/55 tracking-wider">
                Content
              </Label>
              {/* RichTextEditor */}
              <div className="rounded-xl border border-white/5 overflow-hidden">
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
          </div>

          {/* Action buttons footer */}
          <div className="px-6 py-4 border-t border-white/5 bg-zinc-950 flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-full text-white/60 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={submittingPost || !postTitle.trim() || !postPlainText.trim()}
              className="rounded-full bg-primary text-black font-bold hover:bg-primary/90 px-6"
            >
              {submittingPost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Broadcast
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
