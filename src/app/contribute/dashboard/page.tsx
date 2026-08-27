'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { submitPullRequestAction } from '@/app/actions/contributor-actions';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';
import { Badge } from '@/components/ui/badge';
import { Form, Field as FormischField, reset, useForm } from '@formisch/react';
import type { SubmitHandler } from '@formisch/react';
import * as v from 'valibot';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { 
  GitPullRequest, 
  Terminal, 
  Github, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  GitBranch, 
  Lock 
} from 'lucide-react';

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
})

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
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4] mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-white/40">Verifying access credentials...</p>
      </div>
    );
  }

  // Not Logged In Screen
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 max-w-sm text-center space-y-4">
          <Lock className="h-8 w-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-black uppercase tracking-tight italic">Authentication Required</h3>
          <p className="text-xs text-white/50 leading-relaxed font-medium">
            You must be logged in with a registered student account to access the developer dashboard.
          </p>
          <Button asChild className="w-full rounded-xl bg-white text-black font-bold h-10 text-xs uppercase tracking-wider">
            <a href={`/auth/login?redirect=/contribute/dashboard`}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  // Pending / Not Approved Screen
  if (!isApproved) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-red-500/10 max-w-md text-center space-y-4 shadow-2xl">
          <ShieldAlert className="h-8 w-8 text-red-500 mx-auto animate-pulse" />
          <h3 className="text-base font-black uppercase tracking-tight italic">Verification Pending</h3>
          <p className="text-xs text-white/50 leading-relaxed font-medium">
            No approved contributor application found for <strong>{user.email}</strong>. 
          </p>
          <p className="text-[11px] text-white/40 leading-relaxed">
            If you haven't applied yet, please submit your details on our <a href="/contribute" className="text-[#4285F4] underline font-semibold">Contribution Portal</a>. If you've already applied, our super admin will verify your GitHub request soon.
          </p>
          <Button asChild variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider">
            <a href="/contribute">Submit Contribution Request</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black min-h-screen py-24 md:py-32 text-white">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        
        {/* Header banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.08] pb-10 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">
              <Terminal className="h-3.5 w-3.5" /> Contributor Area
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              Developer <span className="text-[#4285F4]">Dashboard</span>
            </h1>
            <p className="text-white/40 font-medium text-sm">
              Approved workspace for contributor: <span className="text-white font-semibold">{user.displayName || user.email}</span>
            </p>
          </div>
          
          <a
            href="https://github.com/VinaySiddha/mlsc.svec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 bg-[#0A0A0A] hover:bg-[#111] transition-all rounded-xl px-5 h-11 text-xs font-bold uppercase tracking-wider text-white shrink-0 shadow-lg"
          >
            <Github className="h-4 w-4" /> Go to Repository <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Guidelines & Submissions */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Guidelines Card */}
            <div className="p-5 rounded-2xl border border-white/5 bg-[#050505] space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#4285F4] flex items-center gap-1.5">
                <GitBranch className="h-4 w-4" /> Git Instructions
              </h3>
              <ul className="space-y-3 text-[11px] text-white/50 leading-relaxed font-medium">
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-black">1.</span>
                  <span>Clone the repository: <code className="bg-black text-white/80 p-0.5 px-1.5 rounded">git clone https://github.com/VinaySiddha/mlsc.svec.git</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-black">2.</span>
                  <span>Create branch from <code>Dev</code>: <code className="bg-black text-white/80 p-0.5 px-1.5 rounded">git checkout -b feature/your-username</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-black">3.</span>
                  <span>Make code changes, push to GitHub, and open a Pull Request.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-black">4.</span>
                  <span>Submit the Pull Request form on the right so an admin can verify and merge it.</span>
                </li>
              </ul>
            </div>

            {/* List of Submissions */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5 pl-1">
                <GitPullRequest className="h-4 w-4" /> Review Requests
              </h3>
              
              <div className="space-y-3">
                {prSubmissions.length === 0 ? (
                  <div className="py-12 border border-dashed border-white/10 rounded-2xl text-center text-xs text-white/30">
                    No PR reviews requested yet.
                  </div>
                ) : (
                  prSubmissions.map((pr) => (
                    <div key={pr.id} className="p-4 rounded-xl border border-white/5 bg-[#050505]/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={pr.status === 'merged' ? 'secondary' : pr.status === 'rejected' ? 'destructive' : 'outline'}
                          className="text-[9px] uppercase tracking-wider font-extrabold h-4.5 px-2 select-none border-none bg-white/5 text-white"
                          style={{
                            backgroundColor: pr.status === 'merged' ? 'rgba(16,185,129,0.1)' : pr.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                            color: pr.status === 'merged' ? '#10b981' : pr.status === 'rejected' ? '#ef4444' : '#fbbf24',
                          }}
                        >
                          {pr.status === 'merged' ? 'Merged' : pr.status === 'rejected' ? 'Changes Needed' : 'In Review'}
                        </Badge>
                        <span className="text-[9px] text-white/30 font-bold">{formatDate(pr.createdAt)}</span>
                      </div>
                      <h4 className="text-xs font-bold truncate text-white">{pr.title}</h4>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-white/40 font-medium">Branch: <code className="bg-black text-white/80 px-1 rounded">{pr.branchName}</code></span>
                        <a href={pr.prLink} target="_blank" rel="noopener noreferrer" className="text-[#4285F4] hover:underline inline-flex items-center gap-0.5 font-bold">
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
            <Card className="w-full bg-[#080808]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] text-white p-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                  <GitPullRequest className="h-5 w-5 text-[#4285F4]" />
                  Request <span className="text-[#4285F4]">PR Merge</span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 font-medium">
                  After opening a pull request on GitHub, submit this form to request admin review. This will email the tech lead immediately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form of={form} id="pr-submit-form" onSubmit={handlePRSubmit}>
                  <FieldGroup className="space-y-4">
                    
                    {/* PR Title */}
                    <FormischField of={form} path={["title"]}>
                      {(field) => (
                        <Field data-invalid={field.errors !== null}>
                          <FieldLabel htmlFor="pr-title">Contribution Title</FieldLabel>
                          <Input
                            {...field.props}
                            id="pr-title"
                            value={field.input ?? ""}
                            placeholder="Implemented dynamic calendar components"
                            autoComplete="off"
                            aria-invalid={field.errors !== null}
                          />
                          {field.errors && (
                            <FieldError errors={field.errors.map((message) => ({ message }))} />
                          )}
                        </Field>
                      )}
                    </FormischField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Branch Name */}
                      <FormischField of={form} path={["branchName"]}>
                        {(field) => (
                          <Field data-invalid={field.errors !== null}>
                            <FieldLabel htmlFor="pr-branch">Branch Name</FieldLabel>
                            <Input
                              {...field.props}
                              id="pr-branch"
                              value={field.input ?? ""}
                              placeholder="feature/calendar-view"
                              autoComplete="off"
                              aria-invalid={field.errors !== null}
                            />
                            {field.errors && (
                              <FieldError errors={field.errors.map((message) => ({ message }))} />
                            )}
                          </Field>
                        )}
                      </FormischField>

                      {/* GitHub PR URL */}
                      <FormischField of={form} path={["prLink"]}>
                        {(field) => (
                          <Field data-invalid={field.errors !== null}>
                            <FieldLabel htmlFor="pr-url">GitHub Pull Request URL</FieldLabel>
                            <Input
                              {...field.props}
                              id="pr-url"
                              value={field.input ?? ""}
                              placeholder="https://github.com/.../pull/12"
                              autoComplete="off"
                              aria-invalid={field.errors !== null}
                            />
                            {field.errors && (
                              <FieldError errors={field.errors.map((message) => ({ message }))} />
                            )}
                          </Field>
                        )}
                      </FormischField>
                    </div>

                    {/* Description */}
                    <FormischField of={form} path={["description"]}>
                      {(field) => (
                        <Field data-invalid={field.errors !== null}>
                          <FieldLabel htmlFor="pr-desc">Describe your changes</FieldLabel>
                          <InputGroup>
                            <InputGroupTextarea
                              {...field.props}
                              id="pr-desc"
                              value={field.input ?? ""}
                              placeholder="Describe what files were changed, new features added, or layout bugs resolved."
                              rows={4}
                              className="min-h-20 resize-none text-xs"
                              aria-invalid={field.errors !== null}
                            />
                            <InputGroupAddon align="block-end">
                              <InputGroupText className="tabular-nums text-[10px]">
                                {(field.input ?? "").length}/300 characters
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
                      form="pr-submit-form"
                      disabled={submittingPR}
                      className="w-full rounded-xl bg-white text-black font-black hover:bg-white/95 h-11 text-xs tracking-wider uppercase transition-transform active:scale-[0.98]"
                    >
                      {submittingPR ? "Submitting Request..." : "Request Pull Request Merge"}
                    </Button>

                  </FieldGroup>
                </Form>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
