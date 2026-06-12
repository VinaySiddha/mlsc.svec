
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
    branch: z.string({ required_error: "Please select your branch." }),
    yearOfStudy: z.string({ required_error: "Please select your year of study." }),
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
}

export function EventRegistrationForm({ eventId, registrationOpen, deadline, limit, currentCount, seatLimits }: EventRegistrationFormProps) {
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
        defaultValues: { name: '', email: '', rollNo: '', phone: '' },
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
            <Button disabled className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Registrations Full
            </Button>
        )
    }

    if (!registrationOpen || isDeadlinePassed) {
        return (
            <Button disabled className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Registrations Closed
            </Button>
        )
    }

    if (authLoading) {
        return (
            <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        )
    }

    if (!user) {
        return (
            <Button asChild className="w-full">
                <Link href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in to Register
                </Link>
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">Register for this Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Register for Event</DialogTitle>
                    <DialogDescription>
                        Fill in your details below to register.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john.doe@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rollNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Roll No</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 22A91A4201" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="10-digit number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="branch"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Branch</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your branch" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {field.value && seatLimits?.branch?.[field.value] && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Info className="h-3 w-3" />
                                                Seats limited for {field.value} ({seatLimits.branch[field.value]} max)
                                            </p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="yearOfStudy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year of Study</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {field.value && seatLimits?.year?.[field.value] && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Info className="h-3 w-3" />
                                                Seats limited for {field.value} year ({seatLimits.year[field.value]} max)
                                            </p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Submit Registration
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
