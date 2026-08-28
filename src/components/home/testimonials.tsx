"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles, MessageSquareQuote, Quote } from "lucide-react";
import { AlumniTestimonial, SEED_ALUMNI_TESTIMONIALS } from "@/schemas/alumni";

interface TestimonialsProps {
  testimonials?: AlumniTestimonial[];
}

const EXTENDED_FALLBACK_TESTIMONIALS: AlumniTestimonial[] = [
  ...SEED_ALUMNI_TESTIMONIALS,
  {
    id: "alumni-ext-1",
    name: "Vamsi Krishna",
    initials: "VK",
    role: "Former Web Lead",
    currentRole: "Frontend Engineer",
    company: "ScaleTech AI",
    batch: "2021 - 2025",
    quote: "Building the MLSC web architecture from scratch taught me modern Next.js patterns, CI/CD, and how to write production code before even graduating.",
    color: "#FF0055",
    type: "career",
    isApproved: true,
    isFeatured: true,
  },
  {
    id: "alumni-ext-2",
    name: "Sai Teja Reddy",
    initials: "SR",
    role: "Former AI Domain Lead",
    currentRole: "Machine Learning Researcher",
    company: "Neural Labs",
    batch: "2020 - 2024",
    quote: "The hands-on PyTorch bootcamps and overnight hackathons gave me the practical edge to publish research and crack top AI engineering roles.",
    color: "#00AA44",
    type: "milestones",
    isApproved: true,
    isFeatured: true,
  },
  {
    id: "alumni-ext-3",
    name: "Pravallika S.",
    initials: "PS",
    role: "Former PR & Community Lead",
    currentRole: "Product Associate",
    company: "CloudScale Inc",
    batch: "2021 - 2025",
    quote: "MLSC empowered me with public speaking, sponsorship pitching, and leadership that set me miles ahead in technical management.",
    color: "#8B5CF6",
    type: "leadership",
    isApproved: true,
    isFeatured: true,
  },
];

