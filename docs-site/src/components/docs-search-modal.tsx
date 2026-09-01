"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DocMeta } from "@/lib/docs";
import { Search, X, FileText, ArrowRight } from "lucide-react";

interface DocsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  docs: DocMeta[];
}

export function DocsSearchModal({ isOpen, onClose, docs }: DocsSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredDocs = query.trim() === ""
    ? docs.slice(0, 8)
    : docs.filter((doc) => {
        const q = query.toLowerCase();
        return (
          doc.title.toLowerCase().includes(q) ||
          doc.description.toLowerCase().includes(q) ||
          doc.categoryTitle.toLowerCase().includes(q)
        );
      });

  const handleSelect = (doc: DocMeta) => {
    router.push(doc.path);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredDocs.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredDocs.length - 1));
    } else if (e.key === "Enter" && filteredDocs[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredDocs[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-800 bg-neutral-900/50">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search documentation, SOPs, architecture, APIs..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-neutral-500 hover:text-neutral-300 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-neutral-900 custom-scrollbar">
          {filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-sm">
              No documentation pages found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredDocs.map((doc, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={doc.path}
                  onClick={() => handleSelect(doc)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected ? "bg-[#4285F4]/15 border border-[#4285F4]/30 text-white" : "text-neutral-300 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 pr-3">
                    <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-[#4285F4]" : "text-neutral-500"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                          {doc.categoryTitle}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-white truncate">{doc.title}</div>
                      {doc.description && (
                        <p className="text-xs text-neutral-400 truncate mt-0.5">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-[#4285F4] translate-x-1" : "text-neutral-600"}`} />
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-neutral-900 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <div className="flex items-center gap-3">
            <span>Navigate: ↑ ↓</span>
            <span>Open: Enter</span>
          </div>
          <span>docs.mlscsvec.com</span>
        </div>
      </div>
    </div>
  );
}
