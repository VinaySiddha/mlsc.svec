
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

import { createEvent, updateEvent } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Switch } from "./ui/switch";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  date: z.date({
    required_error: "A date for the event is required.",
  }),
  image: z.any().optional(),
  registrationOpen: z.boolean().default(false),
  speakers: z.string().optional(),
  timeline: z.string().optional(),
  highlightImages: z.any().optional(),
});


type FormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    event?: (Omit<FormValues, 'image'|'highlightImages'|'date'> & { id: string; date: string; image?: string; highlightImages?: string[] });
}

export function EventForm({ event }: EventFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: event?.title || "",
            description: event?.description || "",
            date: event?.date ? new Date(event.date) : new Date(),
            image: undefined,
            registrationOpen: event?.registrationOpen || false,
            speakers: event?.speakers || "",
            timeline: event?.timeline || "",
            highlightImages: undefined,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        const formData = new FormData();
        
        Object.entries(values).forEach(([key, value]) => {
            if (key === 'image' && value && value.length > 0) {
                formData.append(key, value[0]);
            } else if (key === 'highlightImages' && value) {
                for(let i = 0; i < value.length; i++) {
                    formData.append(key, value[i]);
                }
            }
            else if (key === 'date' && value instanceof Date) {
                 formData.append(key, value.toISOString());
            } else if (key === 'registrationOpen') {
                if (value) formData.append(key, 'on');
            }
             else if (value) {
                formData.append(key, value as string);
            }
        });

        try {
            let result;
            if (event) {
                result = await updateEvent(event.id, formData);
            } else {
                result = await createEvent(formData);
            }

            if (result.error) {
                throw new Error(result.error);
            }

            toast({
                title: event ? "Event Updated!" : "Event Created!",
                description: `The event "${values.title}" has been saved successfully.`,
            });
            router.push('/admin/events');
            router.refresh();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Oh no! Something went wrong.",
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
                    render={({ field: { onChange, value, ...rest }}) => (
                        <FormItem>
                            <FormLabel>Cover Image</FormLabel>
                            <FormControl>
                               <Input type="file" accept="image/*" onChange={e => onChange(e.target.files)} {...rest}/>
                            </FormControl>
                            <FormDescription>This is the main image shown on the events list. {event?.image && "Leave blank to keep the current image."}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="speakers"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Speakers (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., John Doe, Jane Smith" {...field} />
                            </FormControl>
                            <FormDescription>Comma-separated list of speaker names.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Timeline (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="10:00 AM - Welcome Note&#x0a;10:30 AM - Session 1..."
                                    className="resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Enter each timeline item on a new line. This will be displayed on the event details page.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="highlightImages"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormLabel>Highlight Images (Optional)</FormLabel>
                             <FormControl>
                               <Input type="file" accept="image/*" multiple onChange={e => onChange(e.target.files)} {...rest}/>
                            </FormControl>
                            <FormDescription>These images will be displayed in a gallery. You can select multiple images. {event?.highlightImages && "New images will be added to the existing ones."}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />


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
