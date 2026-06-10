'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getNotifications, addNotification, deleteNotification } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const notificationSchema = z.object({
  message: z.string().min(1, 'Notification message cannot be empty.'),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

interface Notification {
    id: string;
    message: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: { message: '' },
  });

  const fetchNotifications = async () => {
    setIsLoading(true);
    const result = await getNotifications();
    if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        setNotifications([]);
    } else {
        setNotifications(result.notifications || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onSubmit = async (values: NotificationFormValues) => {
    setIsSubmitting(true);
    const result = await addNotification(values);
    if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
        toast({ title: 'Success', description: 'Notification added successfully.' });
        form.reset();
        await fetchNotifications();
    }
    setIsSubmitting(false);
  };
  
  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    const result = await deleteNotification(id);
    if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
        toast({ title: 'Success', description: 'Notification deleted successfully.' });
        await fetchNotifications();
    }
    setIsDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
          Announcement <span className="text-[#4285F4]">Ticker</span>
        </h1>
        <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage public website top scrolling announcement bar content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form to add notifications */}
        <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-zinc-800">
            <CardTitle className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-widest">Add Announcement</CardTitle>
            <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
              Add a new scrolling announcement message to the ticker at the top of the public website.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Message</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter announcement text (e.g., Chapter 4.0 recruitment is live!)..." {...field} className="rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-[#4285F4] focus:border-transparent" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold text-xs py-5">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add to Ticker
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* List of current notifications */}
        <Card className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-widest">Current Scrolled Announcements</CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
                  These messages are currently looping on the top announcement bar of the public portal.
              </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
              {isLoading ? (
                  <div className="flex justify-center items-center h-24">
                      <Loader2 className="h-6 w-6 animate-spin text-[#4285F4]" />
                  </div>
              ) : notifications.length > 0 ? (
                  <ul className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {notifications.map((notification) => (
                          <li key={notification.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                              <p className="text-sm text-slate-700 dark:text-zinc-300 font-medium">{notification.message}</p>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(notification.id)}
                                  disabled={isDeleting === notification.id}
                                  className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg shrink-0"
                              >
                                  {isDeleting === notification.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-slate-400 dark:text-zinc-500 text-xs py-8 font-semibold uppercase tracking-wider">No notifications found.</p>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}