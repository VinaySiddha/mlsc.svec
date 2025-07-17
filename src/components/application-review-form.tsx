
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bot, Loader2, Sparkles, Star } from "lucide-react";

import { saveApplicationReview, evaluateCandidateAction } from "@/app/actions";
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
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";


const reviewSchema = z.object({
  status: z.string(),
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
    resumeSummary: string | null;
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
  communication: "Communication Skills",
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
            "h-6 w-6 transition-colors",
            disabled ? "text-muted-foreground/30" : "cursor-pointer",
            displayValue >= star ? "text-primary fill-primary" : "text-muted-foreground/50",
            !disabled && displayValue >= star && "hover:text-primary/80"
          )}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => !disabled && setHoverValue(0)}
        />
      ))}
      {!disabled && <span className="ml-2 text-sm font-medium text-foreground">{value.toFixed(1)}</span>}
    </div>
  );
};


export function ApplicationReviewForm({ application, userRole }: ApplicationReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: application.status ?? 'Received',
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


  const handleEvaluate = async () => {
    if (!transcript.trim()) {
      toast({
        variant: 'destructive',
        title: 'Transcript is empty',
        description: 'Please paste the interview transcript before analyzing.',
      });
      return;
    }

    setIsEvaluating(true);
    try {
      const result = await evaluateCandidateAction({
        resumeSummary: application.resumeSummary || 'No resume summary available.',
        interviewTranscript: transcript,
      });

      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to get evaluation data.');
      }
      
      const { ratings, remarks } = result.data;
      form.setValue('ratings.communication', ratings.communication);
      form.setValue('ratings.technical', ratings.technical);
      form.setValue('ratings.problemSolving', ratings.problemSolving);
      form.setValue('ratings.teamFit', ratings.teamFit);
      form.setValue('remarks', remarks);
      
      toast({
        title: 'Evaluation Complete',
        description: "The AI has analyzed the transcript and populated the form.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
       toast({
        variant: "destructive",
        title: "Evaluation Failed",
        description: errorMessage,
      });
    } finally {
      setIsEvaluating(false);
    }
  };


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
              <CardDescription>Update the applicant's status and ratings.</CardDescription>
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
                          <FormLabel>Is candidate suitable for the opted technical role?</FormLabel>
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
                          <FormLabel>Is candidate suitable for the opted non-technical role?</FormLabel>
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

                  <div className="space-y-4">
                    <FormLabel>Ratings</FormLabel>
                    {ratingCategories.map((category) => (
                      <Controller
                          key={category}
                          name={`ratings.${category}`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-normal text-sm">{categoryLabels[category]}</FormLabel>
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
                          <FormItem>
                            <FormLabel className="font-normal text-sm flex items-center">{categoryLabels['overall']} 
                               <span className="ml-2 text-lg font-bold text-primary">{field.value.toFixed(2)}</span>
                            </FormLabel>
                            <FormControl>
                              <StarRating value={field.value} onChange={() => {}} disabled />
                            </FormControl>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            AI-Powered Evaluation
          </CardTitle>
          <CardDescription>
            Paste the interview transcript and let AI assist in the evaluation. The AI will populate the ratings and remarks above.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
              <Label htmlFor="transcript">Interview Transcript</Label>
              <Textarea 
                  id="transcript"
                  placeholder="Paste the full interview transcript here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[200px] font-mono text-xs"
              />
          </div>
          {application.resumeSummary && (
             <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Using Resume Summary</AlertTitle>
              <AlertDescription className="text-xs italic">
                The AI will use this resume summary for context: "{application.resumeSummary}"
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={handleEvaluate} disabled={isEvaluating} className="w-full">
            {isEvaluating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Transcript
                </>
              )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
