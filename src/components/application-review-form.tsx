
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Star } from "lucide-react";

import { saveApplicationReview } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { SlideToConfirmButton } from "./ui/slide-to-confirm";
import { useAuth } from "@/lib/auth-context";
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
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";
// RadioGroup removed — suitability now uses pill buttons
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
    confidence: z.number().min(0).max(5),
    growthMindset: z.number().min(0).max(5),
    leadership: z.number().min(0).max(5),
    overall: z.number().min(0).max(5),
  }),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof reviewSchema>;

interface ApplicationReviewFormProps {
  application: {
    id: string;
    firestoreId?: string;
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
      confidence?: number;
      growthMindset?: number;
      leadership?: number;
      overall: number;
    };
    remarks?: string;
  };
  userRole: string;
}

const processingStatuses = [
  'Received', 
  'Invited to Interview', 
  'Interview Done', 
  'Thank You For Attending'
];

const finalDecisionStatuses = [
  'Hired', 
  'Rejected'
];




const ratingCategories: (keyof Omit<FormValues['ratings'], 'overall'>)[] = [
  'communication', 'technical', 'problemSolving', 'teamFit', 'confidence', 'growthMindset', 'leadership'
];

const categoryLabels: Record<keyof FormValues['ratings'], string> = {
  communication: "Communication",
  technical: "Technical Skills",
  problemSolving: "Problem-Solving",
  teamFit: "Team Fit",
  confidence: "Confidence & Attitude",
  growthMindset: "Growth Mindset",
  leadership: "Leadership & Initiative",
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
  const { user } = useAuth();

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
        confidence: application.ratings?.confidence ?? 0,
        growthMindset: application.ratings?.growthMindset ?? 0,
        leadership: application.ratings?.leadership ?? 0,
        overall: application.ratings?.overall ?? 0,
      },
      remarks: application.remarks ?? "",
    },
  });

  const ratings = form.watch('ratings');

  useEffect(() => {
      const { communication, technical, problemSolving, teamFit, confidence, growthMindset, leadership } = ratings;
      const individualRatings = [communication, technical, problemSolving, teamFit, confidence, growthMindset, leadership].filter(r => r > 0);
      
      if (individualRatings.length > 0) {
          const sum = individualRatings.reduce((acc, curr) => acc + curr, 0);
          const avg = sum / individualRatings.length;
          form.setValue('ratings.overall', parseFloat(avg.toFixed(2)), { shouldValidate: true });
      } else {
          form.setValue('ratings.overall', 0, { shouldValidate: true });
      }

  }, [
    ratings.communication, 
    ratings.technical, 
    ratings.problemSolving, 
    ratings.teamFit, 
    ratings.confidence, 
    ratings.growthMindset, 
    ratings.leadership, 
    form
  ]);


  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        id: application.firestoreId || application.id,
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
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Failed to save application review for applicant ID ${application.id}`,
        error,
        "ApplicationReviewForm",
        user?.email || "unknown"
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
    <div className="space-y-8">
      <Card className="glass-card">
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
                           <FormItem className="space-y-6">
                               <div className="space-y-3">
                                 <FormLabel>Processing Status</FormLabel>
                                 <FormControl>
                                   <div className="grid grid-cols-2 gap-2">
                                     {processingStatuses.map(status => {
                                       const isSelected = field.value === status;
                                       
                                       let activeClass = "bg-[#4285F4]/10 border-[#4285F4]/30 text-[#4285F4]";
                                       if (status === 'On Hold') {
                                         activeClass = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
                                       }

                                       return (
                                         <button
                                           key={status}
                                           type="button"
                                           onClick={() => field.onChange(status)}
                                           className={cn(
                                             "px-3 py-2.5 rounded-xl border text-center font-bold text-[10px] uppercase tracking-wider transition-all duration-255",
                                             isSelected 
                                               ? activeClass 
                                               : "bg-white/[0.01] border-white/5 text-white/50 hover:bg-white/5 hover:text-white"
                                           )}
                                         >
                                           {status}
                                         </button>
                                       );
                                     })}
                                   </div>
                                 </FormControl>
                               </div>

                               {userRole === 'admin' && (
                                 <div className="space-y-3 pt-4 border-t border-white/5">
                                   <FormLabel className="text-[#34A853]">Final Decision</FormLabel>
                                   <FormControl>
                                     <div className="grid grid-cols-2 gap-2">
                                       {finalDecisionStatuses.map(status => {
                                         const isSelected = field.value === status;
                                         
                                         let activeClass = "bg-[#4285F4]/10 border-[#4285F4]/30 text-[#4285F4]";
                                         if (status === 'Hired' || status === 'Recommended') {
                                           activeClass = "bg-[#34A853]/10 border-[#34A853]/35 text-[#34A853]";
                                         } else if (status === 'Rejected') {
                                           activeClass = "bg-red-500/10 border-red-500/30 text-red-400";
                                         } else if (status === 'Waitlisted') {
                                           activeClass = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
                                         }

                                         return (
                                           <button
                                             key={status}
                                             type="button"
                                             onClick={() => field.onChange(status)}
                                             className={cn(
                                               "px-3 py-3 rounded-xl border text-center font-bold text-xs uppercase tracking-wider transition-all duration-255 shadow-sm",
                                               isSelected 
                                                 ? activeClass 
                                                 : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                             )}
                                           >
                                             {status}
                                           </button>
                                         );
                                       })}
                                     </div>
                                   </FormControl>
                                 </div>
                               )}
                               <FormMessage />
                           </FormItem>
                       )}
                   />

                  <div className="space-y-4">
                    {/* Suitable for Technical Role */}
                    <FormField
                      control={form.control}
                      name="suitability.technical"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-semibold">Suitable for technical role?</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              {['yes', 'no', 'undecided'].map(val => {
                                const isSelected = field.value === val;
                                const activeClass =
                                  val === 'yes' ? 'bg-[#34A853]/10 border-[#34A853]/40 text-[#34A853]' :
                                  val === 'no' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                  'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => field.onChange(val)}
                                    className={cn(
                                      "px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all duration-200 capitalize",
                                      isSelected ? activeClass : "bg-white/[0.01] border-white/5 text-white/50 hover:bg-white/5 hover:text-white"
                                    )}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Suitable for Non-Technical Role */}
                    <FormField
                      control={form.control}
                      name="suitability.nonTechnical"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-semibold">Suitable for non-technical role?</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              {['yes', 'no', 'undecided'].map(val => {
                                const isSelected = field.value === val;
                                const activeClass =
                                  val === 'yes' ? 'bg-[#34A853]/10 border-[#34A853]/40 text-[#34A853]' :
                                  val === 'no' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                  'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => field.onChange(val)}
                                    className={cn(
                                      "px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all duration-200 capitalize",
                                      isSelected ? activeClass : "bg-white/[0.01] border-white/5 text-white/50 hover:bg-white/5 hover:text-white"
                                    )}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
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
                          <InputGroup className="bg-white/5 border-white/10">
                              <InputGroupTextarea
                                  placeholder="Add your comments about the applicant..."
                                  className="min-h-24 text-sm text-white focus-visible:ring-0 placeholder:text-white/30"
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

                  {/* isRecommended field removed as requested */}

                  <SlideToConfirmButton
                    label="Slide to save review"
                    confirmedLabel="Saving review..."
                    onConfirm={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    isConfirmed={isSubmitting}
                    autoResetDelay={0}
                    className="w-full max-w-none"
                  />
                  </form>
              </Form>
          </CardContent>
      </Card>
    </div>
  );
}
