"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/app/home-actions";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Award, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  X, 
  Maximize2, 
  Flame,
  Zap,
  Film,
  Disc,
  Play,
  Layers,
  SlidersHorizontal,
  Compass
} from "lucide-react";

interface MemoryItem {
  id: string;
  url: string;
  type: "moments" | "milestones" | "hackathons" | "workshops";
  title: string;
  desc: string;
  date: string;
  location: string;
  stats: string;
  tag: string;
  color: string;
  iso: string;
  shutter: string;
}

const RICH_DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    url: "/team1.jpg",
    type: "milestones",
    title: "MLSC Core Leadership Assembly",
    desc: "The executive team and leads architecting club roadmaps, syllabus modules, and nationwide hackathons.",
    date: "OCTOBER 2025",
    location: "SVEC INNOVATION HUB",
    stats: "25+ CORE ARCHITECTS",
    tag: "LEADERSHIP",
    color: "#4285F4",
    iso: "ISO 400",
    shutter: "1/500s",
  },
  {
    id: "mem-2",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=75&w=1000&auto=format&fit=crop",
    type: "hackathons",
    title: "24-Hour Overnight Code-a-Thon",
    desc: "50+ teams battling clock limits to engineer autonomous agents and cloud architectures with live deployments.",
    date: "NOVEMBER 2025",
    location: "AUDITORIUM COMPLEX",
    stats: "200+ HACKERS",
    tag: "HACKATHON",
    color: "#FF0055",
    iso: "ISO 1600",
    shutter: "1/125s",
  },
  {
    id: "mem-3",
    url: "/g2.jpg",
    type: "workshops",
    title: "Azure Cloud & DevOps Bootcamp",
    desc: "Intensive hands-on lab deploying scalable microservices with Docker, Kubernetes, and Azure container registries.",
    date: "DECEMBER 2025",
    location: "SYSTEMS LAB 402",
    stats: "120+ PARTICIPANTS",
    tag: "BOOTCAMP",
    color: "#00AA44",
    iso: "ISO 800",
    shutter: "1/250s",
  },
  {
    id: "mem-4",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=75&w=1000&auto=format&fit=crop",
    type: "workshops",
    title: "Generative AI & LLM Sprint",
    desc: "Building production RAG pipelines, fine-tuned embeddings, and autonomous agent loops with LangChain & OpenAI.",
    date: "JANUARY 2026",
    location: "TECH THEATER",
    stats: "150+ BUILDERS",
    tag: "GENAI LAB",
    color: "#FFE600",
    iso: "ISO 640",
    shutter: "1/320s",
  },
  {
    id: "mem-5",
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=75&w=1000&auto=format&fit=crop",
    type: "milestones",
    title: "Microsoft Learn Summit Keynote",
    desc: "A massive campus symposium connecting our student engineers with senior cloud architects and tech founders.",
    date: "FEBRUARY 2026",
    location: "MAIN AUDITORIUM",
    stats: "400+ ATTENDEES",
    tag: "SUMMIT",
    color: "#8B5CF6",
    iso: "ISO 1250",
    shutter: "1/200s",
  },
  {
    id: "mem-6",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=75&w=1000&auto=format&fit=crop",
    type: "hackathons",
    title: "Demo Day & Project Showcase",
    desc: "Top 10 student startups pitching to tech executives, angel investors, and faculty judges with live grants.",
    date: "MARCH 2026",
    location: "INCUBATION LOUNGE",
    stats: "₹50,000+ GRANTS",
    tag: "DEMO DAY",
    color: "#FF6600",
    iso: "ISO 500",
    shutter: "1/400s",
  },
];

