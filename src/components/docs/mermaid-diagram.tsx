"use client";

import React, { useEffect, useState, useId } from "react";
import mermaid from "mermaid";
import { Check, Copy, Activity, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
}

let isMermaidInitialized = false;

function initMermaid() {
  if (isMermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: {
      darkMode: true,
      background: "#09090b",
      primaryColor: "#1e3a8a",
      primaryTextColor: "#ffffff",
      primaryBorderColor: "#3b82f6",
      lineColor: "#60a5fa",
      secondaryColor: "#1e293b",
      tertiaryColor: "#0f172a",
      actorBkg: "#0f172a",
      actorBorder: "#3b82f6",
      actorTextColor: "#ffffff",
      actorLineColor: "#475569",
      signalColor: "#60a5fa",
      signalTextColor: "#93c5fd",
      labelBoxBkgColor: "#1e293b",
      labelBoxBorderColor: "#3b82f6",
      labelTextColor: "#ffffff",
      loopTextColor: "#ffffff",
      noteBorderColor: "#eab308",
      noteBkgColor: "#1e293b",
      noteTextColor: "#fef08a",
      activationBorderColor: "#3b82f6",
      activationBkgColor: "#1e293b",
      sequenceNumberColor: "#ffffff",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    sequence: {
      diagramMarginX: 30,
      diagramMarginY: 10,
      actorMargin: 50,
      width: 160,
      height: 55,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35,
      mirrorActors: false,
      useMaxWidth: false,
    },
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: "basis",
    },
    securityLevel: "loose",
  });
  isMermaidInitialized = true;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const rawId = useId();
  const id = "mermaid-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let isMounted = true;
    initMermaid();

    const cleanChart = chart.trim();

    async function renderChart() {
      try {
        const { svg: renderedSvg } = await mermaid.render(id, cleanChart);
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: any) {
        console.error("Mermaid diagram rendering error:", err);
        if (isMounted) {
          setError(err.message || "Failed to render Mermaid diagram");
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
          <Activity className="w-4 h-4" />
          <span>Diagram Source</span>
        </div>
        <pre className="p-3 bg-neutral-900 rounded-lg text-xs font-mono text-neutral-300 overflow-x-auto">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-2xl border border-neutral-800/90 bg-gradient-to-b from-neutral-950 via-neutral-950/95 to-neutral-900/40 shadow-2xl overflow-hidden group">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800/80 text-xs text-neutral-400">
        <div className="flex items-center gap-2 font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-pulse" />
          <span className="text-white font-semibold">Interactive Workflow Diagram</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-neutral-800/80 rounded-lg p-0.5 border border-neutral-700/60">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.15).toFixed(2)))}
              className="p-1 hover:text-white rounded hover:bg-neutral-700 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono font-semibold text-neutral-300 min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))}
              className="p-1 hover:text-white rounded hover:bg-neutral-700 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoom !== 1 && (
              <button
                onClick={() => setZoom(1)}
                className="p-1 hover:text-[#4285F4] rounded hover:bg-neutral-700 transition-colors border-l border-neutral-700"
                title="Reset zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 px-2.5 py-1 rounded-lg border border-neutral-700/60 transition-colors"
            title="Copy diagram code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diagram Canvas */}
      <div className="p-6 overflow-x-auto custom-scrollbar flex justify-center bg-neutral-950/60">
        {svg ? (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease-out",
            }}
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="py-12 flex items-center justify-center text-xs font-mono text-neutral-500 gap-2">
            <span className="w-3 h-3 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
            <span>Rendering diagram...</span>
          </div>
        )}
      </div>
    </div>
  );
}
