import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDocBySlug, getPrevNextDocs, getAllDocsList } from "@/lib/docs";
import { DocsMarkdownRenderer } from "@/components/docs-markdown-renderer";
import { DocsToc } from "@/components/docs-toc";
import { DocsPager } from "@/components/docs-pager";
import { DocsBreadcrumbs } from "@/components/docs-breadcrumbs";
import { Clock, Calendar, Edit3, ShieldCheck } from "lucide-react";

interface DocPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const docs = getAllDocsList();
  return docs.map((doc) => ({
    category: doc.category,
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const doc = getDocBySlug(category, slug);

  if (!doc) {
    return { title: "Document Not Found — MLSC SVEC" };
  }

  return {
    title: `${doc.title} — MLSC SVEC Documentation`,
    description: doc.description,
    openGraph: {
      title: `${doc.title} — MLSC SVEC Docs`,
      description: doc.description,
      type: "article",
    },
  };
}

export default async function DynamicDocPage({ params }: DocPageProps) {
  const { category, slug } = await params;
  const doc = getDocBySlug(category, slug);

  if (!doc) {
    notFound();
  }

  const { prev, next } = getPrevNextDocs(category, slug);
  const githubEditUrl = `https://github.com/MLSC-SVEC/mlsc.svec/edit/Dev/docs-site/content/${category}/${slug}.md`;

  return (
    <div className="flex gap-10">
      {/* Center Main Article */}
      <article className="flex-1 min-w-0 max-w-4xl pb-16">
        <DocsBreadcrumbs
          categoryTitle={doc.categoryTitle}
          docTitle={doc.title}
        />

        {/* Article Meta Bar */}
        <header className="mb-8 pb-6 border-b border-neutral-800/80">
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono mb-3">
            <span className="flex items-center gap-1.5 bg-[#4285F4]/10 text-[#4285F4] px-2.5 py-0.5 rounded border border-[#4285F4]/30 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official SSoT</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>{doc.readingTime} min read</span>
            </span>
            {doc.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>{new Date(doc.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            {doc.title}
          </h1>

          {doc.description && (
            <p className="text-base text-neutral-400 leading-relaxed">
              {doc.description}
            </p>
          )}
        </header>

        {/* Render Markdown Content */}
        <DocsMarkdownRenderer content={doc.content} />

        {/* Edit on GitHub link */}
        <div className="mt-10 pt-4 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
          <a
            href={githubEditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-[#4285F4] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit this page on GitHub</span>
          </a>
          <span className="font-mono">docs.mlscsvec.com</span>
        </div>

        {/* Previous & Next Pagers */}
        <DocsPager prev={prev} next={next} />
      </article>

      {/* Right Side Table of Contents */}
      <DocsToc toc={doc.toc} />
    </div>
  );
}
