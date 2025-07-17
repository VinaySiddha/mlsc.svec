
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import { Slider } from "./ui/slider";

const ratingSchema = z.object({
  communication: z.number().min(0).max(10),
  technical: z.number().min(0).max(10),
  problemSolving: z.number().min(0).max(10),
  teamFit: z.number().min(0).max(10),
  overall: z.number().min(0).max(10),
});

const reviewSchema = z.object({
  ratings: ratingSchema,
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof reviewSchema>;

interface ApplicationReviewFormProps {
  application: {
    id: string;
    ratings?: {
      communication: number;
      technical: number;
      problemSolving: number;
      teamFit: number;
      overall: number;
    };
    remarks?: string;
  };
}

const ratingCategories = [
  { id: 'communication', label: 'Communication' },
  { id: 'technical', label: 'Technical Knowledge' },
  { id: 'problemSolving', label: 'Problem Solving' },
  { id: 'teamFit', label: 'Team Fit' },
  { id: 'overall', label: 'Overall Impression' },
] as const;


export function ApplicationReviewForm({ application }: ApplicationReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      ratings: {
        communication: application.ratings?.communication ?? 5,
        technical: application.ratings?.technical ?? 5,
        problemSolving: application.ratings?.problemSolving ?? 5,
        teamFit: application.ratings?.teamFit ?? 5,
        overall: application.ratings?.overall ?? 5,
      },
      remarks: application.remarks ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        id: application.id,
        ratings: values.ratings,
        remarks: values.remarks,
      };

      const result = await saveApplicationReview(payload);

      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Review Saved!",
        description: "The applicant's ratings and remarks have been updated.",
      });

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
            <CardTitle>Interview Review</CardTitle>
            <CardDescription>Rate the applicant and leave your remarks.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {ratingCategories.map(cat => (
                   <FormField
                    key={cat.id}
                    control={form.control}
                    name={`ratings.${cat.id}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-baseline">
                          <FormLabel>{cat.label}</FormLabel>
                          <span className="text-sm font-bold text-primary w-8 text-center">
                            {field.value}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

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
