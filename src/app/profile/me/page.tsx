'use client';

import { useAuth } from '@/lib/auth-context';
import { getUserProfile, updateUserProfile, getUserRegisteredEvents } from '@/lib/user-service';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Loader2, MessageSquare, Upload } from 'lucide-react';
import Link from 'next/link';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: '', bio: '', rollNo: '', branch: '', yearOfStudy: '', linkedin: '' },
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

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    const result = await updateUserProfile(user.uid, values);
    if (result.success) {
      setProfile(prev => prev ? { ...prev, ...values } : prev);
      toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div className="flex items-center gap-2">
              <MLSCLogo className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">My Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 container mx-auto max-w-3xl space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                  <AvatarFallback className="text-2xl">{profile.displayName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {isUploadingImage ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Upload className="h-5 w-5 text-white" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                </label>
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
                <Badge variant="outline" className="mt-1">{ROLE_LABELS[profile.role] || profile.role}</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="displayName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl><Input {...field} className="bg-background/20" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl><Textarea placeholder="Tell us about yourself..." {...field} className="bg-background/20" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="rollNo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl><Input placeholder="e.g. 22B01A0501" {...field} className="bg-background/20" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="branch" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/20"><SelectValue placeholder="Select branch" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['CSE', 'AIML', 'CAI', 'CST', 'ECE', 'EEE', 'MECH', 'CIVIL', 'Others'].map(b => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="yearOfStudy" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Study</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/20"><SelectValue placeholder="Select year" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['1st', '2nd', '3rd', '4th'].map(y => (
                            <SelectItem key={y} value={y}>{y} Year</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="linkedin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} className="bg-background/20" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive emails about new events and announcements</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={handleNotificationToggle} />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> My Events</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">You haven't registered for any events yet.</p>
            ) : (
              <div className="space-y-3">
                {events.map((evt: any) => (
                  <div key={evt.id} className="flex justify-between items-center p-3 rounded-lg bg-background/20">
                    <div>
                      <p className="font-medium">{evt.eventTitle}</p>
                      <p className="text-xs text-muted-foreground">{evt.eventDate}</p>
                    </div>
                    <Badge variant="outline">Registered</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> My Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">
              Visit the <Link href="/community" className="text-primary hover:underline">community</Link> to create and view your posts.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
