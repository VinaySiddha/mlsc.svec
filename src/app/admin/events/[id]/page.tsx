
import { getEventRegistrations, getEventById, exportRegistrationsToCsv } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileDown, Loader2 } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { useState } from "react";
import { RegistrationsTable } from "@/components/registrations-table";

export default async function EventRegistrationsPage({ params }: { params: { id: string } }) {
    const headersList = headers();
    const userRole = headersList.get('X-User-Role');

    if (userRole !== 'admin') {
        redirect('/admin');
    }
    
    const eventId = params.id;
    const eventData = await getEventById(eventId);
    
    if (!eventData || !eventData.event) {
        notFound();
    }
    
    const { registrations, error } = await getEventRegistrations(eventId);

    if (error) {
        return <div>Error loading registrations: {error}</div>
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
                            <p className="text-sm text-muted-foreground">{eventData.event.title}</p>
                        </div>
                    </div>
                     <Button asChild variant="glass">
                        <Link href="/admin/events">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Events
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="container mx-auto space-y-8">
                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Registered Users ({registrations.length})</CardTitle>
                                <CardDescription>
                                    List of users who have registered for this event.
                                </CardDescription>
                            </div>
                           <RegistrationsTable registrations={registrations} eventId={eventId} />
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
