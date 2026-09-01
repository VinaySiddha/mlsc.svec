"use client";

import React, { useState } from "react";
import { DocCategory, DocMeta } from "@/lib/docs";
import { DocsSidebar } from "./docs-sidebar";
import { DocsSearchModal } from "./docs-search-modal";

interface DocsShellClientProps {
  categories: DocCategory[];
  docs: DocMeta[];
  children: React.ReactNode;
}

export function DocsShellClient({ categories, docs, children }: DocsShellClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
      {/* Sidebar */}
      <DocsSidebar categories={categories} onOpenSearch={() => setSearchOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 overflow-y-auto">
        {children}
      </main>

      {/* Global Search Modal */}
      <DocsSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        docs={docs}
      />
    </div>
  );
}
