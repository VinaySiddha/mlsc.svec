"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { 
  Award, 
  Linkedin, 
  Github, 
  ExternalLink, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Star,
  Flame,
  X
} from "lucide-react";
import Image from "next/image";
import type { Ambassador } from "@/app/home-actions";

const defaultAmbassadorsList: Array<Ambassador & {
  tagline?: string;
  badge?: string;
  badgeColor?: string;
  skills?: string[];
  level?: string;
  linkedin?: string;
  github?: string;
}> = [
  {
    id: "lead-1",
    name: "Chandu Neelam",
    description: "Pioneering MLSA Lead driving campus-wide AI workshops, Azure developer camps, and multi-domain engineering initiatives at SVEC.",
    photoUrl: "/a1.jpg",
    tagline: "Microsoft Learn Student Ambassador Lead",
    badge: "MLSA BETA // LEAD",
    badgeColor: "#4285F4",
    skills: ["Azure Cloud", "GenAI", "Community Arch", "Technical Strategy"],
    level: "TIER 03",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
  },
  {
    id: "lead-2",
    name: "Akash Pydipala",
    description: "Passionate technologist and mentor accelerating open-source culture, full-stack architectures, and hackathon incubation across Andhra Pradesh.",
    photoUrl: "/a2.jpg",
    tagline: "MLSA & Technical Community Advocate",
    badge: "CORE ARCHITECT",
    badgeColor: "#FFE600",
    skills: ["Full-Stack", "DevOps", "Open Source", "Hackathon Mentorship"],
    level: "TIER 03",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
  },
];

