import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface DocsBreadcrumbsProps {
  categoryTitle: string;
  docTitle: string;
}

export function DocsBreadcrumbs({ categoryTitle, docTitle }: DocsBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-6 font-mono overflow-x-auto whitespace-nowrap">
      <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
      <Link href="/docs" className="hover:text-white transition-colors">
        Docs
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
      <span className="text-neutral-300">{categoryTitle}</span>
      <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
      <span className="text-[#4285F4] font-medium truncate">{docTitle}</span>
    </nav>
  );
}
