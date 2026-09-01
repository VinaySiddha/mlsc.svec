"use client";

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 h-10 bg-white border-2 border-black hover:bg-zinc-100 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[2px_2px_0px_0px_#000000] cursor-pointer no-print"
    >
      <Printer className="h-4 w-4 text-[#34A853] stroke-[2.5]" /> Print Receipt
    </button>
  );
}
