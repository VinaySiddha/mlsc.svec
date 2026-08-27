'use client';

import { use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserByUsername, getUserRegisteredEvents, getUserFollowers, getUserFollowing, followUser, unfollowUser, isFollowingUser } from '@/lib/user-service';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types/user';
import { ROLE_LABELS } from '@/lib/roles';

import { MLSCLogo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Loader2, MessageSquare, Users, UserPlus, UserMinus, Linkedin } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export default function PublicProfilePage({ params }: Props) {
  const { username } = use(params);
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followActionLoading, setFollowActionLoading] = useState(false);

  // Dialog lists state
  const [showFollowDialog, setShowFollowDialog] = useState(false);
  const [followDialogType, setFollowDialogType] = useState<'followers' | 'following'>('followers');
  const [followList, setFollowList] = useState<any[]>([]);
  const [loadingFollowList, setLoadingFollowList] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingData(true);
      const userProfile = await getUserByUsername(username);
      
      if (!userProfile) {
        setTargetUser(null);
        setLoadingData(false);
        return;
      }

      setTargetUser(userProfile);

      const [{ events: evts }, followStatus] = await Promise.all([
        getUserRegisteredEvents(userProfile.uid),
        currentUser ? isFollowingUser(currentUser.uid, userProfile.uid) : Promise.resolve(false),
      ]);

      setEvents(evts);
      setIsFollowing(followStatus);
      setLoadingData(false);
    })();
  }, [username, currentUser]);

  const openFollowModal = async (type: 'followers' | 'following') => {
    if (!targetUser) return;
    setFollowDialogType(type);
    setShowFollowDialog(true);
    setLoadingFollowList(true);
    const list = type === 'followers'
      ? await getUserFollowers(targetUser.uid)
      : await getUserFollowing(targetUser.uid);
    setFollowList(list);
    setLoadingFollowList(false);
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast({ title: 'Authentication Required', description: 'Please sign in to follow users.', variant: 'destructive' });
      router.push(`/auth/login?redirect=/profile/${username}`);
      return;
    }
    if (!targetUser) return;
    
    setFollowActionLoading(true);
    try {
      if (isFollowing) {
        const res = await unfollowUser(currentUser.uid, targetUser.uid);
        if (res.success) {
          setIsFollowing(false);
          setTargetUser(prev => prev ? { ...prev, followersCount: Math.max(0, (prev.followersCount || 1) - 1) } : null);
          toast({ title: 'Unfollowed', description: `You unfollowed ${targetUser.displayName}.` });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: res.error });
        }
      } else {
        const res = await followUser(currentUser.uid, targetUser.uid);
        if (res.success) {
          setIsFollowing(true);
          setTargetUser(prev => prev ? { ...prev, followersCount: (prev.followersCount || 0) + 1 } : null);
          toast({ title: 'Following', description: `You are now following ${targetUser.displayName}.` });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: res.error });
        }
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Action failed.' });
    } finally {
      setFollowActionLoading(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#4285F4]" />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-black text-white font-sans p-6">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#EA4335]">User Not Found.</h2>
        <p className="text-white/50 mt-4">The profile @{username} does not exist.</p>
        <Button asChild className="mt-8 rounded-xl font-bold bg-white text-black hover:bg-white/90">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const isSelf = currentUser?.uid === targetUser.uid;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <header className="glass-nav h-20">
        <div className="container mx-auto flex h-full items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
              <Link href="/"><ArrowLeft className="h-6 w-6" /></Link>
            </Button>
            <div className="flex items-center gap-3">
              <MLSCLogo className="h-9 w-9 text-white" />
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">Profile.</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 md:p-12 lg:p-20 container mx-auto max-w-5xl space-y-12">
        {/* Profile Card */}
        <div className="bento-card !p-10 border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative shrink-0">
              <Avatar className="h-32 w-32 rounded-[2.5rem] ring-4 ring-white/5 border-2 border-white/10">
                <AvatarImage src={targetUser.photoURL} alt={targetUser.displayName} className="object-cover" />
                <AvatarFallback className="text-4xl font-black bg-[#4285F4]">{targetUser.displayName?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center md:text-left flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <CardTitle className="text-4xl font-black tracking-tighter uppercase mb-1">{targetUser.displayName}</CardTitle>
                  <CardDescription className="text-white/40 text-sm font-medium mb-3">@{targetUser.username || 'username'}</CardDescription>
                  
                  {/* Followers / Following Counts */}
                  <div className="flex gap-6 mb-5 justify-center md:justify-start">
                    <button onClick={() => openFollowModal('followers')} className="hover:text-[#4285F4] transition-colors flex items-center gap-1">
                      <span className="font-black text-white text-lg">{targetUser.followersCount || 0}</span> 
                      <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Followers</span>
                    </button>
                    <button onClick={() => openFollowModal('following')} className="hover:text-[#4285F4] transition-colors flex items-center gap-1">
                      <span className="font-black text-white text-lg">{targetUser.followingCount || 0}</span> 
                      <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Following</span>
                    </button>
                  </div>

                  <Badge className="bg-[#4285F4] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-none">
                    {ROLE_LABELS[targetUser.role] || targetUser.role}
                  </Badge>
                </div>

                {/* Follow Button */}
                {!isSelf && (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={followActionLoading}
                    className={`rounded-xl px-6 h-12 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      isFollowing
                        ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                        : 'bg-[#4285F4] text-white hover:bg-[#4285F4]/90'
                    }`}
                  >
                    {followActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      <span className="flex items-center gap-2"><UserMinus className="h-4 w-4" /> Unfollow</span>
                    ) : (
                      <span className="flex items-center gap-2"><UserPlus className="h-4 w-4" /> Follow</span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Details Card */}
          <div className="bento-card border-white/5 space-y-6 h-fit">
            <h3 className="text-2xl font-black tracking-tighter uppercase italic">About.</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Bio</p>
                <p className="text-white/80 text-sm leading-relaxed font-medium">
                  {targetUser.bio || "No bio added yet."}
                </p>
              </div>

              {(targetUser.branch || targetUser.yearOfStudy) && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {targetUser.branch && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Branch</p>
                      <p className="text-white text-sm font-bold">{targetUser.branch}</p>
                    </div>
                  )}
                  {targetUser.yearOfStudy && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Year of Study</p>
                      <p className="text-white text-sm font-bold">{targetUser.yearOfStudy}</p>
                    </div>
                  )}
                </div>
              )}

              {targetUser.linkedin && (
                <div className="pt-4 border-t border-white/5">
                  <a
                    href={targetUser.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-[#4285F4] transition-colors text-xs font-bold uppercase tracking-wider"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Registered Events Card */}
          <div className="bento-card border-white/5">
            <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-8">Registered Events.</h3>
            {events.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/30 font-bold uppercase tracking-widest text-xs">No active registrations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((evt: any) => (
                  <div key={evt.id} className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div>
                      <p className="font-bold tracking-tight">{evt.eventTitle}</p>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">{evt.eventDate}</p>
                    </div>
                    <Badge variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest">Active</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Followers/Following List Dialog */}
      <Dialog open={showFollowDialog} onOpenChange={setShowFollowDialog}>
        <DialogContent className="bg-[#0e0e0e] border border-white/10 text-white rounded-3xl p-8 max-w-md">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Users className="h-6 w-6 text-[#4285F4]" />
              {followDialogType === 'followers' ? 'Followers' : 'Following'}
            </DialogTitle>
          </DialogHeader>

          {loadingFollowList ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#4285F4]" />
            </div>
          ) : followList.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-white/40 text-sm font-semibold uppercase tracking-wider">No users found.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto [scrollbar-width:none]">
              {followList.map((userObj) => (
                <div key={userObj.uid} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                  <Link
                    href={`/profile/${userObj.username}`}
                    className="flex items-center gap-4 group"
                    onClick={() => setShowFollowDialog(false)}
                  >
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={userObj.photoURL} alt={userObj.displayName} />
                      <AvatarFallback className="font-bold bg-[#4285F4]">{userObj.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm leading-none group-hover:underline">{userObj.displayName}</p>
                      <p className="text-[10px] text-white/40 mt-1">@{userObj.username}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
