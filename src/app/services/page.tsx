"use client";

import React from "react";
import { Sparkles, ArrowLeft, Rocket, Briefcase, Award, GraduationCap, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="w-full bg-black min-h-screen py-24 md:py-32 text-white flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-3xl px-6 md:px-8 relative z-10 text-center space-y-12">
        {/* Under Construction Emblem */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-[#4285F4] italic animate-pulse">
          <Rocket className="h-3.5 w-3.5" /> Next-Gen Portal Upgrade
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Revamping Student <span className="text-[#4285F4]">Services</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs md:text-sm">
            Elevating Career Development In All Aspects
          </p>
        </div>

        {/* Main Revamp Announcement Card */}
        <div className="p-8 md:p-10 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl relative overflow-hidden shadow-2xl text-left space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <p className="text-white/80 text-sm md:text-base leading-relaxed font-medium">
            To better empower our student community and provide high-value resources, we have paused all legacy automated microservices. We are engineering a brand-new, comprehensive **Career Integration & Skill Portal** designed to accelerate your career growth in all aspects.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/[0.08]">
            <div className="space-y-2">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-[#4285F4] rounded-xl w-10 h-10 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Portfolio Builders</h4>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                Create and host professional, recruiter-ready technical portfolios.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-10 h-10 flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Job Matching</h4>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                Direct pipelines and alerts matching student skill tags to top tech companies.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-[#FBBC05] rounded-xl w-10 h-10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Mentorship</h4>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                Interactive mock interview sandboxes and structural resume keyword alignment.
              </p>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-white/50 leading-normal font-medium">
              All active resume evaluations, transaction records, and certificate credentials are safe. Direct support remains available via the MLSC Slack channel.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild className="rounded-xl bg-white hover:bg-white/95 text-black font-black text-xs uppercase tracking-wider h-11 px-8">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" /> Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-wider h-11 px-8">
            <Link href="/events">
              Explore Upcoming Bootcamps <Sparkles className="h-4 w-4 ml-2 text-[#4285F4]" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
