"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocCategory } from "@/lib/docs";
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
  Search,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

interface DocsSidebarProps {
  categories: DocCategory[];
  onOpenSearch: () => void;
}

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

export function DocsSidebar({ categories, onOpenSearch }: DocsSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      const isActive = cat.docs.some((doc) => doc.path === pathname);
      initial[cat.id] = isActive || ["01-introduction", "02-getting-started", "07-technical-documentation"].includes(cat.id);
    });
    return initial;
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4 text-sm">
      {/* Search Bar Trigger */}
      <div className="px-4 mb-4">
        <button
          onClick={() => {
            onOpenSearch();
            setMobileOpen(false);
          }}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-400 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#4285F4] transition-colors" />
            <span>Search docs...</span>
          </div>
          <kbd className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Docs Overview Link */}
      <div className="px-4 mb-3">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
            pathname === "/"
              ? "bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#4285F4]" />
          <span>Documentation Hub</span>
        </Link>
      </div>

      {/* Categories Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 custom-scrollbar">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.iconName] || FileText;
          const isExpanded = !!expandedCategories[cat.id];
          const hasActiveDoc = cat.docs.some((doc) => doc.path === pathname);

          return (
            <div key={cat.id} className="space-y-1">
              <button
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                  hasActiveDoc ? "text-white" : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#4285F4]/80">
                    {cat.number}
                  </span>
                  <IconComponent className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate">{cat.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                )}
              </button>

              {isExpanded && (
                <div className="ml-4 pl-2 border-l border-neutral-800/80 space-y-0.5">
                  {cat.docs.map((doc) => {
                    const isActive = pathname === doc.path;
                    return (
                      <Link
                        key={doc.slug}
                        href={doc.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-2 py-1.5 text-xs rounded transition-all truncate ${
                          isActive
                            ? "font-medium text-[#4285F4] bg-[#4285F4]/10 border-l-2 border-[#4285F4] -ml-[9px] pl-[7px]"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                        }`}
                        title={doc.title}
                      >
                        {doc.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Quick Links */}
      <div className="px-4 pt-3 mt-auto border-t border-neutral-800/80">
        <a
          href="https://mlscsvec.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-2 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <span>Main Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
        </a>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden sticky top-16 z-30 flex items-center justify-between px-4 py-2.5 bg-neutral-950/95 backdrop-blur border-b border-neutral-800">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-xs font-medium text-neutral-300 hover:text-white"
        >
          <Menu className="w-4 h-4 text-[#4285F4]" />
          <span>Documentation Menu</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-md"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-neutral-950 border-r border-neutral-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <span className="font-semibold text-sm text-white">Documentation</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:block w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-neutral-800/80 bg-neutral-950/60 backdrop-blur">
        <SidebarContent />
      </aside>
    </>
  );
}
