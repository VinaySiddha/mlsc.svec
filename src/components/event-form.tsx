
"use client";

import { useState, useId } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Loader2, Trash2, PlusCircle, User, Clock } from "lucide-react";

import { createEvent, updateEvent } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { logClientError } from "@/lib/error-logger";
import { useAuth } from "@/lib/auth-context";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Switch } from "./ui/switch";
import { Card, CardContent } from "./ui/card";
import { Image } from "./image";

const speakerSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Speaker name is required."),
    title: z.string().min(2, "Speaker title is required."),
    image: z.any().optional(),
    existingImageUrl: z.string().optional(),
});

const timelineEntrySchema = z.object({
    id: z.string().optional(),
    time: z.string().min(1, "Time is required."),
    description: z.string().min(3, "Description is required."),
});

const EVENT_CATEGORIES = ['Workshop', 'Bootcamp', 'Hackathon', 'Community', 'Talk', 'Other'] as const;

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.enum(EVENT_CATEGORIES).default('Workshop'),
  date: z.date({ required_error: "An event date is required." }),
  time: z.string().min(1, "Time is required (e.g., 10:00 AM)."),
  venue: z.string().min(3, "Venue is required."),
  eventLink: z.string().url("A valid URL is required for the event link.").optional().or(z.literal("")),
  feedbackLink: z.string().url("A valid URL is required for the feedback link.").optional().or(z.literal("")),
  bannerImage: z.any().optional(),
  listImage: z.any().optional(),
  highlightImages: z.any().optional(),
  registrationOpen: z.boolean().default(false),
  registrationDeadline: z.date().optional(),
  registrationLimit: z.coerce.number().min(0, "Registration limit must be a positive number.").optional(),
  speakers: z.array(speakerSchema).optional(),
  timeline: z.array(timelineEntrySchema).optional(),
});

type FormValues = z.infer<typeof eventFormSchema>;

const branches = ["AIML", "CAI", "CIVIL", "CSDS", "CSE", "CST", "ECE", "ECT", "EEE", "MECH"];
const years = ["1st", "2nd", "3rd", "4th"];

interface SeatLimits {
    branch?: Record<string, number>;
    year?: Record<string, number>;
}

interface EventFormProps {
    event?: (Omit<FormValues, 'speakers' | 'timeline' | 'bannerImage' | 'listImage' | 'highlightImages'> & {
        id: string,
        speakers?: {name: string, title: string, image: string}[],
        timeline?: {time: string, description: string}[],
        bannerImage?: string,
        listImage?: string,
        highlightImages?: string[],
        seatLimits?: SeatLimits,
    });
}

