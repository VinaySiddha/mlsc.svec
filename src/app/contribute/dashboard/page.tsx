'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { submitPullRequestAction } from '@/app/actions/contributor-actions';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';
import { Form, Field as FormischField, reset, useForm } from '@formisch/react';
import type { SubmitHandler } from '@formisch/react';
import * as v from 'valibot';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { 
  GitPullRequest, 
  Terminal, 
  Github, 
  ExternalLink, 
  ShieldAlert, 
  GitBranch, 
  Lock,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PRFormSchema = v.object({
  prLink: v.pipe(
    v.string(),
    v.url("Please enter a valid GitHub Pull Request URL."),
    v.regex(/github\.com\/.*\/pull\/\d+/, "URL must match a GitHub Pull Request format.")
  ),
  branchName: v.pipe(
    v.string(),
    v.minLength(3, "Branch name must be at least 3 characters.")
  ),
  title: v.pipe(
    v.string(),
    v.minLength(5, "Contribution title must be at least 5 characters.")
  ),
  description: v.pipe(
    v.string(),
    v.minLength(10, "Description must be at least 10 characters."),
    v.maxLength(300, "Description must be at most 300 characters.")
  ),
});

interface PRSubmission {
  id: string;
  prLink: string;
  branchName: string;
  title: string;
  description: string;
  status: 'pending' | 'merged' | 'rejected';
  createdAt: string;
  mergedAt?: string;
}

export default function ContributorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [submittingPR, setSubmittingPR] = useState(false);
  const [prSubmissions, setPrSubmissions] = useState<PRSubmission[]>([]);

  const form = useForm({
    schema: PRFormSchema,
    initialInput: {
      prLink: '',
      branchName: '',
      title: '',
      description: '',
    },
  });

  // Verify access status in contributions collection
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsApproved(false);
      setCheckingAccess(false);
      return;
    }

    const q = query(
      collection(db, 'contributions'), 
      where('email', '==', user.email),
      where('status', '==', 'approved')
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setIsApproved(true);
      } else {
        setIsApproved(false);
      }
      setCheckingAccess(false);
    });

    return () => unsub();
  }, [user, authLoading]);

  // Load PR submissions
  useEffect(() => {
    if (!user || !isApproved) return;

    const q = query(
      collection(db, 'pullRequests'),
      where('email', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: PRSubmission[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PRSubmission);
      });
      setPrSubmissions(list);
    });

    return () => unsub();
  }, [user, isApproved]);

  const handlePRSubmit: SubmitHandler<typeof PRFormSchema> = async (output) => {
    if (!user) return;
    setSubmittingPR(true);
    try {
      const res = await submitPullRequestAction(
        user.displayName || 'Contributor',
        user.email || '',
        output.prLink,
        output.branchName,
        output.title,
        output.description
      );

      if (res.success) {
        toast.success("PR Merge Request Submitted!", {
          description: "An email has been sent to the admin. You will receive an email once your PR is merged.",
        });
        reset(form);
      } else {
        toast.danger("Submission failed", { description: res.error });
      }
    } catch (err: any) {
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Failed to submit PR merge request: ${output.title}`,
        err,
        "ContributorDashboardPage",
        user.email || "unknown"
      );
      toast.danger("An error occurred", { description: err.message });
    } finally {
      setSubmittingPR(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (authLoading || checkingAccess) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans">
        <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0px_0px_#000000] text-center space-y-3">
          <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-wider text-black">Verifying developer credentials...</p>
        </div>
      </div>
    );
  }

  // Not Logged In Screen
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans px-4">
        <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] max-w-md w-full text-center space-y-4">
          <div className="p-3 bg-[#FFE600] border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000000]">
            <Lock className="h-6 w-6 text-black" />
          </div>
          <h3 className="text-lg font-black uppercase italic tracking-tight text-black">Authentication Required</h3>
          <p className="text-xs text-zinc-600 font-bold leading-relaxed">
            You must be signed in with your registered student account to access the developer workspace.
          </p>
          <Button asChild className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[3px_3px_0px_0px_#000000]">
            <a href={`/auth/login?redirect=/contribute/dashboard`}>Sign In with MLSC Account</a>
          </Button>
        </div>
      </div>
    );
  }

  // Pending / Not Approved Screen
  if (!isApproved) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans px-4">
        <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] max-w-md w-full text-center space-y-4">
          <div className="p-3 bg-[#EA4335] border-2 border-black text-white inline-block shadow-[2px_2px_0px_0px_#000000]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black uppercase italic tracking-tight text-black">Verification Pending</h3>
          <p className="text-xs text-zinc-600 font-bold leading-relaxed">
            No approved contributor authorization found for <strong className="text-black">{user.email}</strong>.
          </p>
          <p className="text-xs text-zinc-500 font-bold leading-relaxed">
            If you haven't applied yet, submit an application on our contributor portal. If already submitted, our team will review your GitHub request shortly.
          </p>
          <Button asChild className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[3px_3px_0px_0px_#000000]">
            <Link href="/contribute">Submit Contributor Request</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen py-16 md:py-24 text-black font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ MLSC SVEC Open-Source Workspace & PR Verification Console
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 space-y-8 pt-6">
        
        {/* Header banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black hover:text-[#4285F4] transition-colors mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-black">
              Developer <span className="bg-[#FFE600] border-2 border-black px-2 shadow-[3px_3px_0px_0px_#000000]">Dashboard</span>
            </h1>
            <p className="text-xs text-zinc-600 font-bold">
              Verified Contributor: <strong className="text-black font-mono">{user.displayName || user.email}</strong>
            </p>
          </div>
          
          <a
            href="https://github.com/VinaySiddha/mlsc.svec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] hover:bg-[#FFE600]/90 text-black px-5 h-11 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] shrink-0"
          >
            <Github className="h-4 w-4" /> GitHub Repo <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Guidelines & Submissions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Guidelines Card */}
            <div className="border-2 border-black bg-zinc-50 p-6 shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5 border-b border-black pb-2">
                <GitBranch className="h-4 w-4 text-[#4285F4]" /> Branch Workflow Guidelines
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-700 font-bold leading-relaxed">
                <li className="flex gap-2">
                  <span className="font-black text-black">1.</span>
                  <span>Clone repo: <code className="bg-white border border-black text-black px-1 py-0.5 font-mono text-[11px]">git clone https://github.com/VinaySiddha/mlsc.svec.git</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-black">2.</span>
                  <span>Checkout feature branch: <code className="bg-white border border-black text-black px-1 py-0.5 font-mono text-[11px]">git checkout -b feature/username</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-black">3.</span>
                  <span>Make code modifications, commit, and open a Pull Request.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-black">4.</span>
                  <span>Submit the review form on the right to notify the tech lead.</span>
                </li>
              </ul>
            </div>

            {/* List of Submissions */}
            <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                  <GitPullRequest className="h-4 w-4 text-[#00A844]" /> My Pull Request Logs
                </h3>
                <span className="border border-black bg-[#FFE600] px-2 py-0.5 text-[9px] font-black uppercase">
                  {prSubmissions.length} Submissions
                </span>
              </div>
              
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {prSubmissions.length === 0 ? (
                  <div className="py-8 border-2 border-dashed border-zinc-300 text-center text-xs text-zinc-400 font-bold">
                    No PR reviews submitted yet.
                  </div>
                ) : (
                  prSubmissions.map((pr) => (
                    <div key={pr.id} className="p-3 border-2 border-black bg-zinc-50 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          'text-[9px] font-black uppercase px-2 py-0.5 border border-black',
                          pr.status === 'merged' ? 'bg-[#00FF66] text-black' :
                          pr.status === 'rejected' ? 'bg-[#EA4335] text-white' :
                          'bg-[#FFE600] text-black'
                        )}>
                          {pr.status === 'merged' ? 'Merged ✓' : pr.status === 'rejected' ? 'Changes Needed' : 'In Review'}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono font-bold">{formatDate(pr.createdAt)}</span>
                      </div>
                      <h4 className="text-xs font-black uppercase text-black">{pr.title}</h4>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200">
                        <span className="text-zinc-600 font-mono text-[10px]">Branch: <strong className="text-black">{pr.branchName}</strong></span>
                        <a href={pr.prLink} target="_blank" rel="noopener noreferrer" className="text-[#4285F4] hover:underline inline-flex items-center gap-1 font-black text-[10px] uppercase">
                          View PR <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right: PR Submit Form */}
          <div className="lg:col-span-7">
            <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
              <div className="border-b-2 border-black pb-4 space-y-1">
                <h3 className="text-xl font-black uppercase italic tracking-tight text-black flex items-center gap-2">
                  <GitPullRequest className="h-5 w-5 text-black" />
                  Request <span className="bg-[#FFE600] border border-black px-1.5">PR Merge</span>
                </h3>
                <p className="text-xs text-zinc-600 font-bold">
                  After submitting code on GitHub, fill this form to initiate official club review.
                </p>
              </div>

              <Form of={form} id="pr-submit-form" onSubmit={handlePRSubmit}>
                <FieldGroup className="space-y-4">
                  
                  {/* PR Title */}
                  <FormischField of={form} path={["title"]}>
                    {(field) => (
                      <Field data-invalid={field.errors !== null}>
                        <FieldLabel htmlFor="pr-title" className="text-xs font-black uppercase text-black">
                          Contribution Title <span className="text-[#EA4335]">*</span>
                        </FieldLabel>
                        <Input
                          {...field.props}
                          id="pr-title"
                          value={field.input ?? ""}
                          placeholder="e.g. Added responsive Chapter 4 components"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Branch Name */}
                    <FormischField of={form} path={["branchName"]}>
                      {(field) => (
                        <Field data-invalid={field.errors !== null}>
                          <FieldLabel htmlFor="pr-branch" className="text-xs font-black uppercase text-black">
                            Branch Name <span className="text-[#EA4335]">*</span>
                          </FieldLabel>
                          <Input
                            {...field.props}
                            id="pr-branch"
                            value={field.input ?? ""}
                            placeholder="feature/calendar-view"
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

                    {/* GitHub PR URL */}
                    <FormischField of={form} path={["prLink"]}>
                      {(field) => (
                        <Field data-invalid={field.errors !== null}>
                          <FieldLabel htmlFor="pr-url" className="text-xs font-black uppercase text-black">
                            GitHub PR URL <span className="text-[#EA4335]">*</span>
                          </FieldLabel>
                          <Input
                            {...field.props}
                            id="pr-url"
                            value={field.input ?? ""}
                            placeholder="https://github.com/.../pull/12"
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
                  </div>

                  {/* Description */}
                  <FormischField of={form} path={["description"]}>
                    {(field) => (
                      <Field data-invalid={field.errors !== null}>
                        <FieldLabel htmlFor="pr-desc" className="text-xs font-black uppercase text-black">
                          Description of Changes <span className="text-[#EA4335]">*</span>
                        </FieldLabel>
                        <InputGroup className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000000]">
                          <InputGroupTextarea
                            {...field.props}
                            id="pr-desc"
                            value={field.input ?? ""}
                            placeholder="Describe what files were changed, bugs fixed, or features introduced."
                            rows={4}
                            className="resize-none text-xs font-bold p-3 text-black focus:outline-none"
                            aria-invalid={field.errors !== null}
                          />
                          <InputGroupAddon align="block-end" className="p-2 border-t border-black bg-zinc-50">
                            <InputGroupText className="tabular-nums text-[10px] font-mono font-bold text-zinc-600">
                              {(field.input ?? "").length}/300 chars
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
                    form="pr-submit-form"
                    disabled={submittingPR}
                    className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-widest h-12 shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    {submittingPR ? "Submitting PR Request..." : "Request Pull Request Merge"}
                  </Button>

                </FieldGroup>
              </Form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
