
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Switch } from "./ui/switch";
import { Card, CardContent } from "./ui/card";
import { Image } from "./image";

const speakerSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Speaker name is required."),
    image: z.any().optional(),
    existingImageUrl: z.string().optional(),
});

const timelineEntrySchema = z.object({
    id: z.string().optional(),
    time: z.string().min(1, "Time is required."),
    description: z.string().min(3, "Description is required."),
});

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  date: z.date({ required_error: "A date for the event is required." }),
  time: z.string().min(1, "Time is required (e.g., 10:00 AM)."),
  venue: z.string().min(3, "Venue is required."),
  image: z.any().optional(),
  registrationOpen: z.boolean().default(false),
  speakers: z.array(speakerSchema).optional(),
  timeline: z.array(timelineEntrySchema).optional(),
});

type FormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    event?: (Omit<FormValues, 'speakers' | 'timeline'> & { id: string, speakers?: {name: string, image: string}[], timeline?: {time: string, description: string}[] });
}

export function EventForm({ event }: EventFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const uniqueId = useId();

    const getInitialSpeakers = () => {
        if (event && Array.isArray(event.speakers)) {
            return event.speakers.map((s, i) => ({ 
                id: `${uniqueId}-speaker-${i}`, 
                name: s.name, 
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
            date: event?.date ? new Date(event.date) : new Date(),
            time: event?.time || "",
            venue: event?.venue || "",
            image: undefined,
            registrationOpen: event?.registrationOpen || false,
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
        
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('date', values.date.toISOString());
        formData.append('time', values.time);
        formData.append('venue', values.venue);
        formData.append('registrationOpen', String(values.registrationOpen));
        
        if (values.image && values.image.length > 0) {
            formData.append('image', values.image[0]);
        }
        
        const speakersToSave = values.speakers?.map((s, index) => {
            if (s.image && s.image.length > 0) {
                formData.append(`speaker_image_${index}`, s.image[0]);
                return { name: s.name, image: '' }; 
            }
            return { name: s.name, image: s.existingImageUrl || '' };
        }) || [];
        formData.append('speakers', JSON.stringify(speakersToSave));
        
        const timelineToSave = values.timeline?.map(t => ({ time: t.time, description: t.description })) || [];
        formData.append('timeline', JSON.stringify(timelineToSave));

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
                                <Textarea
                                    placeholder="A brief description of the event."
                                    className="resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormLabel>Cover Image</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
                            </FormControl>
                            <FormDescription>
                                {event?.image && <span className="text-xs">Current image is set. Upload a new one to replace it.</span>}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
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
                                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
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
                                        name={`speakers.${index}.image`}
                                        render={({ field: { onChange, value, ...rest }}) => (
                                            <FormItem>
                                                <FormLabel>Speaker Image</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    {item.existingImageUrl && !value?.[0] && <Image src={item.existingImageUrl} alt="Current speaker image" width={40} height={40} className="rounded-full object-cover" />}
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
                    <Button type="button" variant="outline" onClick={() => appendSpeaker({ name: '', image: undefined, id: `${uniqueId}-speaker-${speakerFields.length}` })}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Speaker
                    </Button>
                </div>


                <div className="flex flex-col sm:flex-row gap-4">
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
                                    "w-full sm:w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
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
                        name="registrationOpen"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
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
