
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { createTeamCategory, updateTeamCategory } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const teamCategorySchema = z.object({
  name: z.string().min(2, "Category name is required."),
  order: z.coerce.number().min(0, "Order must be a positive number."),
  type: z.enum(["Core", "Technical", "Non-Technical"], { required_error: "Please select a category type."}),
});

type FormValues = z.infer<typeof teamCategorySchema>;

interface TeamCategoryFormProps {
    category?: FormValues & { id: string };
}

const categoryTypes = ["Core", "Technical", "Non-Technical"];

export function TeamCategoryForm({ category }: TeamCategoryFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(teamCategorySchema),
        defaultValues: {
            name: category?.name || "",
            order: category?.order || 0,
            type: category?.type || undefined,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            let result;
            if (category) {
                result = await updateTeamCategory(category.id, values);
            } else {
                result = await createTeamCategory(values);
            }

            if (result.error) {
                throw new Error(result.error);
            }

            toast({
                title: category ? "Category Updated!" : "Category Created!",
                description: `The category "${values.name}" has been saved successfully.`,
            });
            router.push('/admin/team/categories');
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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Core Team" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                             <FormDescription>
                                Lower numbers appear first within each group (Core, Technical, etc.).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Category Type *</FormLabel>
                     <FormDescription>
                        This controls where the category appears on the team page.
                    </FormDescription>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        >
                        {categoryTypes.map(type => (
                             <FormItem key={type} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={type} />
                                </FormControl>
                                <FormLabel className="font-normal">{type}</FormLabel>
                            </FormItem>
                        ))}
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />


                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        category ? "Update Category" : "Create Category"
                    )}
                </Button>
            </form>
        </Form>
    );
}
