'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackApplicationAction } from '@/app/actions/track-actions';
import {
  Search, CheckCircle2, Clock, XCircle, Star, ArrowRight,
  Loader2, FileText, Zap, RefreshCw, Mail, User, Layers, Calendar,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ─── Status Configuration ──────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  icon: React.ReactNode;
  description: string;
  step: number;
}> = {
  'Received': {
    label: 'Received',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
    glow: 'shadow-[0_0_20px_rgba(66,133,244,0.15)]',
    icon: <FileText className="h-5 w-5" />,
    description: 'Your application has been received and is in our queue for review.',
    step: 1,
  },
  'Under Processing': {
    label: 'Under Review',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    icon: <Layers className="h-5 w-5" />,
    description: 'Our domain leads are actively reviewing your application.',
    step: 2,
  },
  'Interviewing': {
    label: 'Interview Scheduled',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/25',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
    icon: <Zap className="h-5 w-5" />,
    description: 'Congratulations! You have been shortlisted for an interview round.',
    step: 3,
  },
  'Recommended': {
    label: 'Recommended',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    icon: <Star className="h-5 w-5" />,
    description: 'Excellent performance! Your application has been recommended for selection.',
    step: 4,
  },
  'Hired': {
    label: 'Selected 🎉',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    icon: <CheckCircle2 className="h-5 w-5" />,
    description: 'Welcome to MLSC! You have been officially selected. Check your email for onboarding details.',
    step: 5,
  },
  'Waitlisted': {
    label: 'Waitlisted',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/25',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    icon: <Clock className="h-5 w-5" />,
    description: 'You are on our waitlist. We will notify you if a spot opens.',
    step: 2,
  },
  'On Hold': {
    label: 'On Hold',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/25',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    icon: <Clock className="h-5 w-5" />,
    description: 'Your application is temporarily on hold. We will update you soon.',
    step: 2,
  },
  'Rejected': {
    label: 'Not Selected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    icon: <XCircle className="h-5 w-5" />,
    description: 'Thank you for applying. Unfortunately, we will not be moving forward at this time.',
    step: 0,
  },
};

const PIPELINE_STEPS = [
  { key: 'Received', label: 'Received' },
  { key: 'Under Processing', label: 'Reviewing' },
  { key: 'Interviewing', label: 'Interview' },
  { key: 'Recommended', label: 'Recommended' },
  { key: 'Hired', label: 'Selected' },
];

