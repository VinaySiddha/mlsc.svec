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
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, Upload, Users } from 'lucide-react';
import Link from 'next/link';

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
      // 1. If username changed, update it first
      if (values.username !== profile.username) {
        const userResult = await changeUsername(user.uid, values.username);
        if (!userResult.success) {
          toast({ variant: 'destructive', title: 'Username Error', description: userResult.error });
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Update the rest of the profile
      const result = await updateUserProfile(user.uid, values);
      if (result.success) {
        setProfile(prev => prev ? { ...prev, ...values } : prev);
        toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    } catch (err: any) {
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
    } catch {
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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#4285F4]" />
      </div>
    );
  }

  if (!user || !profile) return null;

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
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">My Profile.</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 md:p-12 lg:p-20 container mx-auto max-w-5xl space-y-12">
        {/* Profile Card */}
        <div className="bento-card !p-10 border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group shrink-0">
              <Avatar className="h-32 w-32 rounded-[2.5rem] ring-4 ring-white/5 border-2 border-white/10">
                <AvatarImage src={profile.photoURL} alt={profile.displayName} className="object-cover" />
                <AvatarFallback className="text-4xl font-black bg-[#4285F4]">{profile.displayName?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                {isUploadingImage ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                ) : (
                  <Upload className="h-8 w-8 text-white" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
              </label>
            </div>
            <div className="text-center md:text-left flex-1">
              <CardTitle className="text-4xl font-black tracking-tighter uppercase mb-1">{profile.displayName}</CardTitle>
              <CardDescription className="text-white/40 text-sm font-medium mb-3">@{profile.username || 'username'}</CardDescription>
              <CardDescription className="text-white/50 text-base font-medium mb-4">{profile.email}</CardDescription>
              
              {/* Followers / Following Counts */}
              <div className="flex gap-6 mb-5 justify-center md:justify-start">
                <button onClick={() => openFollowModal('followers')} className="hover:text-[#4285F4] transition-colors flex items-center gap-1">
                  <span className="font-black text-white text-lg">{profile.followersCount || 0}</span> 
                  <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Followers</span>
                </button>
                <button onClick={() => openFollowModal('following')} className="hover:text-[#4285F4] transition-colors flex items-center gap-1">
                  <span className="font-black text-white text-lg">{profile.followingCount || 0}</span> 
                  <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Following</span>
                </button>
              </div>

              <Badge className="bg-[#4285F4] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-none">
                {ROLE_LABELS[profile.role] || profile.role}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bento-card border-white/5 space-y-8 h-fit">
            <h3 className="text-2xl font-black tracking-tighter uppercase italic">Edit Details.</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FieldGroup>
                  <FormField control={form.control} name="displayName" render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="profile-displayName">Display Name</FieldLabel>
                      <Input
                        {...field}
                        id="profile-displayName"
                        placeholder="John Doe"
                        aria-invalid={!!fieldState.error}
                        autoComplete="off"
                      />
                      {fieldState.error && (
                        <FieldError errors={[{ message: fieldState.error.message || '' }]} />
                      )}
                    </Field>
                  )} />

                  <FormField control={form.control} name="username" render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="profile-username">Username</FieldLabel>
                      <Input
                        {...field}
                        id="profile-username"
                        placeholder="username"
                        aria-invalid={!!fieldState.error}
                        autoComplete="off"
                      />
                      {fieldState.error && (
                        <FieldError errors={[{ message: fieldState.error.message || '' }]} />
                      )}
                    </Field>
                  )} />

                  <FormField control={form.control} name="bio" render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="profile-bio"
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="min-h-24 resize-none"
                          aria-invalid={!!fieldState.error}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {(field.value || "").length}/300 characters
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.error && (
                        <FieldError errors={[{ message: fieldState.error.message || '' }]} />
                      )}
                    </Field>
                  )} />
                </FieldGroup>
                
                <Separator className="bg-white/5" />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-tight">Email Notifications</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Updates and announcements</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={handleNotificationToggle} className="data-[state=checked]:bg-[#34A853]" />
                </div>

                <Button type="submit" disabled={isSubmitting} className="btn-primary w-full h-12 !mt-8 rounded-xl font-bold bg-white text-black hover:bg-white/90">
                  {isSubmitting && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </div>

          <div className="space-y-8">
            <div className="bento-card border-white/5">
              <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-8">Registered Events.</h3>
              {events.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-white/30 font-bold uppercase tracking-widest text-xs">No active registrations.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((evt: any) => (
                    <div key={evt.id} className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#4285F4]/30 transition-all">
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

            <div className="bento-card border-white/5 bg-[#34A853]/5 border-[#34A853]/10">
              <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-4 text-[#34A853]">Community.</h3>
              <p className="text-white/60 font-medium mb-8">Participate in discussions and share your knowledge.</p>
              <Button asChild variant="outline" className="w-full rounded-full border-[#34A853]/20 hover:bg-[#34A853]/10 text-[#34A853] font-black uppercase tracking-widest text-xs h-12">
                <Link href="/community">Join Discussion</Link>
              </Button>
            </div>
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
                  <Link href={`/profile/${userObj.username}`} className="flex items-center gap-4 group" onClick={() => setShowFollowDialog(false)}>
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
