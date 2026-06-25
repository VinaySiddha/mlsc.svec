"use client";

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 transition-all shadow-sm no-print"
    >
      <Printer className="h-4 w-4 text-[#34A853]" /> Print Receipt
    </button>
  );
}
