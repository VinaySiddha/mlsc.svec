
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { saveApplicationReview } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const reviewSchema = z.object({
  status: z.string(),
  isTechSuitable: z.string(),
  isNonTechSuitable: z.string(),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof reviewSchema>;

interface ApplicationReviewFormProps {
  application: {
    id: string;
    status: string;
    technicalDomain: string;
    nonTechnicalDomain: string;
    review?: {
      isTechSuitable: 'yes' | 'no' | 'undecided';
      isNonTechSuitable: 'yes' | 'no' | 'undecided';
      remarks: string;
    };
  };
  domainLabels: Record<string, string>;
}

const applicationStatuses = ['Received', 'Under Review', 'Interviewing', 'Accepted', 'Rejected'];
const suitabilityOptions = [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
    { id: 'undecided', label: 'Undecided' },
];

export function ApplicationReviewForm({ application, domainLabels }: ApplicationReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: application.status ?? 'Received',
      isTechSuitable: application.review?.isTechSuitable ?? 'undecided',
      isNonTechSuitable: application.review?.isNonTechSuitable ?? 'undecided',
      remarks: application.review?.remarks ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        id: application.id,
        ...values,
      };

      const result = await saveApplicationReview(payload);

      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Review Saved!",
        description: "The applicant's review has been updated.",
      });

      // Refresh page to show new status badge
      window.location.reload();

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
    <Card>
        <CardHeader>
            <CardTitle>Application Review</CardTitle>
            <CardDescription>Update the applicant's status and suitability.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Application Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Update status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {applicationStatuses.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                  control={form.control}
                  name="isTechSuitable"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Suitable for {domainLabels[application.technicalDomain] || application.technicalDomain}?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          {suitabilityOptions.map(item => (
                            <FormItem key={item.id} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={item.id} />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="isNonTechSuitable"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Suitable for {domainLabels[application.nonTechnicalDomain] || application.nonTechnicalDomain}?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          {suitabilityOptions.map(item => (
                            <FormItem key={item.id} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={item.id} />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Add your comments about the interview..."
                            className="resize-y min-h-[100px]"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                    ) : (
                    "Save Review"
                    )}
                </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
