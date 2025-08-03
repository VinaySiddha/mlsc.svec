
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { inviteTeamMember, updateTeamMember } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const teamMemberInviteSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required to send the invite."),
  role: z.string().min(2, "Role is required."),
  categoryId: z.string({ required_error: "Please select a category." }),
});

const teamMemberUpdateSchema = teamMemberInviteSchema.extend({
    image: z.any().optional(), // Optional on update
    linkedin: z.string().url("A valid LinkedIn URL is required.").or(z.literal('')),
}).refine(data => {
    // If image is a FileList, validate it. If it's a string (URL) or undefined, skip validation.
    if (data.image instanceof FileList && data.image.length > 0) {
        const file = data.image[0];
        return ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;
    }
    return true;
}, { 
    message: `Invalid file. Accepted types: .jpg, .png, .webp. Max size: 5MB.`,
    path: ['image'] 
});


type InviteFormValues = z.infer<typeof teamMemberInviteSchema>;
type UpdateFormValues = z.infer<typeof teamMemberUpdateSchema>;


interface TeamMemberFormProps {
    member?: UpdateFormValues & { id: string };
    categories: { id: string, name: string, subDomain: string }[];
    isAdmin?: boolean;
}

export function TeamMemberForm({ member, categories, isAdmin = true }: TeamMemberFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const isUpdateMode = !!member;
    const schema = isUpdateMode ? teamMemberUpdateSchema : teamMemberInviteSchema;
    
    type FormValues = z.infer<typeof schema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: isUpdateMode ? {
            ...member,
            image: undefined, // Clear image field on update form
            linkedin: member.linkedin || ''
        } : {
            name: "",
            role: "",
            email: "",
            categoryId: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        const formData = new FormData();
        
        Object.entries(values).forEach(([key, value]) => {
            if (key === 'image' && value instanceof FileList && value.length > 0) {
                formData.append(key, value[0]);
            } else if (key !== 'image' && value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        try {
            let result;
            const redirectUrl = isAdmin ? '/admin/team' : '/team';

            if (isUpdateMode) {
                result = await updateTeamMember(member.id, formData);
            } else {
                result = await inviteTeamMember(values as InviteFormValues);
            }

            if (result.error) {
                throw new Error(result.error);
            }

            toast({
                title: isUpdateMode ? "Member Updated!" : "Invitation Sent!",
                description: `Team member "${(values as InviteFormValues).name}" has been saved successfully.`,
            });
            
            router.push(redirectUrl);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 {/* Fields editable by admin or when creating new */}
                <div className={cn("space-y-6")}>
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., John Doe" {...field} disabled={!isAdmin && isUpdateMode} />
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
                                    <Input type="email" placeholder="john.doe@example.com" {...field} disabled={!isAdmin && isUpdateMode} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                 <FormControl>
                                     <Input placeholder="e.g., Club Lead" {...field} disabled={!isAdmin}/>
                                 </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name} - {cat.subDomain}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                 {/* Fields for updating image and linkedin, only shown in update mode */}
                {isUpdateMode && (
                    <div className="space-y-6">
                         <FormField
                            control={form.control}
                            name="image"
                            render={({ field: { onChange, ...rest } }) => (
                                <FormItem>
                                    <FormLabel>New Profile Image (Optional)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => onChange(e.target.files)}
                                            {...rest}
                                        />
                                    </FormControl>
                                    <FormDescription>Upload a new image to replace the current one.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="linkedin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LinkedIn Profile URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://linkedin.com/in/..." {...field as any} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        isUpdateMode ? "Update Profile" : "Send Invitation"
                    )}
                </Button>
            </form>
        </Form>
    );
}
