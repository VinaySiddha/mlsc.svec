"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Code2, 
  Award,
  BookOpen
} from "lucide-react";

export function DynamicHero({ images = [], activeChapter = "3.0" }: { images?: any[]; activeChapter?: string }) {
  return (
    <section className="relative overflow-hidden bg-white font-sans pt-12 md:pt-20 pb-20 md:pb-28 border-b-4 border-black">
      
      {/* Crisp Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }} 
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl text-center">
        
        {/* ── 1. OFFICIAL ACCREDITATION PILL ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-6"
        >
          {/* Microsoft 4-Color Quad Badge */}
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0 border border-black shadow-[1px_1px_0px_0px_#000000]">
            <span className="w-1.5 h-1.5 bg-[#F25022]" />
            <span className="w-1.5 h-1.5 bg-[#7FBA00]" />
            <span className="w-1.5 h-1.5 bg-[#00A4EF]" />
            <span className="w-1.5 h-1.5 bg-[#FFB900]" />
          </div>

          <span className="text-xs font-black uppercase tracking-wider text-black font-mono">
            MICROSOFT LEARN STUDENT CLUB · CHAPTER {activeChapter}
          </span>
        </motion.div>

        {/* ── 2. MONUMENTAL "MLSC SVEC" HERO HEADLINE ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Official Logo + Institution Badge */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 relative bg-zinc-50 border-2 border-black shadow-[3px_3px_0px_0px_#000000] p-1.5 shrink-0">
              <Image 
                src="/logo.png" 
                alt="MLSC SVEC Logo" 
                fill 
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="text-left">
              <span className="text-[11px] font-mono font-black uppercase tracking-widest text-zinc-500 block">
                SRI VASAVI ENGINEERING COLLEGE
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-black">
                OFFICIAL TECHNICAL GUILD
              </span>
            </div>
          </div>

          {/* THE HIGHLIGHTED WORDS */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-display font-black tracking-tight uppercase italic text-black leading-[0.88]">
            MLSC <span className="text-[#4285F4] underline decoration-[#FFE600] decoration-8 underline-offset-8">SVEC.</span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-700 font-semibold max-w-2xl mx-auto leading-relaxed pt-2">
            The flagship student developer community at Sri Vasavi Engineering College. Where curious minds build, ship, and lead across Artificial Intelligence, Cloud Infrastructure, and Full-Stack Engineering.
          </p>
        </motion.div>

        {/* ── 3. CLEAN HIGH-CONTRAST ACTION BUTTONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-8"
        >
          <Link
            href="/apply"
            className="px-8 sm:px-10 py-4 bg-[#FFE600] text-black font-sans font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] active:scale-95 transition-all text-center flex items-center gap-2 cursor-pointer"
          >
            <Zap className="h-4 w-4 fill-current text-black" />
            JOIN MLSC SVEC [↗]
          </Link>

          <Link
            href="/domains"
            className="px-8 sm:px-10 py-4 bg-white text-black font-sans font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] active:scale-95 transition-all text-center flex items-center gap-2 cursor-pointer"
          >
            EXPLORE 06 DOMAINS <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
        </motion.div>

        {/* ── 4. BRAND PILLARS (LEARN · BUILD · LEAD) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left"
        >
          {/* Pillar 1 */}
          <div className="bg-white border-3 border-black p-6 shadow-[6px_6px_0px_0px_#4285F4] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 bg-[#4285F4] text-white text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000000]">
                  PILLAR 01
                </span>
                <span className="font-mono text-xs font-bold text-zinc-500">// UPSKILL</span>
              </div>
              <h3 className="text-2xl font-display font-black uppercase italic text-black mb-2">
                LEARN
              </h3>
              <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                Intensive hands-on bootcamps in Artificial Intelligence, Microsoft Azure Cloud, Modern Full-Stack, and DevOps.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t-2 border-black/10 text-[11px] font-mono font-bold text-zinc-600">
              → 6 Specialized Tracks
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white border-3 border-black p-6 shadow-[6px_6px_0px_0px_#FFE600] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 bg-[#FFE600] text-black text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000000]">
                  PILLAR 02
                </span>
                <span className="font-mono text-xs font-bold text-zinc-500">// SHIP</span>
              </div>
              <h3 className="text-2xl font-display font-black uppercase italic text-black mb-2">
                BUILD
              </h3>
              <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                24-hour hackathons, overnight code sprints, and production software deployed to live cloud infrastructure.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t-2 border-black/10 text-[11px] font-mono font-bold text-zinc-600">
              → Live Codebases
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white border-3 border-black p-6 shadow-[6px_6px_0px_0px_#00AA44] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 bg-[#00AA44] text-white text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000000]">
                  PILLAR 03
                </span>
                <span className="font-mono text-xs font-bold text-zinc-500">// INSPIRE</span>
              </div>
              <h3 className="text-2xl font-display font-black uppercase italic text-black mb-2">
                LEAD
              </h3>
              <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                Direct mentorship from Microsoft Student Ambassadors, career workshops, and alumni networks in top tech.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t-2 border-black/10 text-[11px] font-mono font-bold text-zinc-600">
              → MLSA Mentorship
            </div>
          </div>
        </motion.div>

        {/* ── 5. STATS & VERIFICATION STRIP ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 pt-14 text-xs font-mono font-bold text-zinc-700"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
            <span className="text-black font-black">300+</span> ACTIVE BUILDERS
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFE600]" />
            <span className="text-black font-black">06</span> CORE DOMAINS
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00AA44]" />
            <span className="text-black font-black">100%</span> STUDENT POWERED
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
            <span className="text-black font-black">SVEC</span> CHAPTER 3.0
          </div>
        </motion.div>

      </div>
    </section>
  );
}
