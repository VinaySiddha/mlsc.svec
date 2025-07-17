
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Star } from "lucide-react";

import { saveApplicationReview } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";


const reviewSchema = z.object({
  status: z.string(),
  isRecommended: z.boolean(),
  suitability: z.object({
    technical: z.string().optional(),
    nonTechnical: z.string().optional(),
  }),
  ratings: z.object({
    communication: z.number().min(0).max(5),
    technical: z.number().min(0).max(5),
    problemSolving: z.number().min(0).max(5),
    teamFit: z.number().min(0).max(5),
    overall: z.number().min(0).max(5),
  }),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof reviewSchema>;

interface ApplicationReviewFormProps {
  application: {
    id: string;
    status: string;
    isRecommended?: boolean;
    suitability?: {
      technical?: string;
      nonTechnical?: string;
    };
    ratings?: {
      communication: number;
      technical: number;
      problemSolving: number;
      teamFit: number;
      overall: number;
    };
    remarks?: string;
  };
  userRole: string;
}

const adminStatuses = ['Received', 'Under Processing', 'Interviewing', 'Hired', 'Rejected'];
const panelStatuses = ['Received', 'Under Processing', 'Interviewing'];


const ratingCategories: (keyof Omit<FormValues['ratings'], 'overall'>)[] = [
  'communication', 'technical', 'problemSolving', 'teamFit'
];

const categoryLabels: Record<keyof FormValues['ratings'], string> = {
  communication: "Communication",
  technical: "Technical Skills",
  problemSolving: "Problem-Solving",
  teamFit: "Team Fit",
  overall: "Overall Rating",
};

const StarRating = ({ value, onChange, disabled = false }: { value: number; onChange: (value: number) => void; disabled?: boolean }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-7 w-7 transition-colors sm:h-6 sm:w-6",
            disabled ? "text-muted-foreground/30" : "cursor-pointer",
            displayValue >= star ? "text-primary fill-primary" : "text-muted-foreground/50",
            !disabled && displayValue >= star && "hover:text-primary/80"
          )}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => !disabled && setHoverValue(0)}
        />
      ))}
      {!disabled && <span className="ml-2 text-sm font-medium text-foreground w-8 text-center">{value.toFixed(1)}</span>}
    </div>
  );
};


export function ApplicationReviewForm({ application, userRole }: ApplicationReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: application.status ?? 'Received',
      isRecommended: application.isRecommended ?? false,
      suitability: {
        technical: application.suitability?.technical ?? 'undecided',
        nonTechnical: application.suitability?.nonTechnical ?? 'undecided',
      },
      ratings: {
        communication: application.ratings?.communication ?? 0,
        technical: application.ratings?.technical ?? 0,
        problemSolving: application.ratings?.problemSolving ?? 0,
        teamFit: application.ratings?.teamFit ?? 0,
        overall: application.ratings?.overall ?? 0,
      },
      remarks: application.remarks ?? "",
    },
  });

  const ratings = form.watch('ratings');

  useEffect(() => {
      const { communication, technical, problemSolving, teamFit } = ratings;
      const individualRatings = [communication, technical, problemSolving, teamFit].filter(r => r > 0);
      
      if (individualRatings.length > 0) {
          const sum = individualRatings.reduce((acc, curr) => acc + curr, 0);
          const avg = sum / individualRatings.length;
          form.setValue('ratings.overall', parseFloat(avg.toFixed(2)), { shouldValidate: true });
      } else {
          form.setValue('ratings.overall', 0, { shouldValidate: true });
      }

  }, [ratings.communication, ratings.technical, ratings.problemSolving, ratings.teamFit, form]);


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
  
  const applicationStatuses = userRole === 'admin' ? adminStatuses : panelStatuses;

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
              <CardTitle>Application Review</CardTitle>
              <CardDescription>
                Evaluate the candidate and update their status. Use star ratings for a quantitative assessment and remarks for qualitative feedback.
              </CardDescription>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={userRole === 'panel' && (field.value === 'Hired' || field.value === 'Rejected')}>
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

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="suitability.technical"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Suitable for technical role?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex items-center space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="yes" /></FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="no" /></FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="suitability.nonTechnical"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Suitable for non-technical role?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex items-center space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="yes" /></FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="no" /></FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <FormLabel>Ratings</FormLabel>
                    {ratingCategories.map((category) => (
                      <Controller
                          key={category}
                          name={`ratings.${category}`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <FormLabel className="font-normal text-sm mb-2 sm:mb-0">{categoryLabels[category]}</FormLabel>
                              <FormControl>
                                <StarRating value={field.value} onChange={(v) => field.onChange(parseFloat(v.toFixed(1)))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    ))}
                    <Controller
                        name="ratings.overall"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="pt-2 border-t">
                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <FormLabel className="font-normal text-sm flex items-center mb-2 sm:mb-0">{categoryLabels['overall']} 
                                  <span className="ml-2 text-lg font-bold text-primary">{field.value.toFixed(2)}</span>
                                </FormLabel>
                                <FormControl>
                                  <StarRating value={field.value} onChange={() => {}} disabled />
                                </FormControl>
                             </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                  
                  <FormField
                      control={form.control}
                      name="remarks"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                          <Textarea
                              placeholder="Add your comments about the applicant..."
                              className="resize-y min-h-[100px]"
                              {...field}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />

                  <FormField
                    control={form.control}
                    name="isRecommended"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Recommend for Final Round
                          </FormLabel>
                          <FormDescription>
                           Check this box to flag this candidate for the super admin&apos;s review.
                          </FormDescription>
                          <FormMessage />
                        </div>
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
    </div>
  );
}
