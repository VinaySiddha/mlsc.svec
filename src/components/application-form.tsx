"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ThumbsUp, ClipboardCopy } from "lucide-react";

import { submitApplication } from "@/app/actions";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const branches = ["AIML", "CAI", "CSE", "CST", "ECE", "Others"];
const sections = ["A", "B", "C", "D", "E"];
const years = ["2nd", "3rd"];

const technicalDomains = [
  { id: "gen_ai", label: "Generative AI" },
  { id: "ds_ml", label: "Data Science & Machine Learning" },
  { id: "azure", label: "Azure Cloud" },
  { id: "web_app", label: "Web and APP Development" },
];

const nonTechnicalDomains = [
  { id: "event_management", label: "Event Management" },
  { id: "public_relations", label: "Public Relations" },
  { id: "media_marketing", label: "Media Marketing" },
  { id: "creativity", label: "Creativity" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(1, "Phone number is required."),
  branch: z.string({ required_error: "Please select your branch." }),
  section: z.string({ required_error: "Please select your section." }),
  yearOfStudy: z.string({ required_error: "Please select your year of study."}),
  cgpa: z.string().min(1, "CGPA is required.").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10, { message: "Please enter a valid CGPA between 0 and 10."}),
  backlogs: z.string().min(1, "Number of backlogs is required.").refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, { message: "Please enter a valid number."}),
  joinReason: z.string().min(20, "Please tell us why you want to join.").max(1000),
  aboutClub: z.string().min(20, "Please tell us what you know about the club.").max(1000),
  technicalDomain: z.string({ required_error: "Please select a technical domain." }),
  nonTechnicalDomain: z.string({ required_error: "Please select a non-technical domain." }),
  linkedin: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal('')),
  anythingElse: z.string().optional(),
  resume: z
    .any()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      ".pdf and .docx files are accepted."
    ),
});

type FormValues = z.infer<typeof formSchema>;

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{summary: string | null, referenceId: string | null} | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cgpa: "",
      backlogs: "",
      joinReason: "",
      aboutClub: "",
      technicalDomain: "",
      nonTechnicalDomain: "",
      linkedin: "",
      anythingElse: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'resume' && value?.[0]) {
        formData.append('resume', value[0]);
      } else if (value !== undefined && value !== null && typeof value === 'string') {
        formData.append(key, value);
      }
    });
    
    try {
      const result = await submitApplication(formData);

      if (result.error) {
        throw new Error(result.error);
      }
      
      setSubmissionResult({ summary: result.summary, referenceId: result.referenceId });
      toast({
        title: "Application Submitted!",
        description: "We've received your application. Keep your reference ID safe.",
      });
      form.reset();

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Reference ID copied to clipboard!",
    });
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Branch *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select your branch" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Section *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select your section" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {sections.map(section => <SelectItem key={section} value={section}>{section}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="yearOfStudy"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Current Year of Study *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
              control={form.control}
              name="cgpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current CGPA *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 8.5" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backlogs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No of Active Backlogs *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 0" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="joinReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Why do you want to join this club? *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your passion for machine learning and what you hope to achieve with the club."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aboutClub"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What do you know about MLSC club? *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Your knowledge about the club's activities, goals, etc."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="technicalDomain"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Which domain are you interested in? (TECHNICAL) *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {technicalDomains.map(item => (
                        <FormItem key={item.id} className="flex items-center space-x-3 space-y-0">
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
          </div>

          <div className="space-y-8">
            <FormField
              control={form.control}
              name="nonTechnicalDomain"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Which domain are you interested in? (NON-TECHNICAL) *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {nonTechnicalDomains.map(item => (
                        <FormItem key={item.id} className="flex items-center space-x-3 space-y-0">
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
          </div>

          <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile (Link)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.linkedin.com/in/yourprofile/" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
          <FormField
            control={form.control}
            name="anythingElse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anything else you’d like to share?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any other information you'd like us to know."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <FormField
              control={form.control}
              name="resume"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Resume (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept=".pdf,.docx"
                      onChange={(e) => onChange(e.target.files)}
                      {...rest}
                    />
                  </FormControl>
                  <FormDescription>Upload your resume (PDF or DOCX, max 5MB).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </Form>
      {submissionResult && (
        <Card className="mt-12 bg-primary/5">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="text-accent" />
              <span>Application Received!</span>
            </CardTitle>
            <CardDescription>
              Your application has been submitted successfully. Please save your reference ID to track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissionResult.referenceId && (
              <div>
                <p className="text-sm font-medium text-foreground">Your Reference ID:</p>
                <div className="flex items-center gap-2 mt-2">
                  <Input 
                    readOnly 
                    value={submissionResult.referenceId} 
                    className="bg-background font-mono text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(submissionResult.referenceId!)}>
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {submissionResult.summary && (
              <div>
                <p className="text-sm font-medium text-foreground">AI-Generated Resume Summary:</p>
                <p className="text-sm text-muted-foreground mt-2 p-4 border rounded-md bg-background">{submissionResult.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
