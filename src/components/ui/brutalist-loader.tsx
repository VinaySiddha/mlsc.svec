"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Cpu } from "lucide-react";

interface BrutalistLoaderProps {
  statusText?: string;
  showProgress?: boolean;
  onComplete?: () => void;
  fullScreen?: boolean;
}

export function BrutalistLoader({
  statusText = "INITIALIZING SYSTEM",
  showProgress = true,
  onComplete,
  fullScreen = false,
}: BrutalistLoaderProps) {
  const [progress, setProgress] = useState(15);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "LOADING // MLSC_CORE_KERNEL_3.0",
    "SYNCING // STUDENT_AMBASSADORS",
    "INITIALIZING // TECH_DOMAINS",
    "FETCHING // ALUMNI_ARCHIVE",
    "SYSTEM_ONLINE // READY",
  ];

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 200);
          }
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 20) + 10;
        return next > 100 ? 100 : next;
      });
    }, 120);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 250);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [showProgress, onComplete]);

  const content = (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000000] max-w-md w-full mx-4 font-sans relative">
      {/* Corner Neo-Brutalist Screws */}
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#FFE600] border-2 border-black" />
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#4285F4] border-2 border-black" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#00FF66] border-2 border-black" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#FF0055] border-2 border-black" />

      {/* Header bar */}
      <div className="w-full flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-[#FFE600] border border-black animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            MLSC SVEC // OS 3.0
          </span>
        </div>
        <span className="text-[10px] font-black uppercase bg-[#4285F4] text-white px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000000]">
          LIVE
        </span>
      </div>

      {/* Main Spinner Graphic */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-20 h-20 bg-[#FFE600] border-4 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center animate-spin [animation-duration:4s]">
          <Cpu className="h-10 w-10 text-black stroke-[2.5]" />
        </div>
      </div>

      {/* Loading Step & Status */}
      <div className="w-full text-center space-y-1 mt-2 mb-4">
        <div className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center justify-center gap-1.5 font-mono">
          <Terminal className="h-3.5 w-3.5 text-[#4285F4]" />
          {steps[stepIndex]}
        </div>
        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
          {statusText}
        </p>
      </div>

      {/* Brutalist Progress Bar */}
      {showProgress && (
        <div className="w-full space-y-2">
          <div className="w-full h-5 bg-zinc-100 border-2 border-black relative overflow-hidden shadow-[2px_2px_0px_0px_#000000]">
            <motion.div
              className="h-full bg-[#00FF66] border-r-2 border-black flex items-center justify-end pr-1"
              style={{ width: `${progress}%` }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            >
              <span className="text-[9px] font-black font-mono text-black">
                {progress}%
              </span>
            </motion.div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
            <span>MEM: 64MB OK</span>
            <span>STATUS: 200 OK</span>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}
