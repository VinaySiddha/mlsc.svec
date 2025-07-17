"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ThumbsUp } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const roles = [
  { id: "events", label: "Events" },
  { id: "marketing", label: "Marketing" },
  { id: "external_relations", label: "External Relations" },
  { id: "tech", label: "Tech" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  isNtuStudent: z.enum(["yes", "no"], {
    required_error: "Please select an option.",
  }),
  major: z.string().optional(),
  yearOfStudy: z.string({ required_error: "Please select your year of study."}),
  interestedRoles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
  skills: z.string().optional(),
  reason: z.string().min(20, "Please tell us why you want to join.").max(1000),
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
})
.refine(data => data.isNtuStudent === 'no' || !!data.major, {
    message: "Major is required if you are an NTU student.",
    path: ["major"],
});


type FormValues = z.infer<typeof formSchema>;

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      major: "",
      interestedRoles: [],
      skills: "",
      reason: "",
    },
  });

  const isNtuStudent = form.watch("isNtuStudent");

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSummary(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'interestedRoles' && Array.isArray(value)) {
        value.forEach(role => formData.append('interestedRoles', role));
      } else if (key === 'resume' && value?.[0]) {
        formData.append('resume', value[0]);
      } else if (value !== undefined && value !== null && !Array.isArray(value)) {
        formData.append(key, value as string);
      }
    });

    try {
      const result = await submitApplication(formData);

      if (result.error) {
        throw new Error(result.error);
      }
      
      setSummary(result.summary);
      toast({
        title: "Application Submitted!",
        description: "We've received your application and will be in touch soon.",
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
          </div>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isNtuStudent"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Are you an NTU student? *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isNtuStudent === 'yes' && (
            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>If yes, what is your major? *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="yearOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What is your year of study? *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year of study" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="year1">Year 1</SelectItem>
                    <SelectItem value="year2">Year 2</SelectItem>
                    <SelectItem value="year3">Year 3</SelectItem>
                    <SelectItem value="year4">Year 4</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="na">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interestedRoles"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">What roles are you interested in? *</FormLabel>
                  <FormDescription>Select all that apply.</FormDescription>
                </div>
                {roles.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="interestedRoles"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What are your technical skills?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Python, PyTorch, React, etc."
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
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Why do you want to join MLSC? *</FormLabel>
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
      {summary !== null && (
        <Card className="mt-12 bg-primary/5">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="text-accent" />
              <span>Application Received!</span>
            </CardTitle>
            <CardDescription>
              {summary ? "Our AI has generated a summary of your resume. An admin will review your application shortly." : "An admin will review your application shortly."}
            </CardDescription>
          </CardHeader>
          {summary && (
            <CardContent>
              <p className="text-sm font-medium text-foreground">AI-Generated Summary:</p>
              <p className="text-sm text-muted-foreground mt-2 p-4 border rounded-md bg-background">{summary}</p>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}
