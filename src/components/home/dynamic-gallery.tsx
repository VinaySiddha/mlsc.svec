"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/app/home-actions";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Award, 
  Grid, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  X, 
  Maximize2, 
  Flame,
  Zap,
  Tag
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
  rotation: string;
}

const RICH_DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    url: "/team1.jpg",
    type: "milestones",
    title: "MLSC Core Leadership Assembly",
    desc: "The executive team and domain leads strategizing the Chapter 3.0 roadmap, curriculum, and hackathon series.",
    date: "OCTOBER 2025",
    location: "SVEC INNOVATION HUB",
    stats: "25+ CORE ARCHITECTS",
    tag: "LEADERSHIP",
    color: "#4285F4",
    rotation: "-rotate-1",
  },
  {
    id: "mem-2",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=75&w=800&auto=format&fit=crop",
    type: "hackathons",
    title: "24-Hour Code-a-Thon Arena",
    desc: "Over 50 teams building overnight AI and cloud solutions with live mentor feedback and deployment checkpoints.",
    date: "NOVEMBER 2025",
    location: "AUDITORIUM COMPLEX",
    stats: "200+ HACKERS",
    tag: "HACKATHON",
    color: "#FF0055",
    rotation: "rotate-1",
  },
  {
    id: "mem-3",
    url: "/g2.jpg",
    type: "workshops",
    title: "Azure Cloud & DevOps Bootcamp",
    desc: "Hands-on engineering lab deploying microservices with Docker and Azure Kubernetes Service (AKS).",
    date: "DECEMBER 2025",
    location: "SYSTEMS LAB 402",
    stats: "120+ PARTICIPANTS",
    tag: "BOOTCAMP",
    color: "#00AA44",
    rotation: "-rotate-2",
  },
  {
    id: "mem-4",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=75&w=800&auto=format&fit=crop",
    type: "workshops",
    title: "Generative AI & LLM Sprint",
    desc: "Deep dive into building RAG systems and autonomous AI agents with LangChain, ChromaDB, and OpenAI models.",
    date: "JANUARY 2026",
    location: "TECH THEATER",
    stats: "150+ BUILDERS",
    tag: "GENAI LAB",
    color: "#FFE600",
    rotation: "rotate-2",
  },
  {
    id: "mem-5",
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=75&w=800&auto=format&fit=crop",
    type: "milestones",
    title: "Microsoft Learn Summit Keynote",
    desc: "Campus-wide technical symposium bridging student developers with industry architects and Microsoft leaders.",
    date: "FEBRUARY 2026",
    location: "MAIN AUDITORIUM",
    stats: "400+ ATTENDEES",
    tag: "SUMMIT",
    color: "#8B5CF6",
    rotation: "-rotate-1",
  },
  {
    id: "mem-6",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=75&w=800&auto=format&fit=crop",
    type: "hackathons",
    title: "Demo Day & Project Showcase",
    desc: "Top 10 student startups and open-source projects pitching to tech founders and faculty judges.",
    date: "MARCH 2026",
    location: "INCUBATION LOUNGE",
    stats: "₹50,000+ GRANTS",
    tag: "DEMO DAY",
    color: "#FF6600",
    rotation: "rotate-1",
  },
];

