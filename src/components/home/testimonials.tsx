"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles, MessageSquareQuote } from "lucide-react";
import { AlumniTestimonial, SEED_ALUMNI_TESTIMONIALS } from "@/schemas/alumni";

interface TestimonialsProps {
  testimonials?: AlumniTestimonial[];
}

export function Testimonials({ testimonials: dynamicList }: TestimonialsProps) {
  const items = dynamicList && dynamicList.length > 0 ? dynamicList : SEED_ALUMNI_TESTIMONIALS;

  // Split or structure them for two oppositely moving rows
  // Ensure enough items so marquee loop doesn't have blank gaps
  const row1Base = items.length >= 4 ? items : [...items, ...items];
  const row2Base = items.length >= 4 ? [...items.slice(2), ...items.slice(0, 2)] : [...items, ...items];

  const row1 = [...row1Base, ...row1Base, ...row1Base];
  const row2 = [...row2Base, ...row2Base, ...row2Base];

  return (
    <section className="py-24 bg-black relative overflow-hidden border-t border-white/5">
      {/* Background radial gradient to give depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4285F4]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full relative z-10 max-w-7xl mx-auto px-6">
        {/* Header with brutalist badge and action buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/20 text-[10px] font-black uppercase tracking-[0.25em] text-[#4285F4] italic">
                <MessageSquareQuote className="h-3.5 w-3.5" />
                Alumni Network & Voices
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white leading-[0.9]">
              What our <span className="text-[#4285F4]">Alumni Say</span>
            </h2>
            <p className="text-white/45 text-sm md:text-base font-medium mt-3 max-w-xl">
              Unfiltered reflections, career milestones, and memories from the pioneers who built MLSC SVEC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/what-our-alumni-say/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFE600] text-black font-mono font-bold text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#FFFFFF] hover:bg-[#e6cf00] transition-all active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Share Your Words
            </Link>

            <Link
              href="/what-our-alumni-say"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 font-mono"
            >
              Explore All Stories
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Marquee Row Container */}
        <div className="flex flex-col gap-6 w-full overflow-hidden">
          {/* Row 1: Moving Left */}
          <div className="w-full overflow-x-hidden relative flex mask-image-horizontal">
            <div className="animate-marquee-left flex gap-6 py-2">
              {row1.map((item, idx) => (
                <div 
                  key={`row1-${idx}-${item.id || idx}`}
                  className="w-[280px] sm:w-[350px] md:w-[420px] flex-shrink-0 relative rounded-2xl border-2 border-zinc-800 p-6 md:p-7 flex flex-col justify-between shadow-2xl hover:border-white transition-all duration-300 group bg-[#0E0E10]"
                  style={{
                    boxShadow: `4px 4px 0px 0px ${item.color || '#4285F4'}`,
                  }}
                >
                  {/* Top Tag & Quote Icon */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/5">
                        {item.batch ? `Batch '${item.batch.slice(-2)}` : 'Alumnus'}
                      </span>
                      <span className="text-zinc-500 font-serif text-3xl leading-none select-none opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: item.color || '#4285F4' }}>
                        “
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-normal line-clamp-4">
                      {item.quote}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-3.5 mt-6 pt-4 border-t border-white/5 relative z-10">
                    {/* Initials Avatar or Image */}
                    {item.photoUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-white/10 flex-shrink-0 shadow-md">
                        <Image
                          src={item.photoUrl}
                          alt={item.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md select-none flex-shrink-0 border border-white/10"
                        style={{ 
                          backgroundColor: item.color || '#4285F4',
                        }}
                      >
                        {item.initials || item.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white leading-snug truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-medium truncate">
                        {item.role}
                      </p>
                      {item.company && (
                        <p className="text-[10px] text-[#4285F4] font-semibold truncate mt-0.5">
                          {item.currentRole ? `${item.currentRole} @ ` : ''}{item.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Moving Right */}
          <div className="w-full overflow-x-hidden relative flex mask-image-horizontal">
            <div className="animate-marquee-right flex gap-6 py-2">
              {row2.map((item, idx) => (
                <div 
                  key={`row2-${idx}-${item.id || idx}`}
                  className="w-[280px] sm:w-[350px] md:w-[420px] flex-shrink-0 relative rounded-2xl border-2 border-zinc-800 p-6 md:p-7 flex flex-col justify-between shadow-2xl hover:border-white transition-all duration-300 group bg-[#0E0E10]"
                  style={{
                    boxShadow: `4px 4px 0px 0px ${item.color || '#4285F4'}`,
                  }}
                >
                  {/* Top Tag & Quote Icon */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/5">
                        {item.batch ? `Batch '${item.batch.slice(-2)}` : 'Alumnus'}
                      </span>
                      <span className="text-zinc-500 font-serif text-3xl leading-none select-none opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: item.color || '#4285F4' }}>
                        “
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-normal line-clamp-4">
                      {item.quote}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-3.5 mt-6 pt-4 border-t border-white/5 relative z-10">
                    {/* Initials Avatar or Image */}
                    {item.photoUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-white/10 flex-shrink-0 shadow-md">
                        <Image
                          src={item.photoUrl}
                          alt={item.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md select-none flex-shrink-0 border border-white/10"
                        style={{ 
                          backgroundColor: item.color || '#4285F4',
                        }}
                      >
                        {item.initials || item.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white leading-snug truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-medium truncate">
                        {item.role}
                      </p>
                      {item.company && (
                        <p className="text-[10px] text-[#4285F4] font-semibold truncate mt-0.5">
                          {item.currentRole ? `${item.currentRole} @ ` : ''}{item.company}
                        </p>
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
