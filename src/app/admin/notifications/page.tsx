
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getNotifications, addNotification, deleteNotification } from '@/app/actions';
import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
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
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-4">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manage Notifications
            </h1>
          </Link>
          <Button asChild variant="glass">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto space-y-8">
          <Card className="max-w-3xl mx-auto glass-card">
            <CardHeader>
              <CardTitle>Add New Notification</CardTitle>
              <CardDescription>
                Add a new message to the scrolling notification ticker on the home page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormLabel className="sr-only">Message</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter notification text..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Add Notification</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="max-w-3xl mx-auto glass-card">
            <CardHeader>
                <CardTitle>Current Notifications</CardTitle>
                <CardDescription>
                    This is the list of notifications currently displayed on the home page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : notifications.length > 0 ? (
                    <ul className="space-y-3">
                        {notifications.map((notification) => (
                            <li key={notification.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <p className="text-sm text-foreground">{notification.message}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(notification.id)}
                                    disabled={isDeleting === notification.id}
                                >
                                    {isDeleting === notification.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No notifications found.</p>
                )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}

    