export function EventForm({ event }: EventFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notifyUsers, setNotifyUsers] = useState(false);
    const [seatLimitsEnabled, setSeatLimitsEnabled] = useState(
        !!(event?.seatLimits?.branch && Object.keys(event.seatLimits.branch).length > 0) ||
        !!(event?.seatLimits?.year && Object.keys(event.seatLimits.year).length > 0)
    );
    const [branchLimits, setBranchLimits] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        branches.forEach(b => { init[b] = event?.seatLimits?.branch?.[b]?.toString() || ''; });
        return init;
    });
    const [yearLimits, setYearLimits] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        years.forEach(y => { init[y] = event?.seatLimits?.year?.[y]?.toString() || ''; });
        return init;
    });
    const { toast } = useToast();
    const uniqueId = useId();

    const getInitialSpeakers = () => {
        if (event && Array.isArray(event.speakers)) {
            return event.speakers.map((s, i) => ({ 
                id: `${uniqueId}-speaker-${i}`, 
                name: s.name,
                title: s.title,
                image: undefined, 
                existingImageUrl: s.image 
            }));
        }
        return [];
    };

    const getInitialTimeline = () => {
        if (event && Array.isArray(event.timeline)) {
            return event.timeline.map((t, i) => ({
                id: `${uniqueId}-timeline-${i}`,
                time: t.time,
                description: t.description,
            }));
        }
        return [];
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: event?.title || "",
            description: event?.description || "",
            category: (event as any)?.category || 'Workshop',
            date: event?.date ? new Date(event.date) : new Date(),
            time: event?.time || "",
            venue: event?.venue || "",
            eventLink: event?.eventLink || "",
            feedbackLink: event?.feedbackLink || "",
            bannerImage: undefined,
            listImage: undefined,
            highlightImages: undefined,
            registrationOpen: event?.registrationOpen || false,
            registrationDeadline: event?.registrationDeadline ? new Date(event.registrationDeadline) : undefined,
            registrationLimit: event?.registrationLimit || 0,
            speakers: getInitialSpeakers(),
            timeline: getInitialTimeline(),
        },
    });

    const { fields: speakerFields, append: appendSpeaker, remove: removeSpeaker } = useFieldArray({
        control: form.control,
        name: "speakers",
    });

    const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
        control: form.control,
        name: "timeline",
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        const formData = new FormData();
        
        // Append all simple key-value pairs
        Object.entries(values).forEach(([key, value]) => {
            if (key === 'date' || key === 'registrationDeadline') {
                if (value) formData.append(key, (value as Date).toISOString());
            } else if (!['speakers', 'timeline', 'bannerImage', 'listImage', 'highlightImages'].includes(key)) {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            }
        });
        
        // Handle file uploads
        if (values.bannerImage && values.bannerImage.length > 0) formData.append('bannerImage', values.bannerImage[0]);
        if (values.listImage && values.listImage.length > 0) formData.append('listImage', values.listImage[0]);
        if (values.highlightImages) {
            for (let i = 0; i < values.highlightImages.length; i++) {
                formData.append('highlightImages', values.highlightImages[i]);
            }
        }
        
        const speakersToSave = values.speakers?.map((s, index) => {
            if (s.image && s.image.length > 0) {
                formData.append(`speaker_image_${index}`, s.image[0]);
            }
            // The existing image URL is handled on the server side
            return { name: s.name, title: s.title, existingImageUrl: s.existingImageUrl };
        }) || [];
        formData.append('speakers', JSON.stringify(speakersToSave));
        
        const timelineToSave = values.timeline?.map(t => ({ time: t.time, description: t.description })) || [];
        formData.append('timeline', JSON.stringify(timelineToSave));

        if (seatLimitsEnabled) {
            const seatLimits: SeatLimits = {};
            const branchEntries = Object.entries(branchLimits).filter(([, v]) => v && parseInt(v) > 0);
            if (branchEntries.length > 0) {
                seatLimits.branch = Object.fromEntries(branchEntries.map(([k, v]) => [k, parseInt(v)]));
            }
            const yearEntries = Object.entries(yearLimits).filter(([, v]) => v && parseInt(v) > 0);
            if (yearEntries.length > 0) {
                seatLimits.year = Object.fromEntries(yearEntries.map(([k, v]) => [k, parseInt(v)]));
            }
            if (seatLimits.branch || seatLimits.year) {
                formData.append('seatLimits', JSON.stringify(seatLimits));
            }
        }

        if (notifyUsers && !event) {
            formData.append('notifyUsers', 'true');
        }

        try {
            const result = event ? await updateEvent(event.id, formData) : await createEvent(formData);

            if (result.error) {
                throw new Error(result.error);
            }

            toast({
                title: event ? "Event Updated!" : "Event Created!",
                description: `The event "${values.title}" has been saved.`,
            });
            router.push('/admin/events');
            router.refresh();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            await logClientError(
                event ? `Failed to update event: ${values.title}` : `Failed to create event: ${values.title}`,
                error,
                "EventForm",
                user?.email || "unknown"
            );
            toast({
                variant: "destructive",
                title: "Something went wrong.",
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., AI Hackathon" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Description</FormLabel>
                            <FormControl>
                                <InputGroup className="bg-white/5 border-white/10">
                                    <InputGroupTextarea
                                        placeholder="A brief description of the event."
                                        className="min-h-32 text-sm text-white focus-visible:ring-0 placeholder:text-white/30"
                                        {...field}
                                    />
                                    <InputGroupAddon align="block-end" className="border-white/10 bg-white/5">
                                        <InputGroupText className="text-white/40 tabular-nums">
                                            {(field.value || "").length} characters
                                        </InputGroupText>
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Category</FormLabel>
                            <select
                                {...field}
                                className="flex h-11 w-full rounded-xl border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm text-white focus:bg-black focus-visible:outline-none focus-visible:border-[#4285F4]/60 focus-visible:ring-1 focus-visible:ring-[#4285F4]/60 focus-visible:shadow-[0_0_12px_rgba(66,133,244,0.25)] transition-all duration-200"
                            >
                                {EVENT_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat} className="bg-black text-white">{cat}</option>
                                ))}
                            </select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="listImage"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>List Image (4:3 aspect ratio)</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
                                </FormControl>
                                <FormDescription>
                                    {event?.listImage && <span className="text-xs">Current list image is set. Upload a new one to replace it.</span>}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bannerImage"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Banner Image (16:9 aspect ratio)</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
                                </FormControl>
                                <FormDescription>
                                    {event?.bannerImage && <span className="text-xs">Current banner image is set. Upload a new one to replace it.</span>}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="venue"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Venue / Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., SVEC Auditorium" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 10:00 AM - 1:00 PM" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <FormLabel>Timeline</FormLabel>
                     <div className="space-y-4">
                        {timelineFields.map((item, index) => (
                            <Card key={item.id} className="p-4 relative">
                                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <FormField
                                        control={form.control}
                                        name={`timeline.${index}.time`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time</FormLabel>
                                                <FormControl><Input placeholder="e.g. 10:00 AM" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`timeline.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl><Input placeholder="e.g. Keynote Speech" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removeTimeline(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                     <Button type="button" variant="outline" onClick={() => appendTimeline({ time: '', description: '' })}>
                        <Clock className="mr-2 h-4 w-4"/> Add Timeline Entry
                    </Button>
                </div>
                
                 <div className="space-y-4">
                    <FormLabel>Speakers</FormLabel>
                    <div className="space-y-4">
                        {speakerFields.map((item, index) => (
                            <Card key={item.id} className="p-4 relative">
                                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                    <FormField
                                        control={form.control}
                                        name={`speakers.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Speaker Name</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name={`speakers.${index}.title`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Speaker Title</FormLabel>
                                                <FormControl><Input placeholder="e.g. Host" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`speakers.${index}.image`}
                                        render={({ field: { onChange, value, ...rest }}) => (
                                            <FormItem>
                                                <FormLabel>Speaker Image</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    {item.existingImageUrl && !value?.[0] && <Image src={item.existingImageUrl} alt="Current speaker image" width={40} height={40} className="rounded-full object-cover" style={{ height: 'auto' }} />}
                                                    <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removeSpeaker(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <Button type="button" variant="outline" onClick={() => appendSpeaker({ name: '', title: '', image: undefined, id: `${uniqueId}-speaker-${speakerFields.length}` })}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Speaker
                    </Button>
                </div>
                
                 <div className="space-y-4">
                    <FormLabel>Event Links</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="eventLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Link</FormLabel>
                                    <FormControl><Input placeholder="e.g., WhatsApp/Meet link" {...field} /></FormControl>
                                    <FormDescription>This link is sent in confirmation/reminder emails.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="feedbackLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Feedback Link</FormLabel>
                                    <FormControl><Input placeholder="e.g., Google Form link" {...field} /></FormControl>
                                    <FormDescription>This link is sent in post-event feedback emails.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                     <FormLabel>Event Gallery</FormLabel>
                     <FormField
                        control={form.control}
                        name="highlightImages"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="file" accept="image/*" multiple onChange={(e) => onChange(e.target.files)} {...rest} />
                                </FormControl>
                                <FormDescription>
                                    {event?.highlightImages && event.highlightImages.length > 0 && <span className="text-xs">Current gallery has {event.highlightImages.length} images. Uploading new images will replace them.</span>}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Event Date</FormLabel>
                            <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full sm:w-[240px] pl-4 text-left font-normal h-11 rounded-xl border border-white/10 bg-[#0A0A0A]/80 hover:bg-[#111111]/80 hover:border-white/20 text-white transition-all duration-200 focus:outline-none focus:border-[#4285F4]/60 focus:ring-1 focus:ring-[#4285F4]/60",
                                    !field.value && "text-white/35"
                                    )}
                                >
                                    {field.value ? (
                                    format(field.value, "PPP")
                                    ) : (
                                    <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                />
                            </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="registrationDeadline"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Registration Deadline (Optional)</FormLabel>
                            <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full sm:w-[240px] pl-4 text-left font-normal h-11 rounded-xl border border-white/10 bg-[#0A0A0A]/80 hover:bg-[#111111]/80 hover:border-white/20 text-white transition-all duration-200 focus:outline-none focus:border-[#4285F4]/60 focus:ring-1 focus:ring-[#4285F4]/60",
                                    !field.value && "text-white/35"
                                    )}
                                >
                                    {field.value ? (
                                    format(field.value, "PPP")
                                    ) : (
                                    <span>Pick a deadline</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                />
                            </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="registrationLimit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Registration Limit (Optional)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl>
                                <FormDescription>Set to 0 for unlimited registrations.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="registrationOpen"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/[0.08] bg-[#0A0A0A]/40 p-4 transition-colors hover:bg-white/[0.02]">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-sm font-semibold tracking-wide text-white/80">
                                        Open Registrations
                                    </FormLabel>
                                    <FormMessage />
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex flex-row items-center justify-between rounded-xl border border-white/[0.08] bg-[#0A0A0A]/40 p-4 transition-colors hover:bg-white/[0.02]">
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold tracking-wide text-white/80">Seat Limits by Branch / Year</p>
                            <p className="text-xs text-white/45">Optionally restrict how many students from each branch or year can register</p>
                        </div>
                        <Switch checked={seatLimitsEnabled} onCheckedChange={setSeatLimitsEnabled} />
                    </div>

                    {seatLimitsEnabled && (
                        <Card className="p-4">
                            <CardContent className="p-0 space-y-6">
                                <div>
                                    <p className="text-sm font-medium mb-3 text-white/70">Branch Limits</p>
                                    <p className="text-xs text-white/45 mb-3">Leave blank for no restriction on that branch.</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        {branches.map(b => (
                                            <div key={b} className="space-y-1">
                                                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">{b}</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="--"
                                                    value={branchLimits[b]}
                                                    onChange={(e) => setBranchLimits(prev => ({ ...prev, [b]: e.target.value }))}
                                                    className="h-9 text-xs rounded-lg py-1 px-3 bg-[#0A0A0A]/80 border-white/10"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium mb-3 text-white/70">Year Limits</p>
                                    <p className="text-xs text-white/45 mb-3">Leave blank for no restriction on that year.</p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {years.map(y => (
                                            <div key={y} className="space-y-1">
                                                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">{y} Year</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="--"
                                                    value={yearLimits[y]}
                                                    onChange={(e) => setYearLimits(prev => ({ ...prev, [y]: e.target.value }))}
                                                    className="h-9 text-xs rounded-lg py-1 px-3 bg-[#0A0A0A]/80 border-white/10"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {!event && (
                    <div className="flex flex-row items-center justify-between rounded-xl border border-white/[0.08] bg-[#0A0A0A]/40 p-4 transition-colors hover:bg-white/[0.02]">
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold tracking-wide text-white/80">Notify Users</p>
                            <p className="text-xs text-white/45">Send email notification to all registered users about this event</p>
                        </div>
                        <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} />
                    </div>
                )}

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        event ? "Update Event" : "Create Event"
                    )}
                </Button>
            </form>
        </Form>
    );
}
