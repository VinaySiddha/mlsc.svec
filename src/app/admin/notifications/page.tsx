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
import { logClientError } from '@/lib/error-logger';
import { useAuth } from '@/lib/auth-context';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';

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
  const [deleteNotificationId, setDeleteNotificationId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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
    try {
      const result = await addNotification(values);
      if (result.error) {
          throw new Error(result.error);
      }
      toast({ title: 'Success', description: 'Notification added successfully.' });
      form.reset();
      await fetchNotifications();
    } catch (error: any) {
      await logClientError(
        'Failed to add announcement ticker message',
        error,
        'NotificationsPage',
        user?.email || 'unknown'
      );
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = (id: string) => {
    setDeleteNotificationId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteNotificationId) return;
    const id = deleteNotificationId;
    setIsDeleting(id);
    try {
      const result = await deleteNotification(id);
      if (result.error) {
          throw new Error(result.error);
      }
      toast({ title: 'Success', description: 'Notification deleted successfully.' });
      setDeleteNotificationId(null);
      await fetchNotifications();
    } catch (error: any) {
      await logClientError(
        `Failed to delete announcement ticker message ID: ${id}`,
        error,
        'NotificationsPage',
        user?.email || 'unknown'
      );
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6 font-sans text-black">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#4285F4] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-white">
          <Plus className="h-7 w-7 text-white stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
            Announcement <span className="text-[#4285F4]">Ticker</span>
          </h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">Manage public website top scrolling announcement bar content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form to add notifications */}
        <Card className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
          <CardHeader className="p-6 border-b-2 border-black bg-[#FAFAFA]">
            <CardTitle className="text-sm font-black text-black uppercase font-display tracking-tight">Add Announcement</CardTitle>
            <CardDescription className="text-xs text-zinc-600 font-bold mt-1">
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
                        <Input placeholder="Enter announcement text (e.g., Chapter 4.0 recruitment is live!)..." {...field} className="border-2 border-black bg-white text-xs font-bold text-black shadow-[2px_2px_0px_0px_#000000] focus:outline-none placeholder:text-zinc-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] py-5">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                  )}
                  Add to Ticker
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* List of current notifications */}
        <Card className="lg:col-span-2 bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
          <CardHeader className="p-6 border-b-2 border-black bg-[#FAFAFA]">
              <CardTitle className="text-sm font-black text-black uppercase font-display tracking-tight">Current Scrolled Announcements</CardTitle>
              <CardDescription className="text-xs text-zinc-600 font-bold mt-1">
                  These messages are currently looping on the top announcement bar of the public portal.
              </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
              {isLoading ? (
                  <div className="flex justify-center items-center h-24">
                      <Loader2 className="h-6 w-6 animate-spin text-black" />
                  </div>
              ) : notifications.length > 0 ? (
                  <ul className="divide-y-2 divide-black">
                      {notifications.map((notification) => (
                          <li key={notification.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                              <p className="text-xs text-black font-bold">{notification.message}</p>
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(notification.id)}
                                  disabled={isDeleting === notification.id}
                                  className="h-8 w-8 border-2 border-black bg-white hover:bg-[#FF0055] hover:text-white text-black shadow-[2px_2px_0px_0px_#000000] shrink-0"
                              >
                                  {isDeleting === notification.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />}
                              </Button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-zinc-500 text-xs py-8 font-black uppercase tracking-wider">No notifications found.</p>
              )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        isOpen={deleteNotificationId !== null}
        onClose={() => setDeleteNotificationId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement?"
        description="This action cannot be undone. This will permanently delete this announcement ticker message from the website header bar."
        isLoading={isDeleting !== null}
      />
    </div>
  );
}