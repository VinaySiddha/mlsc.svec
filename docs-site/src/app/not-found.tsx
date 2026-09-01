import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4] mb-4">
        <BookOpen className="w-6 h-6" />
      </div>
      <span className="text-xs font-mono font-bold text-[#4285F4] uppercase tracking-wider mb-2">
        404 — Document Not Found
      </span>
      <h1 className="text-3xl font-black text-white mb-3">
        Page Does Not Exist
      </h1>
      <p className="text-neutral-400 text-sm max-w-md mb-6 leading-relaxed">
        The documentation page you are looking for may have been moved, renamed, or does not exist.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4285F4] hover:bg-blue-600 text-white text-xs font-bold transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Docs Hub</span>
      </Link>
    </div>
  );
}
