"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Award, Bot, Sparkles, Star, UserCheck } from "lucide-react";

import { saveApplicationReview } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
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
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { SlideToConfirmButton } from "./ui/slide-to-confirm";

const reviewSchema = z.object({
  status: z.string(),
  isRecommended: z.boolean(),
  isManualSelected: z.boolean().optional(),
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
    isAiRecommended?: boolean;
    isManualSelected?: boolean;
    suitability?: {
      technical?: string;
      nonTechnical?: string;
    };
    aiSuitability?: {
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
    aiRatings?: {
      communication: number;
      technical: number;
      problemSolving: number;
      teamFit: number;
      confidence?: number;
      growthMindset?: number;
      leadership?: number;
      overall: number;
    };
    manualRatings?: {
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
  'Interviewed',
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
            displayValue >= star ? "text-emerald-400 fill-emerald-400" : "text-muted-foreground/50",
            !disabled && displayValue >= star && "hover:text-emerald-300"
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

  // Resolve initial manual ratings
  const initialManual = application.manualRatings || (
    application.ratings && application.aiRatings && application.ratings.overall !== application.aiRatings.overall
      ? application.ratings
      : (application.status !== 'Received' ? application.ratings : undefined)
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: (application.status && application.status !== 'Received') ? application.status : 'Interviewed',
      isRecommended: application.isManualSelected ?? application.isRecommended ?? false,
      isManualSelected: application.isManualSelected ?? application.isRecommended ?? false,
      suitability: {
        technical: application.suitability?.technical ?? 'undecided',
        nonTechnical: application.suitability?.nonTechnical ?? 'undecided',
      },
      ratings: {
        communication: initialManual?.communication ?? 0,
        technical: initialManual?.technical ?? 0,
        problemSolving: initialManual?.problemSolving ?? 0,
        teamFit: initialManual?.teamFit ?? 0,
        confidence: initialManual?.confidence ?? 0,
        growthMindset: initialManual?.growthMindset ?? 0,
        leadership: initialManual?.leadership ?? 0,
        overall: initialManual?.overall ?? 0,
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
      const finalStatus = (values.status === 'Received' || !values.status) ? 'Interviewed' : values.status;
      const payload = {
        id: application.firestoreId || application.id,
        ...values,
        status: finalStatus,
        isManualSelected: values.isRecommended,
        manualRatings: values.ratings,
      };

      const result = await saveApplicationReview(payload);

      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Review Saved!",
        description: "Manual interview scores and candidate review have been updated.",
      });

      // Refresh page to show new status badge and ratings
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

  const isSuperAdmin = userRole === 'super_admin';

  const aiRatings = isSuperAdmin ? (application.aiRatings || (
    !application.manualRatings && application.ratings ? application.ratings : undefined
  )) : undefined;
  
  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="size-5 text-[#34A853]" />
                Manual Interview Evaluation
              </CardTitle>
              <CardDescription className="text-xs text-white/50 mt-1">
                {isSuperAdmin
                  ? "Score the candidate during the interview. AI benchmark scores are displayed beside each category for reference."
                  : "Score the candidate during the interview based on live rubric criteria."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
              {/* Processing Status Selection */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-6">
                    <div className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-white/70">
                        Interview Status
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2">
                          {processingStatuses.map(status => {
                            const isSelected = field.value === status;
                            let activeClass = "bg-[#4285F4]/15 border-[#4285F4]/40 text-[#4285F4]";

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => field.onChange(status)}
                                className={cn(
                                  "px-3 py-2.5 rounded-xl border text-center font-bold text-[10px] uppercase tracking-wider transition-all duration-200",
                                  isSelected 
                                    ? activeClass 
                                    : "bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/5 hover:text-white"
                                )}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                    </div>

                    {userRole === 'admin' || userRole === 'super_admin' ? (
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <FormLabel className="text-[#34A853] text-xs font-bold uppercase tracking-wider">
                          Final Decision
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2">
                            {finalDecisionStatuses.map(status => {
                              const isSelected = field.value === status;
                              let activeClass = status === 'Hired'
                                ? "bg-[#34A853]/15 border-[#34A853]/40 text-[#34A853]"
                                : "bg-red-500/15 border-red-500/40 text-red-400";

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => field.onChange(status)}
                                  className={cn(
                                    "px-3 py-2.5 rounded-xl border text-center font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm",
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
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Suitability Preferences */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <FormField
                  control={form.control}
                  name="suitability.technical"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-semibold text-white/70">Suitable for Technical Role?</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          {['yes', 'no', 'undecided'].map(val => {
                            const isSelected = field.value === val;
                            const activeClass =
                              val === 'yes' ? 'bg-[#34A853]/15 border-[#34A853]/40 text-[#34A853]' :
                              val === 'no' ? 'bg-red-500/15 border-red-500/40 text-red-400' :
                              'bg-yellow-500/15 border-yellow-500/40 text-yellow-400';
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => field.onChange(val)}
                                className={cn(
                                  "px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all duration-200 capitalize",
                                  isSelected ? activeClass : "bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/5 hover:text-white"
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

                <FormField
                  control={form.control}
                  name="suitability.nonTechnical"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-semibold text-white/70">Suitable for Non-Technical Role?</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          {['yes', 'no', 'undecided'].map(val => {
                            const isSelected = field.value === val;
                            const activeClass =
                              val === 'yes' ? 'bg-[#34A853]/15 border-[#34A853]/40 text-[#34A853]' :
                              val === 'no' ? 'bg-red-500/15 border-red-500/40 text-red-400' :
                              'bg-yellow-500/15 border-yellow-500/40 text-yellow-400';
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => field.onChange(val)}
                                className={cn(
                                  "px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all duration-200 capitalize",
                                  isSelected ? activeClass : "bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/5 hover:text-white"
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

              {/* Quantitative Category Ratings with AI Benchmarks */}
              <div className="space-y-5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Live Interview Star Rubric
                  </FormLabel>
                  {isSuperAdmin && aiRatings && (
                    <span className="text-[10px] text-[#4285F4] flex items-center gap-1 font-semibold">
                      <Bot className="size-3" /> AI Screening Baseline Shown
                    </span>
                  )}
                </div>

                {ratingCategories.map((category) => {
                  const aiScore = isSuperAdmin && aiRatings ? (aiRatings as any)[category] : undefined;
                  return (
                    <Controller
                      key={category}
                      name={`ratings.${category}`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5">
                          <div className="flex items-center gap-2 mb-2 sm:mb-0">
                            <FormLabel className="font-medium text-xs text-white/80">
                              {categoryLabels[category]}
                            </FormLabel>
                            {isSuperAdmin && aiScore !== undefined && aiScore > 0 && (
                              <span 
                                title={`AI resume screening rated this dimension ${aiScore.toFixed(1)}/5.0`}
                                className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4]"
                              >
                                <Bot className="size-2.5" /> {aiScore.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <FormControl>
                            <StarRating value={field.value} onChange={(v) => field.onChange(parseFloat(v.toFixed(1)))} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  );
                })}

                {/* Overall Score */}
                <Controller
                  name="ratings.overall"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="pt-3 border-t border-white/10">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <FormLabel className="font-bold text-sm flex items-center text-white">
                          Human Interview Overall:
                          <span className="ml-2 text-xl font-black text-[#34A853]">{field.value.toFixed(2)}</span>
                          <span className="text-xs text-white/40 ml-1">/ 5.0</span>
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

              {/* High-Visibility Manual Selection Toggle */}
              <FormField
                control={form.control}
                name="isRecommended"
                render={({ field }) => (
                  <FormItem>
                    <div 
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 select-none",
                        field.value 
                          ? "bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/10 border-yellow-400/80 shadow-[0_0_25px_rgba(250,204,21,0.25)] ring-1 ring-yellow-400/50" 
                          : "bg-white/[0.02] border-white/10 hover:border-yellow-500/40 hover:bg-yellow-500/[0.03]"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className={cn("size-5 transition-colors", field.value ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" : "text-white/40")} />
                          <FormLabel className={cn(
                            "text-sm font-black uppercase tracking-wider cursor-pointer",
                            field.value ? "text-yellow-300" : "text-white/70"
                          )}>
                            {field.value ? "★ Candidate Manually Selected" : "☆ Manual Candidate Selection"}
                          </FormLabel>
                        </div>
                        <FormDescription className="text-xs text-white/60">
                          {field.value 
                            ? "Candidate is flagged as recommended for the final hiring round." 
                            : "Click to select and recommend this candidate for hiring."}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div 
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md",
                            field.value 
                              ? "bg-yellow-400 text-black shadow-yellow-500/30" 
                              : "bg-white/10 text-white/60 border border-white/20 hover:text-white"
                          )}
                        >
                          {field.value ? "★ Selected" : "Select"}
                        </div>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Interview Remarks / Feedback */}
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-white/70">
                      Interview Remarks & Feedback
                    </FormLabel>
                    <FormControl>
                      <InputGroup className="bg-white/5 border-white/10">
                        <InputGroupTextarea
                          placeholder="Add your qualitative interview notes, performance summary, and hire rationale..."
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
