"use client";

import React, { useEffect, useState } from "react";
import { AlignLeft } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocsTocProps {
  toc: TocItem[];
}

export function DocsToc({ toc }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0% -60% 0%", threshold: 0.1 }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (!toc || toc.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pl-6 pr-2 py-4 text-xs custom-scrollbar">
      <div className="flex items-center gap-2 font-semibold text-neutral-300 uppercase tracking-wider mb-4 font-mono text-[11px]">
        <AlignLeft className="w-3.5 h-3.5 text-[#4285F4]" />
        <span>On this page</span>
      </div>

      <nav className="space-y-2">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveId(item.id);
                  history.pushState(null, "", `#${item.id}`);
                }
              }}
              className={`block transition-colors leading-relaxed truncate ${
                item.level === 3 ? "pl-3 border-l border-neutral-800" : ""
              } ${
                isActive
                  ? "text-[#4285F4] font-medium"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              title={item.text}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
