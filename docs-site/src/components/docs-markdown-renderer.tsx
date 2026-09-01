"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Check, Copy, Info, AlertTriangle, AlertCircle, Lightbulb, ShieldAlert } from "lucide-react";
import { MermaidDiagram } from "./mermaid-diagram";

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  const isMermaid =
    language === "mermaid" ||
    (!inline &&
      (codeString.trim().startsWith("sequenceDiagram") ||
        codeString.trim().startsWith("graph ") ||
        codeString.trim().startsWith("graph TD") ||
        codeString.trim().startsWith("graph LR") ||
        codeString.trim().startsWith("flowchart ")));

  if (isMermaid) {
    return <MermaidDiagram chart={codeString} />;
  }

  if (inline) {
    return (
      <code className="bg-neutral-800 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono border border-neutral-700/60" {...props}>
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-xl group">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/80 border-b border-neutral-800/80 text-xs font-mono text-neutral-400">
        <span className="uppercase font-semibold text-neutral-400">{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-neutral-200 leading-relaxed custom-scrollbar">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function HeadingRenderer({ level, children }: { level: number; children: React.ReactNode }) {
  const rawText = React.Children.toArray(children).join("");
  const id = rawText
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";

  const sizeClasses: Record<number, string> = {
    1: "text-2xl sm:text-3xl font-black tracking-tight text-white mt-10 mb-4 pb-2 border-b border-neutral-800",
    2: "text-xl sm:text-2xl font-bold tracking-tight text-white mt-8 mb-3 scroll-mt-24",
    3: "text-lg font-semibold text-neutral-100 mt-6 mb-2 scroll-mt-24",
    4: "text-base font-semibold text-neutral-200 mt-4 mb-2",
  };

  return (
    <Tag id={id} className={`group flex items-center gap-2 ${sizeClasses[level] || ""}`}>
      <span>{children}</span>
      {level > 1 && (
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-[#4285F4] transition-opacity text-sm ml-1"
          aria-label="Direct link to heading"
        >
          #
        </a>
      )}
    </Tag>
  );
}

function BlockquoteRenderer({ children }: { children: React.ReactNode }) {
  const contentString = React.Children.toArray(children)
    .map((c) => (typeof c === "string" ? c : ""))
    .join("");

  if (contentString.includes("[!NOTE]")) {
    return (
      <div className="my-5 p-4 rounded-xl border border-blue-500/40 bg-blue-500/10 text-neutral-200 flex items-start gap-3 text-sm">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    );
  }

  if (contentString.includes("[!TIP]")) {
    return (
      <div className="my-5 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-neutral-200 flex items-start gap-3 text-sm">
        <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    );
  }

  if (contentString.includes("[!IMPORTANT]")) {
    return (
      <div className="my-5 p-4 rounded-xl border border-purple-500/40 bg-purple-500/10 text-neutral-200 flex items-start gap-3 text-sm">
        <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    );
  }

  if (contentString.includes("[!WARNING]")) {
    return (
      <div className="my-5 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-neutral-200 flex items-start gap-3 text-sm">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    );
  }

  if (contentString.includes("[!CAUTION]")) {
    return (
      <div className="my-5 p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-neutral-200 flex items-start gap-3 text-sm">
        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    );
  }

  return (
    <blockquote className="my-5 pl-4 border-l-2 border-[#4285F4] italic text-neutral-300 bg-neutral-900/30 py-2 pr-3 rounded-r-lg">
      {children}
    </blockquote>
  );
}

export function DocsMarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="docs-prose prose prose-invert max-w-none text-neutral-300 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: CodeBlock as any,
          h1: ({ children }) => <HeadingRenderer level={1}>{children}</HeadingRenderer>,
          h2: ({ children }) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
          h3: ({ children }) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
          h4: ({ children }) => <HeadingRenderer level={4}>{children}</HeadingRenderer>,
          blockquote: ({ children }) => <BlockquoteRenderer>{children}</BlockquoteRenderer>,
          p: ({ children }) => <p className="my-3 text-sm sm:text-base leading-7 text-neutral-300">{children}</p>,
          ul: ({ children }) => <ul className="my-3 ml-6 list-disc space-y-1 text-sm sm:text-base text-neutral-300">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 ml-6 list-decimal space-y-1 text-sm sm:text-base text-neutral-300">{children}</ol>,
          li: ({ children }) => <li className="leading-7">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[#4285F4] hover:text-blue-300 underline underline-offset-4 font-medium transition-colors"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/50 shadow-lg custom-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm divide-y divide-neutral-800">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-neutral-900/90 text-neutral-200 font-semibold">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-neutral-900/40 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-3 font-medium tracking-wide uppercase text-[11px] text-neutral-400 font-sans">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 text-neutral-300 align-top">{children}</td>,
          hr: () => <hr className="my-8 border-neutral-800" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
