"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Loader2, 
  ThumbsUp, 
  ClipboardCopy, 
  AlertTriangle,
  Sparkles,
  Database,
  Cloud,
  Code2,
  CalendarRange,
  Users2,
  Clapperboard,
  Palette
} from "lucide-react";

import { submitApplication } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { logClientError } from "@/lib/error-logger";
import { useAuth } from "@/lib/auth-context";
import { cn, copyToClipboardSafe } from "@/lib/utils";
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
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Link from "next/link";
import { SlideToConfirmButton } from "./ui/slide-to-confirm";

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
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  rollNo: z.string().min(1, "Roll number is required."),
  branch: z.string({ required_error: "Please select your branch." }),
  section: z.string({ required_error: "Please select your section." }),
  yearOfStudy: z.string({ required_error: "Please select your year of study." }),
  cgpa: z.string().min(1, "CGPA is required.").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10, { message: "Please enter a valid CGPA between 0 and 10." }),
  backlogs: z.string().min(1, "Number of backlogs is required.").refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, { message: "Please enter a valid number." }),
  joinReason: z.string().min(20, "Response must be at least 20 characters long.").max(1000, "Response cannot exceed 1000 characters."),
  aboutClub: z.string().min(20, "Response must be at least 20 characters long.").max(1000, "Response cannot exceed 1000 characters."),
  technicalDomain: z.string({ required_error: "Please select a technical domain." }).min(1, "Please select a technical domain."),
  nonTechnicalDomain: z.string({ required_error: "Please select a non-technical domain." }).min(1, "Please select a non-technical domain."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal('')),
  anythingElse: z.string().max(1000, "Response cannot exceed 1000 characters.").optional(),
  resume: z
    .any()
    .refine((files) => files?.length == 1, "Resume is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      ".pdf and .docx files are accepted."
    ),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions to submit your application.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ name: string, referenceId: string | null, summary: string | null } | null>(null);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      rollNo: "",
      cgpa: "",
      backlogs: "",
      joinReason: "",
      aboutClub: "",
      technicalDomain: "",
      nonTechnicalDomain: "",
      linkedin: "",
      anythingElse: "",
      terms: false,
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ["name", "email", "phone", "linkedin"];
    } else if (step === 2) {
      fieldsToValidate = ["rollNo", "branch", "section", "yearOfStudy", "cgpa", "backlogs"];
    } else if (step === 3) {
      fieldsToValidate = ["technicalDomain", "nonTechnicalDomain"];
    }

    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'resume') {
        formData.append(key, value[0]);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    try {
      const result = await submitApplication(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setSubmissionResult({ name: values.name, referenceId: result.referenceId || null, summary: result.summary || null });
      toast({
        title: "Application Submitted!",
        description: "We've received your application. Keep your reference ID safe.",
      });
      form.reset();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      await logClientError(
        `Failed to submit application for ${values.name}`,
        error,
        "ApplicationForm",
        user?.email || values.email || "unknown"
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

  const copyToClipboard = (text: string) => {
    copyToClipboardSafe(text).then((success) => {
      if (success) {
        toast({
          description: "Reference ID copied to clipboard!",
        });
      } else {
        toast({
          variant: "destructive",
          description: "Failed to copy reference ID. Please select and copy it manually.",
        });
      }
    });
  }

  if (submissionResult) {
    return (
      <div className="bg-white border-2 border-black shadow-[10px_10px_0px_0px_#00FF66] p-8 md:p-12 space-y-8 font-sans">
        <div className="border-b-2 border-black pb-6">
          <div className="inline-block px-3 py-1 bg-[#00FF66] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-3">
            [ APPLICATION RECORDED ]
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black uppercase italic tracking-tight text-black flex items-center gap-3">
            <ThumbsUp className="h-8 w-8 text-[#00A844] stroke-[2.5]" />
            APPLICATION RECEIVED!
          </h2>
          <p className="text-zinc-700 text-xs sm:text-sm font-semibold mt-2">
            Your candidate file has been created and synced with the evaluation database.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-[#FFE600] border-2 border-black p-5 shadow-[4px_4px_0px_0px_#000000]">
            <div className="flex items-center gap-2 text-black font-black text-xs uppercase tracking-wider mb-2">
              <AlertTriangle className="h-4 w-4 stroke-[3]" />
              IMPORTANT: SAVE YOUR REFERENCE ID
            </div>
            <p className="text-zinc-900 text-xs font-bold">
              Save your unique Reference ID below to track your evaluation status.
            </p>
          </div>

          {submissionResult.summary && (
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-wider text-black">AI-Generated Profile Summary</Label>
              <div className="text-xs text-zinc-800 p-4 border-2 border-black bg-[#F9F9FB] font-mono font-bold">
                {submissionResult.summary}
              </div>
            </div>
          )}

          {submissionResult.referenceId && (
            <div className="space-y-2">
              <Label htmlFor="referenceId" className="text-xs font-black uppercase tracking-wider text-black">Unique Candidate Reference ID</Label>
              <div className="flex items-center gap-3">
                <input
                  id="referenceId"
                  readOnly
                  value={submissionResult.referenceId}
                  className="bg-white border-2 border-black text-black font-mono font-bold text-sm px-4 py-3 w-full shadow-[2px_2px_0px_0px_#000000]"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(submissionResult.referenceId!)}
                  className="px-5 py-3 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-2 shrink-0"
                >
                  <ClipboardCopy className="h-4 w-4 stroke-[2.5]" />
                  COPY
                </button>
              </div>
            </div>
          )}

          <div className="bg-[#F9F9FB] border-2 border-black p-6 shadow-[4px_4px_0px_0px_#00FF66] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-black">
                COMMUNITY ONBOARDING CHANNEL
              </p>
              <p className="text-[11px] text-zinc-700 font-semibold mt-1">
                Join our official applicant community for real-time interview updates and round schedules.
              </p>
            </div>
            <a
              href="https://chat.whatsapp.com/BToVAcH9Kie5pt4vSjPHHw"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-[#00FF66] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all shrink-0"
            >
              JOIN WHATSAPP [↗]
            </a>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-zinc-200 text-black font-black text-xs uppercase tracking-wider border-2 border-black hover:bg-zinc-300 transition-all shadow-[2px_2px_0px_0px_#000000]"
            >
              SUBMIT ANOTHER APPLICATION
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stepper Header bubble navigation */}
      <div className="flex items-center justify-between mb-10 border-b-2 border-black pb-6 flex-wrap gap-2">
        {[
          { num: 1, label: "Personal Info" },
          { num: 2, label: "Academic Standing" },
          { num: 3, label: "Domain Track" },
          { num: 4, label: "Resume & Submit" }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={cn(
              "size-8 flex items-center justify-center text-xs font-black border-2 transition-all duration-200",
              step === s.num 
                ? "bg-[#FFE600] border-black text-black shadow-[3px_3px_0px_0px_#000000]" 
                : step > s.num
                  ? "bg-[#00FF66] border-black text-black shadow-[2px_2px_0px_0px_#000000]"
                  : "bg-[#F9F9FB] border-black text-zinc-500"
            )}>
              {s.num}
            </div>
            <span className={cn(
              "text-xs font-black uppercase tracking-wider",
              step === s.num ? "text-black" : "text-zinc-500"
            )}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b-2 border-black pb-4">
                <span className="text-[10px] bg-[#4285F4] text-white px-2.5 py-1 font-black tracking-widest uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  [ STEP 01 // PERSONAL CREDENTIALS ]
                </span>
                <h3 className="text-2xl font-display font-black uppercase italic tracking-tight mt-3 text-black">
                  CANDIDATE CONTACT INFO
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4]" />
                      </FormControl>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Email Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4]" />
                      </FormControl>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit mobile number" {...field} className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4]" />
                      </FormControl>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.linkedin.com/in/yourprofile/" {...field} className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4]" />
                      </FormControl>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Section 2: Academic Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b-2 border-black pb-4">
                <span className="text-[10px] bg-[#FFE600] text-black px-2.5 py-1 font-black tracking-widest uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  [ STEP 02 // ACADEMIC PROFILE ]
                </span>
                <h3 className="text-2xl font-display font-black uppercase italic tracking-tight mt-3 text-black">
                  ACADEMIC BACKGROUND
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="rollNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Roll Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 22A91A4201" {...field} className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600]" />
                      </FormControl>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Branch *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black focus:border-[#FFE600]">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-2 border-black text-black rounded-none">
                          {branches.map(branch => <SelectItem key={branch} value={branch} className="text-xs focus:bg-[#FFE600] focus:text-black">{branch}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Section *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black focus:border-[#FFE600]">
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-2 border-black text-black rounded-none">
                          {sections.map(section => <SelectItem key={section} value={section} className="text-xs focus:bg-[#FFE600] focus:text-black">{section}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearOfStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Year of Study *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black focus:border-[#FFE600]">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-2 border-black text-black rounded-none">
                          {years.map(year => <SelectItem key={year} value={year} className="text-xs focus:bg-[#FFE600] focus:text-black">{year}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cgpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Current CGPA *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 8.5" type="number" step="0.01" {...field} className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600]" />
                      </FormControl>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backlogs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Active Backlogs *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 0" type="number" {...field} className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600]" />
                      </FormControl>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Section 3: Domain Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b-2 border-black pb-4">
                <span className="text-[10px] bg-[#00FF66] text-black px-2.5 py-1 font-black tracking-widest uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  [ STEP 03 // TRACK SELECTION ]
                </span>
                <h3 className="text-2xl font-display font-black uppercase italic tracking-tight mt-3 text-black">
                  DOMAIN PREFERENCES
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="technicalDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">TECHNICAL DOMAIN INTEREST *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black focus:border-[#00FF66]">
                            <SelectValue placeholder="Select technical domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-2 border-black text-black rounded-none">
                          {technicalDomains.map(item => <SelectItem key={item.id} value={item.id} className="text-xs focus:bg-[#00FF66] focus:text-black">{item.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nonTechnicalDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-black">NON-TECHNICAL DOMAIN INTEREST *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black focus:border-[#00FF66]">
                            <SelectValue placeholder="Select non-technical domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-2 border-black text-black rounded-none">
                          {nonTechnicalDomains.map(item => <SelectItem key={item.id} value={item.id} className="text-xs focus:bg-[#00FF66] focus:text-black">{item.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600 text-[11px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Section 4: Statements & Submission */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b-2 border-black pb-4">
                <span className="text-[10px] bg-[#FF0055] text-white px-2.5 py-1 font-black tracking-widest uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  [ STEP 04 // STATEMENTS & VERIFICATION ]
                </span>
                <h3 className="text-2xl font-display font-black uppercase italic tracking-tight mt-3 text-black">
                  MOTIVATION & RESUME UPLOAD
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="joinReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Why do you want to join MLSC SVEC? *</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Describe your technical drive and expectations from the club..."
                            rows={4}
                            className="w-full bg-white border-2 border-black text-black p-3 text-xs focus:border-[#FF0055] focus:shadow-[3px_3px_0px_0px_#FF0055] outline-none placeholder-zinc-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aboutClub"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-wider text-black">What do you know about our club activities? *</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Share your awareness of MLSC events, workshops, or past initiatives..."
                            rows={4}
                            className="w-full bg-white border-2 border-black text-black p-3 text-xs focus:border-[#FF0055] focus:shadow-[3px_3px_0px_0px_#FF0055] outline-none placeholder-zinc-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="anythingElse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Additional Notes / Portfolio</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="GitHub repos, portfolio links, or any other notes..."
                            rows={3}
                            className="w-full bg-white border-2 border-black text-black p-3 text-xs focus:border-[#FF0055] focus:shadow-[3px_3px_0px_0px_#FF0055] outline-none placeholder-zinc-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resume"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem className="flex flex-col justify-between">
                        <div>
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Resume Upload (PDF / DOCX) *</FormLabel>
                          <FormControl className="mt-2">
                            <Input
                              type="file"
                              accept=".pdf,.docx"
                              onChange={(e) => onChange(e.target.files)}
                              {...rest}
                              className="bg-white border-2 border-black rounded-none h-12 px-4 text-xs text-black file:mr-4 file:py-1 file:px-3 file:border-2 file:border-black file:text-[10px] file:font-black file:uppercase file:bg-[#FFE600] file:text-black cursor-pointer flex items-center pt-2"
                            />
                          </FormControl>
                          <FormDescription className="text-[10px] text-zinc-600 mt-1">Upload your latest resume (max 5MB).</FormDescription>
                        </div>
                        <FormMessage className="text-red-600 text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 border-2 border-black bg-[#F9F9FB] p-4 shadow-[3px_3px_0px_0px_#000000]">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-2 border-black rounded-none h-5 w-5 data-[state=checked]:bg-[#00FF66] data-[state=checked]:border-black data-[state=checked]:text-black"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs font-bold text-black cursor-pointer">
                          I agree to the <Link href="/terms-and-conditions" className="text-[#4285F4] underline" target="_blank">terms and conditions</Link> *
                        </FormLabel>
                        <FormDescription className="text-[10px] text-zinc-600">
                          By submitting this form, you authorize MLSC SVEC to process your application data for recruitment evaluation.
                        </FormDescription>
                        <FormMessage className="text-red-600 text-[11px] font-bold" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t-2 border-black mt-8 flex-wrap gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-6 py-3 bg-zinc-200 border-2 border-black hover:bg-zinc-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000]"
              >
                [ ← BACK ]
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                CONTINUE TO NEXT STEP [→]
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-[#00FF66] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                SUBMIT OFFICIAL APPLICATION [↗]
              </button>
            )}
          </div>

        </form>
      </Form>
    </>
  );
}
