import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getAllDocCategories, getAllDocsList } from "@/lib/docs";
import { DocsShellClient } from "@/components/docs-shell-client";
import { ArrowLeft, BookOpen, ExternalLink, Github } from "lucide-react";

export const metadata: Metadata = {
  title: "MLSC SVEC Documentation — Single Source of Truth",
  description:
    "Official internal and technical documentation, operating procedures, and architectural guides for MLSC SVEC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getAllDocCategories();
  const allDocs = getAllDocsList();

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#4285F4]/30 selection:text-white antialiased">
        {/* Top Docs Global Header */}
        <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <a
                href="https://mlscsvec.com"
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-neutral-900"
                title="Return to Main Portal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Main Site</span>
              </a>
              <div className="h-4 w-px bg-neutral-800" />
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4] group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white group-hover:text-[#4285F4] transition-colors">
                    MLSC SVEC Docs
                  </span>
                  <span className="text-[10px] font-mono bg-neutral-900 text-blue-400 border border-neutral-800 px-1.5 py-0.2 rounded font-semibold">
                    v2.0
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/MLSC-SVEC/mlsc.svec"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-lg transition-all"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <a
                href="https://mlscsvec.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <span>mlscsvec.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </header>

        <DocsShellClient categories={categories} docs={allDocs}>
          {children}
        </DocsShellClient>
      </body>
    </html>
  );
}
