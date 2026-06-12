'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Form, Field as FormischField, reset, useForm, setInput } from '@formisch/react';
import type { SubmitHandler } from '@formisch/react';
import * as v from 'valibot';
import { toast } from '@/hooks/use-toast';
import { resubmitApplicationDetailsAction } from '@/app/actions/contributor-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';
import { Badge } from '@/components/ui/badge';
import { Terminal, Mail, Github, Sparkles, User, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

const ReverifySchema = v.object({
  github: v.pipe(
    v.string(),
    v.maxLength(39, "GitHub username must be at most 39 characters.")
  ),
  skills: v.pipe(
    v.string(),
    v.minLength(3, "Please enter your relevant skills."),
    v.maxLength(100, "Skills list must be at most 100 characters.")
  ),
  message: v.pipe(
    v.string(),
    v.minLength(15, "Please explain why you want to contribute in at least 15 characters."),
    v.maxLength(500, "Message must be at most 500 characters.")
  ),
});

function ReverifyPageContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    schema: ReverifySchema,
    initialInput: {
      github: '',
      skills: '',
      message: '',
    },
  });

  // Fetch application details
  useEffect(() => {
    if (!appId) {
      setLoading(false);
      return;
    }

    const fetchApp = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'contributions', appId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAppData(data);
          
          // Prefill values
          setInput(form, { path: ['github'], input: data.github || '' });
          setInput(form, { path: ['skills'], input: data.skills || '' });
          setInput(form, { path: ['message'], input: data.message || '' });
        }
      } catch (err) {
        console.error("Error fetching application details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [appId]);

  const handleSubmit: SubmitHandler<typeof ReverifySchema> = async (output) => {
    if (!appId) return;
    setSubmitting(true);
    try {
      const res = await resubmitApplicationDetailsAction(
        appId,
        output.github,
        output.skills,
        output.message
      );

      if (res.success) {
        toast.success("Application Resubmitted!", {
          description: "Your updated details have been received. We will re-evaluate your request shortly.",
        });
        setSuccess(true);
      } else {
        toast.danger("Submission failed", {
          description: res.error || "Please try again later.",
        });
      }
    } catch (err: any) {
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Failed to resubmit reverification details for application ${appId}`,
        err,
        "ReverifyPage",
        appData?.email || "unknown"
      );
      toast.danger("An error occurred", {
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4] mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-white/40">Loading application data...</p>
      </div>
    );
  }

  if (!appId || !appData) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 max-w-sm text-center space-y-4">
          <ShieldAlert className="h-8 w-8 text-red-500 mx-auto" />
          <h3 className="text-base font-black uppercase tracking-tight italic">Invalid Application Reference</h3>
          <p className="text-xs text-white/50 leading-relaxed font-medium">
            The reference link you followed is missing or has expired. Please verify your email invitation and try again.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
        <div className="p-8 rounded-2xl bg-zinc-900 border border-emerald-500/10 max-w-md text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
          <h3 className="text-lg font-black uppercase tracking-tight italic">Resubmission Complete!</h3>
          <p className="text-xs text-white/60 leading-relaxed font-medium">
            Your details have been resubmitted successfully. An email confirmation has been sent to <strong>{appData.email}</strong>.
          </p>
          <p className="text-[11px] text-white/40 leading-relaxed">
            Our super admin team will verify your updated GitHub and skills details. You will receive an email once the access is granted.
          </p>
          <Button asChild className="w-full rounded-xl bg-white text-black font-bold h-10 text-xs uppercase tracking-wider">
            <a href="/">Go to Home Page</a>
          </Button>
        </div>
      </div>
    );
  }

  if (appData.status === 'approved') {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/10 max-w-md text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <h3 className="text-base font-black uppercase tracking-tight italic">Already Approved</h3>
          <p className="text-xs text-white/50 leading-relaxed font-medium">
            Your application under <strong>{appData.email}</strong> is already approved.
          </p>
          <p className="text-[11px] text-white/40 leading-relaxed">
            You can access the workspace using the Contributor Dashboard with your registered credentials.
          </p>
          <Button asChild className="w-full rounded-xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold h-10 text-xs uppercase tracking-wider">
            <a href="/contribute/dashboard">Access Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black min-h-screen py-24 md:py-32 text-white">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        
        {/* Banner */}
        <div className="space-y-2 border-b border-white/[0.08] pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-400 italic">
            <AlertCircle className="h-3.5 w-3.5 animate-pulse" /> Reverification Required
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
            Update <span className="text-[#4285F4]">Details</span>
          </h1>
          <p className="text-white/40 font-medium text-xs">
            Review feedback from the admin team and update your submission credentials below.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Admin Feedback */}
          <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] space-y-3 md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Administrative Feedback
            </h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium bg-black/40 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
              {appData.feedback || "Please double check your GitHub username and provide more specific skills."}
            </p>
          </div>

          {/* Submitter Info Card */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#050505] space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Profile Info</h4>
            <div className="space-y-2.5 text-xs text-white/70">
              <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                <span className="text-white/45">Name:</span>
                <span className="font-bold text-white">{appData.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                <span className="text-white/45">Email:</span>
                <span className="font-bold text-white truncate max-w-[150px]">{appData.email}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                <span className="text-white/45">Department:</span>
                <span className="font-bold text-white">{appData.department}</span>
              </div>
            </div>
          </div>

          {/* Git Reminder Card */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#050505] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4285F4] flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" /> Onboarding Path
              </h4>
              <p className="text-[11px] text-white/50 leading-relaxed mt-2 font-medium">
                Make sure your GitHub username is spelled exactly as it appears online. The supervisor will use it to grant direct repository access.
              </p>
            </div>
            <Badge className="text-[9px] uppercase tracking-wider font-extrabold w-fit mt-4 bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 select-none">
              Dev Branch Guidelines
            </Badge>
          </div>
        </div>

        {/* Update Form */}
        <Card className="w-full bg-[#080808]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] text-white p-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-black tracking-tight text-white uppercase italic flex items-center gap-2">
              <Terminal className="h-5 w-5 text-[#4285F4]" />
              Resubmission Form
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 font-medium">
              Update your GitHub account or add context about your developer experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form of={form} id="reverify-form-formisch" onSubmit={handleSubmit}>
              <FieldGroup className="space-y-4">
                
                {/* GitHub Username */}
                <FormischField of={form} path={["github"]}>
                  {(field) => (
                    <Field data-invalid={field.errors !== null}>
                      <FieldLabel htmlFor="reverify-github">GitHub Username</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="block-start">
                          <InputGroupText>
                            <Github className="h-3.5 w-3.5 text-white/30" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          {...field.props}
                          id="reverify-github"
                          value={field.input ?? ""}
                          placeholder="github-username"
                          autoComplete="off"
                          aria-invalid={field.errors !== null}
                        />
                      </InputGroup>
                      {field.errors && (
                        <FieldError errors={field.errors.map((message) => ({ message }))} />
                      )}
                    </Field>
                  )}
                </FormischField>

                {/* Skills */}
                <FormischField of={form} path={["skills"]}>
                  {(field) => (
                    <Field data-invalid={field.errors !== null}>
                      <FieldLabel htmlFor="reverify-skills">Updated Skills List</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="block-start">
                          <InputGroupText>
                            <Sparkles className="h-3.5 w-3.5 text-white/30" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          {...field.props}
                          id="reverify-skills"
                          value={field.input ?? ""}
                          placeholder="React, Typescript, Tailwind, Python"
                          autoComplete="off"
                          aria-invalid={field.errors !== null}
                        />
                      </InputGroup>
                      {field.errors && (
                        <FieldError errors={field.errors.map((message) => ({ message }))} />
                      )}
                    </Field>
                  )}
                </FormischField>

                {/* Message */}
                <FormischField of={form} path={["message"]}>
                  {(field) => (
                    <Field data-invalid={field.errors !== null}>
                      <FieldLabel htmlFor="reverify-msg">Elaborate Motivation / Project Details</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field.props}
                          id="reverify-msg"
                          value={field.input ?? ""}
                          placeholder="Provide details about your projects or clarify any questions raised in the feedback."
                          rows={5}
                          className="min-h-24 resize-none text-xs"
                          aria-invalid={field.errors !== null}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums text-[10px]">
                            {(field.input ?? "").length}/500 characters
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      {field.errors && (
                        <FieldError errors={field.errors.map((message) => ({ message }))} />
                      )}
                    </Field>
                  )}
                </FormischField>

                <Button
                  type="submit"
                  form="reverify-form-formisch"
                  disabled={submitting}
                  className="w-full rounded-xl bg-white text-black font-black hover:bg-white/95 h-11 text-xs tracking-wider uppercase transition-transform active:scale-[0.98] mt-2"
                >
                  {submitting ? "Resubmitting details..." : "Resubmit Application Details"}
                </Button>

              </FieldGroup>
            </Form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default function ReverifyPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4] mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-white/40">Loading workspace...</p>
      </div>
    }>
      <ReverifyPageContent />
    </Suspense>
  );
}
