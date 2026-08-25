"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles, MessageSquareQuote, Quote, ShieldCheck, Star } from "lucide-react";
import { AlumniTestimonial, SEED_ALUMNI_TESTIMONIALS } from "@/schemas/alumni";

interface TestimonialsProps {
  testimonials?: AlumniTestimonial[];
}

export function Testimonials({ testimonials: dynamicList }: TestimonialsProps) {
  const items = dynamicList && dynamicList.length > 0 ? dynamicList : SEED_ALUMNI_TESTIMONIALS;

  const row1Base = items.length >= 4 ? items : [...items, ...items];
  const row2Base = items.length >= 4 ? [...items.slice(2), ...items.slice(0, 2)] : [...items, ...items];

  const row1 = [...row1Base, ...row1Base, ...row1Base];
  const row2 = [...row2Base, ...row2Base, ...row2Base];

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

      <div className="w-full relative z-10 max-w-7xl mx-auto px-6">
        {/* Header with brutalist badge and action buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
              <MessageSquareQuote className="h-3.5 w-3.5 stroke-[2.5]" />
              [ 05 // ALUMNI NETWORK & VOICES ]
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFE600] text-black font-sans font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              SUBMIT YOUR STORY [↗]
            </Link>

            <Link
              href="/what-our-alumni-say"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-100 text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all active:scale-95"
            >
              EXPLORE ALL ARCHIVES
              <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Marquee Row Container */}
        <div className="flex flex-col gap-8 w-full overflow-hidden">
          {/* Row 1: Moving Left */}
          <div className="w-full overflow-x-hidden relative flex">
            <div className="animate-marquee-left flex gap-6 py-2">
              {row1.map((item, idx) => (
                <div 
                  key={`row1-${idx}-${item.id || idx}`}
                  className="w-[300px] sm:w-[380px] md:w-[440px] flex-shrink-0 relative border-4 border-black p-6 md:p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group bg-white"
                >
                  {/* Top Tag & Quote Icon */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                        {item.batch ? `CLASS OF '${item.batch.slice(-2)}` : 'ALUMNUS'}
                      </span>
                      <div className="h-7 w-7 bg-[#4285F4] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                        <Quote className="h-3.5 w-3.5 fill-current" />
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-zinc-900 leading-relaxed font-semibold">
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t-2 border-black relative z-10">
                    {/* Initials Avatar or Image */}
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
                        <span className="inline-block text-[10px] text-black font-black uppercase tracking-wider truncate mt-1 bg-[#E8F8EE] px-2 py-0.5 border border-black">
                          {item.currentRole ? `${item.currentRole} @ ` : ''}{item.company}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Moving Right */}
          <div className="w-full overflow-x-hidden relative flex">
            <div className="animate-marquee-right flex gap-6 py-2">
              {row2.map((item, idx) => (
                <div 
                  key={`row2-${idx}-${item.id || idx}`}
                  className="w-[300px] sm:w-[380px] md:w-[440px] flex-shrink-0 relative border-4 border-black p-6 md:p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group bg-white"
                >
                  {/* Top Tag & Quote Icon */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                        {item.batch ? `CLASS OF '${item.batch.slice(-2)}` : 'ALUMNUS'}
                      </span>
                      <div className="h-7 w-7 bg-[#FF0055] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                        <Quote className="h-3.5 w-3.5 fill-current" />
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-zinc-900 leading-relaxed font-semibold">
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t-2 border-black relative z-10">
                    {/* Initials Avatar or Image */}
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
                        <span className="inline-block text-[10px] text-black font-black uppercase tracking-wider truncate mt-1 bg-[#FFFDE5] px-2 py-0.5 border border-black">
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

      </div>
    </section>
  );
}
