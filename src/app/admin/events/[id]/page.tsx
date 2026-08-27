'use client';

import { 
    getEventRegistrations, 
    getEventById, 
    sendReminderEmails, 
    sendFeedbackEmails,
    checkInRegistrantAction,
    exportEventRegistrationsToCsv,
    deleteEventRegistrationAction
} from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { QRScanner } from "@/components/admin/qr-scanner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    Ticket,
    Download,
    Phone,
    SlidersHorizontal,
    MoreHorizontal,
    CheckCircle2,
    Calendar,
    MapPin,
    Clock,
    FileSpreadsheet,
    Mail,
    Sliders,
    Copy,
    ClipboardCheck,
    BarChart3,
    CheckSquare,
    RotateCcw,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { useEffect, useState, useMemo, useTransition, use } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    date: string;
    time: string;
    venue: string;
    feedbackLink?: string;
    registrationOpen: boolean;
    [key: string]: any;
}

// Helper: Get colorful avatars based on name hash
const AVATAR_COLORS = [
  'bg-red-500/10 text-red-400 border-red-500/20',
  'bg-green-500/10 text-green-400 border-green-500/20',
  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'bg-teal-500/10 text-teal-400 border-teal-500/20',
];

function getInitials(name: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % AVATAR_COLORS.length);
  return AVATAR_COLORS[index];
}

