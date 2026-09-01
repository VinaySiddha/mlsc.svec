import React from "react";
import Link from "next/link";
import { getAllDocCategories } from "@/lib/docs";
import {
  BookOpen,
  Compass,
  Users,
  Shield,
  Calendar,
  Settings,
  Code2,
  Cpu,
  FileText,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Compass,
  Users,
  Shield,
  Calendar,
  Settings,
  Code2,
  Cpu,
  FileText,
  HelpCircle,
  RefreshCw,
};

export default function DocsHomePage() {
  const categories = getAllDocCategories();
  const totalDocs = categories.reduce((acc, cat) => acc + cat.docs.length, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* Hero Header */}
      <div className="relative pt-6 pb-4 border-b border-neutral-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/30 text-[#4285F4] text-xs font-mono font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official Institutional Knowledge Base</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
          MLSC SVEC Documentation
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 max-w-3xl leading-relaxed">
          The single source of truth for all club operations, technical architecture, community governance, and administrative standard operating procedures.
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-neutral-900 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Platform: <strong className="text-white">docs.mlscsvec.com</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-500" />
            <span>Categories: <strong className="text-white">{categories.length} Sections</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-500" />
            <span>Total Articles: <strong className="text-white">{totalDocs} Documents</strong></span>
          </div>
        </div>
      </div>

      {/* Role-Based Quick Start Paths */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#4285F4]" />
          <span>Start by Role</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/02-getting-started/01-new-member-guide"
            className="group p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-[#4285F4]/60 hover:bg-neutral-900/40 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-blue-400 font-semibold uppercase">01 • Member</span>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mt-1">
                New Member Guide
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Onboarding, Discord community, and profile setup.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-[#4285F4] font-medium">
              <span>Read guide</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/02-getting-started/02-new-volunteer-guide"
            className="group p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-[#4285F4]/60 hover:bg-neutral-900/40 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">02 • Volunteer</span>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors mt-1">
                Volunteer Guide
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Expectations, task assignments, and domain channels.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <span>Read guide</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/07-technical-documentation/03-development-setup"
            className="group p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-[#4285F4]/60 hover:bg-neutral-900/40 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-semibold uppercase">03 • Developer</span>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mt-1">
                Developer Setup
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Node.js 20+, Git workflow, Server Actions, & Firestore.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-purple-400 font-medium">
              <span>Read guide</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/06-administration/01-admin-responsibilities"
            className="group p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-[#4285F4]/60 hover:bg-neutral-900/40 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase">04 • Admin</span>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors mt-1">
                Admin Console
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Event ticketing, user access, and audit log compliance.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-amber-400 font-medium">
              <span>Read guide</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* All 11 Documentation Categories Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#4285F4]" />
          <span>Documentation Sections ({categories.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || FileText;
            const firstDocPath = cat.docs[0]?.path || "/";

            return (
              <div
                key={cat.id}
                className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#4285F4]">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-500">
                        SECTION {cat.number}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                      {cat.docs.length} articles
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5">{cat.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  <div className="space-y-1.5 border-t border-neutral-900 pt-3">
                    {cat.docs.slice(0, 4).map((doc) => (
                      <Link
                        key={doc.slug}
                        href={doc.path}
                        className="flex items-center justify-between text-xs text-neutral-300 hover:text-[#4285F4] py-1 transition-colors group/item"
                      >
                        <span className="truncate pr-2">{doc.title}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-600 group-hover/item:text-[#4285F4] shrink-0" />
                      </Link>
                    ))}
                    {cat.docs.length > 4 && (
                      <div className="text-[11px] text-neutral-500 italic pt-1">
                        + {cat.docs.length - 4} more articles
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-900">
                  <Link
                    href={firstDocPath}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4285F4] hover:text-blue-300 transition-colors"
                  >
                    <span>Browse {cat.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Single Source of Truth Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-neutral-950 to-neutral-950 border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <Terminal className="w-4 h-4" />
            <span>Single Source of Truth Mandate</span>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
            If an architectural flow, operational procedure, or API endpoint is not documented on docs.mlscsvec.com, it is not considered institutional knowledge.
          </p>
        </div>
        <a
          href="https://github.com/MLSC-SVEC/mlsc.svec/tree/Dev/docs-site/content"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 rounded-lg bg-[#4285F4] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          Contribute to Docs
        </a>
      </div>
    </div>
  );
}
