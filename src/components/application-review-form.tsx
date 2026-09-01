
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
            "h-6 w-6 transition-colors",
            disabled ? "text-zinc-300" : "cursor-pointer",
            displayValue >= star ? "text-[#FFE600] fill-[#FFE600] stroke-black stroke-[1.5]" : "text-zinc-300 fill-zinc-100",
            !disabled && displayValue >= star && "hover:opacity-90"
          )}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => !disabled && setHoverValue(0)}
        />
      ))}
      {!disabled && <span className="ml-2 text-xs font-black text-black w-8 text-center">{value.toFixed(1)}</span>}
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
      status: application.status || "Received",
      isRecommended: application.isRecommended || false,
      suitability: {
        technical: application.suitability?.technical || 'undecided',
        nonTechnical: application.suitability?.nonTechnical || 'undecided',
      },
      ratings: {
        communication: application.ratings?.communication || 0,
        technical: application.ratings?.technical || 0,
        problemSolving: application.ratings?.problemSolving || 0,
        teamFit: application.ratings?.teamFit || 0,
        confidence: application.ratings?.confidence || 0,
        growthMindset: application.ratings?.growthMindset || 0,
        leadership: application.ratings?.leadership || 0,
        overall: application.ratings?.overall || 0,
      },
      remarks: application.remarks || "",
    },
  });

  const watchedRatings = form.watch("ratings");

  useEffect(() => {
    const { communication, technical, problemSolving, teamFit, confidence, growthMindset, leadership } = watchedRatings;
    const count = 7;
    const sum = (communication || 0) + (technical || 0) + (problemSolving || 0) + (teamFit || 0) + (confidence || 0) + (growthMindset || 0) + (leadership || 0);
    const overall = sum / count;
    form.setValue("ratings.overall", parseFloat(overall.toFixed(2)));
  }, [watchedRatings, form]);


  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const { updateApplicationStatus } = await import("@/app/actions");
      const targetId = application.firestoreId || application.id;
      const result = await updateApplicationStatus(targetId, data.status, {
        isRecommended: data.isRecommended,
        suitability: data.suitability,
        ratings: data.ratings,
        remarks: data.remarks,
      });

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
    <div className="space-y-8 font-sans">
      <Card className="border-2 border-black bg-white text-black shadow-[6px_6px_0px_0px_#000000]">
          <CardHeader className="border-b-2 border-black pb-4">
              <span className="text-[10px] bg-[#FFE600] text-black px-2.5 py-1 font-black tracking-widest uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] w-fit">
                [ EVALUATION PANEL ]
              </span>
              <CardTitle className="text-xl font-display font-black uppercase italic tracking-tight mt-2 text-black">
                Application Review
              </CardTitle>
              <CardDescription className="text-xs text-zinc-600 font-bold">
                Evaluate the candidate and update their stage. Star ratings compute real-time averages.
              </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                   <FormField
                       control={form.control}
                       name="status"
                       render={({ field }) => (
                           <FormItem className="space-y-6">
                               <div className="space-y-3">
                                 <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Processing Status</FormLabel>
                                 <FormControl>
                                   <div className="grid grid-cols-2 gap-2">
                                     {processingStatuses.map(status => {
                                       const isSelected = field.value === status;
                                       
                                       return (
                                         <button
                                           key={status}
                                           type="button"
                                           onClick={() => field.onChange(status)}
                                           className={cn(
                                             "px-3 py-2.5 border-2 border-black text-center font-black text-[10px] uppercase tracking-wider transition-all duration-150 cursor-pointer",
                                             isSelected 
                                               ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000] translate-x-[1px] translate-y-[1px]" 
                                               : "bg-white text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-zinc-100"
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
                                 <div className="space-y-3 pt-4 border-t-2 border-black">
                                   <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Final Decision</FormLabel>
                                   <FormControl>
                                     <div className="grid grid-cols-2 gap-2">
                                       {finalDecisionStatuses.map(status => {
                                         const isSelected = field.value === status;
                                         
                                         let selectedStyle = "bg-[#FFE600] text-black";
                                         if (status === 'Hired') selectedStyle = "bg-[#00FF66] text-black";
                                         if (status === 'Rejected') selectedStyle = "bg-[#FF0055] text-white";

                                         return (
                                           <button
                                             key={status}
                                             type="button"
                                             onClick={() => field.onChange(status)}
                                             className={cn(
                                               "px-3 py-3 border-2 border-black text-center font-black text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer",
                                               isSelected 
                                                 ? `${selectedStyle} shadow-[3px_3px_0px_0px_#000000] translate-x-[1px] translate-y-[1px]` 
                                                 : "bg-white text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-zinc-100"
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
                               <FormMessage className="text-red-600 text-xs font-bold" />
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
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Suitable for technical role?</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              {['yes', 'no', 'undecided'].map(val => {
                                const isSelected = field.value === val;
                                const activeClass =
                                  val === 'yes' ? 'bg-[#00FF66] text-black' :
                                  val === 'no' ? 'bg-[#FF0055] text-white' :
                                  'bg-[#FFE600] text-black';
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => field.onChange(val)}
                                    className={cn(
                                      "px-4 py-2 border-2 border-black font-black text-[10px] uppercase tracking-wider transition-all duration-150 cursor-pointer",
                                      isSelected 
                                        ? `${activeClass} shadow-[3px_3px_0px_0px_#000000] translate-x-[1px] translate-y-[1px]` 
                                        : "bg-white text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-zinc-100"
                                    )}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600 text-xs font-bold" />
                        </FormItem>
                      )}
                    />

                    {/* Suitable for Non-Technical Role */}
                    <FormField
                      control={form.control}
                      name="suitability.nonTechnical"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Suitable for non-technical role?</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              {['yes', 'no', 'undecided'].map(val => {
                                const isSelected = field.value === val;
                                const activeClass =
                                  val === 'yes' ? 'bg-[#00FF66] text-black' :
                                  val === 'no' ? 'bg-[#FF0055] text-white' :
                                  'bg-[#FFE600] text-black';
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => field.onChange(val)}
                                    className={cn(
                                      "px-4 py-2 border-2 border-black font-black text-[10px] uppercase tracking-wider transition-all duration-150 cursor-pointer",
                                      isSelected 
                                        ? `${activeClass} shadow-[3px_3px_0px_0px_#000000] translate-x-[1px] translate-y-[1px]` 
                                        : "bg-white text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-zinc-100"
                                    )}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600 text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6 pt-2">
                    <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Score Ratings (1 - 5)</FormLabel>
                    {ratingCategories.map((category) => (
                      <Controller
                          key={category}
                          name={`ratings.${category}`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 border-b border-zinc-100">
                              <FormLabel className="text-xs font-bold text-black mb-2 sm:mb-0">{categoryLabels[category]}</FormLabel>
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
                          <FormItem className="pt-3 border-t-2 border-black bg-zinc-50 p-3">
                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <FormLabel className="text-xs font-black uppercase tracking-wider text-black flex items-center mb-2 sm:mb-0">
                                  {categoryLabels['overall']} 
                                  <span className="ml-2 px-2 py-0.5 bg-[#4285F4] text-white text-sm font-black border border-black shadow-[2px_2px_0px_0px_#000000]">{field.value.toFixed(2)}</span>
                                </FormLabel>
                                <FormControl>
                                  <StarRating value={field.value} onChange={() => {}} disabled />
                                </FormControl>
                             </div>
                            <FormMessage className="text-red-600 text-xs font-bold" />
                          </FormItem>
                        )}
                      />
                  </div>
                  
                  <FormField
                      control={form.control}
                      name="remarks"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Remarks</FormLabel>
                          <FormControl>
                          <InputGroup className="bg-white border-2 border-black">
                              <InputGroupTextarea
                                  placeholder="Add your comments about the applicant..."
                                  className="min-h-24 text-xs text-black focus-visible:ring-0 placeholder:text-zinc-400"
                                  {...field}
                              />
                              <InputGroupAddon align="block-end" className="border-t-2 border-black bg-zinc-50">
                                  <InputGroupText className="text-zinc-600 tabular-nums font-bold">
                                      {(field.value || "").length} characters
                                  </InputGroupText>
                              </InputGroupAddon>
                          </InputGroup>
                          </FormControl>
                          <FormMessage className="text-red-600 text-xs font-bold" />
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
