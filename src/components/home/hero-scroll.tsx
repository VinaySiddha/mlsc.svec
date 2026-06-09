"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScroll() {
  return (
    <div className="flex flex-col overflow-hidden bg-black">
      <ContainerScroll
        titleComponent={
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40 mb-4">
              Chapter 3.0 · Now Open
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-tight">
              Everything you need to{" "}
              <span className="text-[#4285F4]">grow as a technologist.</span>
            </h2>
            <p className="mt-4 text-white/40 text-base md:text-lg font-medium max-w-2xl mx-auto">
              Events, workshops, mentors, and a community — all in one place.
            </p>
          </div>
        }
      >
        <img
          src="/mlsc-preview.png"
          alt="MLSC SVEC platform preview"
          className="mx-auto rounded-xl object-cover h-full w-full object-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
