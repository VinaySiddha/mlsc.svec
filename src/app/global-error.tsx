'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCw, Home, ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Critical Global Root Error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white font-sans antialiased m-0 p-0 flex flex-col min-h-screen relative overflow-hidden">
        {/* Dynamic Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#EA4335]/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#4285F4]/10 rounded-full blur-[160px] pointer-events-none" />

        <main className="flex-1 flex flex-col justify-center items-center relative z-10 px-6 py-12 text-center">
          <div className="max-w-xl w-full space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EA4335]/10 border border-[#EA4335]/30 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#EA4335] animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#EA4335]">
                Root System Malfunction
              </span>
            </div>

            <div className="flex justify-center my-4">
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-[#EA4335]/20 backdrop-blur-xl shadow-[0_0_50px_rgba(234,67,53,0.2)]">
                <ShieldAlert className="h-16 w-16 text-[#EA4335]" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Critical Exception Encountered.
            </h1>
            
            <p className="text-white/40 text-sm font-medium leading-relaxed max-w-md mx-auto">
              A foundational component encountered an unhandled exception. Reloading the node will reset the state.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => reset()}
                className="h-11 px-6 rounded-xl bg-white text-black hover:bg-white/90 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
              >
                <RotateCw className="h-4 w-4" />
                Reload Application
              </button>
              
              <a
                href="/"
                className="h-11 px-6 rounded-xl border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <Home className="h-4 w-4" />
                Return to Home
              </a>
            </div>

            {error.digest && (
              <p className="text-[10px] font-mono text-white/20 pt-4">
                DIGEST: {error.digest}
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
