import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Shield, BookOpen, AlertCircle, Users, Award, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Community Guidelines — MLSC SVEC",
  description: "Read the community code of conduct and guidelines for MLSC SVEC.",
  openGraph: {
    title: "Community Guidelines — MLSC SVEC",
    url: "https://mlscsvec.com/guidelines",
  },
};

export default function GuidelinesPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 Community Code of Conduct & Developer Integrity
      </div>

      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
          
          {/* Header */}
          <div className="mb-14">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                [ CODE OF CONDUCT // INTEGRITY STANDARDS ]
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight uppercase italic leading-[0.88] text-black mb-4">
                COMMUNITY <span className="text-[#4285F4]">GUIDELINES.</span>
              </h1>
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs font-mono">
                LAST REVISED // {currentDate.toUpperCase()}
              </p>
            </ScrollReveal>
          </div>

          {/* Content Card */}
          <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[10px_10px_0px_0px_#FFE600] space-y-10 text-zinc-800 leading-relaxed text-sm md:text-base font-semibold">
            
            {/* Section 1 */}
            <ScrollReveal>
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#4285F4] border-2 border-black text-white shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Users className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase italic text-black">
                    1. Inclusivity and Mutual Respect
                  </h3>
                </div>
                <p>
                  MLSC SVEC is committed to cultivating a safe, welcoming, and harassment-free environment for every student developer regardless of background, gender, technical experience, or identity. We maintain zero tolerance for discrimination, abusive language, or harassment in any online or physical community space.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 2 */}
            <ScrollReveal>
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#00FF66] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <BookOpen className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase italic text-black">
                    2. Collaboration & Academic Honesty
                  </h3>
                </div>
                <p>
                  While we encourage peer mentoring, open-source pull requests, and collaborative hackathon teams, all members must respect intellectual property and academic integrity:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm text-zinc-800 font-bold">
                  <li>Directly submitting another engineer's codebase or claiming unearned work in club competitions is strictly prohibited.</li>
                  <li>Always provide clear open-source license attributions and library citations in student repositories.</li>
                  <li>Constructive code review feedback is encouraged; unhelpful criticism is discouraged.</li>
                </ul>
              </section>
            </ScrollReveal>

            {/* Section 3 */}
            <ScrollReveal>
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#FFE600] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Shield className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase italic text-black">
                    3. Infrastructure Safety & Security
                  </h3>
                </div>
                <p>
                  Members must safeguard authentication tokens and avoid abusing club API quotas or computational servers:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm text-zinc-800 font-bold">
                  <li>Do not share passwords, OAuth credentials, or private access tokens.</li>
                  <li>Attempting unauthorized penetration testing, scraping, botting, or denial-of-service on club domains will result in instant banning.</li>
                  <li>Report discovered security vulnerabilities directly to the Lead Tech team via responsible disclosure.</li>
                </ul>
              </section>
            </ScrollReveal>

            {/* Section 4 */}
            <ScrollReveal>
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#EA4335] border-2 border-black text-white shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <AlertCircle className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase italic text-black">
                    4. Enforcement & Penalties
                  </h3>
                </div>
                <p>
                  The MLSC Executive Board holds authority to enforce community conduct across all Discord servers, GitHub organizations, and physical events. Violations may result in official warnings, temporary suspensions, revoke of digital badges, or permanent exclusion from future hiring drives and hackathons.
                </p>
              </section>
            </ScrollReveal>

          </div>
        </div>
      </main>
    </div>
  );
}
