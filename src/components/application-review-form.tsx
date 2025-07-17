
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bot, Loader2, Star } from "lucide-react";

import { saveApplicationReview, getCandidateEvaluation } from "@/app/actions";
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


const ratingCategories: (keyof FormValues['ratings'])[] = [
  'communication', 'technical', 'problemSolving', 'teamFit', 'overall'
];

const categoryLabels: Record<keyof FormValues['ratings'], string> = {
  communication: "Communication Skills",
  technical: "Technical Skills",
  problemSolving: "Problem-Solving",
  teamFit: "Team Fit",
  overall: "Overall Rating",
};

const StarRating = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const [hoverValue, setHoverValue] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-6 w-6 cursor-pointer transition-colors",
            (hoverValue || value) >= star ? "text-primary fill-primary" : "text-muted-foreground/50"
          )}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        />
      ))}
    </div>
  );
};


export function ApplicationReviewForm({ application, userRole }: ApplicationReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [interviewTranscript, setInterviewTranscript] = useState("");
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

  const handleEvaluation = async () => {
    if (!interviewTranscript.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Interview transcript cannot be empty." });
      return;
    }
    if (!application.resumeSummary) {
        toast({ variant: "destructive", title: "Error", description: "A resume summary is required for evaluation." });
        return;
    }

    setIsEvaluating(true);
    try {
      const result = await getCandidateEvaluation({
        interviewTranscript,
        resumeSummary: application.resumeSummary,
      });
      if (result.error || !result.evaluation) {
        throw new Error(result.error || "Failed to get evaluation.");
      }
      
      const { ratings, remarks } = result.evaluation;
      form.setValue('ratings', ratings);
      form.setValue('remarks', remarks);

      toast({ title: "Evaluation Complete", description: "AI analysis has been populated in the form." });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Evaluation Failed", description: errorMessage });
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
    <>
    <Card>
      <CardHeader>
        <CardTitle>AI Interview Analysis</CardTitle>
        <CardDescription>
          Paste the interview transcript below and let AI assist with the evaluation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full gap-2">
            <Label htmlFor="transcript">Interview Transcript</Label>
            <Textarea 
                id="transcript"
                placeholder="Paste the full interview transcript here..." 
                className="min-h-[150px]"
                value={interviewTranscript}
                onChange={(e) => setInterviewTranscript(e.target.value)}
                disabled={isEvaluating}
            />
        </div>
        <Button onClick={handleEvaluation} disabled={isEvaluating || !interviewTranscript} className="w-full">
            {isEvaluating ? <Loader2 className="animate-spin" /> : <Bot />}
            <span>{isEvaluating ? 'Evaluating...' : 'Analyze with AI'}</span>
        </Button>
         <Alert>
          <AlertTitle className="font-semibold">How it works</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            The AI will analyze the transcript against the candidate's resume summary to provide objective ratings and remarks, which will populate the form below.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

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
                               <StarRating value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  ))}
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
    </>
  );
}
