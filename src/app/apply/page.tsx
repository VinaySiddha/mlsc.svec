import type { Metadata } from "next";
import { ApplicationForm } from "@/components/application-form";
import { getHiringStatus } from "@/app/actions";
import { Clock, ArrowLeft, Send, Sparkles, UserCheck, HelpCircle, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  const { 
    isHiringOpen, 
    isLimitReached, 
    isDeadlinePassed, 
    registrationLimit, 
    currentCount, 
    activeChapter 
  } = await getHiringStatus();
  const isClosed = !isHiringOpen;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans relative overflow-hidden">
      {/* Creative Background mesh & layered glows */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#4285F4]/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-[30%] left-[-10%] w-[50vw] h-[50vw] bg-[#34A853]/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[55vw] h-[55vw] bg-[#FBBC05]/3 rounded-full blur-[150px] pointer-events-none" />

      <header className="container mx-auto px-6 pt-8 pb-4 relative z-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> 
          Back to Home
        </Link>
      </header>

      <main className="flex-1 relative z-10">
        {/* Creative Hero Banner — matches other public pages */}
        <section className="relative w-full pt-16 pb-12 overflow-hidden">
          <div className="container mx-auto px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-6">
              JOIN THE TEAM {activeChapter ? `· CHAPTER ${activeChapter}` : ''}
            </p>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] max-w-4xl">
              APPLY <span className="text-[#4285F4]">NOW.</span>
            </h1>
            <p className="mt-8 text-white/40 text-lg font-medium max-w-xl leading-relaxed">
              {isLimitReached
                ? `Registration limit reached (${registrationLimit} applicants). Applications are closed.`
                : isDeadlinePassed
                ? "The application deadline for this recruitment cycle has passed."
                : isClosed 
                ? "Hiring is currently closed. Stay tuned for future opportunities." 
                : "Join the premier technical student organization at Sri Vasavi Engineering College."}
            </p>
          </div>
        </section>

        {/* Form Container & Roadmaps */}
        <section className="pb-32 container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {isClosed ? (
              isLimitReached ? (
                <div className="bg-white/[0.02] border border-white/5 p-16 md:p-24 rounded-3xl text-center flex flex-col items-center backdrop-blur-md">
                  <div className="p-4 rounded-full bg-[#EA4335]/10 border border-[#EA4335]/20 mb-6">
                    <Users className="h-12 w-12 text-[#EA4335]" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">Registration Limit Reached.</h2>
                  <p className="text-white/40 text-sm font-medium max-w-md mx-auto leading-relaxed">
                    Applications for Chapter {activeChapter || '4.0'} have reached the maximum limit of {registrationLimit} registered candidates. 
                    Registrations are now closed. Follow our socials for future announcements.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
                    <Button asChild variant="glass">
                      <Link href="/">Back to Home</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/10 text-white/70 hover:text-white">
                      <Link href="/track">Track Application</Link>
                    </Button>
                  </div>
                </div>
              ) : isDeadlinePassed ? (
                <div className="bg-white/[0.02] border border-white/5 p-16 md:p-24 rounded-3xl text-center flex flex-col items-center backdrop-blur-md">
                  <Clock className="h-16 w-16 text-[#EA4335] mb-6" />
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Deadline Passed.</h2>
                  <p className="text-white/40 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                    The registration deadline for Chapter {activeChapter || '4.0'} has passed. 
                    Follow our socials for future announcements.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
                    <Button asChild variant="glass">
                      <Link href="/">Back to Home</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/10 text-white/70 hover:text-white">
                      <Link href="/track">Track Application</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 p-16 md:p-24 rounded-3xl text-center flex flex-col items-center backdrop-blur-md">
                  <Clock className="h-16 w-16 text-[#EA4335] mb-6" />
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Closed.</h2>
                  <p className="text-white/40 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                    Applications are no longer being accepted at this time. 
                    Follow our socials for future announcements.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
                    <Button asChild variant="glass">
                      <Link href="/">Back to Home</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/10 text-white/70 hover:text-white">
                      <Link href="/track">Track Application</Link>
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-8">
                {/* Optional Registration Limit Progress Indicator */}
                {registrationLimit > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4] backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        Chapter {activeChapter} Registration Active
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white/80">
                      <span className="text-[#4285F4] font-black">{currentCount}</span> / {registrationLimit} Registered ({Math.max(0, registrationLimit - currentCount)} spots remaining)
                    </div>
                  </div>
                )}
                
                {/* Stepper Roadmap diagram — consistently blue */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4285F4] mb-6 text-center md:text-left">
                    Hiring & Evaluation Journey
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
                    {[
                      { icon: Send, title: "Submit Form", desc: "Share details & domain preferences", color: "text-[#4285F4] bg-[#4285F4]/10" },
                      { icon: HelpCircle, title: "Resume Check", desc: "AI-assisted screening", color: "text-[#4285F4] bg-[#4285F4]/10" },
                      { icon: Sparkles, title: "Peer Interaction", desc: "Short domain interview", color: "text-[#4285F4] bg-[#4285F4]/10" },
                      { icon: UserCheck, title: "Get Onboarded", desc: "Join SVEC chapter team", color: "text-[#4285F4] bg-[#4285F4]/10" }
                    ].map((step, idx) => {
                      const IconComponent = step.icon;
                      return (
                        <div key={idx} className="flex items-center md:items-start gap-4 md:flex-col md:gap-3 group">
                          <div className={`flex aspect-square size-11 items-center justify-center rounded-2xl border border-[#4285F4]/20 ${step.color} transition-all duration-300 group-hover:scale-105 shrink-0`}>
                            <IconComponent className="size-5" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-black uppercase tracking-wider text-white">
                              {idx + 1}. {step.title}
                            </h4>
                            <p className="text-[10px] text-white/40 mt-0.5 leading-normal">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Wrapper Card */}
                <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-lg">
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