export function DynamicGallery({ images = [] }: { images?: GalleryImage[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [lightboxMemory, setLightboxMemory] = useState<MemoryItem | null>(null);

  // Merge database pictures with rich memory records (Firestore images displayed first)
  const combinedMemories: MemoryItem[] = [
    ...images.map((img, idx) => ({
      id: img.id,
      url: img.url,
      type: (img.type as any) || "moments",
      title: img.title || (img.type === "milestones" ? "Ecosystem Milestone" : "Campus Tech Moment"),
      desc: img.desc || "Live capture from our engineering hackathons and builder workshops.",
      date: img.date || "2026",
      location: img.location || "SVEC CAMPUS",
      stats: img.stats || "ACTIVE EVENT",
      tag: img.tag || (img.type ? img.type.toUpperCase() : "EVENT"),
      color: img.color || (idx % 2 === 0 ? "#4285F4" : "#FFE600"),
      iso: "ISO 800",
      shutter: "1/250s",
    })),
    ...RICH_DEFAULT_MEMORIES,
  ];

  const filteredMemories = filter === "all"
    ? combinedMemories
    : combinedMemories.filter(m => m.type === filter || (filter === "moments" && (m.type === "hackathons" || m.type === "workshops")));

  const activeMemory = filteredMemories[activeIdx] || filteredMemories[0] || RICH_DEFAULT_MEMORIES[0];

  return (
    <section className="relative py-24 md:py-36 bg-white overflow-hidden border-b-4 border-black font-sans">
      {/* Background Graphic Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} 
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#00FF66] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                <Film className="h-3.5 w-3.5 stroke-[2.5]" />
                [ 03 // THE BUILDER ARCHIVE & FILM REEL ]
              </div>

              <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.88] text-black">
                MOMENTS & <br />
                <span className="text-[#4285F4]">MEMORIES.</span>
              </h2>

              <p className="text-base sm:text-lg text-zinc-700 font-semibold leading-relaxed mt-4 max-w-xl">
                A high-energy film reel documenting the late nights, breakthrough deployments, high-stakes demos, and vibrant builder culture at MLSC SVEC.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {[
                { key: "all", label: "ALL ARCHIVES", icon: Layers },
                { key: "hackathons", label: "🔥 HACKATHONS", icon: Flame },
                { key: "workshops", label: "⚡ BOOTCAMPS & LABS", icon: Zap },
                { key: "milestones", label: "🏆 MILESTONES", icon: Award },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setFilter(tab.key);
                      setActiveIdx(0);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
                      filter === tab.key
                        ? "bg-[#FFE600] text-black shadow-[4px_4px_0px_0px_#000000] -translate-y-0.5"
                        : "bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black shadow-[2px_2px_0px_0px_#000000]"
                    }`}
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════════════════════════════════════════════════════
            THE ARCHIVAL CASSETTE DECK (Interactive Main Projector)
            ══════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch mb-14">

          {/* Left: Main Stage Film Projector Frame */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="border-4 border-black bg-zinc-950 shadow-[12px_12px_0px_0px_#000000] p-4 sm:p-6 text-white relative flex flex-col justify-between h-full">

              {/* Film Sprocket Strip Top */}
              <div className="w-full flex items-center justify-between pb-3 border-b-2 border-zinc-800 font-mono text-[10px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#FF0055] inline-block border border-black" />
                  <span className="font-bold text-white uppercase">REEL #0{activeIdx + 1} // COMMUNITY_VAULT</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{activeMemory.iso}</span>
                  <span>{activeMemory.shutter}</span>
                  <span className="text-[#00FF66] font-black">[ READY ]</span>
                </div>
              </div>

              {/* Main Photo Viewport */}
              <div className="relative aspect-[16/10] w-full my-4 border-2 border-zinc-700 overflow-hidden bg-black group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeMemory.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={activeMemory.url}
                    alt={activeMemory.title}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Overlaid Corner Lens Crosshairs */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white pointer-events-none" />

                {/* Enlarge Button */}
                <button
                  onClick={() => setLightboxMemory(activeMemory)}
                  className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/90 text-white border-2 border-white text-xs font-black uppercase flex items-center gap-1.5 hover:bg-[#FFE600] hover:text-black hover:border-black transition-all cursor-pointer shadow-[3px_3px_0px_0px_#FFFFFF]"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  EXPAND VIEW
                </button>
              </div>

              {/* Projector Metadata Footer */}
              <div className="pt-3 border-t-2 border-zinc-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2.5 py-0.5 text-[10px] font-black uppercase text-black border border-black shadow-[2px_2px_0px_0px_#FFFFFF]"
                      style={{ backgroundColor: activeMemory.color }}
                    >
                      [ {activeMemory.tag} ]
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display font-black uppercase italic text-white">
                      {activeMemory.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400">
                    <Calendar className="h-3.5 w-3.5 text-[#FFE600]" />
                    <span>{activeMemory.date}</span>
                    <span className="text-zinc-600">·</span>
                    <MapPin className="h-3.5 w-3.5 text-[#FF0055]" />
                    <span>{activeMemory.location}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                  {activeMemory.desc}
                </p>
              </div>

            </div>
          </div>

          {/* Right: Interactive Archival Drawer / Index List */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
            <div className="bg-[#FFE600] border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between font-mono text-xs font-black uppercase text-black">
              <span>// ARCHIVE INDEX DECK</span>
              <span>{filteredMemories.length} RECORDS</span>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
              {filteredMemories.map((mem, mIdx) => {
                const isSelected = mIdx === activeIdx;
                return (
                  <button
                    key={mem.id}
                    onClick={() => setActiveIdx(mIdx)}
                    className={`w-full text-left p-3.5 border-2 border-black transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-white shadow-[5px_5px_0px_0px_#000000] translate-x-1"
                        : "bg-zinc-50 hover:bg-white text-zinc-700 hover:shadow-[3px_3px_0px_0px_#000000]"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 border-2 border-black overflow-hidden flex-shrink-0 relative bg-zinc-900">
                      <img
                        src={mem.url}
                        alt={mem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span 
                          className="text-[9px] font-black uppercase px-1.5 py-0.5 border border-black"
                          style={{ backgroundColor: mem.color }}
                        >
                          {mem.tag}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 font-bold">
                          {mem.date.split(" ")[0]}
                        </span>
                      </div>

                      <h4 className="text-xs font-display font-black uppercase italic text-black truncate mt-1">
                        {mem.title}
                      </h4>

                      <p className="text-[10px] text-zinc-600 font-semibold truncate mt-0.5">
                        {mem.stats}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            BOTTOM HORIZONTAL CONTACT SHEET STRIP
            ══════════════════════════════════════════════════════════ */}
        <div className="border-4 border-black bg-zinc-100 p-4 sm:p-6 shadow-[8px_8px_0px_0px_#000000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4 font-mono text-xs font-black uppercase text-black">
            <span className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#4285F4]" />
              CONTACT SHEET FILM STRIP // CLICK ANY TO LOAD INTO PROJECTOR
            </span>
            <span className="text-zinc-500 hidden sm:inline">SVEC INNOVATION CAMPUS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {filteredMemories.slice(0, 6).map((mem, idx) => (
              <button
                key={`strip-${mem.id}`}
                onClick={() => setActiveIdx(idx)}
                className={`relative aspect-[4/3] border-2 border-black overflow-hidden group cursor-pointer transition-all ${
                  activeIdx === idx
                    ? "ring-4 ring-[#FFE600] scale-105 shadow-[4px_4px_0px_0px_#000000] z-10"
                    : "opacity-80 hover:opacity-100 hover:scale-102 shadow-[2px_2px_0px_0px_#000000]"
                }`}
              >
                <img
                  src={mem.url}
                  alt={mem.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-[9px] font-black uppercase">
                  LOAD #0{idx + 1}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lightbox Inspection Modal */}
        <AnimatePresence>
          {lightboxMemory && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border-4 border-black p-6 sm:p-8 max-w-4xl w-full shadow-[16px_16px_0px_0px_#000000] relative space-y-6 max-h-[92vh] overflow-y-auto"
              >
                <button
                  onClick={() => setLightboxMemory(null)}
                  className="absolute top-4 right-4 h-9 w-9 bg-[#FF0055] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer z-30"
                >
                  <X className="h-5 w-5 stroke-[2.5]" />
                </button>

                {/* Header Tag */}
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-1 text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                    style={{ backgroundColor: lightboxMemory.color }}
                  >
                    [ {lightboxMemory.tag} // ARCHIVED FRAME ]
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    {lightboxMemory.date}
                  </span>
                </div>

                {/* Full Frame Photo */}
                <div className="relative aspect-[16/9] w-full border-4 border-black shadow-[6px_6px_0px_0px_#000000] overflow-hidden bg-black">
                  <img
                    src={lightboxMemory.url}
                    alt={lightboxMemory.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Story Details */}
                <div className="space-y-4">
                  <h3 className="text-3xl sm:text-4xl font-display font-black uppercase italic text-black">
                    {lightboxMemory.title}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs font-mono font-bold text-zinc-700 bg-zinc-100 p-3 border-2 border-black">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#FF0055]" />
                      <span>{lightboxMemory.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#4285F4]" />
                      <span>{lightboxMemory.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-[#00AA44]" />
                      <span>{lightboxMemory.stats}</span>
                    </div>
                  </div>

                  <p className="text-base font-medium text-zinc-800 leading-relaxed">
                    {lightboxMemory.desc}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setLightboxMemory(null)}
                    className="px-6 py-2.5 bg-[#FFE600] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
                  >
                    CLOSE REEL [✕]
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
