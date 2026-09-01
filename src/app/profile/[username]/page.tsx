'use client';

import { use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserByUsername, getUserRegisteredEvents, getUserFollowers, getUserFollowing, followUser, unfollowUser, isFollowingUser } from '@/lib/user-service';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types/user';
import { ROLE_LABELS } from '@/lib/roles';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Loader2, Users, UserPlus, UserMinus, Linkedin, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin" />
          <p className="text-xs text-black font-black uppercase tracking-widest">Loading Member Profile...</p>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-white text-black font-sans p-6 space-y-4">
        <div className="p-4 bg-[#EA4335] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tight text-black">Member Profile Not Found</h2>
        <p className="text-zinc-600 text-xs font-bold max-w-sm">
          The profile username @{username} does not exist or has been modified.
        </p>
        <Button asChild className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 px-6 shadow-[3px_3px_0px_0px_#000000]">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const isSelf = currentUser?.uid === targetUser.uid;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ MLSC SVEC Community Member Profile
      </div>

      {/* Nav Header */}
      <div className="border-b-2 border-black bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button asChild variant="outline" className="border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000000] h-9 w-9 p-0">
            <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFE600] border border-black px-2.5 py-1">
              Role: {ROLE_LABELS[targetUser.role] || targetUser.role}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        
        {/* Profile Card */}
        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar */}
            <div className="h-32 w-32 border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_#000000] bg-[#FFE600] shrink-0">
              {targetUser.photoURL ? (
                <img src={targetUser.photoURL} alt={targetUser.displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-black text-4xl text-black">
                  {targetUser.displayName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* User Meta */}
            <div className="text-center md:text-left flex-1 w-full space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-black">
                    {targetUser.displayName}
                  </h1>
                  <p className="text-zinc-600 text-xs font-bold font-mono mt-0.5">@{targetUser.username || 'username'}</p>
                </div>

                {/* Follow Button */}
                {!isSelf && (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={followActionLoading}
                    className={cn(
                      'border-2 border-black font-black text-xs uppercase tracking-wider h-11 px-6 shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]',
                      isFollowing
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-black'
                        : 'bg-[#FFE600] hover:bg-[#FFE600]/90 text-black'
                    )}
                  >
                    {followActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      <span className="flex items-center gap-1.5"><UserMinus className="h-4 w-4" /> Unfollow</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><UserPlus className="h-4 w-4" /> Follow Member</span>
                    )}
                  </Button>
                )}
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <button onClick={() => openFollowModal('followers')} className="border-2 border-black px-3 py-1 bg-zinc-50 hover:bg-[#FFE600] transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-black text-black text-sm">{targetUser.followersCount || 0}</span> 
                  <span className="text-zinc-600 font-black uppercase tracking-wider text-[10px]">Followers</span>
                </button>
                <button onClick={() => openFollowModal('following')} className="border-2 border-black px-3 py-1 bg-zinc-50 hover:bg-[#FFE600] transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-black text-black text-sm">{targetUser.followingCount || 0}</span> 
                  <span className="text-zinc-600 font-black uppercase tracking-wider text-[10px]">Following</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* About Box */}
          <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] space-y-4">
            <h2 className="text-xl font-black uppercase italic tracking-tight text-black border-b-2 border-black pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-[#4285F4]" /> About Member
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Bio</p>
                <p className="text-sm font-bold text-black leading-relaxed">
                  {targetUser.bio || "No bio added yet."}
                </p>
              </div>

              {(targetUser.branch || targetUser.yearOfStudy) && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t-2 border-black">
                  {targetUser.branch && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Branch</p>
                      <p className="text-xs font-black uppercase text-black">{targetUser.branch}</p>
                    </div>
                  )}
                  {targetUser.yearOfStudy && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Year of Study</p>
                      <p className="text-xs font-black uppercase text-black">{targetUser.yearOfStudy}</p>
                    </div>
                  )}
                </div>
              )}

              {targetUser.linkedin && (
                <div className="pt-3 border-t-2 border-black">
                  <a
                    href={targetUser.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#4285F4] hover:underline"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Registered Events Card */}
          <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] space-y-4">
            <h2 className="text-xl font-black uppercase italic tracking-tight text-black border-b-2 border-black pb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#00A844]" /> Community Participation ({events.length})
            </h2>

            {events.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-black bg-zinc-50">
                <p className="text-zinc-500 font-black uppercase tracking-wider text-xs">No active event registrations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((evt: any) => (
                  <div key={evt.id} className="p-4 border-2 border-black bg-zinc-50 flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]">
                    <div>
                      <p className="font-black text-sm uppercase text-black">{evt.eventTitle}</p>
                      <p className="text-[10px] text-zinc-600 font-bold font-mono mt-0.5">{evt.eventDate}</p>
                    </div>
                    <span className="px-2 py-0.5 border border-black bg-[#00FF66] text-black text-[10px] font-black uppercase">
                      Attendee
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Followers/Following Dialog */}
      <Dialog open={showFollowDialog} onOpenChange={setShowFollowDialog}>
        <DialogContent className="bg-white border-2 border-black text-black p-6 sm:p-8 max-w-md shadow-[8px_8px_0px_0px_#000000]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight text-black flex items-center gap-2">
              <Users className="h-5 w-5 text-[#4285F4]" />
              {followDialogType === 'followers' ? 'Followers' : 'Following'}
            </DialogTitle>
          </DialogHeader>

          {loadingFollowList ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin" />
            </div>
          ) : followList.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-black bg-zinc-50">
              <p className="text-zinc-500 text-xs font-black uppercase">No members in this list yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 divide-y divide-black">
              {followList.map((userObj) => (
                <div key={userObj.uid} className="pt-3 first:pt-0 flex items-center justify-between">
                  <Link
                    href={`/profile/${userObj.username}`}
                    className="flex items-center gap-3 group"
                    onClick={() => setShowFollowDialog(false)}
                  >
                    <div className="h-9 w-9 border-2 border-black bg-[#FFE600] flex items-center justify-center font-black text-xs text-black">
                      {userObj.displayName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-xs text-black group-hover:text-[#4285F4]">{userObj.displayName}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">@{userObj.username}</p>
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
