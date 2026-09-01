'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  AlertOctagon, 
  RotateCw, 
  Home, 
  LifeBuoy, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, startTransition] = useTransition();

  useEffect(() => {
    // Log the error to console
    console.error('Application Error Boundary Caught Exception:', error);
  }, [error]);

  const handleRetry = () => {
    startTransition(() => {
      reset();
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans relative overflow-hidden selection:bg-[#EA4335] selection:text-white">
      {/* Dynamic Background Mesh & Anomaly Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[55vw] h-[55vw] bg-[#EA4335]/12 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#FBBC05]/8 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header */}
      <header className="container mx-auto px-6 pt-8 pb-4 relative z-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
          Back to Safety
        </Link>
      </header>

      {/* Main Error Area */}
      <main className="flex-1 flex flex-col justify-center items-center relative z-10 px-6 py-12">
        <div className="max-w-3xl w-full text-center space-y-8">
          
          {/* Creative Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EA4335]/10 border border-[#EA4335]/30 backdrop-blur-md shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-[#EA4335] animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#EA4335]">
              System Anomaly · 500 Intercepted
            </span>
          </div>

          {/* Large Creative Anomaly Visual */}
          <div className="relative select-none my-4 flex flex-col items-center justify-center">
            <div className="relative p-6 rounded-3xl bg-white/[0.02] border border-[#EA4335]/20 backdrop-blur-xl shadow-[0_0_50px_rgba(234,67,53,0.15)]">
              <ShieldAlert className="h-20 w-20 text-[#EA4335] animate-pulse" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3 max-w-lg mx-auto">
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Something Went <span className="text-[#EA4335]">Wrong.</span>
            </h1>
            <p className="text-white/40 text-sm sm:text-base font-medium leading-relaxed">
              An unexpected disruption occurred while rendering this interface. Our system captured the trace for analysis.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              variant="glass" 
              className="h-12 px-8 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              <RotateCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Recovering...' : 'Try Again'}
            </Button>
            
            <Button asChild variant="outline" className="h-12 px-8 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-white/20 font-bold text-xs uppercase tracking-wider backdrop-blur-md">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-12 px-6 rounded-2xl border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.08] font-bold text-xs uppercase tracking-wider backdrop-blur-md">
              <Link href="/contact" className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-[#FBBC05]" />
                Support
              </Link>
            </Button>
          </div>

          {/* Collapsible Diagnostic Trace */}
          <div className="pt-8 max-w-2xl mx-auto text-left">
            <button
              onClick={() => setShowDetails(prev => !prev)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors text-xs font-mono text-white/40 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#4285F4]" />
                Diagnostic Trace & Error Code
              </span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDetails && (
              <div className="mt-2 p-5 rounded-2xl bg-black/80 border border-white/10 font-mono text-xs space-y-3 shadow-2xl backdrop-blur-md overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-white/30 border-b border-white/10 pb-2">
                  <span>DIGEST ID:</span>
                  <span className="text-[#FBBC05]">{error.digest || 'UNIDENTIFIED_TRACE'}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-[#EA4335] font-bold">Message:</p>
                  <pre className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-white/70 overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap break-all">
                    {error.message || 'An unknown exception was intercepted by the global error boundary.'}
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer Tag */}
      <footer className="container mx-auto px-6 py-6 text-center text-[10px] font-mono text-white/20 relative z-10">
        MLSC SVEC RESILIENCE SUBSYSTEM · EXCEPTION HANDLER
      </footer>
    </div>
  );
}
