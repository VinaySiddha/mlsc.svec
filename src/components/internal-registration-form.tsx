"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ThumbsUp, 
  ClipboardCopy, 
  AlertTriangle,
  UserCheck,
  ArrowRight,
  UserPlus
} from "lucide-react";

import { internalRegister } from "@/app/actions";
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
  branch: z.string({ required_error: "Please select candidate's branch." }),
  section: z.string({ required_error: "Please select candidate's section." }),
  yearOfStudy: z.string({ required_error: "Please select candidate's year of study." }),
  cgpa: z.string().min(1, "CGPA is required.").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10, { message: "Please enter a valid CGPA between 0 and 10." }),
  backlogs: z.string().min(1, "Number of backlogs is required.").refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, { message: "Please enter a valid number." }),
  technicalDomain: z.string({ required_error: "Please select a technical domain." }).min(1, "Please select a technical domain."),
  nonTechnicalDomain: z.string({ required_error: "Please select a non-technical domain." }).min(1, "Please select a non-technical domain."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal('')),
  joinReason: z.string().max(1000, "Response cannot exceed 1000 characters.").optional(),
  aboutClub: z.string().max(1000, "Response cannot exceed 1000 characters.").optional(),
  anythingElse: z.string().max(1000, "Response cannot exceed 1000 characters.").optional(),
  terms: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function InternalRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ name: string; referenceId: string | null } | null>(null);
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
      technicalDomain: "",
      nonTechnicalDomain: "",
      linkedin: "",
      joinReason: "",
      aboutClub: "",
      anythingElse: "",
      terms: true,
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

    try {
      const result = await internalRegister(values);

      if (result.error) {
        throw new Error(result.error);
      }

      setSubmissionResult({ name: values.name, referenceId: result.referenceId || null });
      toast({
        title: "Candidate Registered!",
        description: "The candidate has been successfully added to the system.",
      });
      form.reset();
      setStep(1);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      await logClientError(
        `Failed to internally register student ${values.name}`,
        error,
        "InternalRegistrationForm",
        user?.email || "unknown"
      );
      toast({
        variant: "destructive",
        title: "Registration Failed",
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
  };

  if (submissionResult) {
    return (
      <Card className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <CardHeader className="p-0 pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-white">
            <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ThumbsUp className="h-6 w-6" />
            </span>
            <span>Candidate Registered!</span>
          </CardTitle>
          <CardDescription className="text-white/50 text-xs mt-1">
            Application profile for <strong className="text-white">{submissionResult.name}</strong> created in Chapter pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          <Alert className="bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4] rounded-2xl">
            <AlertTriangle className="h-4 w-4 text-[#4285F4]" />
            <AlertTitle className="font-bold text-xs uppercase tracking-wider">Candidate Reference ID</AlertTitle>
            <AlertDescription className="text-xs text-white/70 mt-1">
              Share this Reference ID with the candidate so they can track their application and interview status.
            </AlertDescription>
          </Alert>

          {submissionResult.referenceId && (
            <div className="space-y-2">
              <Label htmlFor="referenceId" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                Generated Reference ID
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="referenceId"
                  readOnly
                  value={submissionResult.referenceId}
                  className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm font-mono text-[#4285F4] font-bold"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => copyToClipboard(submissionResult.referenceId!)}
                  className="h-12 w-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0"
                >
                  <ClipboardCopy className="h-5 w-5" />
                  <span className="sr-only">Copy Reference ID</span>
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/5">
            <Button 
              onClick={() => {
                setSubmissionResult(null);
                form.reset();
                setStep(1);
              }} 
              variant="outline"
              className="w-full sm:w-auto rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider h-11 px-6"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Register Another Candidate
            </Button>
            <Button asChild className="w-full sm:w-auto rounded-xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold text-xs uppercase tracking-wider h-11 px-6">
              <Link href="/admin/applications" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span>View in Applications</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Stepper Header bubble navigation */}
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
        {[
          { num: 1, label: "Personal" },
          { num: 2, label: "Academic" },
          { num: 3, label: "Domains" },
          { num: 4, label: "Submit" }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={cn(
              "flex aspect-square size-7 items-center justify-center rounded-full text-xs font-black border transition-all duration-300",
              step === s.num 
                ? "bg-[#4285F4] border-[#4285F4] text-white shadow-[0_0_10px_rgba(66,133,244,0.3)]" 
                : step > s.num
                  ? "bg-[#4285F4]/20 border-[#4285F4]/40 text-[#4285F4]"
                  : "bg-white/5 border-white/10 text-white/30"
            )}>
              {s.num}
            </div>
            <span className={cn(
              "hidden sm:inline text-[10px] font-black uppercase tracking-wider",
              step === s.num ? "text-white" : "text-white/30"
            )}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          {/* Section 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-b border-white/5 pb-4 mb-6">
                <span className="text-[9px] bg-[#4285F4]/10 text-[#4285F4] px-2.5 py-1 rounded font-black tracking-widest uppercase">
                  Section 01
                </span>
                <h3 className="text-base font-black uppercase italic tracking-tight mt-2 text-white">
                  Personal <span className="text-[#4285F4]">Details</span>
                </h3>
                <p className="text-[11px] text-white/40 mt-1">Candidate contact details and professional links.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all text-white placeholder:text-white/30" />
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Email Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all text-white placeholder:text-white/30" />
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit number" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all text-white placeholder:text-white/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">LinkedIn Profile (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.linkedin.com/in/profile" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all text-white placeholder:text-white/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Section 2: Academic Info */}
          {step === 2 && (
            <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-b border-white/5 pb-4 mb-6">
                <span className="text-[9px] bg-[#4285F4]/10 text-[#4285F4] px-2.5 py-1 rounded font-black tracking-widest uppercase">
                  Section 02
                </span>
                <h3 className="text-base font-black uppercase italic tracking-tight mt-2 text-white">
                  Academic <span className="text-[#4285F4]">Information</span>
                </h3>
                <p className="text-[11px] text-white/40 mt-1">Details regarding current course, section, CGPA, and standing.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="rollNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Roll No *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 22A91A4201" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all text-white placeholder:text-white/30" />
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Branch *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] focus:ring-0 focus:ring-offset-0 transition-all text-left w-full text-white">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-xl">
                          {branches.map(branch => <SelectItem key={branch} value={branch} className="rounded-lg">{branch}</SelectItem>)}
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Section *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] focus:ring-0 focus:ring-offset-0 transition-all text-left w-full text-white">
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-xl">
                          {sections.map(section => <SelectItem key={section} value={section} className="rounded-lg">{section}</SelectItem>)}
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Year of Study *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] focus:ring-0 focus:ring-offset-0 transition-all text-left w-full text-white">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-xl">
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Current CGPA *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 8.5" type="number" step="0.01" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all text-white placeholder:text-white/30" />
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">No of Backlogs *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 0" type="number" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all text-white placeholder:text-white/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Section 3: Domain Preferences */}
          {step === 3 && (
            <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-b border-white/5 pb-4 mb-6">
                <span className="text-[9px] bg-[#4285F4]/10 text-[#4285F4] px-2.5 py-1 rounded font-black tracking-widest uppercase">
                  Section 03
                </span>
                <h3 className="text-base font-black uppercase italic tracking-tight mt-2 text-white">
                  Domain <span className="text-[#4285F4]">Preferences</span>
                </h3>
                <p className="text-[11px] text-white/40 mt-1">Select the technical and non-technical domains for this candidate.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="technicalDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">TECHNICAL DOMAIN *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] focus:ring-0 focus:ring-offset-0 transition-all text-left w-full text-white">
                            <SelectValue placeholder="Select technical domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-xl">
                          {technicalDomains.map(item => <SelectItem key={item.id} value={item.id} className="rounded-lg">{item.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nonTechnicalDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">NON-TECHNICAL DOMAIN *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] focus:ring-0 focus:ring-offset-0 transition-all text-left w-full text-white">
                            <SelectValue placeholder="Select non-technical domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-xl">
                          {nonTechnicalDomains.map(item => <SelectItem key={item.id} value={item.id} className="rounded-lg">{item.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Section 4: Statements & Confirmation */}
          {step === 4 && (
            <div className="space-y-8 bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-b border-white/5 pb-4 mb-6">
                <span className="text-[9px] bg-[#4285F4]/10 text-[#4285F4] px-2.5 py-1 rounded font-black tracking-widest uppercase">
                  Section 04
                </span>
                <h3 className="text-base font-black uppercase italic tracking-tight mt-2 text-white">
                  Statements & <span className="text-[#4285F4]">Confirmation</span>
                </h3>
                <p className="text-[11px] text-white/40 mt-1">Optional background statements, interviewer notes, and confirmation.</p>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="joinReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Why join MLSC? (Optional)</FormLabel>
                        <FormControl>
                          <InputGroup className="bg-white/5 border-white/10 rounded-xl overflow-hidden">
                            <InputGroupTextarea
                              placeholder="Motivation or notes on why the candidate wants to join..."
                              className="min-h-28 text-sm text-white focus-visible:ring-0 placeholder:text-white/30 border-0"
                              {...field}
                            />
                            <InputGroupAddon align="block-end" className="border-white/5 bg-white/[0.02]">
                              <InputGroupText className="text-white/40 tabular-nums">
                                {(field.value || "").length}/1000 characters
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">What they know about MLSC (Optional)</FormLabel>
                        <FormControl>
                          <InputGroup className="bg-white/5 border-white/10 rounded-xl overflow-hidden">
                            <InputGroupTextarea
                              placeholder="Candidate knowledge about club activities or chapters..."
                              className="min-h-28 text-sm text-white focus-visible:ring-0 placeholder:text-white/30 border-0"
                              {...field}
                            />
                            <InputGroupAddon align="block-end" className="border-white/5 bg-white/[0.02]">
                              <InputGroupText className="text-white/40 tabular-nums">
                                {(field.value || "").length}/1000 characters
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="anythingElse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Admin Notes / Additional Remarks (Optional)</FormLabel>
                      <FormControl>
                        <InputGroup className="bg-white/5 border-white/10 rounded-xl overflow-hidden">
                          <InputGroupTextarea
                            placeholder="Add any additional notes, referral details, or manual screening comments..."
                            className="min-h-24 text-sm text-white focus-visible:ring-0 placeholder:text-white/30 border-0"
                            {...field}
                          />
                          <InputGroupAddon align="block-end" className="border-white/5 bg-white/[0.02]">
                            <InputGroupText className="text-white/40 tabular-nums">
                              {(field.value || "").length}/1000 characters
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-white/30 rounded-md h-5 w-5 focus-visible:ring-offset-0 focus-visible:ring-[#4285F4] data-[state=checked]:bg-[#4285F4] data-[state=checked]:border-[#4285F4]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-semibold text-white/80 cursor-pointer">
                          Confirm internal candidate registration *
                        </FormLabel>
                        <FormDescription className="text-xs text-white/40">
                          Candidate profile will be added to the Chapter pipeline with 'Received' status ready for live interview evaluation.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-8">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((prev) => prev - 1)}
                className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider h-11 px-6"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-black text-xs uppercase tracking-wider h-11 px-8 flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <SlideToConfirmButton
                label="Slide to register candidate"
                confirmedLabel="Registering candidate..."
                onConfirm={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                isConfirmed={isSubmitting}
                autoResetDelay={0}
                className="max-w-xs w-full"
              />
            )}
          </div>

        </form>
      </Form>
    </>
  );
}
