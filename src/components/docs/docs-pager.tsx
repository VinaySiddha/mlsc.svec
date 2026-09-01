import React from "react";
import Link from "next/link";
import { DocMeta } from "@/lib/docs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocsPagerProps {
  prev: DocMeta | null;
  next: DocMeta | null;
}

export function DocsPager({ prev, next }: DocsPagerProps) {
  if (!prev && !next) return null;

  return (
    <div className="mt-14 pt-8 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prev ? (
        <Link
          href={prev.path}
          className="group flex flex-col items-start p-4 rounded-xl border border-neutral-800 hover:border-[#4285F4]/50 bg-neutral-950 hover:bg-neutral-900/60 transition-all"
        >
          <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-[#4285F4] transition-colors mb-1 font-mono">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </div>
          <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
            {prev.title}
          </span>
          <span className="text-xs text-neutral-500 mt-1">{prev.categoryTitle}</span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.path}
          className="group flex flex-col items-end text-right p-4 rounded-xl border border-neutral-800 hover:border-[#4285F4]/50 bg-neutral-950 hover:bg-neutral-900/60 transition-all sm:col-start-2"
        >
          <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-[#4285F4] transition-colors mb-1 font-mono">
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
            {next.title}
          </span>
          <span className="text-xs text-neutral-500 mt-1">{next.categoryTitle}</span>
        </Link>
      ) : null}
    </div>
  );
}
