"use client";

import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { updateUserProfile } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

const profileFormSchema = z.object({
    previousRepresentations: z.string().optional(),
    receiveEmailUpdates: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfileFormProps {
    userId: string;
}

export function UserProfileForm({ userId }: UserProfileFormProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userProfileRef = useMemo(() => doc(firestore, "users", userId), [firestore, userId]);
    
    const { data: userProfile, isLoading } = useDoc<{
        previousRepresentations?: string;
        receiveEmailUpdates?: boolean;
    }>(userProfileRef);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            previousRepresentations: "",
            receiveEmailUpdates: false,
        },
    });

    useEffect(() => {
        if (userProfile) {
            form.reset({
                previousRepresentations: userProfile.previousRepresentations || "",
                receiveEmailUpdates: userProfile.receiveEmailUpdates || false,
            });
        }
    }, [userProfile, form]);
    
    const onSubmit = async (values: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await updateUserProfile(userId, values);
            if (result.error) {
                throw new Error(result.error);
            }
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
             <div className="space-y-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-24" />
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <FormField
                    control={form.control}
                    name="previousRepresentations"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Previous Representations</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Tell us about any previous roles or representations you've held in other clubs or organizations."
                                className="resize-y"
                                {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                This helps us understand your experience and background.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="receiveEmailUpdates"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                Email Updates
                                </FormLabel>
                                <FormDescription>
                                Receive notifications about club activities, events, and announcements.
                                </FormDescription>
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
                 <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </Form>
    );
}
