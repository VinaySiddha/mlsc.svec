"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal, Code2, Users, Flame, Zap, ShieldCheck } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words";
import Link from "next/link";

const flipWords = ["INNOVATORS.", "BUILDERS.", "LEADERS.", "CREATORS.", "HACKERS."];

export function DynamicHero({ images = [] }: { images?: any[] }) {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex flex-col justify-center bg-white font-sans py-20 md:py-28 border-b-4 border-black">
      {/* Background Graphic Grid */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }} 
      />

      {/* Retro Ticker Top Strip */}
      <div className="w-full bg-[#FFE600] border-y-2 border-black py-1.5 px-4 mb-12 overflow-hidden flex items-center justify-between text-black text-[11px] font-black uppercase tracking-widest font-mono">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 bg-black animate-ping" />
          <span>MLSC_SVEC // CHAPTER 3.0 RECRUITMENT ACTIVE</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <span>[ STATUS: 100% ONLINE ]</span>
          <span>[ CAMPUS: SRI VASAVI ENG COLLEGE ]</span>
          <span>[ POWERED BY MICROSOFT LEARN ]</span>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 text-center">

        {/* Badge Stamp */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            MICROSOFT LEARN STUDENT CLUB · CHAPTER 3.0
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="hero-heading text-black flex flex-col items-center justify-center">
            <span className="block text-4xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-black uppercase italic tracking-tighter text-black leading-[0.88]">
              WE ARE
            </span>

            {/* FlipWords on the second line with wrapper */}
            <span className="relative inline-flex items-center justify-center h-[1.15em] min-w-[240px] sm:min-w-[400px]">
              <FlipWords
                words={flipWords}
                duration={2500}
                className="text-[#4285F4] !p-0 !m-0 font-display font-black tracking-tighter uppercase italic"
              />
            </span>

            {/* Stamp line */}
            <span className="inline-block mt-3 px-6 py-2 bg-[#FFE600] text-black font-display text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight border-4 border-black shadow-[8px_8px_0px_0px_#000000] -rotate-1 hover:rotate-0 transition-transform">
              MLSC SVEC.
            </span>
          </h1>
        </motion.div>

        {/* Terminal Command Line */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-100 border-2 border-black text-zinc-900 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000000] mt-8 mb-4"
        >
          <Terminal className="h-3.5 w-3.5 text-[#4285F4]" />
          <span>&gt; npx create-mlsc-builder --track=all</span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl text-base sm:text-lg md:text-xl text-zinc-800 mx-auto mb-10 font-semibold leading-relaxed"
        >
          A premier student-led engineering powerhouse at Sri Vasavi Engineering College. Turning raw curiosity into production-grade software, AI architectures, and future tech leadership.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/apply"
            className="w-full sm:w-auto px-8 py-4 bg-[#FFE600] text-black font-sans font-black text-sm uppercase tracking-wider border-2 border-black shadow-[5px_5px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4 fill-current" />
            JOIN CLUB / APPLY NOW [↗]
          </Link>

          <Link
            href="/schedule"
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-sans font-black text-sm uppercase tracking-wider border-2 border-black shadow-[5px_5px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            EXPLORE SCHEDULE <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
        </motion.div>

        {/* Live HUD Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16"
        >
          <div className="bg-white border-2 border-black p-4 shadow-[5px_5px_0px_0px_#4285F4] text-left hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-display font-black text-black">300+</span>
              <Users className="h-5 w-5 text-[#4285F4]" />
            </div>
            <p className="text-[10px] font-black text-[#4285F4] uppercase tracking-wider mt-1 font-mono">ACTIVE BUILDERS</p>
          </div>

          <div className="bg-white border-2 border-black p-4 shadow-[5px_5px_0px_0px_#FFE600] text-left hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-display font-black text-black">15+</span>
              <Flame className="h-5 w-5 text-[#FF6600]" />
            </div>
            <p className="text-[10px] font-black text-black uppercase tracking-wider mt-1 font-mono">EVENTS HOSTED</p>
          </div>

          <div className="bg-white border-2 border-black p-4 shadow-[5px_5px_0px_0px_#00FF66] text-left hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-display font-black text-black">6</span>
              <Code2 className="h-5 w-5 text-[#00AA44]" />
            </div>
            <p className="text-[10px] font-black text-[#00AA44] uppercase tracking-wider mt-1 font-mono">CORE DOMAINS</p>
          </div>

          <div className="bg-white border-2 border-black p-4 shadow-[5px_5px_0px_0px_#FF0055] text-left hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-display font-black text-black">100%</span>
              <ShieldCheck className="h-5 w-5 text-[#FF0055]" />
            </div>
            <p className="text-[10px] font-black text-[#FF0055] uppercase tracking-wider mt-1 font-mono">STUDENT-LED</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
