
'use client';

import { getEventRegistrations, getEventById, sendReminderEmails } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { useEffect, useState, useTransition } from "react";

interface Registration {
    id: string;
    name: string;
    email: string;
    rollNo: string;
    phone: string;
    branch: string;
    yearOfStudy: string;
    registeredAt: string;
}

interface EventData {
    id: string;
    title: string;
    [key: string]: any;
}

export default function EventRegistrationsPage({ params }: { params: { id: string } }) {
    const [event, setEvent] = useState<EventData | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const eventId = params.id;

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const eventResult = await getEventById(eventId);
                if (eventResult.error || !eventResult.event) {
                    throw new Error(eventResult.error || "Event not found");
                }
                setEvent(eventResult.event);

                const registrationsResult = await getEventRegistrations(eventId);
                if (registrationsResult.error) {
                    throw new Error(registrationsResult.error);
                }
                setRegistrations(registrationsResult.registrations);

            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [eventId]);

    const handleSendReminders = () => {
        startTransition(async () => {
            try {
                const result = await sendReminderEmails(eventId);
                if (result.error) throw new Error(result.error);
                toast({
                    title: "Emails Sent!",
                    description: `Reminder emails have been sent to ${result.count} participant(s).`
                });
            } catch (e: any) {
                toast({
                    variant: 'destructive',
                    title: "Failed to Send Reminders",
                    description: e.message || "An unknown error occurred."
                });
            }
        });
    }

    if (isLoading) {
        return (
             <div className="flex flex-col min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground mt-2">Loading registrations...</p>
             </div>
        )
    }

    if (error) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MLSCLogo className="h-10 w-10 text-primary" />
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Event Registrations
                            </h1>
                            <p className="text-sm text-muted-foreground">{event?.title}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button onClick={handleSendReminders} variant="outline" disabled={isSending}>
                            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Reminders
                        </Button>
                        <Button asChild variant="glass">
                            <Link href="/admin/events">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Events
                            </Link>
                        </Button>
                     </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="container mx-auto space-y-8">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Registered Users ({registrations.length})</CardTitle>
                            <CardDescription>
                                List of users who have registered for this event.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Roll No</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Registered At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrations.length > 0 ? (
                                            registrations.map(reg => (
                                                <TableRow key={reg.id}>
                                                    <TableCell className="font-medium">{reg.name}</TableCell>
                                                    <TableCell>{reg.email}</TableCell>
                                                    <TableCell>{reg.rollNo}</TableCell>
                                                    <TableCell>{reg.phone}</TableCell>
                                                    <TableCell>{reg.branch}</TableCell>
                                                    <TableCell>{reg.yearOfStudy}</TableCell>
                                                    <TableCell>{format(new Date(reg.registeredAt), "PPP p")}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-24">
                                                    No registrations yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
