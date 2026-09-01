'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Form, Field as FormischField, useForm, setInput } from '@formisch/react';
import type { SubmitHandler } from '@formisch/react';
import * as v from 'valibot';
import { toast } from '@/hooks/use-toast';
import { resubmitApplicationDetailsAction } from '@/app/actions/contributor-actions';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';
import { Terminal, Github, Sparkles, AlertCircle, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans">
        <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0px_0px_#000000] text-center space-y-3">
          <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-wider text-black">Fetching Application Record...</p>
        </div>
      </div>
    );
  }

  if (!appId || !appData) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans px-4">
        <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] max-w-md w-full text-center space-y-4">
          <div className="p-3 bg-[#EA4335] text-white border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000000]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black uppercase italic tracking-tight text-black">Invalid Application Reference</h3>
          <p className="text-xs text-zinc-600 font-bold leading-relaxed">
            The reference ID is invalid or missing. Please verify your notification email link and try again.
          </p>
          <Button asChild className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[3px_3px_0px_0px_#000000]">
            <Link href="/contribute">Return to Contributor Portal</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans px-4">
        <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] max-w-md w-full text-center space-y-4">
          <div className="p-3 bg-[#00FF66] text-black border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000000]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight text-black">Resubmission Complete!</h3>
          <p className="text-xs text-zinc-600 font-bold leading-relaxed">
            Your updated credentials have been recorded. Confirmation sent to <strong className="text-black">{appData.email}</strong>.
          </p>
          <Button asChild className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[3px_3px_0px_0px_#000000]">
            <Link href="/">Go to Home Page</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (appData.status === 'approved') {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans px-4">
        <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] max-w-md w-full text-center space-y-4">
          <div className="p-3 bg-[#00FF66] text-black border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000000]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight text-black">Application Already Approved</h3>
          <p className="text-xs text-zinc-600 font-bold leading-relaxed">
            Your contributor profile for <strong className="text-black">{appData.email}</strong> is already verified and active.
          </p>
          <Button asChild className="w-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[3px_3px_0px_0px_#000000]">
            <Link href="/contribute/dashboard">Access Contributor Workspace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen py-16 md:py-24 text-black font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ MLSC Developer Verification & Credential Update Portal
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 space-y-8 pt-6">
        
        {/* Banner */}
        <div className="space-y-1 border-b-2 border-black pb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black hover:text-[#4285F4] transition-colors mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-black">
            Update <span className="bg-[#FFE600] border-2 border-black px-2 shadow-[3px_3px_0px_0px_#000000]">Credentials</span>
          </h1>
          <p className="text-xs text-zinc-600 font-bold">
            Review feedback from the admin team and update your submission credentials below.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Feedback */}
          <div className="border-2 border-black bg-zinc-50 p-5 shadow-[4px_4px_0px_0px_#000000] space-y-2 md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-[#EA4335]" /> Administrative Review Feedback
            </h4>
            <p className="text-xs text-zinc-700 font-bold bg-white p-3 border-2 border-black whitespace-pre-wrap shadow-[2px_2px_0px_0px_#000000]">
              {appData.feedback || "Please double check your GitHub username and provide more specific skills."}
            </p>
          </div>

          {/* Submitter Info Card */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000] space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-black border-b border-black pb-1.5">Profile Info</h4>
            <div className="space-y-2 text-xs font-bold text-zinc-700">
              <div className="flex justify-between border-b border-zinc-200 pb-1">
                <span>Name:</span>
                <span className="text-black">{appData.name}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-1">
                <span>Email:</span>
                <span className="text-black font-mono truncate max-w-[150px]">{appData.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="text-black">{appData.department}</span>
              </div>
            </div>
          </div>

          {/* Git Reminder Card */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5 border-b border-black pb-1.5">
                <Terminal className="h-4 w-4 text-[#4285F4]" /> Accuracy Notice
              </h4>
              <p className="text-xs text-zinc-600 font-bold leading-relaxed mt-2">
                Make sure your GitHub username is exact. The supervisor will invite this username to the organization repo.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-[#FFE600] border border-black text-black w-fit mt-3 shadow-[1px_1px_0px_0px_#000000]">
              SVEC Engineering Wing
            </span>
          </div>
        </div>

        {/* Update Form */}
        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
          <div className="border-b-2 border-black pb-4 space-y-1">
            <h3 className="text-xl font-black uppercase italic tracking-tight text-black flex items-center gap-2">
              <Terminal className="h-5 w-5 text-black" />
              Resubmission Form
            </h3>
            <p className="text-xs text-zinc-600 font-bold">
              Update your GitHub account or add context about your developer experience.
            </p>
          </div>

          <Form of={form} id="reverify-form-formisch" onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4">
              
              {/* GitHub Username */}
              <FormischField of={form} path={["github"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="reverify-github" className="text-xs font-black uppercase text-black">
                      GitHub Username <span className="text-[#EA4335]">*</span>
                    </FieldLabel>
                    <Input
                      {...field.props}
                      id="reverify-github"
                      value={field.input ?? ""}
                      placeholder="github-username"
                      autoComplete="off"
                      aria-invalid={field.errors !== null}
                      className="h-11 px-3 border-2 border-black bg-white text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    />
                    {field.errors && (
                      <FieldError errors={field.errors.map((message) => ({ message }))} className="text-xs font-bold text-[#EA4335]" />
                    )}
                  </Field>
                )}
              </FormischField>

              {/* Skills */}
              <FormischField of={form} path={["skills"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="reverify-skills" className="text-xs font-black uppercase text-black">
                      Updated Skills List <span className="text-[#EA4335]">*</span>
                    </FieldLabel>
                    <Input
                      {...field.props}
                      id="reverify-skills"
                      value={field.input ?? ""}
                      placeholder="e.g. Next.js, TypeScript, Tailwind, Python"
                      autoComplete="off"
                      aria-invalid={field.errors !== null}
                      className="h-11 px-3 border-2 border-black bg-white text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    />
                    {field.errors && (
                      <FieldError errors={field.errors.map((message) => ({ message }))} className="text-xs font-bold text-[#EA4335]" />
                    )}
                  </Field>
                )}
              </FormischField>

              {/* Message */}
              <FormischField of={form} path={["message"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="reverify-msg" className="text-xs font-black uppercase text-black">
                      Motivation / Project Details <span className="text-[#EA4335]">*</span>
                    </FieldLabel>
                    <InputGroup className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000000]">
                      <InputGroupTextarea
                        {...field.props}
                        id="reverify-msg"
                        value={field.input ?? ""}
                        placeholder="Provide details about your projects or clarify any questions raised in the feedback."
                        rows={4}
                        className="resize-none text-xs font-bold p-3 text-black focus:outline-none"
                        aria-invalid={field.errors !== null}
                      />
                      <InputGroupAddon align="block-end" className="p-2 border-t border-black bg-zinc-50">
                        <InputGroupText className="tabular-nums text-[10px] font-mono font-bold text-zinc-600">
                          {(field.input ?? "").length}/500 chars
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {field.errors && (
                      <FieldError errors={field.errors.map((message) => ({ message }))} className="text-xs font-bold text-[#EA4335]" />
                    )}
                  </Field>
                )}
              </FormischField>

              <Button
                type="submit"
                form="reverify-form-formisch"
                disabled={submitting}
                className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-widest h-12 shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
              >
                {submitting ? "Resubmitting Credentials..." : "Resubmit Application Details"}
              </Button>

            </FieldGroup>
          </Form>
        </div>

      </div>
    </div>
  );
}

export default function ReverifyPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans">
        <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0px_0px_#000000] text-center space-y-3">
          <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-wider text-black">Loading reverification workspace...</p>
        </div>
      </div>
    }>
      <ReverifyPageContent />
    </Suspense>
  );
}
