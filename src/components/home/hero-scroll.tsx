"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export function HeroScroll() {
  return (
    <div className="flex flex-col overflow-hidden bg-white border-b-2 border-black">
      <ContainerScroll
        titleComponent={
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-4">
              Chapter 3.0 · Now Open
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter text-black uppercase italic leading-tight">
              Everything you need to{" "}
              <span className="text-[#4285F4]">grow as a technologist.</span>
            </h2>
            <p className="mt-4 text-zinc-700 text-base md:text-lg font-semibold max-w-2xl mx-auto">
              Events, workshops, mentors, and a community — all in one place.
            </p>
          </div>
        }
      >
        <div className="h-full w-full relative bg-white">
          <Image
            src="/mlsc-preview.png"
            alt="MLSC SVEC platform preview"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="mx-auto object-contain"
            draggable={false}
            priority
          />
        </div>
      </ContainerScroll>
    </div>
  );
}
