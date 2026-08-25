import type { Metadata } from "next";
import { ApplicationForm } from "@/components/application-form";
import { getHiringStatus } from "@/app/actions";
import { Clock, ArrowLeft, Send, Sparkles, UserCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export const metadata: Metadata = {
  title: "Apply — MLSC SVEC",
  description: "Apply to join Microsoft Learn Student Club SVEC. Be part of a community of student innovators, tech enthusiasts, and future leaders.",
  openGraph: {
    title: "Apply — MLSC SVEC",
    description: "Apply to join Microsoft Learn Student Club SVEC. Be part of a community of student innovators, tech enthusiasts, and future leaders.",
    url: "https://mlscsvec.com/apply",
  },
};

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

export default async function ApplyPage() {
  const { isHiringOpen } = await getHiringStatus();
  const isClosed = !isHiringOpen;

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1">
        
        {/* Header */}
        <section className="pt-32 pb-16 container mx-auto px-6 border-b-2 border-black bg-white">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black bg-[#FFE600] border-2 border-black px-4 py-2 shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all mb-8"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3]" /> [ BACK TO HOME ]
          </Link>
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-5">
              [ 01 // JOIN THE CORE TEAM ]
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.88] max-w-4xl">
              APPLY FOR <br />
              <span className="text-[#4285F4]">MLSC CHAPTER.</span>
            </h1>
            <p className="mt-6 text-zinc-700 text-base md:text-xl font-semibold max-w-xl leading-relaxed">
              {isClosed 
                ? "Hiring is currently closed for the active term. Stay tuned for future announcements." 
                : "Join the premier technical student organization at Sri Vasavi Engineering College. Build real projects, organize large-scale hackathons, and accelerate your tech career."}
            </p>
          </ScrollReveal>
        </section>

        {/* Evaluation Journey & Form */}
        <section className="py-20 container mx-auto px-6 bg-[#F9F9FB]">
          <div className="max-w-5xl mx-auto space-y-12">
            {isClosed ? (
              <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#FF0055] p-12 md:p-20 text-center flex flex-col items-center">
                <Clock className="h-16 w-16 text-[#FF0055] mb-6 stroke-[2.5]" />
                <h2 className="text-3xl md:text-5xl font-display font-black uppercase italic tracking-tight text-black mb-4">
                  RECRUITMENT CLOSED.
                </h2>
                <p className="text-zinc-700 text-sm md:text-base font-semibold max-w-md mx-auto leading-relaxed mb-8">
                  Applications are currently paused. Follow our official social media channels to get notified when applications reopen.
                </p>
                <Link 
                  href="/"
                  className="px-8 py-3.5 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  RETURN TO HOME [↗]
                </Link>
              </div>
            ) : (
              <div className="space-y-10">
                
                {/* Stepper Roadmap */}
                <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_#4285F4]">
                  <div className="inline-block px-3 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-6">
                    [ SELECTION PROCESS ROADMAP ]
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Send, title: "SUBMIT APPLICATION", desc: "Fill personal details & domain preferences", stamp: "[ STEP 01 ]", shadow: "shadow-[4px_4px_0px_0px_#4285F4]" },
                      { icon: HelpCircle, title: "RESUME SCREENING", desc: "Profile validation and project review", stamp: "[ STEP 02 ]", shadow: "shadow-[4px_4px_0px_0px_#FFE600]" },
                      { icon: Sparkles, title: "DOMAIN INTERACTION", desc: "Technical discussion & peer review", stamp: "[ STEP 03 ]", shadow: "shadow-[4px_4px_0px_0px_#00FF66]" },
                      { icon: UserCheck, title: "OFFICIAL ONBOARDING", desc: "Induction into MLSC core wing", stamp: "[ STEP 04 ]", shadow: "shadow-[4px_4px_0px_0px_#FF0055]" }
                    ].map((step, idx) => {
                      const IconComponent = step.icon;
                      return (
                        <div key={idx} className={`bg-[#F9F9FB] border-2 border-black p-5 ${step.shadow} flex flex-col justify-between`}>
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[9px] font-mono font-bold text-zinc-600">{step.stamp}</span>
                              <IconComponent className="h-4 w-4 text-black" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-black mb-1">
                              {step.title}
                            </h4>
                            <p className="text-[11px] text-zinc-700 font-semibold leading-normal">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Container */}
                <div className="bg-white border-2 border-black p-6 md:p-12 shadow-[8px_8px_0px_0px_#FFE600]">
                  <ApplicationForm />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
