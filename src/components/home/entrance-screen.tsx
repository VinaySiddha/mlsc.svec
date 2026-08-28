"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Terminal, Sparkles, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export function EntranceScreen({ activeChapter = "3.0" }: { activeChapter?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check session storage
    const hasSeenEntrance = sessionStorage.getItem("mlsc_entrance_v2_seen");
    if (hasSeenEntrance) {
      setIsOpen(true);
      return;
    }
    setMounted(true);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            triggerOpen();
          }, 400);
          return 0;
        }
        return prev - 1;
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  const triggerOpen = () => {
    setIsOpen(true);
    sessionStorage.setItem("mlsc_entrance_v2_seen", "true");
  };

  if (!mounted || isOpen) return null;

  return (
    <AnimatePresence>
      {!isOpen && (
        <div className="fixed inset-0 z-[999999] pointer-events-auto flex flex-col font-sans select-none overflow-hidden">
          {/* Top Shutter Half */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
            className="w-full h-1/2 bg-[#FFFFFF] border-b-4 border-black relative flex flex-col justify-end items-center pb-8 px-6 shadow-2xl"
          >
            {/* Retro Hazard Striping Top Border */}
            <div
              className="absolute top-0 inset-x-0 h-4 border-b-2 border-black opacity-80"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #FFE600 0, #FFE600 15px, #000000 15px, #000000 30px)",
              }}
            />

            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Top Terminal Status */}
            <div className="flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-mono font-bold tracking-widest uppercase mb-4 border-2 border-black">
              <Terminal className="h-3.5 w-3.5 text-[#FFE600]" />
              SYSTEM INITIALIZING // CHAPTER {activeChapter}
            </div>

            {/* Top Branding */}
            <div className="relative z-10 text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                <Activity className="h-3.5 w-3.5" />
                SYSTEM INITIALIZING // CHAPTER {activeChapter}
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic text-black leading-none">
                MLSC <span className="text-[#4285F4]">SVEC.</span>
              </h1>
            </div>
          </motion.div>

          {/* Center Dynamic Reactor / Lock */}
          <motion.div
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center"
          >
            <div className="bg-white border-4 border-black p-5 sm:p-7 shadow-[8px_8px_0px_0px_#FFE600] text-center max-w-xs sm:max-w-sm w-full space-y-4">
              {/* Countdown & Status */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2 font-mono text-[11px] font-black">
                <span className="flex items-center gap-1.5 text-black">
                  <span className="h-2.5 w-2.5 bg-[#00FF66] border border-black animate-ping" />
                  ONLINE
                </span>
                <span className="text-zinc-500">T-MINUS 0{countdown}</span>
              </div>

              {/* Big Animated Launch Counter */}
              <div className="py-2">
                <div className="text-5xl sm:text-6xl font-display font-black italic tracking-tight text-black flex items-center justify-center gap-2">
                  {countdown > 0 ? (
                    <span className="text-[#4285F4]">0{countdown}</span>
                  ) : (
                    <span className="text-[#00AA44] animate-pulse">LAUNCH!</span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1 font-mono">
                  [ CALIBRATING ENVIRONMENT NODES ]
                </p>
              </div>

              {/* Manual Enter Action Button */}
              <button
                onClick={triggerOpen}
                className="w-full py-3 bg-[#FFE600] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                ENTER DIRECTLY <ArrowRight className="h-4 w-4 stroke-[3]" />
              </button>
            </div>
          </motion.div>

          {/* Bottom Shutter Half */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
            className="w-full h-1/2 bg-[#F9F9FB] border-t-4 border-black relative flex flex-col justify-start items-center pt-8 px-6 shadow-2xl"
          >
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10 text-center space-y-2 mt-4">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-600">
                WHERE CURIOSITY BECOMES CAPABILITY
              </p>
              <div className="flex items-center justify-center gap-4 text-[10px] font-mono font-bold text-zinc-500 pt-2">
                <span>[ PROTOCOL: 3.0.4 ]</span>
                <span>[ SECURE SOCKET: OK ]</span>
                <span>[ SRI VASAVI ENG COLLEGE ]</span>
              </div>
            </div>

            {/* Retro Hazard Striping Bottom Border */}
            <div
              className="absolute bottom-0 inset-x-0 h-4 border-t-2 border-black opacity-80"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #4285F4 0, #4285F4 15px, #000000 15px, #000000 30px)",
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
