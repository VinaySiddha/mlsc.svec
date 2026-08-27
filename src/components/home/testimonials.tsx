"use client";

import React from "react";
import { Camera, Award } from "lucide-react";

interface Testimonial {
  name: string;
  initials: string;
  role: string;
  quote: string;
  color: string;
  type: 'moments' | 'milestones'; // to match the icons
}

const testimonials: Testimonial[] = [
  {
    name: "Chandu Neelam",
    initials: "CN",
    role: "Former President, MLSC",
    quote: "Being part of MLSC was a turning point in my college life. The projects we built, the hackathons we organized, and the mentorship we received established a foundation that changed the course of our careers.",
    color: "#4285F4", // Google Blue
    type: "milestones"
  },
  {
    name: "Kasyap Vadapalli",
    initials: "KV",
    role: "Former Vice President, MLSC",
    quote: "The collaborative environment at MLSC is unmatched. Working on cutting-edge technologies with passionate peers helped me hone my skills and build things I never thought possible.",
    color: "#34A853", // Google Green
    type: "moments"
  },
  {
    name: "Sri Satya Satti",
    initials: "SS",
    role: "Former Technical Lead, MLSC",
    quote: "MLSC is not just a student club; it is an incubator for innovation. The platform gave me real-world development experience, team leadership opportunities, and memories to cherish.",
    color: "#FBBC05", // Google Yellow
    type: "milestones"
  },
  {
    name: "Hemanth Patcha",
    initials: "HP",
    role: "Former Secretary, MLSC",
    quote: "From organizing large-scale workshops to handling complex technical stacks, MLSC developed both my engineering and leadership capabilities. It was a life-changing experience.",
    color: "#EA4335", // Google Red
    type: "moments"
  },
  {
    name: "Akash Pydipala",
    initials: "AP",
    role: "Former Treasurer, MLSC",
    quote: "The exposure, resources, and community mentorship at MLSC are top-tier. It is the absolute best environment for any student developer looking to build, scale, and learn.",
    color: "#A733FF", // Purple
    type: "milestones"
  }
];

// Split or structure them for two oppositely moving rows
// To make the scrolling truly seamless, we repeat the array at least twice per row.
const row1 = [...testimonials, ...testimonials];
const row2 = [...testimonials.slice(2), ...testimonials, ...testimonials.slice(0, 2)];

export function Testimonials() {
  return (
    <section className="py-20 bg-black relative overflow-hidden border-t border-white/5">
      {/* Background radial gradient to give depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
            What our <span className="text-[#4285F4]">Alumni Say</span>
          </h2>
          <p className="text-white/45 text-base md:text-lg font-medium mt-3">
            Hear from the individuals who helped build and grow our community.
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full overflow-hidden">
          {/* Row 1: Moving Left */}
          <div className="w-full overflow-x-hidden relative flex mask-image-horizontal">
            <div className="animate-marquee-left flex gap-6 py-2">
              {row1.map((item, idx) => (
                <div 
                  key={`row1-${idx}`}
                  className="w-[350px] md:w-[420px] flex-shrink-0 relative rounded-2xl border border-zinc-800/80 p-8 flex flex-col justify-between shadow-2xl hover:border-zinc-700 transition-all duration-300"
                  style={{
                    background: "linear-gradient(180deg, #18181b, #09090b)",
                  }}
                >
                  {/* Card Content block */}
                  <div>
                    {/* Quote Icon */}
                    <span className="text-zinc-500 font-serif text-5xl leading-none select-none block mb-4">
                      “
                    </span>
                    <p className="text-sm md:text-base text-zinc-200 leading-relaxed font-normal">
                      {item.quote}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-3.5 mt-8 relative z-10">
                    {/* Initials Avatar */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md select-none flex-shrink-0 border border-white/10"
                      style={{ 
                        backgroundColor: item.color,
                      }}
                    >
                      {item.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-zinc-400 font-normal mt-0.5">
                        {item.role}
                      </p>
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
                  key={`row2-${idx}`}
                  className="w-[350px] md:w-[420px] flex-shrink-0 relative rounded-2xl border border-zinc-800/80 p-8 flex flex-col justify-between shadow-2xl hover:border-zinc-700 transition-all duration-300"
                  style={{
                    background: "linear-gradient(180deg, #18181b, #09090b)",
                  }}
                >
                  {/* Card Content block */}
                  <div>
                    {/* Quote Icon */}
                    <span className="text-zinc-500 font-serif text-5xl leading-none select-none block mb-4">
                      “
                    </span>
                    <p className="text-sm md:text-base text-zinc-200 leading-relaxed font-normal">
                      {item.quote}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-3.5 mt-8 relative z-10">
                    {/* Initials Avatar */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md select-none flex-shrink-0 border border-white/10"
                      style={{ 
                        backgroundColor: item.color,
                      }}
                    >
                      {item.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-zinc-400 font-normal mt-0.5">
                        {item.role}
                      </p>
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
