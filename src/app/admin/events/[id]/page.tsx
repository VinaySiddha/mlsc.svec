
'use client';

import { 
    getEventRegistrations, 
    getEventById, 
    sendReminderEmails, 
    sendFeedbackEmails,
    checkInRegistrantAction
} from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { QRScanner } from "@/components/admin/qr-scanner";
import { 
    ArrowLeft, 
    Loader2, 
    Send, 
    MessageSquareQuote, 
    Search, 
    X,
    ScanLine,
    Users,
    UserCheck,
    Ticket
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { useEffect, useState, useMemo, useTransition, use } from "react";

interface Registration {
    id: string;
    name: string;
    email: string;
    rollNo: string;
    phone: string;
    branch: string;
    yearOfStudy: string;
    registeredAt: string;
    checkedIn?: boolean;
    checkedInAt?: string;
}

interface EventData {
    id: string;
    title: string;
    feedbackLink?: string;
    [key: string]: any;
}

export default function EventRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [event, setEvent] = useState<EventData | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, startTransition] = useTransition();
    const [actionType, setActionType] = useState<'reminders' | 'feedback' | null>(null);
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');

    // QR scanner state
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const eventId = resolvedParams.id;

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
                setRegistrations(registrationsResult.registrations || []);

            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [eventId]);

    const branches = useMemo(() => {
        const set = new Set(registrations.map(r => r.branch).filter(Boolean));
        return Array.from(set).sort();
    }, [registrations]);

    const years = useMemo(() => {
        const set = new Set(registrations.map(r => r.yearOfStudy).filter(Boolean));
        return Array.from(set).sort();
    }, [registrations]);

    const filteredRegistrations = useMemo(() => {
        return registrations.filter(reg => {
            if (branchFilter !== 'all' && reg.branch !== branchFilter) return false;
            if (yearFilter !== 'all' && reg.yearOfStudy !== yearFilter) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (
                    reg.name?.toLowerCase().includes(q) ||
                    reg.email?.toLowerCase().includes(q) ||
                    reg.rollNo?.toLowerCase().includes(q) ||
                    reg.phone?.includes(q)
                );
            }
            return true;
        });
    }, [registrations, branchFilter, yearFilter, searchQuery]);

    // Live checked in counts
    const checkedInCount = useMemo(() => {
        return registrations.filter(r => r.checkedIn).length;
    }, [registrations]);

    const hasActiveFilters = searchQuery || branchFilter !== 'all' || yearFilter !== 'all';

    const clearFilters = () => {
        setSearchQuery('');
        setBranchFilter('all');
        setYearFilter('all');
    };

    // Callback when scanner or manual toggle updates a registrant
    const handleCheckInSuccess = (updatedReg: any) => {
        setRegistrations(prev => prev.map(reg => reg.id === updatedReg.id ? { ...reg, ...updatedReg } : reg));
    };

    const handleToggleCheckIn = async (registrationId: string, currentStatus: boolean) => {
        setTogglingId(registrationId);
        try {
            const newStatus = !currentStatus;
            const result = await checkInRegistrantAction(eventId, registrationId, newStatus);
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Operation Failed',
                    description: result.error
                });
            } else if (result.registration) {
                handleCheckInSuccess(result.registration);
                toast({
                    title: newStatus ? 'Attendee Checked In' : 'Attendance Cancelled',
                    description: `${result.registration.name} has been marked ${newStatus ? 'present' : 'absent'}.`
                });
            }
        } catch (err: any) {
            console.error("Manual toggle failed:", err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'An unexpected error occurred.'
            });
        } finally {
            setTogglingId(null);
        }
    };

    const handleSendReminders = () => {
        setActionType('reminders');
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
            } finally {
                setActionType(null);
            }
        });
    }

    const handleSendFeedback = () => {
        if (!event?.feedbackLink) {
            toast({
                variant: 'destructive',
                title: "No Feedback Link",
                description: "Please add a feedback link to the event before sending emails."
            });
            return;
        }
        setActionType('feedback');
        startTransition(async () => {
            try {
                const result = await sendFeedbackEmails(eventId);
                if (result.error) throw new Error(result.error);
                toast({
                    title: "Feedback Emails Sent!",
                    description: `Feedback request emails have been sent to ${result.count} participant(s).`
                });
            } catch (e: any) {
                toast({
                    variant: 'destructive',
                    title: "Failed to Send Feedback Emails",
                    description: e.message || "An unknown error occurred."
                });
            } finally {
                setActionType(null);
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
                <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MLSCLogo className="h-10 w-10 text-primary" />
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Event Registrations
                            </h1>
                            <p className="text-sm text-muted-foreground">{event?.title}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button 
                            onClick={() => setIsScannerOpen(true)} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-950/20"
                        >
                            <ScanLine className="mr-2 h-4 w-4" />
                            Scan Tickets
                        </Button>
                        <Button onClick={handleSendReminders} variant="outline" disabled={isSending}>
                            {isSending && actionType === 'reminders' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Reminders
                        </Button>
                        <Button onClick={handleSendFeedback} variant="outline" disabled={isSending || !event?.feedbackLink}>
                            {isSending && actionType === 'feedback' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareQuote className="mr-2 h-4 w-4" />}
                            Send Feedback Forms
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
                <div className="container mx-auto space-y-6">
                    
                    {/* Live Count Statistics cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="glass-card border-zinc-800/40 bg-zinc-900/20 backdrop-blur-xs">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Registrations</p>
                                    <h3 className="text-3xl font-extrabold text-zinc-100">{registrations.length}</h3>
                                </div>
                                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                                    <Users className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card border-zinc-800/40 bg-zinc-900/20 backdrop-blur-xs">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Checked In (Attended)</p>
                                    <h3 className="text-3xl font-extrabold text-emerald-400">{checkedInCount}</h3>
                                </div>
                                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                                    <UserCheck className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card border-zinc-800/40 bg-zinc-900/20 backdrop-blur-xs">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Attendance Rate</p>
                                    <h3 className="text-3xl font-extrabold text-zinc-100">
                                        {registrations.length > 0 
                                            ? `${Math.round((checkedInCount / registrations.length) * 100)}%` 
                                            : '0%'}
                                    </h3>
                                </div>
                                <div className="p-3 bg-zinc-500/10 text-zinc-400 rounded-xl border border-zinc-750">
                                    <Ticket className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Registered Users ({filteredRegistrations.length}{hasActiveFilters ? ` of ${registrations.length}` : ''})</CardTitle>
                                    <CardDescription>
                                        List of users who have registered for this event.
                                    </CardDescription>
                                </div>
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        <X className="mr-1 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-4">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, email, roll no, phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select value={branchFilter} onValueChange={setBranchFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {branches.map(b => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {years.map(y => (
                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md overflow-x-auto">
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
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRegistrations.length > 0 ? (
                                            filteredRegistrations.map(reg => (
                                                <TableRow key={reg.id}>
                                                    <TableCell className="font-medium whitespace-nowrap">{reg.name}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{reg.email}</TableCell>
                                                    <TableCell className="whitespace-nowrap font-mono text-xs">{reg.rollNo}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{reg.phone}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{reg.branch}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{reg.yearOfStudy}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{format(new Date(reg.registeredAt), "PPP p")}</TableCell>
                                                    <TableCell>
                                                        {reg.checkedIn ? (
                                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/20 whitespace-nowrap">
                                                                Checked In
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/15 border-zinc-700 whitespace-nowrap">
                                                                Absent
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right whitespace-nowrap">
                                                        <Button
                                                            onClick={() => handleToggleCheckIn(reg.id, !!reg.checkedIn)}
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={togglingId === reg.id}
                                                            className={`h-8 px-2.5 text-xs font-medium transition-all ${
                                                                reg.checkedIn
                                                                    ? 'hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'
                                                                    : 'hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30'
                                                            }`}
                                                        >
                                                            {togglingId === reg.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : reg.checkedIn ? (
                                                                'Undo'
                                                            ) : (
                                                                'Check In'
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center h-24">
                                                    {hasActiveFilters ? 'No registrations match the current filters.' : 'No registrations yet.'}
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

            {/* Mobile Floating Action Button (FAB) for quick-scanning */}
            <div className="fixed bottom-6 right-6 z-40 md:hidden">
                <Button 
                    onClick={() => setIsScannerOpen(true)} 
                    className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center justify-center p-0 active:scale-95 transition-transform border border-emerald-500/30"
                >
                    <ScanLine className="h-6 w-6" />
                </Button>
            </div>

            {/* Live QR Scanner Dialog */}
            <QRScanner
                eventId={eventId}
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onCheckInSuccess={handleCheckInSuccess}
            />
        </div>
    );
}