export function Testimonials({ testimonials: dynamicList }: TestimonialsProps) {
  const fullList = dynamicList && dynamicList.length > 0 
    ? dynamicList 
    : EXTENDED_FALLBACK_TESTIMONIALS;

  // Split into two completely distinct subsets so top and bottom rows show different alumni
  const topSet = fullList.filter((_, idx) => idx % 2 === 0);
  const bottomSet = fullList.filter((_, idx) => idx % 2 !== 0);

  // If either set is small, fill with non-overlapping items
  const effectiveTopSet = topSet.length >= 3 ? topSet : fullList.slice(0, 4);
  const effectiveBottomSet = bottomSet.length >= 3 ? bottomSet : fullList.slice(4).concat(fullList.slice(0, 2));

  // Loop items for continuous seamless marquee without blank spaces
  const rowTop = [...effectiveTopSet, ...effectiveTopSet, ...effectiveTopSet, ...effectiveTopSet];
  const rowBottom = [...effectiveBottomSet, ...effectiveBottomSet, ...effectiveBottomSet, ...effectiveBottomSet];

  return (
    <section className="py-24 md:py-36 bg-white relative overflow-hidden border-b-4 border-black font-sans">
      {/* Background Graphic Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} 
      />

      {/* Section Header (Contained in Max-W-7XL) */}
      <div className="w-full relative z-10 max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
              <MessageSquareQuote className="h-3.5 w-3.5 stroke-[2.5]" />
              [ 05 // ALUMNI VOICES & WALL OF MEMORIES ]
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter uppercase italic text-black leading-[0.88]">
              WHAT OUR <br />
              <span className="text-[#4285F4]">ALUMNI SAY.</span>
            </h2>

            <p className="text-zinc-700 text-base md:text-lg font-semibold mt-4 max-w-xl leading-relaxed">
              Unfiltered reflections, career milestones, and stories from the students who built MLSC SVEC and now engineer systems at global technology leaders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/what-our-alumni-say/submit"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FFE600] text-black font-sans font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              SUBMIT YOUR STORY [↗]
            </Link>

            <Link
              href="/what-our-alumni-say"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-zinc-100 text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all active:scale-95 font-sans cursor-pointer"
            >
              EXPLORE ALL ARCHIVES
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Full Bleed Edge-to-Edge Scrolling Marquees (Left Edge to Right Edge) */}
      <div className="w-full overflow-hidden flex flex-col gap-8 relative z-10">

        {/* ── TOP ROW: SCROLLING LEFT TO RIGHT ACROSS ENTIRE SCREEN ── */}
        <div className="w-full overflow-x-hidden relative flex py-2">
          <div 
            className="animate-marquee-right flex gap-6"
            style={{ animationDuration: "35s" }}
          >
            {rowTop.map((item, idx) => (
              <div 
                key={`top-${item.id}-${idx}`}
                className="w-[300px] sm:w-[380px] md:w-[440px] flex-shrink-0 relative border-4 border-black p-6 md:p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group bg-white"
              >
                {/* Top Tag & Quote Icon */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span 
                      className="text-[10px] font-black uppercase tracking-wider px-3 py-1 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                      style={{ backgroundColor: item.color || "#FFE600" }}
                    >
                      {item.batch ? `CLASS OF '${item.batch.slice(-2)}` : 'ALUMNUS'}
                    </span>
                    <div className="h-8 w-8 bg-black text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                      <Quote className="h-4 w-4 fill-current text-[#FFE600]" />
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-zinc-900 leading-relaxed font-semibold">
                    "{item.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t-2 border-black relative z-10">
                  {item.photoUrl ? (
                    <div className="w-12 h-12 overflow-hidden relative border-2 border-black flex-shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                      <Image
                        src={item.photoUrl}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-12 h-12 flex items-center justify-center text-white text-sm font-black shadow-[2px_2px_0px_0px_#000000] select-none flex-shrink-0 border-2 border-black"
                      style={{ 
                        backgroundColor: item.color || '#4285F4',
                      }}
                    >
                      {item.initials || item.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-display font-black uppercase italic text-black leading-snug truncate group-hover:text-[#4285F4] transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-zinc-600 font-bold truncate">
                      {item.role}
                    </p>
                    {item.company && (
                      <span className="inline-block text-[10px] text-black font-black uppercase tracking-wider truncate mt-1 bg-[#F4F4F5] px-2 py-0.5 border border-black">
                        {item.currentRole ? `${item.currentRole} @ ` : ''}{item.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM ROW: SCROLLING RIGHT TO LEFT ACROSS ENTIRE SCREEN ── */}
        <div className="w-full overflow-x-hidden relative flex py-2">
          <div 
            className="animate-marquee-left flex gap-6"
            style={{ animationDuration: "48s" }}
          >
            {rowBottom.map((item, idx) => (
              <div 
                key={`bottom-${item.id}-${idx}`}
                className="w-[300px] sm:w-[380px] md:w-[440px] flex-shrink-0 relative border-4 border-black p-6 md:p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group bg-white"
              >
                {/* Top Tag & Quote Icon */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span 
                      className="text-[10px] font-black uppercase tracking-wider px-3 py-1 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                      style={{ backgroundColor: item.color || "#00FF66" }}
                    >
                      {item.batch ? `CLASS OF '${item.batch.slice(-2)}` : 'ALUMNUS'}
                    </span>
                    <div className="h-8 w-8 bg-[#FF0055] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                      <Quote className="h-4 w-4 fill-current" />
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-zinc-900 leading-relaxed font-semibold">
                    "{item.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t-2 border-black relative z-10">
                  {item.photoUrl ? (
                    <div className="w-12 h-12 overflow-hidden relative border-2 border-black flex-shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                      <Image
                        src={item.photoUrl}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-12 h-12 flex items-center justify-center text-white text-sm font-black shadow-[2px_2px_0px_0px_#000000] select-none flex-shrink-0 border-2 border-black"
                      style={{ 
                        backgroundColor: item.color || '#FF0055',
                      }}
                    >
                      {item.initials || item.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-display font-black uppercase italic text-black leading-snug truncate group-hover:text-[#4285F4] transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-zinc-600 font-bold truncate">
                      {item.role}
                    </p>
                    {item.company && (
                      <span className="inline-block text-[10px] text-black font-black uppercase tracking-wider truncate mt-1 bg-[#EBF3FF] px-2 py-0.5 border border-black">
                        {item.currentRole ? `${item.currentRole} @ ` : ''}{item.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
