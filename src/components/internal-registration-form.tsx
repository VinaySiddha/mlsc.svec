
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ThumbsUp, ClipboardCopy, AlertTriangle } from "lucide-react";

import { internalRegister } from "@/app/actions";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Link from "next/link";

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
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  rollNo: z.string().min(1, "Roll number is required."),
  branch: z.string({ required_error: "Please select your branch." }),
  section: z.string({ required_error: "Please select your section." }),
  yearOfStudy: z.string({ required_error: "Please select your year of study."}),
  cgpa: z.string().min(1, "CGPA is required.").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10, { message: "Please enter a valid CGPA between 0 and 10."}),
  backlogs: z.string().min(1, "Number of backlogs is required.").refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, { message: "Please enter a valid number."}),
  technicalDomain: z.string({ required_error: "Please select a technical domain." }).min(1, "Please select a technical domain."),
  nonTechnicalDomain: z.string({ required_error: "Please select a non-technical domain." }).min(1, "Please select a non-technical domain."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export function InternalRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ referenceId: string | null} | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      rollNo: "",
      cgpa: "",
      backlogs: "",
      technicalDomain: "",
      nonTechnicalDomain: "",
      linkedin: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    
    try {
      const result = await internalRegister(values);

      if (result.error) {
        throw new Error(result.error);
      }
      
      setSubmissionResult({ referenceId: result.referenceId });
      toast({
        title: "Candidate Registered!",
        description: "The candidate has been added to the system.",
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

  if (submissionResult) {
    return (
       <Card className="bg-background">
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-2xl">
              <ThumbsUp className="h-8 w-8 text-green-500" />
              <span>Candidate Registered!</span>
            </CardTitle>
            <CardDescription>
              A new application has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <Alert>
                <AlertTitle className="font-bold">Important: Share the Reference ID</AlertTitle>
                <AlertDescription>
                  Please copy and share the Reference ID with the candidate. They will need it to check their application status.
                </AlertDescription>
             </Alert>

            {submissionResult.referenceId && (
              <div>
                <Label htmlFor="referenceId" className="text-sm font-medium text-foreground">Generated Reference ID</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input 
                    id="referenceId"
                    readOnly 
                    value={submissionResult.referenceId} 
                    className="bg-muted font-mono text-base"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(submissionResult.referenceId!)}>
                    <ClipboardCopy className="h-5 w-5" />
                    <span className="sr-only">Copy Reference ID</span>
                  </Button>
                </div>
              </div>
            )}
             <Button onClick={() => setSubmissionResult(null)} variant="outline">Register another candidate</Button>
          </CardContent>
        </Card>
    )
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <Input placeholder="10-digit number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rollNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll No *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 22A91A4201" {...field} />
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
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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

          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering Candidate...
              </>
            ) : (
              "Register Candidate"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
