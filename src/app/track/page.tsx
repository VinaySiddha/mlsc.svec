'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackApplicationAction } from '@/app/actions/track-actions';
import {
  Search, CheckCircle2, Clock, XCircle, Star, ArrowRight,
  Loader2, FileText, Zap, RefreshCw, Mail, User, Layers, Calendar,
  Check, AlertTriangle, HelpCircle, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { MLSCLogo } from '@/components/icons';

// ─── Status Configuration (Chapter 4 Neo-Brutalist) ────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  accentBorder: string;
  badgeBg: string;
  shadowColor: string;
  icon: React.ReactNode;
  description: string;
  step: number;
}> = {
  'Received': {
    label: 'Received',
    color: 'text-black',
    bg: 'bg-[#4285F4]/10',
    accentBorder: 'border-[#4285F4]',
    badgeBg: 'bg-[#4285F4] text-white',
    shadowColor: 'shadow-[6px_6px_0px_0px_#4285F4]',
    icon: <FileText className="h-5 w-5" />,
    description: 'Your application has been received into the MLSC SVEC registry and is in our queue for review.',
    step: 1,
  },
  'Under Processing': {
    label: 'Under Review',
    color: 'text-black',
    bg: 'bg-[#FFE600]/15',
    accentBorder: 'border-black',
    badgeBg: 'bg-[#FFE600] text-black',
    shadowColor: 'shadow-[6px_6px_0px_0px_#000000]',
    icon: <Layers className="h-5 w-5" />,
    description: 'Our domain leads and core team members are actively reviewing your responses and portfolio.',
    step: 2,
  },
  'Interviewing': {
    label: 'Interview Scheduled',
    color: 'text-black',
    bg: 'bg-[#FFE600]/25',
    accentBorder: 'border-black',
    badgeBg: 'bg-[#FFE600] text-black',
    shadowColor: 'shadow-[6px_6px_0px_0px_#FFE600]',
    icon: <Zap className="h-5 w-5" />,
    description: 'Congratulations! You have been shortlisted for the domain interview & discussion round.',
    step: 3,
  },
  'Recommended': {
    label: 'Recommended',
    color: 'text-black',
    bg: 'bg-[#00FF66]/15',
    accentBorder: 'border-black',
    badgeBg: 'bg-[#00FF66] text-black',
    shadowColor: 'shadow-[6px_6px_0px_0px_#00FF66]',
    icon: <Star className="h-5 w-5" />,
    description: 'Outstanding evaluation! Your application has been recommended for final chapter induction.',
    step: 4,
  },
  'Hired': {
    label: 'Selected 🎉',
    color: 'text-black',
    bg: 'bg-[#00FF66]/20',
    accentBorder: 'border-black',
    badgeBg: 'bg-[#00FF66] text-black',
    shadowColor: 'shadow-[8px_8px_0px_0px_#000000]',
    icon: <CheckCircle2 className="h-5 w-5" />,
    description: 'Welcome to MLSC SVEC! You are officially inducted into Chapter 4. Check your email for onboarding orientation.',
    step: 5,
  },
  'Waitlisted': {
    label: 'Waitlisted',
    color: 'text-black',
    bg: 'bg-orange-100',
    accentBorder: 'border-black',
    badgeBg: 'bg-orange-400 text-white',
    shadowColor: 'shadow-[6px_6px_0px_0px_#000000]',
    icon: <Clock className="h-5 w-5" />,
    description: 'You are on our waitlist. We will notify you immediately if an opening arises in your domain.',
    step: 2,
  },
  'On Hold': {
    label: 'On Hold',
    color: 'text-black',
    bg: 'bg-amber-100',
    accentBorder: 'border-black',
    badgeBg: 'bg-amber-400 text-black',
    shadowColor: 'shadow-[6px_6px_0px_0px_#000000]',
    icon: <Clock className="h-5 w-5" />,
    description: 'Your application is temporarily on hold pending additional batch slot evaluations.',
    step: 2,
  },
  'Rejected': {
    label: 'Not Selected',
    color: 'text-black',
    bg: 'bg-[#EA4335]/10',
    accentBorder: 'border-[#EA4335]',
    badgeBg: 'bg-[#EA4335] text-white',
    shadowColor: 'shadow-[6px_6px_0px_0px_#EA4335]',
    icon: <XCircle className="h-5 w-5" />,
    description: 'Thank you for your interest and effort. While we cannot offer you a slot this cycle, we strongly encourage you to participate in our open workshops and re-apply next cycle.',
    step: 0,
  },
};