// Framer motion variants
const statsContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const statsItemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function EventRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [event, setEvent] = useState<EventData | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, startTransition] = useTransition();
    const [actionType, setActionType] = useState<'reminders' | 'feedback' | 'export' | 'bulkCheckIn' | 'reset' | null>(null);
    const { toast } = useToast();

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dialog & Modal states
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [isBulkCheckInOpen, setIsBulkCheckInOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [deletingReg, setDeletingReg] = useState<{ id: string, name: string, userId?: string } | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Bulk check in inputs
    const [bulkRollNumbers, setBulkRollNumbers] = useState('');
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

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

    useEffect(() => {
        // Prevent Radix UI from locking pointer-events on body when dialogs or dropdowns close
        const restorePointerEvents = () => {
            if (!isScannerOpen && !isAnalyticsOpen && !isBulkCheckInOpen && !isResetConfirmOpen && !deletingReg) {
                if (document.body.style.pointerEvents === 'none') {
                    document.body.style.pointerEvents = 'auto';
                }
            }
        };

        restorePointerEvents();
        
        const interval = setInterval(restorePointerEvents, 500);
        return () => clearInterval(interval);
    }, [isScannerOpen, isAnalyticsOpen, isBulkCheckInOpen, isResetConfirmOpen, deletingReg]);

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
            if (statusFilter !== 'all') {
                const isCheckedIn = !!reg.checkedIn;
                if (statusFilter === 'present' && !isCheckedIn) return false;
                if (statusFilter === 'absent' && isCheckedIn) return false;
            }
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
    }, [registrations, branchFilter, yearFilter, statusFilter, searchQuery]);

    // Live checked in counts
    const checkedInCount = useMemo(() => {
        return registrations.filter(r => r.checkedIn).length;
    }, [registrations]);

    // Analytics breakdowns
    const analyticsData = useMemo(() => {
        const branchCounts: Record<string, number> = {};
        const yearCounts: Record<string, number> = {};
        
        registrations.forEach(reg => {
            if (reg.branch) {
                branchCounts[reg.branch] = (branchCounts[reg.branch] || 0) + 1;
            }
            if (reg.yearOfStudy) {
                yearCounts[reg.yearOfStudy] = (yearCounts[reg.yearOfStudy] || 0) + 1;
            }
        });

        const sortedBranches = Object.entries(branchCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count, percent: Math.round((count / registrations.length) * 100) }));

        const sortedYears = Object.entries(yearCounts)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, count]) => ({ name, count, percent: Math.round((count / registrations.length) * 100) }));

        return { branches: sortedBranches, years: sortedYears };
    }, [registrations]);

    const hasActiveFilters = searchQuery || branchFilter !== 'all' || yearFilter !== 'all' || statusFilter !== 'all';

    const clearFilters = () => {
        setSearchQuery('');
        setBranchFilter('all');
        setYearFilter('all');
        setStatusFilter('all');
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

    const handleExportCsv = async () => {
        setActionType('export');
        try {
            const result = await exportEventRegistrationsToCsv(eventId);
            if (result.error) throw new Error(result.error);
            if (!result.csvData) {
                toast({
                    title: "No Data Available",
                    description: "There are no registrations to export.",
                });
                return;
            }

            // Create browser download
            const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            const fileTitle = event?.title 
                ? event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
                : 'event';
            link.setAttribute("download", `${fileTitle}-registrations.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export Successful",
                description: "Registrations list downloaded as CSV.",
            });
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: "Export Failed",
                description: e.message || "An unknown error occurred during CSV export."
            });
        } finally {
            setActionType(null);
        }
    };

    // Bulk check in trigger
    const handleBulkCheckIn = async () => {
        const lines = bulkRollNumbers
            .split(/[\n,]+/)
            .map(s => s.trim().toUpperCase())
            .filter(Boolean);

        if (lines.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Input',
                description: 'Please paste or type at least one roll number.'
            });
            return;
        }

        setActionType('bulkCheckIn');
        setBulkProgress({ current: 0, total: lines.length });

        let checkInCount = 0;
        let failCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const roll = lines[i];
            // Find registration in local state matching this roll number
            const matchedReg = registrations.find(r => r.rollNo?.toUpperCase() === roll);

            if (matchedReg) {
                try {
                    // Only check in if not already checked in
                    if (!matchedReg.checkedIn) {
                        const result = await checkInRegistrantAction(eventId, matchedReg.id, true);
                        if (result.registration) {
                            handleCheckInSuccess(result.registration);
                        }
                    }
                    checkInCount++;
                } catch (err) {
                    console.error(`Failed bulk check-in for roll ${roll}:`, err);
                    failCount++;
                }
            } else {
                failCount++;
            }
            setBulkProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setActionType(null);
        setIsBulkCheckInOpen(false);
        setBulkRollNumbers('');
        toast({
            title: 'Bulk Process Completed',
            description: `Successfully checked in ${checkInCount} attendee(s). ${failCount > 0 ? `Failed or skipped ${failCount} roll number(s).` : ''}`
        });
    };

    // Reset all attendance
    const handleResetAllAttendance = async () => {
        setActionType('reset');
        setIsResetConfirmOpen(false);
        
        const checkedInRegs = registrations.filter(r => r.checkedIn);
        if (checkedInRegs.length === 0) {
            toast({
                title: 'Clean Slate',
                description: 'No attendees are currently marked checked in.'
            });
            setActionType(null);
            return;
        }

        let resetCount = 0;
        for (const reg of checkedInRegs) {
            try {
                const result = await checkInRegistrantAction(eventId, reg.id, false);
                if (result.registration) {
                    handleCheckInSuccess(result.registration);
                }
                resetCount++;
            } catch (err) {
                console.error(`Failed resetting check-in for registration ID ${reg.id}:`, err);
            }
        }

        setActionType(null);
        toast({
            title: 'Attendance Reset',
            description: `Successfully reset check-in status to absent for ${resetCount} participant(s).`
        });
    };

    const handleDeleteParticipant = async () => {
        if (!deletingReg) return;
        const targetId = deletingReg.id;
        const targetName = deletingReg.name;
        const targetUserId = deletingReg.userId;
        
        setDeletingReg(null);
        
        try {
            const result = await deleteEventRegistrationAction(eventId, targetId, targetUserId);
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Deletion Failed',
                    description: result.error
                });
            } else {
                setRegistrations(prev => prev.filter(r => r.id !== targetId));
                toast({
                    title: 'Participant Removed',
                    description: `${targetName} has been successfully deregistered.`
                });
            }
        } catch (err: any) {
            console.error("Deregistration failed:", err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'An unexpected error occurred during deletion.'
            });
        }
    };

    // Copy email utilities
    const handleCopyEmails = (filteredOnly: boolean) => {
        const targets = filteredOnly ? filteredRegistrations : registrations;
        if (targets.length === 0) {
            toast({
                title: 'No Emails',
                description: 'There are no email addresses to copy.'
            });
            return;
        }
        const emails = targets.map(r => r.email).filter(Boolean).join(', ');
        navigator.clipboard.writeText(emails)
            .then(() => {
                toast({
                    title: 'Copied to Clipboard!',
                    description: `Copied ${targets.length} email addresses.`
                });
            })
            .catch(err => {
                console.error('Failed to copy emails:', err);
                toast({
                    variant: 'destructive',
                    title: 'Copy Failed',
                    description: 'Could not access the system clipboard.'
                });
            });
    };

    const formattedEventDate = useMemo(() => {
        if (!event?.date) return '';
        try {
            return format(new Date(event.date), "PPP");
        } catch (e) {
            return String(event.date);
        }
    }, [event?.date]);

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-[#4285F4]" />
                <p className="text-zinc-500 mt-3 text-sm font-medium tracking-wide">Loading registrations...</p>
            </div>
        )
    }

    if (error) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <header className="py-5 px-4 sm:px-6 md:px-8 border-b border-zinc-900 sticky top-0 bg-black/80 backdrop-blur-md z-30">
                <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                            <MLSCLogo className="h-10 w-10 text-[#4285F4]" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase italic">
                                    Registrations
                                </h1>
                                <Badge variant={event?.registrationOpen ? 'default' : 'secondary'} className={`text-[10px] py-0.5 px-2.5 font-bold uppercase tracking-widest ${
                                    event?.registrationOpen 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                }`}>
                                    {event?.registrationOpen ? 'Open' : 'Closed'}
                                </Badge>
                            </div>
                            <p className="text-xs text-[#4285F4] font-semibold truncate max-w-[250px] md:max-w-md mt-0.5">{event?.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <Button asChild variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-10 text-xs font-bold uppercase tracking-wider">
                            <Link href="/admin/events">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        
                        <Button 
                            onClick={() => setIsScannerOpen(true)} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl h-10 px-4 shadow-lg shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                        >
                            <ScanLine className="mr-2 h-4 w-4" />
                            Scan Tickets
                        </Button>

                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    disabled={isSending || actionType !== null}
                                    className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-xl h-10 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {isSending || actionType !== null ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sliders className="h-4 w-4 mr-2" />
                                    )}
                                    Tools
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-900 text-zinc-300 w-56 rounded-xl p-1.5 shadow-2xl">
                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-zinc-500 p-2">Quick Actions</DropdownMenuLabel>
                                <DropdownMenuItem 
                                    onClick={() => setIsBulkCheckInOpen(true)}
                                    className="rounded-lg py-2 focus:bg-zinc-900 focus:text-white cursor-pointer text-xs font-semibold gap-2.5"
                                >
                                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                                    Bulk Check-In rolls
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => setIsAnalyticsOpen(true)}
                                    className="rounded-lg py-2 focus:bg-zinc-900 focus:text-white cursor-pointer text-xs font-semibold gap-2.5"
                                >
                                    <BarChart3 className="h-4 w-4 text-[#FBBC04]" />
                                    Branch / Year Stats
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator className="bg-zinc-900" />
                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-zinc-500 p-2">Export & Clipboard</DropdownMenuLabel>
                                <DropdownMenuItem 
                                    onClick={handleExportCsv} 
                                    disabled={actionType === 'export'}
                                    className="rounded-lg py-2 focus:bg-zinc-900 focus:text-white cursor-pointer text-xs font-semibold gap-2.5"
                                >
                                    {actionType === 'export' ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                                    ) : (
                                        <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                                    )}
                                    Export to CSV (.csv)
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => handleCopyEmails(false)}
                                    className="rounded-lg py-2 focus:bg-zinc-900 focus:text-white cursor-pointer text-xs font-semibold gap-2.5"
                                >
                                    <Copy className="h-4 w-4 text-blue-400" />
                                    Copy All Emails
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => handleCopyEmails(true)}
                                    disabled={filteredRegistrations.length === 0}
                                    className="rounded-lg py-2 focus:bg-zinc-900 focus:text-white cursor-pointer text-xs font-semibold gap-2.5"
                                >
                                    <ClipboardCheck className="h-4 w-4 text-indigo-400" />
                                    Copy Filtered Emails
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-zinc-900" />
                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-zinc-500 p-2">Email Campaigns</DropdownMenuLabel>
                                <DropdownMenuItem 
                                    onClick={handleSendReminders} 
                                    disabled={isSending}
                                    className="rounded-lg py-2 focus:bg-zinc-900 focus:text-white cursor-pointer text-xs font-semibold gap-2.5"
                                >
                                    {isSending && actionType === 'reminders' ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-[#4285F4]" />
                                    ) : (
                                        <Mail className="h-4 w-4 text-[#4285F4]" />
                                    )}
                                    Send Email Reminders
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={handleSendFeedback} 
                                    disabled={isSending || !event?.feedbackLink}
                                    className="rounded-lg py-2 focus:bg-zinc-900 focus:text-white cursor-pointer text-xs font-semibold gap-2.5"
                                >
                                    {isSending && actionType === 'feedback' ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-[#EA4335]" />
                                    ) : (
                                        <MessageSquareQuote className="h-4 w-4 text-[#EA4335]" />
                                    )}
                                    Send Feedback Forms
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-zinc-900" />
                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-red-500/80 p-2">Danger Zone</DropdownMenuLabel>
                                <DropdownMenuItem 
                                    onClick={() => setIsResetConfirmOpen(true)}
                                    disabled={actionType === 'reset'}
                                    className="rounded-lg py-2 focus:bg-red-950/20 focus:text-red-400 text-red-500 cursor-pointer text-xs font-semibold gap-2.5"
                                >
                                    <RotateCcw className="h-4 w-4 text-red-500" />
                                    Reset All Attendance
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="container mx-auto space-y-8">
                    
                    {/* Event Brief banner */}
                    {event && (
                        <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-2xl p-4 flex flex-wrap gap-x-8 gap-y-3 text-xs text-zinc-400 items-center">
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#4285F4]" /> {formattedEventDate}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#34A853]" /> {event.time}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#EA4335]" /> {event.venue}</span>
                        </div>
                    )}

                    {/* Live Count Statistics cards with motion entrance */}
                    <motion.div 
                        variants={statsContainerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                    >
                        <motion.div variants={statsItemVariants}>
                            <Card className="border-zinc-900 bg-zinc-950/20 backdrop-blur-xs relative overflow-hidden group hover:border-[#4285F4]/30 hover:shadow-[0_0_20px_rgba(66,133,244,0.05)] transition-all duration-300">
                                <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/2 rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors" />
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Registered</p>
                                        <h3 className="text-3xl font-black text-white">{registrations.length}</h3>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                                        <Users className="h-5 w-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={statsItemVariants}>
                            <Card className="border-zinc-900 bg-zinc-950/20 backdrop-blur-xs relative overflow-hidden group hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all duration-300">
                                <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/2 rounded-full blur-2xl group-hover:bg-emerald-500/5 transition-colors" />
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Attendance (Present)</p>
                                        <h3 className="text-3xl font-black text-emerald-400">{checkedInCount}</h3>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                                        <UserCheck className="h-5 w-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={statsItemVariants}>
                            <Card className="border-zinc-900 bg-zinc-950/20 backdrop-blur-xs relative overflow-hidden group hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.05)] transition-all duration-300">
                                <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/2 rounded-full blur-2xl group-hover:bg-purple-500/5 transition-colors" />
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Attendance Rate</p>
                                        <h3 className="text-3xl font-black text-[#FBBC04]">
                                            {registrations.length > 0 
                                                ? `${Math.round((checkedInCount / registrations.length) * 100)}%` 
                                                : '0%'}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                                        <Ticket className="h-5 w-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Main Registrations Section */}
                    <Card className="bg-zinc-950/40 border border-zinc-900 rounded-2xl shadow-xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-zinc-900 bg-zinc-950/30">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-bold uppercase tracking-widest text-white">Participants List</CardTitle>
                                        <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-semibold">{filteredRegistrations.length} Found</Badge>
                                    </div>
                                    <CardDescription className="text-xs text-zinc-500 mt-1">
                                        Search, filter and toggle attendance check-ins.
                                    </CardDescription>
                                </div>
                                {hasActiveFilters && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={clearFilters}
                                        className="text-zinc-500 hover:text-white text-xs font-semibold w-fit self-start lg:self-center"
                                    >
                                        <X className="mr-1.5 h-3.5 w-3.5" />
                                        Reset Filters
                                    </Button>
                                )}
                            </div>

                            {/* Search and Filters Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="Search name, roll no, email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-zinc-950 border-zinc-900 text-sm h-10 rounded-xl focus-visible:ring-[#4285F4]/60 placeholder:text-zinc-600"
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Status Filter */}
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-900 rounded-xl h-10 text-sm text-zinc-400 focus:ring-[#4285F4]/60">
                                        <div className="flex items-center gap-2">
                                            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
                                            <SelectValue placeholder="All Attendance" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300 rounded-xl">
                                        <SelectItem value="all">All Attendance</SelectItem>
                                        <SelectItem value="present">Checked In (Present)</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Branch Filter */}
                                <Select value={branchFilter} onValueChange={setBranchFilter}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-900 rounded-xl h-10 text-sm text-zinc-400 focus:ring-[#4285F4]/60">
                                        <SelectValue placeholder="All Branches" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300 rounded-xl">
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {branches.map(b => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Year Filter */}
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-900 rounded-xl h-10 text-sm text-zinc-400 focus:ring-[#4285F4]/60">
                                        <SelectValue placeholder="All Years" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300 rounded-xl">
                                        <SelectItem value="all">All Years</SelectItem>
                                        {years.map(y => (
                                            <SelectItem key={y} value={y}>{y} Year</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-0">
                            {/* Desktop Table View - Hidden on mobile */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-zinc-950/20 border-b border-zinc-900">
                                        <TableRow className="hover:bg-transparent border-zinc-900">
                                            <TableHead className="w-12 text-zinc-500 font-bold uppercase tracking-wider text-[10px] pl-6"></TableHead>
                                            <TableHead className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Participant Info</TableHead>
                                            <TableHead className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Roll Number</TableHead>
                                            <TableHead className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Branch / Year</TableHead>
                                            <TableHead className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Registration Date</TableHead>
                                            <TableHead className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                                            <TableHead className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] text-right pr-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRegistrations.length > 0 ? (
                                            filteredRegistrations.map(reg => (
                                                <TableRow key={reg.id} className="border-zinc-900 hover:bg-zinc-900/10 group transition-colors">
                                                    {/* Avatar */}
                                                    <TableCell className="pl-6 py-4">
                                                        <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold ${getAvatarColor(reg.name)}`}>
                                                            {getInitials(reg.name)}
                                                        </div>
                                                    </TableCell>
                                                    {/* Info */}
                                                    <TableCell className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-zinc-200">{reg.name}</span>
                                                            <span className="text-xs text-zinc-500 font-medium mt-0.5">{reg.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    {/* Roll No */}
                                                    <TableCell className="py-4 font-mono text-xs text-zinc-400">
                                                        {reg.rollNo}
                                                    </TableCell>
                                                    {/* Branch / Year */}
                                                    <TableCell className="py-4 text-xs font-semibold text-zinc-300">
                                                        {reg.branch} <span className="text-zinc-500 mx-1">•</span> {reg.yearOfStudy} Year
                                                    </TableCell>
                                                    {/* Date */}
                                                    <TableCell className="py-4 text-xs text-zinc-500 font-medium">
                                                        {format(new Date(reg.registeredAt), "MMM d, yyyy")}
                                                    </TableCell>
                                                    {/* Status Badge */}
                                                    <TableCell className="py-4">
                                                        {reg.checkedIn ? (
                                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0.5 px-2.5 font-bold uppercase tracking-widest text-[9px]">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block" />
                                                                Present
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-zinc-900 text-zinc-500 border-zinc-800 py-0.5 px-2.5 font-bold uppercase tracking-widest text-[9px]">
                                                                Absent
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    {/* Actions */}
                                                    <TableCell className="text-right pr-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button 
                                                                onClick={() => setDeletingReg({ id: reg.id, name: reg.name, userId: (reg as any).userId })} 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
                                                                title={`Remove ${reg.name}`}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-[#4285F4] hover:bg-zinc-900 border border-transparent hover:border-zinc-800" title={`Call ${reg.name}`}>
                                                                <a href={`tel:${reg.phone}`}>
                                                                    <Phone className="h-3.5 w-3.5" />
                                                                </a>
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleToggleCheckIn(reg.id, !!reg.checkedIn)}
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={togglingId === reg.id}
                                                                className={`h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border-zinc-800 bg-zinc-950 ${
                                                                    reg.checkedIn
                                                                        ? 'hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-zinc-400'
                                                                        : 'hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 text-emerald-400'
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
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-32 text-zinc-500 font-semibold uppercase tracking-wider text-xs">
                                                    {hasActiveFilters ? 'No registrations match the filters.' : 'No registrations found.'}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card Grid View - Visible on mobile/tablet */}
                            <div className="block md:hidden p-4 space-y-4 max-h-[60vh] overflow-y-auto bg-black">
                                {filteredRegistrations.length > 0 ? (
                                    filteredRegistrations.map(reg => (
                                        <Card key={reg.id} className="border-zinc-900 bg-zinc-950/60 p-4 rounded-xl space-y-3.5 shadow-md">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-2.5 items-center">
                                                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(reg.name)}`}>
                                                        {getInitials(reg.name)}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-extrabold text-sm text-zinc-200 truncate">{reg.name}</span>
                                                        <span className="text-[10px] text-zinc-500 truncate">{reg.email}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    {reg.checkedIn ? (
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0.5 px-2 font-bold uppercase tracking-widest text-[8px] whitespace-nowrap">
                                                            Present
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-zinc-900 text-zinc-500 border-zinc-800 py-0.5 px-2 font-bold uppercase tracking-widest text-[8px] whitespace-nowrap">
                                                            Absent
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-900/60 font-medium">
                                                <div>
                                                    <span className="text-zinc-600 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Roll Number</span>
                                                    <span className="font-mono text-zinc-300">{reg.rollNo}</span>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-600 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Branch / Year</span>
                                                    <span className="text-zinc-300">{reg.branch} ({reg.yearOfStudy} Yr)</span>
                                                </div>
                                            </div>

                                            {/* Action footer */}
                                            <div className="flex justify-end gap-2 pt-1">
                                                <Button 
                                                    onClick={() => setDeletingReg({ id: reg.id, name: reg.name, userId: (reg as any).userId })}
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 border-zinc-900 bg-zinc-950 hover:bg-red-950/20 hover:text-red-500 rounded-lg text-zinc-400 text-xs w-10 p-0" 
                                                    title={`Remove ${reg.name}`}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button asChild variant="outline" size="sm" className="h-8 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 rounded-lg text-zinc-400 text-xs w-10 p-0" title={`Call ${reg.name}`}>
                                                    <a href={`tel:${reg.phone}`}>
                                                        <Phone className="h-3.5 w-3.5" />
                                                    </a>
                                                </Button>
                                                <Button
                                                    onClick={() => handleToggleCheckIn(reg.id, !!reg.checkedIn)}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={togglingId === reg.id}
                                                    className={`h-8 flex-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border-zinc-800 bg-zinc-950 ${
                                                        reg.checkedIn
                                                            ? 'hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-zinc-400'
                                                            : 'hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 text-emerald-400'
                                                    }`}
                                                >
                                                    {togglingId === reg.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : reg.checkedIn ? (
                                                        'Undo Check-In'
                                                    ) : (
                                                        'Check In Attendee'
                                                    )}
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-center py-12 text-zinc-500 font-semibold uppercase tracking-wider text-xs">
                                        No registrations match filters.
                                    </p>
                                )}
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
                    <ScanLine className="h-6 w-6 animate-pulse" />
                </Button>
            </div>

            {/* Live QR Scanner Dialog */}
            <QRScanner
                eventId={eventId}
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onCheckInSuccess={handleCheckInSuccess}
            />

            {/* 1. Event Analytics Dialog */}
            <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
                <DialogContent className="sm:max-w-xl bg-zinc-950 text-zinc-100 border-zinc-900 p-6 overflow-hidden max-h-[90vh] flex flex-col rounded-2xl">
                    <DialogHeader className="border-b border-zinc-900 pb-4">
                        <DialogTitle className="text-zinc-100 flex items-center gap-2 text-lg">
                            <BarChart3 className="h-5 w-5 text-[#FBBC04]" />
                            Registration Demographics
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 text-xs mt-0.5">
                            Real-time breakdown of registered students by branch and academic year.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
                        {/* Branch Statistics */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-[#4285F4]" />
                                Branch Breakdown
                            </h4>
                            <div className="space-y-2.5">
                                {analyticsData.branches.length === 0 ? (
                                    <p className="text-xs text-zinc-500 italic">No branch data available.</p>
                                ) : (
                                    analyticsData.branches.map(b => (
                                        <div key={b.name} className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-zinc-300">{b.name}</span>
                                                <span className="text-zinc-400">{b.count} student(s) <span className="text-zinc-600">({b.percent}%)</span></span>
                                            </div>
                                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                                                <div 
                                                    className="h-full bg-[#4285F4] rounded-full transition-all duration-500" 
                                                    style={{ width: `${b.percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <hr className="border-zinc-900" />

                        {/* Year of Study Statistics */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-[#34A853]" />
                                Academic Year Breakdown
                            </h4>
                            <div className="space-y-2.5">
                                {analyticsData.years.length === 0 ? (
                                    <p className="text-xs text-zinc-500 italic">No year data available.</p>
                                ) : (
                                    analyticsData.years.map(y => (
                                        <div key={y.name} className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-zinc-300">{y.name} Year</span>
                                                <span className="text-zinc-400">{y.count} student(s) <span className="text-zinc-600">({y.percent}%)</span></span>
                                            </div>
                                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                                                <div 
                                                    className="h-full bg-[#34A853] rounded-full transition-all duration-500" 
                                                    style={{ width: `${y.percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-zinc-900 pt-4 flex justify-end">
                        <Button 
                            onClick={() => setIsAnalyticsOpen(false)}
                            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-100 rounded-xl text-xs font-bold uppercase tracking-wider h-10 px-6"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. Bulk Check-In Dialog */}
            <Dialog open={isBulkCheckInOpen} onOpenChange={setIsBulkCheckInOpen}>
                <DialogContent className="sm:max-w-md bg-zinc-950 text-zinc-100 border-zinc-900 p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100 flex items-center gap-2 text-lg">
                            <CheckSquare className="h-5 w-5 text-emerald-500" />
                            Bulk Check-In
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 text-xs mt-0.5">
                            Enter multiple student roll numbers separated by commas or newlines to mark them present at once.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <Textarea 
                            placeholder="e.g.&#10;22A81A0501&#10;22A81A0502, 22A81A0503"
                            value={bulkRollNumbers}
                            onChange={(e) => setBulkRollNumbers(e.target.value)}
                            disabled={actionType === 'bulkCheckIn'}
                            className="min-h-36 bg-zinc-950 border-zinc-900 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-emerald-500 rounded-xl text-sm"
                        />

                        {actionType === 'bulkCheckIn' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-zinc-400 font-semibold">
                                    <span>Processing roll numbers...</span>
                                    <span>{bulkProgress.current} / {bulkProgress.total}</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            onClick={() => {
                                setIsBulkCheckInOpen(false);
                                setBulkRollNumbers('');
                            }}
                            variant="ghost"
                            disabled={actionType === 'bulkCheckIn'}
                            className="text-zinc-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleBulkCheckIn}
                            disabled={actionType === 'bulkCheckIn' || !bulkRollNumbers.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider px-6 h-10"
                        >
                            {actionType === 'bulkCheckIn' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing
                                </>
                            ) : (
                                'Verify & Check In'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 3. Confirm Reset Attendance Alert */}
            <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
                <AlertDialogContent className="bg-zinc-950 text-zinc-100 border-zinc-900 rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-zinc-100 flex items-center gap-2 text-lg">
                            <RotateCcw className="h-5 w-5 text-red-500 animate-spin-once" />
                            Reset All Attendance?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400 text-xs leading-relaxed">
                            This action will reset the check-in status of **all participants** back to **Absent**. Registered user tickets will remain valid. This action is irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-850 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleResetAllAttendance}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider px-6"
                        >
                            Reset Attendance
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 4. Confirm Delete Participant Alert */}
            <AlertDialog open={deletingReg !== null} onOpenChange={(open) => !open && setDeletingReg(null)}>
                <AlertDialogContent className="bg-zinc-950 text-zinc-100 border-zinc-900 rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-zinc-100 flex items-center gap-2 text-lg">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            Remove Participant?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400 text-xs leading-relaxed">
                            Are you sure you want to remove **{deletingReg?.name}** from the event? This will cancel their registration ticket and remove it from their profile. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-850 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteParticipant}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider px-6"
                        >
                            Remove Participant
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