// ─── Component ──────────────────────────────────────────────────────────
export default function TrackPage() {
  const [referenceId, setReferenceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!referenceId.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const res = await trackApplicationAction(referenceId);

    if (res.error) {
      setError(res.error);
    } else {
      setResult(res.application);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setReferenceId('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const cfg = result ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG['Received']) : null;
  const currentStep = cfg?.step ?? 0;
  const isRejected = result?.status === 'Rejected';

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-[#4285F4]/30">

      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[#4285F4]/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-[#34A853]/[0.02] blur-[100px]" />
      </div>

      {/* Nav */}
      <div className="border-b border-white/[0.04] backdrop-blur-xl sticky top-0 z-50 bg-[#050505]/70">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MLSC" width={28} height={28} className="rounded-lg" />
            <span className="text-xs font-black uppercase tracking-widest text-white/40">MLSC SVEC</span>
          </Link>
          <Link href="/apply" className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-white transition-colors">
            Apply Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#4285F4]/20 bg-[#4285F4]/5 text-[#4285F4] text-[11px] font-bold uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-pulse" />
            Application Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
            Track Your
            <br />
            <span className="text-[#4285F4]">Application</span>
          </h1>
          <p className="text-white/40 text-base font-medium max-w-md mx-auto">
            Enter your Reference ID received in your confirmation email to check your MLSC 4.0 application status.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <form onSubmit={handleTrack} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-white/25 pointer-events-none" />
              <input
                ref={inputRef}
                value={referenceId}
                onChange={e => setReferenceId(e.target.value.toUpperCase())}
                placeholder="e.g. MLSC-339214-AH27"
                className="w-full h-14 pl-12 pr-36 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-white/20 font-mono text-sm font-bold tracking-widest focus:outline-none focus:border-[#4285F4]/50 focus:bg-white/[0.05] transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !referenceId.trim()}
                className={cn(
                  "absolute right-2 h-10 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200",
                  "bg-[#4285F4] text-white hover:bg-[#5294ff] active:scale-95",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
                )}
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : 'Track →'
                }
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">

          {/* Error */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Application Not Found</p>
                <p className="text-white/50 text-sm mt-1">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 text-xs font-bold text-[#4285F4] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* Result Card */}
          {result && cfg && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-4"
            >
              {/* Main status card */}
              <div className={cn(
                "rounded-2xl border p-6 space-y-6 transition-all",
                cfg.border,
                cfg.bg,
                cfg.glow,
              )}>

                {/* Top row: name + status badge */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1">Applicant</p>
                    <h2 className="text-xl font-black text-white">{result.name}</h2>
                    <p className="text-xs text-white/40 font-medium mt-0.5 font-mono">{result.id}</p>
                  </div>
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border font-bold text-sm",
                    cfg.bg, cfg.border, cfg.color
                  )}>
                    {cfg.icon}
                    {cfg.label}
                  </div>
                </div>

                {/* Status description */}
                <div className={cn("rounded-xl p-4 border", cfg.bg, cfg.border)}>
                  <p className={cn("text-sm font-semibold leading-relaxed", cfg.color)}>
                    {cfg.description}
                  </p>
                </div>

                {/* Progress pipeline (not shown for rejected) */}
                {!isRejected && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Application Pipeline</p>
                    <div className="flex items-center gap-0">
                      {PIPELINE_STEPS.map((step, i) => {
                        const done = currentStep > i + 1;
                        const active = currentStep === i + 1;
                        return (
                          <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center gap-1.5 flex-1">
                              <motion.div
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className={cn(
                                  "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                                  done
                                    ? "bg-[#34A853] border-[#34A853]"
                                    : active
                                      ? cn("border-current animate-pulse", cfg.color, cfg.bg)
                                      : "border-white/10 bg-white/[0.02]"
                                )}
                              >
                                {done
                                  ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                  : active
                                    ? <span className={cn("w-2 h-2 rounded-full bg-current", cfg.color)} />
                                    : <span className="w-2 h-2 rounded-full bg-white/10" />
                                }
                              </motion.div>
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-wide text-center",
                                active ? cfg.color : done ? "text-emerald-400" : "text-white/20"
                              )}>
                                {step.label}
                              </span>
                            </div>
                            {i < PIPELINE_STEPS.length - 1 && (
                              <div className={cn(
                                "h-px flex-1 mb-4 transition-all",
                                done ? "bg-[#34A853]/60" : "bg-white/[0.06]"
                              )} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Mail className="h-3.5 w-3.5" />, label: 'Email', value: result.email },
                    {
                      icon: <Layers className="h-3.5 w-3.5" />, label: 'Domain',
                      value: result.technicalDomain || result.nonTechnicalDomain || '—'
                    },
                    ...(result.submittedAt ? [{
                      icon: <Calendar className="h-3.5 w-3.5" />, label: 'Applied On',
                      value: new Date(result.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })
                    }] : []),
                    {
                      icon: <User className="h-3.5 w-3.5" />, label: 'Chapter',
                      value: 'MLSC 4.0'
                    },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 text-white/30 mb-1">
                        {icon}
                        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Track another
                  </button>
                  <a
                    href="mailto:mlsc@svec.edu.in"
                    className="text-xs font-bold text-[#4285F4] hover:text-white transition-colors"
                  >
                    Need help? Contact us →
                  </a>
                </div>
              </div>

              {/* Help note */}
              <p className="text-center text-[11px] text-white/20 font-medium">
                Status updates are sent to your registered email. Check your spam folder if you haven't received any notifications.
              </p>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Empty state tips */}
        {!result && !error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              {
                icon: <FileText className="h-5 w-5 text-[#4285F4]" />,
                title: 'Find Your ID',
                body: 'Check the confirmation email you received right after submitting your application.',
              },
              {
                icon: <Clock className="h-5 w-5 text-yellow-400" />,
                title: 'Review Takes Time',
                body: 'Panel reviews typically take 3–5 business days. Status will update automatically.',
              },
              {
                icon: <Mail className="h-5 w-5 text-[#34A853]" />,
                title: 'Email Notifications',
                body: 'You will receive an email for every major status change. Check spam if needed.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="text-xs text-white/40 font-medium leading-relaxed">{body}</p>
              </div>
            ))}
          </motion.div>
        )}

      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.04] mt-16 py-6 text-center">
        <p className="text-[11px] text-white/20 font-medium">
          © 2026 Microsoft Learn Student Chapter — SVEC &nbsp;·&nbsp; #MLSC4.0
        </p>
      </div>

    </div>
  );
}
