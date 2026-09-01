'use client';

import { useAuth } from '@/lib/auth-context';
import { getUserProfile, updateUserProfile, getUserRegisteredEvents, getUserFollowers, getUserFollowing, changeUsername } from '@/lib/user-service';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import type { UserProfile } from '@/types/user';
import { ROLE_LABELS } from '@/lib/roles';

import { MLSCLogo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, Upload, Users, Coins, ExternalLink, Copy, CheckCircle2, User, Calendar, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.').max(15, 'Username must be under 15 characters.').regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores are allowed.'),
  bio: z.string().max(300, 'Bio must be under 300 characters.').optional(),
  rollNo: z.string().optional(),
  branch: z.string().optional(),
  yearOfStudy: z.string().optional(),
  linkedin: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function UserProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Dialog lists state
  const [showFollowDialog, setShowFollowDialog] = useState(false);
  const [followDialogType, setFollowDialogType] = useState<'followers' | 'following'>('followers');
  const [followList, setFollowList] = useState<any[]>([]);
  const [loadingFollowList, setLoadingFollowList] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: '', username: '', bio: '', rollNo: '', branch: '', yearOfStudy: '', linkedin: '' },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      (async () => {
        const [p, { events: evts }] = await Promise.all([
          getUserProfile(user.uid),
          getUserRegisteredEvents(user.uid),
        ]);
        if (p) {
          setProfile(p);
          setEmailNotifications(p.emailNotifications);
          form.reset({
            displayName: p.displayName || '',
            username: p.username || '',
            bio: p.bio || '',
            rollNo: p.rollNo || '',
            branch: p.branch || '',
            yearOfStudy: p.yearOfStudy || '',
            linkedin: p.linkedin || '',
          });
        }
        setEvents(evts);
        setLoadingProfile(false);
      })();
    }
  }, [user, authLoading, router, form]);

  const openFollowModal = async (type: 'followers' | 'following') => {
    if (!user) return;
    setFollowDialogType(type);
    setShowFollowDialog(true);
    setLoadingFollowList(true);
    const list = type === 'followers'
      ? await getUserFollowers(user.uid)
      : await getUserFollowing(user.uid);
    setFollowList(list);
    setLoadingFollowList(false);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !profile) return;
    setIsSubmitting(true);

    try {
      if (values.username !== profile.username) {
        const userResult = await changeUsername(user.uid, values.username);
        if (!userResult.success) {
          toast({ variant: 'destructive', title: 'Username Error', description: userResult.error });
          setIsSubmitting(false);
          return;
        }
      }

      const result = await updateUserProfile(user.uid, values);
      if (result.success) {
        setProfile(prev => prev ? { ...prev, ...values } : prev);
        toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        'Failed to update user profile details',
        err,
        'UserProfileMePage',
        user.email || 'unknown'
      );
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Something went wrong.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingImage(true);
    try {
      const storageRef = ref(storage, `user-profiles/${user.uid}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      await updateUserProfile(user.uid, { photoURL: url });
      setProfile(prev => prev ? { ...prev, photoURL: url } : prev);
      toast({ title: 'Photo Updated', description: 'Your profile photo has been changed.' });
    } catch (err: any) {
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        'Failed to upload profile picture to storage',
        err,
        'UserProfileMePage',
        user.email || 'unknown'
      );
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload image.' });
    }
    setIsUploadingImage(false);
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (!user) return;
    setEmailNotifications(checked);
    await updateUserProfile(user.uid, { emailNotifications: checked });
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin" />
          <p className="text-xs text-black font-black uppercase tracking-widest">Loading Member Profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 Member Profile & Account Dossier
      </div>

      {/* Nav Header */}
      <div className="border-b-2 border-black bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000000] h-9 w-9 p-0">
              <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm uppercase italic tracking-tight">MLSC Member Profile</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFE600] border border-black px-2.5 py-1">
              Role: {ROLE_LABELS[profile.role] || profile.role}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        
        {/* Profile Identity Card */}
        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar Container */}
            <div className="relative group shrink-0">
              <div className="h-32 w-32 border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_#000000] bg-[#FFE600]">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-black text-4xl text-black">
                    {profile.displayName?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-4 border-black">
                {isUploadingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 mb-1" />
                    <span className="text-[9px] font-black uppercase">Change Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
              </label>
            </div>

            {/* User Meta Info */}
            <div className="text-center md:text-left flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-black">
                  {profile.displayName}
                </h1>
                <p className="text-zinc-600 text-xs font-bold font-mono mt-0.5">@{profile.username || 'username'} · {profile.email}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Button asChild className="bg-white hover:bg-zinc-100 text-black border-2 border-black text-xs font-black uppercase tracking-wider h-9 px-4 shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]">
                  <Link href={`/profile/${profile.username}`} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View Public Profile
                  </Link>
                </Button>
                <Button 
                  onClick={() => {
                    const profileUrl = `${window.location.origin}/profile/${profile.username}`;
                    navigator.clipboard.writeText(profileUrl);
                    toast({ title: "Link Copied", description: "Public profile link copied to clipboard." });
                  }}
                  className="bg-white hover:bg-zinc-100 text-black border-2 border-black text-xs font-black uppercase tracking-wider h-9 px-4 shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Link
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <button onClick={() => openFollowModal('followers')} className="border-2 border-black px-3 py-1 bg-zinc-50 hover:bg-[#FFE600] transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-black text-black text-sm">{profile.followersCount || 0}</span> 
                  <span className="text-zinc-600 font-black uppercase tracking-wider text-[10px]">Followers</span>
                </button>
                <button onClick={() => openFollowModal('following')} className="border-2 border-black px-3 py-1 bg-zinc-50 hover:bg-[#FFE600] transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-black text-black text-sm">{profile.followingCount || 0}</span> 
                  <span className="text-zinc-600 font-black uppercase tracking-wider text-[10px]">Following</span>
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#FFE600] text-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000]">
                  <Coins className="h-3.5 w-3.5 text-black shrink-0" /> {profile.coins || 0} MLSC Coins
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Two-Column Grid: Form + Events/Community */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Edit Profile Details */}
          <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] space-y-6">
            <h2 className="text-xl font-black uppercase italic tracking-tight text-black border-b-2 border-black pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-[#4285F4]" /> Edit Profile Data
            </h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <FormField control={form.control} name="displayName" render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black block">Display Name</label>
                    <input
                      {...field}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white border-2 border-black px-3 h-10 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    />
                    {fieldState.error && <p className="text-xs text-[#EA4335] font-bold">{fieldState.error.message}</p>}
                  </div>
                )} />

                <FormField control={form.control} name="username" render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black block">Username</label>
                    <input
                      {...field}
                      placeholder="e.g. j_doe"
                      className="w-full bg-white border-2 border-black px-3 h-10 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    />
                    {fieldState.error && <p className="text-xs text-[#EA4335] font-bold">{fieldState.error.message}</p>}
                  </div>
                )} />

                <FormField control={form.control} name="bio" render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black block">Bio & Interests</label>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold">{(field.value || "").length}/300</span>
                    </div>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Write a brief introduction about yourself..."
                      className="w-full bg-white border-2 border-black p-3 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000] resize-none"
                    />
                    {fieldState.error && <p className="text-xs text-[#EA4335] font-bold">{fieldState.error.message}</p>}
                  </div>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <FormField control={form.control} name="branch" render={({ field }) => (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black block">Department / Branch</label>
                      <input
                        {...field}
                        placeholder="e.g. CSE / AIML"
                        className="w-full bg-white border-2 border-black px-3 h-10 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                      />
                    </div>
                  )} />

                  <FormField control={form.control} name="yearOfStudy" render={({ field }) => (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black block">Year of Study</label>
                      <input
                        {...field}
                        placeholder="e.g. 3rd Year"
                        className="w-full bg-white border-2 border-black px-3 h-10 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                      />
                    </div>
                  )} />
                </div>

                <FormField control={form.control} name="linkedin" render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black block">LinkedIn Profile URL</label>
                    <input
                      {...field}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-white border-2 border-black px-3 h-10 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    />
                    {fieldState.error && <p className="text-xs text-[#EA4335] font-bold">{fieldState.error.message}</p>}
                  </div>
                )} />

                <div className="border-t-2 border-black pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-black">Email Announcements</p>
                    <p className="text-[10px] text-zinc-600 font-bold">Receive club alerts and contest updates</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={handleNotificationToggle} />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </form>
            </Form>
          </div>

          {/* Registered Events & Actions */}
          <div className="space-y-6">
            
            <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] space-y-4">
              <h2 className="text-xl font-black uppercase italic tracking-tight text-black border-b-2 border-black pb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#00A844]" /> Registered Events ({events.length})
              </h2>

              {events.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-black bg-zinc-50">
                  <p className="text-zinc-500 font-black uppercase tracking-wider text-xs">No active event passes found.</p>
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
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Community Portal Card */}
            <div className="border-2 border-black bg-[#FFE600] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] space-y-3 text-black">
              <h3 className="text-xl font-black uppercase italic tracking-tight">Community Discussions</h3>
              <p className="text-xs font-bold leading-relaxed">
                Connect with peers, collaborate on open source repositories, and share project updates in real time.
              </p>
              <Button asChild className="w-full bg-white hover:bg-zinc-100 text-black border-2 border-black font-black uppercase tracking-wider text-xs h-11 shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]">
                <Link href="/community">Join Community Channel</Link>
              </Button>
            </div>

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
                  <Link href={`/profile/${userObj.username}`} className="flex items-center gap-3 group" onClick={() => setShowFollowDialog(false)}>
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
