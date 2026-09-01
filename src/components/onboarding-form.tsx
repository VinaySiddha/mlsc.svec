"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, Linkedin } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const onboardingSchema = z.object({
  linkedin: z.string().url("A valid LinkedIn URL is required."),
  image: z
    .any()
    .refine((files) => files?.length == 1, "Profile image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  onComplete: (formData: FormData) => Promise<{error?: string}>;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      linkedin: "",
    },
  });

  const onSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('linkedin', values.linkedin);
    formData.append('image', values.image[0]);

    try {
      const result = await onComplete(formData);
      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        "Failed to complete profile onboarding",
        error,
        "OnboardingForm",
        "unknown"
      );
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-wider text-black">
                Member Profile Portrait <span className="text-[#EA4335]">*</span>
              </FormLabel>
              <FormControl>
                <div className="border-2 border-dashed border-black bg-zinc-50 p-4 text-center hover:bg-zinc-100 transition-colors">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files)}
                    className="border-none bg-transparent file:bg-[#FFE600] file:text-black file:border-2 file:border-black file:font-black file:text-xs file:uppercase file:px-3 file:py-1 file:mr-3 cursor-pointer shadow-none"
                    {...rest}
                  />
                </div>
              </FormControl>
              <FormDescription className="text-[10px] text-zinc-500 font-bold">
                Max 5MB (.jpg, .png, .webp). Used on your official ID card.
              </FormDescription>
              <FormMessage className="text-xs font-bold text-[#EA4335]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-wider text-black">
                LinkedIn Profile URL <span className="text-[#EA4335]">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="https://www.linkedin.com/in/your-profile" 
                    {...field} 
                    className="h-11 px-3 border-2 border-black bg-white text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs font-bold text-[#EA4335]" />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full h-12 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activating Membership Profile...
            </>
          ) : (
            "Complete Onboarding & Issue ID"
          )}
        </Button>
      </form>
    </Form>
  );
}