const PIPELINE_STEPS = [
  { key: 'Received', label: 'Received', num: '01' },
  { key: 'Under Processing', label: 'Reviewing', num: '02' },
  { key: 'Interviewing', label: 'Interview', num: '03' },
  { key: 'Recommended', label: 'Recommended', num: '04' },
  { key: 'Hired', label: 'Inducted', num: '05' },
];

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

    const res = await trackApplicationAction(referenceId.trim());

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
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Banner Bar */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 Induction Pipeline — Live Application Tracker
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-1.5 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase tracking-widest text-black">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] border border-black animate-ping" />
            [ APPLICATION REGISTRY // REAL-TIME STATUS ]
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.95] text-black">
            Track Your <br />
            <span className="text-[#4285F4]">Application.</span>
          </h1>

          <p className="text-zinc-700 text-sm sm:text-base font-bold max-w-lg mx-auto leading-relaxed">
            Enter your unique Application Reference ID (e.g. <span className="font-mono bg-zinc-100 px-2 py-0.5 border border-black">MLSC-XXXXXX-XXXX</span>) sent to your registered email.
          </p>
        </motion.div>

        {/* Search Input Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <form onSubmit={handleTrack} className="relative">
            <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-white p-2 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-black pointer-events-none" />
                <input
                  ref={inputRef}
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value.toUpperCase())}
                  placeholder="e.g. MLSC-339214-AH27"
                  className="w-full h-12 sm:h-14 pl-12 pr-4 bg-zinc-50 border-2 border-black text-black placeholder:text-zinc-400 font-mono text-sm sm:text-base font-black tracking-widest focus:outline-none focus:bg-white transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || !referenceId.trim()}
                className={cn(
                  "h-12 sm:h-14 px-8 border-2 border-black font-black uppercase tracking-wider text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2",
                  "bg-[#FFE600] text-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] active:scale-95",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    Track Status <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {/* Error Message */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="border-2 border-black bg-[#EA4335]/10 p-6 shadow-[6px_6px_0px_0px_#EA4335] flex items-start gap-4"
            >
              <div className="w-10 h-10 border-2 border-black bg-[#EA4335] text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="font-black text-black text-base uppercase tracking-tight">Application Record Not Found</p>
                <p className="text-zinc-800 text-sm font-semibold">{error}</p>
                <div className="pt-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-100 transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Try Another ID
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success Status Card */}
          {result && cfg && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Main Status Container */}
              <div className={cn(
                "border-2 border-black p-6 sm:p-8 space-y-6 transition-all bg-white",
                cfg.shadowColor
              )}>
                {/* Header Row: Applicant Details & Status Stamp */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-black pb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">
                      Applicant Dossier
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-black uppercase italic tracking-tight mt-1">
                      {result.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-600 font-mono font-bold mt-1">
                      Ref ID: <span className="bg-zinc-100 px-2 py-0.5 border border-black text-black">{result.id}</span>
                    </p>
                  </div>

                  <div className={cn(
                    "inline-flex items-center gap-2 border-2 border-black px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#000000] self-start",
                    cfg.badgeBg
                  )}>
                    {cfg.icon}
                    {cfg.label}
                  </div>
                </div>

                {/* Status Callout Box */}
                <div className={cn("border-2 border-black p-5 shadow-[4px_4px_0px_0px_#000000]", cfg.bg)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-xs uppercase tracking-wider text-black">Official Status Update:</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-black leading-relaxed">
                    {cfg.description}
                  </p>
                </div>

                {/* Multi-Step Pipeline Indicator (Unless Rejected) */}
                {!isRejected && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-black">
                        Recruitment Pipeline Progress
                      </span>
                      <span className="text-xs font-black text-zinc-600 font-mono">
                        Step {currentStep} of 5
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                      {PIPELINE_STEPS.map((step, i) => {
                        const isDone = currentStep > i + 1;
                        const isActive = currentStep === i + 1;

                        return (
                          <div
                            key={step.key}
                            className={cn(
                              "border-2 border-black p-3 flex flex-col justify-between transition-all",
                              isDone
                                ? "bg-[#00FF66]/20 border-black shadow-[2px_2px_0px_0px_#000000]"
                                : isActive
                                  ? "bg-[#FFE600] border-black shadow-[4px_4px_0px_0px_#000000] ring-2 ring-black"
                                  : "bg-zinc-50 opacity-60"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black font-mono">{step.num}</span>
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-black" />
                              ) : isActive ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                              ) : (
                                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                              )}
                            </div>
                            <p className="text-xs font-black uppercase tracking-tight text-black">
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Applicant Metadata Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="border-2 border-black p-3 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                    <div className="flex items-center gap-1.5 text-zinc-600 mb-1">
                      <Mail className="h-3.5 w-3.5 text-black" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Email</span>
                    </div>
                    <p className="text-xs font-bold text-black truncate">{result.email || '—'}</p>
                  </div>

                  <div className="border-2 border-black p-3 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                    <div className="flex items-center gap-1.5 text-zinc-600 mb-1">
                      <Layers className="h-3.5 w-3.5 text-black" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Applied Domain</span>
                    </div>
                    <p className="text-xs font-bold text-black truncate">
                      {result.technicalDomain || result.nonTechnicalDomain || 'Core Domain'}
                    </p>
                  </div>

                  <div className="border-2 border-black p-3 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                    <div className="flex items-center gap-1.5 text-zinc-600 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-black" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Submitted On</span>
                    </div>
                    <p className="text-xs font-bold text-black truncate">
                      {result.submittedAt
                        ? new Date(result.submittedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Active Cycle'}
                    </p>
                  </div>

                  <div className="border-2 border-black p-3 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                    <div className="flex items-center gap-1.5 text-zinc-600 mb-1">
                      <User className="h-3.5 w-3.5 text-black" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Chapter</span>
                    </div>
                    <p className="text-xs font-black text-black">MLSC 4.0</p>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-black">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-100 active:scale-95 transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Track Another ID
                  </button>

                  <a
                    href="mailto:mlsc@svec.edu.in"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-black hover:underline"
                  >
                    Need assistance? Contact support <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Informational Help Note */}
              <div className="border-2 border-black bg-zinc-50 p-4 text-center shadow-[3px_3px_0px_0px_#000000]">
                <p className="text-xs text-zinc-700 font-bold">
                  🔔 All interview schedules and induction invitations are transmitted directly to your registered email. Check your spam / updates tab regularly.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State Guidelines & Tips */}
        {!result && !error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
          >
            {[
              {
                icon: <FileText className="h-6 w-6 text-black" />,
                bg: 'bg-[#4285F4]/15',
                title: 'Check Your Inbox',
                body: 'Your reference token was issued instantly in your application submission receipt email.',
              },
              {
                icon: <Clock className="h-6 w-6 text-black" />,
                bg: 'bg-[#FFE600]/25',
                title: 'Review Windows',
                body: 'Evaluation panels convene weekly. Status updates reflect directly in real-time.',
              },
              {
                icon: <Zap className="h-6 w-6 text-black" />,
                bg: 'bg-[#00FF66]/20',
                title: 'Next Step Notice',
                body: 'Shortlisted candidates receive direct interview links and calendar invitations.',
              },
            ].map(({ icon, bg, title, body }) => (
              <div
                key={title}
                className="border-2 border-black bg-white p-6 space-y-3 shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] transition-all"
              >
                <div className={cn("w-12 h-12 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]", bg)}>
                  {icon}
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-black">{title}</h3>
                <p className="text-xs text-zinc-700 font-medium leading-relaxed">{body}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