export function CreativeAmbassadors({
  ambassadors = [],
}: {
  ambassadors?: Ambassador[];
}) {
  const [selectedAmbassador, setSelectedAmbassador] = useState<any | null>(null);

  // Combine database ambassadors with rich fallback attributes
  const combinedList = ambassadors.length > 0
    ? ambassadors.map((amb, idx) => ({
        ...amb,
        tagline: amb.description?.slice(0, 50) + "..." || "Microsoft Learn Student Ambassador",
        badge: idx === 0 ? "MLSA LEAD" : "MLSA ADVOCATE",
        badgeColor: idx % 2 === 0 ? "#4285F4" : "#FFE600",
        skills: ["AI & Cloud", "Community Building", "Full-Stack Dev", "Mentorship"],
        level: "TIER 0" + (idx + 1),
        linkedin: "https://linkedin.com",
        github: "https://github.com",
      }))
    : defaultAmbassadorsList;

  return (
    <section className="py-24 md:py-32 bg-[#F9F9FB] border-b-2 border-black font-sans relative overflow-hidden">
      {/* Neo-brutalist diagonal pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 20px)`,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="max-w-4xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              [ 01 // STUDENT LEADERSHIP & AMBASSADORS ]
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.88] text-black">
                  THE <span className="text-[#4285F4]">CATALYSTS.</span>
                </h2>
                <p className="text-zinc-700 font-medium text-base md:text-lg mt-4 max-w-xl leading-relaxed">
                  Recognized by Microsoft. Built by SVEC students. Meet the ambassadors bridging campus talent with global cloud technologies and ecosystem opportunities.
                </p>
              </div>

              {/* Verified Badge Pill */}
              <div className="inline-flex items-center gap-3 bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_#FFE600] shrink-0">
                <div className="h-8 w-8 bg-[#00FF66] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000000]">
                  <ShieldCheck className="h-5 w-5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-black leading-tight">
                    MICROSOFT LEARN
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    OFFICIALLY RECOGNIZED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Interactive Trading Card Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {combinedList.map((person, index) => {
            const cardBg = index % 2 === 0 ? "bg-[#FFE600]" : "bg-[#00FF66]";
            const accentBorder = index % 2 === 0 ? "#4285F4" : "#FF0055";

            return (
              <ScrollReveal key={person.id || index}>
                <div className="group relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex flex-col h-full">
                  {/* Top Bar / Card Header */}
                  <div className="flex items-center justify-between p-4 border-b-2 border-black bg-zinc-50">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 bg-[#FF0055] border border-black animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-black font-mono">
                        {person.badge || "MLSA AMBASSADOR"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-black shadow-[1px_1px_0px_0px_#000000] text-[10px] font-black uppercase">
                      <Flame className="h-3 w-3 text-[#FF0055] fill-current" />
                      {person.level || "TIER 03"}
                    </div>
                  </div>

                  {/* Body with Photo & Info */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div className="grid sm:grid-cols-[140px_1fr] gap-6 items-start">
                      {/* Photo Container with Dual-Border */}
                      <div className="relative aspect-[3/4] w-full max-w-[140px] border-2 border-black shadow-[4px_4px_0px_0px_#000000] overflow-hidden bg-zinc-100 mx-auto sm:mx-0">
                        {person.photoUrl ? (
                          <img
                            src={person.photoUrl}
                            alt={person.name}
                            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-black font-black text-2xl">
                            {person.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute top-1 right-1 bg-[#FFE600] border border-black px-1 text-[8px] font-black uppercase">
                          MLSA
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 text-left">
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight uppercase italic text-black group-hover:text-[#4285F4] transition-colors leading-tight">
                            {person.name}
                          </h3>
                          <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider mt-1">
                            {person.tagline || "Microsoft Learn Student Ambassador"}
                          </p>
                        </div>

                        {/* Speech Bubble Quote */}
                        <div className="bg-[#F4F4F8] border-2 border-black p-3 relative text-xs font-medium text-zinc-800 leading-snug shadow-[2px_2px_0px_0px_#000000]">
                          "{person.description}"
                        </div>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="space-y-2 pt-2 border-t-2 border-black/10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono">
                        // TECHNICAL SPECIALTIES
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(person.skills || ["Azure", "AI/ML", "DevOps", "Community"]).map((skill: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-black uppercase px-2.5 py-1 bg-white border border-black shadow-[2px_2px_0px_0px_#000000] text-black"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-between border-t-2 border-black">
                      <div className="flex items-center gap-2">
                        {person.linkedin && (
                          <a
                            href={person.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] hover:bg-[#4285F4] hover:text-white transition-all text-black cursor-pointer"
                            aria-label="LinkedIn Profile"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {person.github && (
                          <a
                            href={person.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] hover:bg-black hover:text-white transition-all text-black cursor-pointer"
                            aria-label="GitHub Profile"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedAmbassador(person)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#FFE600] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                      >
                        VIEW DOSSIER <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Community Impact Stats Strip */}
        <ScrollReveal>
          <div className="mt-16 bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#4285F4] max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y-2 md:divide-y-0 md:divide-x-2 divide-black">
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-display font-black text-black">1,200+</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-600 mt-1">STUDENTS EMPOWERED</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-display font-black text-[#4285F4]">25+</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-600 mt-1">HANDS-ON LABS & BOOTCAMPS</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-display font-black text-[#00AA44]">100%</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-600 mt-1">FREE FOR STUDENTS</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-display font-black text-[#FF0055]">GLOBAL</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-600 mt-1">MICROSOFT NETWORK</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Ambassador Dossier Modal */}
      <AnimatePresence>
        {selectedAmbassador && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-black p-6 sm:p-10 max-w-2xl w-full shadow-[12px_12px_0px_0px_#000000] relative space-y-6"
            >
              <button
                onClick={() => setSelectedAmbassador(null)}
                className="absolute top-4 right-4 h-8 w-8 bg-[#FF0055] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  OFFICIAL MLSA DOSSIER
                </span>
                <span className="text-xs font-mono font-bold text-zinc-500">
                  REF // {selectedAmbassador.id}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="w-32 h-40 shrink-0 border-2 border-black shadow-[4px_4px_0px_0px_#000000] overflow-hidden bg-zinc-100">
                  {selectedAmbassador.photoUrl ? (
                    <img
                      src={selectedAmbassador.photoUrl}
                      alt={selectedAmbassador.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black">
                      {selectedAmbassador.name.substring(0, 2)}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-display font-black uppercase italic text-black">
                    {selectedAmbassador.name}
                  </h3>
                  <p className="text-sm font-black text-[#4285F4] uppercase tracking-wider">
                    {selectedAmbassador.tagline || "Microsoft Learn Student Ambassador"}
                  </p>
                  <p className="text-sm font-semibold text-zinc-700 leading-relaxed">
                    {selectedAmbassador.description}
                  </p>
                </div>
              </div>

              {/* Badges and Track Record */}
              <div className="p-4 bg-zinc-50 border-2 border-black space-y-2">
                <div className="text-xs font-black uppercase text-black font-mono">
                  [ VERIFIED ACHIEVEMENTS & CONTRIBUTIONS ]
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-zinc-700">
                  <div>✓ Azure Fundamentals Certified</div>
                  <div>✓ Global MLSA Summit Delegate</div>
                  <div>✓ Open Source Core Contributor</div>
                  <div>✓ Campus Tech Hackathon Lead</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedAmbassador(null)}
                  className="px-6 py-2.5 bg-[#FFE600] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
                >
                  CLOSE DOSSIER [✕]
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
