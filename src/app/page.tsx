import type { Metadata } from "next";
import { getNotifications, getGlobalSettings } from "@/app/actions";
import { getHomePageData } from "@/app/home-actions";

import { DynamicHero } from "@/components/home/dynamic-hero";
import { CreativeAmbassadors } from "@/components/home/creative-ambassadors";
import { CreativeDomainsShowcase } from "@/components/home/creative-domains-showcase";
import { DynamicGallery } from "@/components/home/dynamic-gallery";
import { Testimonials } from "@/components/home/testimonials";
import { EntranceScreen } from "@/components/home/entrance-screen";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

import { Code2, Bug, ArrowUpRight } from "lucide-react";
import { OpenSourceButton } from "@/components/ui/open-source-button";
import { FundraiseButton } from "@/components/fundraise-button";

export const metadata: Metadata = {
  title: "MLSC X SVEC — Where Curiosity Becomes Capability",
  description:
    "MLSC X SVEC is a student-led technology community where curious minds learn, build, collaborate, and create what comes next at Sri Vasavi Engineering College.",
  openGraph: {
    title: "MLSC X SVEC — Where Curiosity Becomes Capability",
    description:
      "A student-led technology community turning curiosity into skills, ideas into projects, and students into builders.",
    url: "https://mlscsvec.com",
  },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ notifications }, homeData, { settings }] = await Promise.all([
    getNotifications(),
    getHomePageData(),
    getGlobalSettings(),
  ]);

  const activeChapter = settings?.activeChapter || '3.0';

  return (
    <div className="flex flex-col min-h-screen text-black bg-white">
      {/* Neo-Brutalist Entrance Screen */}
      <EntranceScreen activeChapter={activeChapter} />

      <main className="flex-1">

        {/* =====================================================
            HERO
        ===================================================== */}

        <DynamicHero images={homeData.heroImages} activeChapter={activeChapter} />

        {/* =====================================================
            CREATIVE AMBASSADORS & STUDENT LEADERSHIP
        ===================================================== */}

        <CreativeAmbassadors ambassadors={homeData.ambassadors} />

        {/* =====================================================
            CREATIVE DOMAINS SHOWCASE
        ===================================================== */}

        <CreativeDomainsShowcase />

        {/* =====================================================
            GALLERY
        ===================================================== */}

        <DynamicGallery images={homeData.galleryImages} />

        {/* =====================================================
            COMMUNITY STATEMENT
        ===================================================== */}
d 
        {/* =====================================================
            04 // THE ECOSYSTEM / LAUNCHPAD
        ===================================================== */}

        <section className="py-24 md:py-36 bg-[#F9F9FB] border-b-4 border-black font-sans relative overflow-hidden">
          {/* Background Graphic Grid */}
          <div 
            className="absolute inset-0 opacity-[0.035] pointer-events-none" 
            style={{
              backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }} 
          />

          <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal>
              <div className="max-w-5xl mx-auto text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000000] mb-6">
                  [ 04 // THE ECOSYSTEM ]
                </div>

                <h2 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-[0.86] text-black">
                  NOT ANOTHER CLUB.
                  <br />
                  <span className="text-[#4285F4]">
                    A LAUNCHPAD.
                  </span>
                </h2>

                <p className="text-zinc-700 max-w-2xl mx-auto mt-6 text-base md:text-xl leading-relaxed font-semibold">
                  We bring together developers, designers, system architects, and problem-solvers who believe college learning should build production mastery.
                </p>
              </div>
            </ScrollReveal>

            {/* 3 Pillar Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <ScrollReveal>
                <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#FFE600] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="w-12 h-12 bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000] mb-6 font-display font-black text-2xl">
                      01
                    </div>
                    <h3 className="text-2xl font-display font-black uppercase italic text-black mb-3">
                      ZERO TO PRODUCTION
                    </h3>
                    <p className="text-sm font-semibold text-zinc-700 leading-relaxed">
                      No boring theoretical slides. Every workshop ends with code committed to GitHub, containerized, and deployed to live cloud infrastructure.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t-2 border-black font-mono text-[11px] font-black text-[#4285F4]">
                    // PROD READY PIPELINES
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#4285F4] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="w-12 h-12 bg-[#4285F4] text-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000] mb-6 font-display font-black text-2xl">
                      02
                    </div>
                    <h3 className="text-2xl font-display font-black uppercase italic text-black mb-3">
                      MICROSOFT NETWORK
                    </h3>
                    <p className="text-sm font-semibold text-zinc-700 leading-relaxed">
                      Direct connection to Microsoft Learn Student Ambassador recognition, Azure dev credits, global hackathons, and certification vouchers.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t-2 border-black font-mono text-[11px] font-black text-[#00AA44]">
                    // GLOBAL ECOSYSTEM ACCESS
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#00FF66] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="w-12 h-12 bg-[#00FF66] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000] mb-6 font-display font-black text-2xl">
                      03
                    </div>
                    <h3 className="text-2xl font-display font-black uppercase italic text-black mb-3">
                      BUILDER INCUBATION
                    </h3>
                    <p className="text-sm font-semibold text-zinc-700 leading-relaxed">
                      Pitch student startup prototypes, get engineering teammates, receive compute sponsorship, and present to alumni investors on Demo Day.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t-2 border-black font-mono text-[11px] font-black text-[#FF0055]">
                    // INCUBATION & GRANTS
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* =====================================================
            05 // THE EXPERIENCE ENGINE
        ===================================================== */}

        <section className="py-24 md:py-36 bg-white container mx-auto px-6 font-sans">
          <ScrollReveal>
            <div className="max-w-6xl mx-auto bg-white border-4 border-black p-8 md:p-14 shadow-[12px_12px_0px_0px_#000000] relative">
              {/* Corner screws */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#FFE600] border-2 border-black" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#4285F4] border-2 border-black" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#00FF66] border-2 border-black" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#FF0055] border-2 border-black" />

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF66] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-5">
                    [ 05 // THE EXPERIENCE ENGINE ]
                  </div>

                  <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.88] text-black">
                    DON'T JUST
                    <br />
                    <span className="text-[#4285F4]">
                      ATTEND.
                    </span>
                    <br />
                    EXPERIENCE.
                  </h2>

                  <p className="text-zinc-700 text-base md:text-lg leading-relaxed mt-6 font-semibold">
                    Every experience is engineered to move you from passive observer to someone who ships architectures into real-world production.
                  </p>

                  <div className="mt-8">
                    <a
                      href="/schedule"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
                    >
                      VIEW UPCOMING SESSIONS [↗]
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      num: "01",
                      title: "24-HOUR HACKATHONS",
                      desc: "Overnight coding sprints, high-energy mentor reviews, pizza fuels, and rapid deployment checkpoints.",
                      badge: "INTENSIVE",
                      color: "#FFE600",
                    },
                    {
                      num: "02",
                      title: "TECHNICAL DEEP-DIVES",
                      desc: "Hands-on labs covering LLMs, Kubernetes clusters, modern Next.js stacks, and cloud architecture.",
                      badge: "WEEKLY",
                      color: "#4285F4",
                    },
                    {
                      num: "03",
                      title: "MENTORSHIP CIRCLES",
                      desc: "1-on-1 career guidance, resume roasts, mock coding rounds, and direct referral networks.",
                      badge: "1-ON-1",
                      color: "#00FF66",
                    },
                  ].map((exp, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-5 bg-[#F9F9FB] border-2 border-black shadow-[4px_4px_0px_0px_#000000] flex items-start gap-4 hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
                    >
                      <div
                        className="w-10 h-10 border-2 border-black flex items-center justify-center font-display font-black text-sm shrink-0 shadow-[2px_2px_0px_0px_#000000]"
                        style={{ backgroundColor: exp.color }}
                      >
                        {exp.num}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-base font-display font-black uppercase italic text-black">
                            {exp.title}
                          </h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white border border-black font-mono">
                            {exp.badge}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-600 mt-1 leading-snug">
                          {exp.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* =====================================================
            06 // TESTIMONIALS / WHAT OUR ALUMNI SAY
        ===================================================== */}

        <Testimonials testimonials={homeData.alumniTestimonials} />

        {/* =====================================================
            07 // OPEN SOURCE CODEBASE & BUILDERS INITIATIVE
        ===================================================== */}

        <section className="py-24 md:py-36 bg-[#F9F9FB] border-b-4 border-black font-sans relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-5xl relative z-10">
            <ScrollReveal>
              <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_#00FF66] text-center space-y-6">
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                  <Code2 className="h-4 w-4 stroke-[2.5]" />
                  [ 07 // OPEN SOURCE INITIATIVE ]
                </div>

                <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.88] text-black">
                  DON'T JUST USE
                  <br />
                  <span className="text-[#00AA44]">
                    WHAT WE BUILD.
                  </span>
                  <br />
                  BUILD WITH US.
                </h2>

                <p className="text-zinc-700 font-semibold text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  Every platform, tool, and service powering MLSC SVEC is open source. Write code, fix issues, design modules, and leave your stamp in production.
                </p>

                {/* Cyber Repo Stats HUD */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left font-mono text-xs font-bold pt-4">
                  <div className="p-3 bg-zinc-50 border-2 border-black">
                    <span className="text-[10px] text-zinc-500 block uppercase">REPOSITORY</span>
                    <span className="text-black font-black font-mono">mlsc.svec</span>
                  </div>
                  <div className="p-3 bg-zinc-50 border-2 border-black">
                    <span className="text-[10px] text-zinc-500 block uppercase">LICENSE</span>
                    <span className="text-black font-black">MIT / OPEN</span>
                  </div>
                  <div className="p-3 bg-zinc-50 border-2 border-black">
                    <span className="text-[10px] text-zinc-500 block uppercase">CONTRIBUTORS</span>
                    <span className="text-[#4285F4] font-black">35+ BUILDERS</span>
                  </div>
                  <div className="p-3 bg-zinc-50 border-2 border-black">
                    <span className="text-[10px] text-zinc-500 block uppercase">TECH STACK</span>
                    <span className="text-[#00AA44] font-black">NEXT.JS 15</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap justify-center gap-4 pt-6">
                  <a
                    href="/contribute"
                    className="px-8 py-4 bg-[#00FF66] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    START CONTRIBUTING [↗]
                  </a>

                  <a
                    href="/issue-tracker"
                    className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
                  >
                    <Bug className="h-4 w-4 stroke-[2.5] text-[#FF0055]" />
                    EXPLORE ISSUES
                  </a>
                </div>

              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* =====================================================
            08 // GRAND FINALE CTA
        ===================================================== */}

        <section className="py-28 md:py-44 bg-white font-sans relative overflow-hidden">
          <div className="container mx-auto px-6 text-center relative z-10">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto bg-[#FFE600] border-4 border-black p-10 md:p-16 shadow-[14px_14px_0px_0px_#000000] relative">
                
                {/* Corner screws */}
                <div className="absolute -top-2 -left-2 w-5 h-5 bg-black" />
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-black" />
                <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-black" />
                <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-black" />

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_#FFFFFF] mb-6">
                  [ 08 // WHAT COMES NEXT ]
                </div>

                <h2 className="text-5xl sm:text-7xl md:text-9xl font-display font-black tracking-tighter uppercase italic leading-[0.82] text-black">
                  BUILD
                  <br />
                  <span className="text-[#4285F4]">
                    WHAT COMES NEXT.
                  </span>
                </h2>

                <p className="max-w-xl mx-auto mt-6 text-zinc-900 text-base md:text-lg leading-relaxed font-bold">
                  Your degree is only the beginning. Your ideas, prototypes, skills, and the teammates you meet along the way are what shape your engineering career.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="/apply"
                    className="w-full sm:w-auto px-10 py-4 bg-black text-[#FFE600] font-black text-sm uppercase tracking-wider border-2 border-black shadow-[5px_5px_0px_0px_#FFFFFF] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    ⚡ JOIN MLSC SVEC CHAPTER 4.0 [↗]
                  </a>

                  <a
                    href="/schedule"
                    className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[5px_5px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    EXPLORE SESSIONS →
                  </a>
                </div>

              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
    </div>
  );
}