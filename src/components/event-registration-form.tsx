
'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { registerForEvent } from '@/app/actions';
import { createEventRegistrationOrderAction } from '@/app/actions/cashfree-actions';
import Script from 'next/script';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, Users, LogIn, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logClientError } from '@/lib/error-logger';

const branches = ["AIML", "CAI", "CIVIL", "CSDS", "CSE", "CST", "ECE", "ECT", "EEE", "MECH"];
const years = ["1st", "2nd", "3rd", "4th"];

const registrationSchema = z.object({
    name: z.string().min(2, 'Name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    rollNo: z.string().min(1, 'Roll number is required.'),
    phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
    branch: z.string().min(1, "Please select your branch."),
    yearOfStudy: z.string().min(1, "Please select your year of study."),
});


type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface SeatLimits {
    branch?: Record<string, number>;
    year?: Record<string, number>;
}

interface EventRegistrationFormProps {
    eventId: string;
    registrationOpen: boolean;
    deadline?: string | null;
    limit?: number;
    currentCount?: number;
    seatLimits?: SeatLimits;
    registrationFee?: number;
}

export function EventRegistrationForm({ eventId, registrationOpen, deadline, limit, currentCount, seatLimits, registrationFee = 0 }: EventRegistrationFormProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
    const { user, loading: authLoading } = useAuth();
    const pathname = usePathname();

    const isLimitReached = (limit && currentCount != null) ? currentCount >= limit : false;

    useEffect(() => {
        if (deadline) {
            const checkDeadline = () => {
                if (new Date() > new Date(deadline)) {
                    setIsDeadlinePassed(true);
                }
            };
            checkDeadline();
            const interval = setInterval(checkDeadline, 1000);
            return () => clearInterval(interval);
        }
    }, [deadline]);

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: { name: '', email: '', rollNo: '', phone: '', branch: '', yearOfStudy: '' },
    });

    useEffect(() => {
        if (user) {
            if (user.displayName) form.setValue('name', user.displayName);
            if (user.email) form.setValue('email', user.email);
        }
    }, [user, form]);

    const onSubmit = async (values: RegistrationFormValues) => {
        setIsSubmitting(true);
        try {
            if (registrationFee && registrationFee > 0) {
                toast({
                    title: "Initializing Payment",
                    description: "Connecting to secure Cashfree portal...",
                });
                
                const originUrl = window.location.origin;
                const res = await createEventRegistrationOrderAction({
                    eventId,
                    userId: user?.uid,
                    registrationData: values,
                    originUrl,
                });

                if (!res.success || !res.paymentSessionId) {
                    setIsSubmitting(false);
                    toast({
                        variant: "destructive",
                        title: "Checkout Error",
                        description: res.error || "Failed to initialize payment order.",
                    });
                    return;
                }

                const cashfree = (window as any).Cashfree({
                    mode: res.mode || 'production',
                });
                
                cashfree.checkout({
                    paymentSessionId: res.paymentSessionId,
                    redirectTarget: '_self'
                });
            } else {
                const result = await registerForEvent(eventId, values, user?.uid);
                if (result.error) {
                    throw new Error(result.error);
                }
                toast({
                    title: 'Registration Successful!',
                    description: "We've received your registration for the event.",
                });
                setOpen(false);
                form.reset();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            await logClientError(
                `Failed to register student for event ${eventId}`,
                error,
                "EventRegistrationForm",
                user?.email || values.email || "unknown"
            );
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLimitReached) {
        return (
            <div className="w-full py-3 px-4 bg-[#F9F9FB] border-2 border-black text-zinc-700 font-mono font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                [ REGISTRATIONS FULL ]
            </div>
        )
    }

    if (!registrationOpen || isDeadlinePassed) {
        return (
            <div className="w-full py-3 px-4 bg-[#F9F9FB] border-2 border-black text-zinc-700 font-mono font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                [ REGISTRATIONS CLOSED ]
            </div>
        )
    }

    if (authLoading) {
        return (
            <div className="w-full py-3 px-4 bg-[#F9F9FB] border-2 border-black text-zinc-700 font-mono font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                [ VERIFYING SESSION... ]
            </div>
        )
    }

    if (!user) {
        return (
            <Link 
                href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
                className="w-full py-3.5 px-4 bg-[#FFE600] text-black font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
                <LogIn className="h-4 w-4 stroke-[3]" />
                SIGN IN TO REGISTER [↗]
            </Link>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="w-full py-3.5 px-4 bg-[#00FF66] text-black font-black text-xs uppercase tracking-widest text-center border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer">
                    {registrationFee && registrationFee > 0 ? `REGISTER (₹${registrationFee}) [↗]` : 'CLAIM FREE PASS [↗]'}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md md:max-w-lg bg-white border-2 border-black shadow-[10px_10px_0px_0px_#4285F4] p-6 text-black font-sans rounded-none">
                <DialogHeader className="border-b-2 border-black pb-4">
                    <div className="inline-block px-3 py-0.5 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black mb-2 w-fit">
                        [ RSVP VERIFICATION ]
                    </div>
                    <DialogTitle className="text-2xl font-display font-black uppercase italic tracking-tight text-black">
                        REGISTER FOR EVENT
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-700 font-semibold">
                        Confirm your participant credentials below to secure your seat.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-3">
                        <div className="max-h-[55vh] overflow-y-auto pr-2 -mr-2 space-y-4 py-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Full Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="John Doe" 
                                                    {...field} 
                                                    className="bg-white border-2 border-black text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] text-xs h-10 rounded-none"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-600 text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Email</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="john.doe@example.com" 
                                                    {...field} 
                                                    className="bg-white border-2 border-black text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] text-xs h-10 rounded-none"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-600 text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rollNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Roll No</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="e.g., 22A91A4201" 
                                                    {...field} 
                                                    className="bg-white border-2 border-black text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] text-xs h-10 rounded-none"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-600 text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Phone Number</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="10-digit number" 
                                                    {...field} 
                                                    className="bg-white border-2 border-black text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] text-xs h-10 rounded-none"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-600 text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="branch"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Branch</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white border-2 border-black text-black focus:border-[#4285F4] text-xs h-10 rounded-none">
                                                        <SelectValue placeholder="Select Branch" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-2 border-black text-black rounded-none">
                                                    {branches.map(branch => <SelectItem key={branch} value={branch} className="text-xs focus:bg-[#FFE600] focus:text-black">{branch}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            {field.value && seatLimits?.branch?.[field.value] && (
                                                <p className="text-[10px] font-mono text-zinc-800 font-bold flex items-center gap-1">
                                                    <Info className="h-3 w-3 text-blue-600" />
                                                    Seats limited for {field.value} ({seatLimits.branch[field.value]} max)
                                                </p>
                                            )}
                                            <FormMessage className="text-red-600 text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="yearOfStudy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Year of Study</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white border-2 border-black text-black focus:border-[#4285F4] text-xs h-10 rounded-none">
                                                        <SelectValue placeholder="Select Year" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-2 border-black text-black rounded-none">
                                                    {years.map(year => <SelectItem key={year} value={year} className="text-xs focus:bg-[#FFE600] focus:text-black">{year}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            {field.value && seatLimits?.year?.[field.value] && (
                                                <p className="text-[10px] font-mono text-zinc-800 font-bold flex items-center gap-1">
                                                    <Info className="h-3 w-3 text-blue-600" />
                                                    Seats limited for {field.value} year ({seatLimits.year[field.value]} max)
                                                </p>
                                            )}
                                            <FormMessage className="text-red-600 text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter className="border-t-2 border-black pt-4 flex items-center justify-end gap-2">
                            <DialogClose asChild>
                                <button type="button" className="px-4 py-2 text-xs font-black uppercase tracking-wider text-zinc-600 hover:text-black border-2 border-transparent hover:border-black">
                                    CANCEL
                                </button>
                            </DialogClose>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {registrationFee && registrationFee > 0 ? `PAY ₹${registrationFee} & CONFIRM [↗]` : 'CONFIRM REGISTRATION [↗]'}
                            </button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
            <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
        </Dialog>
    );
}