export function DynamicGallery({ images = [] }: { images?: GalleryImage[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  // Combine database images with rich fallback memories
  const combinedMemories: MemoryItem[] = [
    ...RICH_DEFAULT_MEMORIES,
    ...images.map((img, idx) => ({
      id: img.id,
      url: img.url,
      type: img.type as any,
      title: img.type === "moments" ? "Campus Tech Moment" : "Ecosystem Milestone",
      desc: "Captured live during our community hackathons and developer tracks.",
      date: "2026",
      location: "SVEC CAMPUS",
      stats: "ACTIVE EVENT",
      tag: img.type.toUpperCase(),
      color: idx % 2 === 0 ? "#4285F4" : "#FFE600",
      rotation: idx % 2 === 0 ? "rotate-1" : "-rotate-1",
    })),
  ];

  const filteredMemories = filter === "all"
    ? combinedMemories
    : combinedMemories.filter(m => m.type === filter || (filter === "moments" && (m.type === "hackathons" || m.type === "workshops")));

  return (
    <section className="relative py-24 md:py-36 bg-[#F9F9FB] overflow-hidden border-b-2 border-black font-sans">
      {/* Background Graphic Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} 
      />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF66] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                <Camera className="h-3.5 w-3.5 stroke-[2.5]" />
                [ 03 // VISUAL SCRAPBOOK & CAPTURES ]
              </div>

              <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.88] text-black">
                MOMENTS & <br />
                <span className="text-[#4285F4]">MEMORIES.</span>
              </h2>

              <p className="text-base sm:text-lg text-zinc-700 font-medium leading-relaxed mt-4 max-w-xl">
                A raw, tangible scrapbook capturing the late-night coding sprints, high-stakes hackathons, breakthrough milestones, and vibrant builder culture at MLSC SVEC.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {[
                { key: "all", label: "ALL CAPTURES", icon: Grid },
                { key: "hackathons", label: "🔥 HACKATHONS", icon: Flame },
                { key: "workshops", label: "⚡ BOOTCAMPS & LABS", icon: Zap },
                { key: "milestones", label: "🏆 MILESTONES", icon: Award },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
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

        {/* Polaroid Scrapbook Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredMemories.map((item, index) => {
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  key={item.id}
                  onClick={() => setSelectedMemory(item)}
                  className={`group relative bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer flex flex-col justify-between ${item.rotation} hover:rotate-0`}
                >
                  {/* Washi Tape Corner Stamp */}
                  <div 
                    className="absolute -top-3.5 left-6 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] z-20"
                    style={{ backgroundColor: item.color }}
                  >
                    [ {item.tag} ]
                  </div>

                  {/* Top Header Stamp */}
                  <div className="flex items-center justify-between pb-3 pt-1 border-b-2 border-black/10 font-mono text-[10px] font-black text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-black" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-black" />
                      {item.location}
                    </span>
                  </div>

                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] w-full mt-3 mb-4 border-2 border-black overflow-hidden bg-zinc-900">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                    
                    {/* Hover Inspect Pill */}
                    <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[10px] font-black uppercase px-2 py-1 border border-white/30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3 w-3" />
                      ENLARGE
                    </div>
                  </div>

                  {/* Polaroid Bottom Chin / Story Info */}
                  <div className="space-y-2 pt-2 border-t-2 border-black">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-display font-black tracking-tight uppercase italic text-black group-hover:text-[#4285F4] transition-colors leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs font-semibold text-zinc-600 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>

                    {/* Meta Footer Bar */}
                    <div className="pt-2 flex items-center justify-between border-t border-dashed border-zinc-300 text-[10px] font-mono font-black">
                      <span className="text-[#4285F4] bg-[#EBF3FF] px-2 py-0.5 border border-[#4285F4]">
                        {item.stats}
                      </span>
                      <span className="text-zinc-500 uppercase">
                        TAP TO READ →
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox Memory Inspection Modal */}
        <AnimatePresence>
          {selectedMemory && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border-4 border-black p-6 sm:p-10 max-w-3xl w-full shadow-[14px_14px_0px_0px_#000000] relative space-y-6 max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="absolute top-4 right-4 h-8 w-8 bg-[#FF0055] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer z-30"
                >
                  <X className="h-5 w-5 stroke-[2.5]" />
                </button>

                {/* Header Tag */}
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-1 text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                    style={{ backgroundColor: selectedMemory.color }}
                  >
                    [ {selectedMemory.tag} // ARCHIVED CAPTURE ]
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    {selectedMemory.date}
                  </span>
                </div>

                {/* Large Photo */}
                <div className="relative aspect-[16/9] w-full border-4 border-black shadow-[6px_6px_0px_0px_#000000] overflow-hidden bg-zinc-900">
                  <img
                    src={selectedMemory.url}
                    alt={selectedMemory.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Story Details */}
                <div className="space-y-4">
                  <h3 className="text-3xl sm:text-4xl font-display font-black uppercase italic text-black">
                    {selectedMemory.title}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs font-mono font-bold text-zinc-700 bg-zinc-100 p-3 border-2 border-black">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#FF0055]" />
                      <span>{selectedMemory.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#4285F4]" />
                      <span>{selectedMemory.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-[#00AA44]" />
                      <span>{selectedMemory.stats}</span>
                    </div>
                  </div>

                  <p className="text-base font-medium text-zinc-800 leading-relaxed">
                    {selectedMemory.desc}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedMemory(null)}
                    className="px-6 py-2.5 bg-[#FFE600] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
                  >
                    CLOSE MEMORY [✕]
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
