import type { Metadata } from "next";
import { getNotifications } from "@/app/actions";
import { getHomePageData } from "@/app/home-actions";

import { DynamicHero } from "@/components/home/dynamic-hero";
import { HeroScroll } from "@/components/home/hero-scroll";
import { DynamicGallery } from "@/components/home/dynamic-gallery";
import { Testimonials } from "@/components/home/testimonials";
import { MLSCDomainsCarousel } from "@/components/home/mlsc-domains-carousel";
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
  const [{ notifications }, homeData] = await Promise.all([
    getNotifications(),
    getHomePageData(),
  ]);

  return (
    <div className="flex flex-col min-h-screen text-white bg-black">
      <main className="flex-1">

        {/* =====================================================
            HERO
        ===================================================== */}

        <DynamicHero images={homeData.heroImages} />

        {/* =====================================================
            CINEMATIC INTRO
        ===================================================== */}

        <HeroScroll />

        {/* =====================================================
            DOMAINS
        ===================================================== */}

        <section className="py-20 md:py-28 container mx-auto px-6">
          <ScrollReveal>
            <div className="mb-8 px-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#4285F4]">
                  01 — Explore
                </span>

                <span className="h-px w-12 bg-[#4285F4]/40" />
              </div>

              <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                Curiosity needs a{" "}
                <span className="text-[#4285F4]">direction.</span>
              </h3>

              <p className="text-white/40 font-medium text-sm md:text-base mt-4 max-w-2xl leading-relaxed">
                Technology is bigger than a single skill. Find the space
                that interests you, meet people who think differently,
                and turn what you learn into something real.
              </p>
            </div>
          </ScrollReveal>

          <MLSCDomainsCarousel />
        </section>

        {/* =====================================================
            GALLERY
        ===================================================== */}

        <DynamicGallery images={homeData.galleryImages} />

        {/* =====================================================
            COMMUNITY STATEMENT
        ===================================================== */}

        <section className="py-24 md:py-32 bg-black border-y border-white/5">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-5xl mx-auto text-center">

                <div className="flex justify-center items-center gap-3 mb-6">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/30">
                    02 — The Community
                  </span>

                  <span className="h-px w-10 bg-white/10" />
                </div>

                <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                  Not another club.
                  <br />
                  <span className="text-[#4285F4]">
                    A launchpad.
                  </span>
                </h2>

                <p className="text-white/40 max-w-2xl mx-auto mt-8 text-sm md:text-lg leading-relaxed">
                  We bring together developers, designers, innovators,
                  speakers, and problem-solvers who believe learning
                  should lead somewhere.
                </p>

              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* =====================================================
            EXPERIENCE
        ===================================================== */}

        <section className="py-24 md:py-32 container mx-auto px-6">
          <ScrollReveal>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-center">

              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#4285F4]">
                    03 — The Experience
                  </span>

                  <span className="h-px w-12 bg-[#4285F4]/40" />
                </div>

                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                  Don't just
                  <br />
                  <span className="text-[#4285F4]">
                    attend.
                  </span>
                  <br />
                  Experience.
                </h2>
              </div>

              <div>
                <p className="text-white/50 text-base md:text-lg leading-relaxed">
                  Workshops. Hackathons. Technical sessions.
                  Challenges. Conversations.
                </p>

                <p className="text-white/30 text-sm md:text-base leading-relaxed mt-5">
                  Every experience is designed to move you one step
                  closer to becoming someone who doesn't just understand
                  technology — but knows what to do with it.
                </p>
              </div>

            </div>
          </ScrollReveal>
        </section>

        {/* =====================================================
            TESTIMONIALS
        ===================================================== */}

        <Testimonials />

        {/* =====================================================
            BUILDERS STATEMENT
        ===================================================== */}

        <section className="py-24 md:py-32 bg-[#030303] border-y border-white/5">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-6xl mx-auto">

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/30">
                    04 — The Builders
                  </span>

                  <span className="h-px w-12 bg-white/10" />
                </div>

                <div className="grid md:grid-cols-[1.5fr_1fr] gap-12 items-end">

                  <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.88]">
                    Ideas deserve to
                    <br />
                    escape the{" "}
                    <span className="text-[#4285F4]">
                      notebook.
                    </span>
                  </h2>

                  <div>
                    <p className="text-white/40 text-sm md:text-base leading-relaxed">
                      Explore what our community is building — from
                      experimental prototypes to ambitious projects
                      designed around problems that actually matter.
                    </p>

                    <a
                      href="/projects"
                      className="inline-flex items-center gap-2 mt-6 text-sm font-bold uppercase tracking-wider text-white hover:text-[#4285F4] transition-colors"
                    >
                      Explore our projects
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>

                </div>

              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* =====================================================
            OPEN SOURCE / CONTRIBUTE
        ===================================================== */}

        <section className="py-24 md:py-32 bg-[#030303] relative overflow-hidden">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(66,133,244,0.08),transparent_60%)] pointer-events-none" />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#4285F4]/10 to-transparent pointer-events-none" />

          <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">

            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">
                <Code2 className="h-3.5 w-3.5" />
                Open Source Initiative
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="mt-7 text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                Don't just use
                <br />
                <span className="text-[#4285F4]">
                  what we build.
                </span>
                <br />
                Build with us.
              </h2>
            </ScrollReveal>

            <ScrollReveal>
              <p className="text-white/40 font-medium text-sm md:text-base max-w-xl mx-auto leading-relaxed mt-7">
                Write code. Fix issues. Improve systems. Ship ideas.
                Contribute to the technology that powers our community
                and leave something better than you found it.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="flex flex-wrap justify-center gap-4 pt-8">

                <OpenSourceButton
                  href="/contribute"
                  className="min-w-[190px]"
                >
                  Start Contributing
                </OpenSourceButton>

                <FundraiseButton
                  href="/issue-tracker"
                  playText="Explore"
                  nowText="Issues"
                  icon={<Bug className="h-5 w-5" />}
                  className="min-w-[190px] h-12 text-shadow-none"
                />

              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* =====================================================
            FINAL STATEMENT
        ===================================================== */}

        <section className="py-28 md:py-40 bg-black">
          <div className="container mx-auto px-6 text-center">

            <ScrollReveal>
              <span className="text-[10px] font-black tracking-[0.35em] uppercase text-white/25">
                05 — What Comes Next
              </span>

              <h2 className="mt-7 text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.82]">
                Build
                <br />
                <span className="text-[#4285F4]">
                  what comes next.
                </span>
              </h2>

              <p className="max-w-xl mx-auto mt-8 text-white/35 text-sm md:text-base leading-relaxed">
                Your degree is only the beginning. Your ideas,
                experiments, skills, and the people you meet along
                the way are what shape the future.
              </p>
            </ScrollReveal>

          </div>
        </section>

      </main>
    </div>
  );
}