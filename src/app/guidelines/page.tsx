import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Shield, BookOpen, AlertCircle, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Community Guidelines — MLSC SVEC",
  description: "Read the community code of conduct and guidelines for MLSC SVEC.",
  openGraph: {
    title: "Community Guidelines — MLSC SVEC",
    url: "https://mlscsvec.in/guidelines",
  },
};

export default function GuidelinesPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1 py-24 md:py-40">
        <div className="container mx-auto px-6 max-w-5xl relative">
          {/* Ambient Glow */}
          <div className="glow-sphere top-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#FBBC04]/10" />
          <div className="glow-sphere bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-[#EA4335]/10" />

          {/* Header */}
          <div className="mb-20 relative z-10">
            <ScrollReveal>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
                Community <br /> <span className="text-[#FBBC04]">Guidelines.</span>
              </h1>
              <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">
                Last updated: {currentDate}
              </p>
            </ScrollReveal>
          </div>

          {/* Guidelines Content */}
          <div className="bg-zinc-950/40 border border-white/[0.08] backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative z-10 space-y-12 text-white/70 leading-relaxed text-lg font-medium">
            
            {/* Section 1 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4]">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    1. Inclusivity and Mutual Respect
                  </h3>
                </div>
                <p>
                  MLSC SVEC is dedicated to providing a harassment-free community experience for everyone, regardless of gender, sexual orientation, disability, physical appearance, race, or technical competence. We do not tolerate harassment of community members in any form. Be respectful, kind, and supportive of your peers.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 2 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    2. Collaboration & Academic Honesty
                  </h3>
                </div>
                <p>
                  While we encourage collaboration, coding bootstrapping, and team projects, all members must maintain academic honesty. Plagiarism, copying code directly from others without understanding, or claiming work that is not yours in hackathons or assignments is strictly prohibited. Give credit where credit is due.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 3 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FBBC04]/10 border border-[#FBBC04]/20 text-[#FBBC04]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    3. Safety and Security
                  </h3>
                </div>
                <p>
                  Protect your credentials and personal information. Do not share your passwords or attempt to bypass security measures. Attempting to reverse engineer, scrape, disable, or spam the portal or services provided by the club will result in immediate suspension.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 4 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335]">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    4. Enforcement and Penalties
                  </h3>
                </div>
                <p>
                  Core team members and admins hold the right to moderate all community activity. Any behavior violating these guidelines will be flagged. Persistent or severe violations will result in temporary suspension, account deletion, or permanent IP blocking from all MLSC SVEC platforms and events.
                </p>
              </section>
            </ScrollReveal>

          </div>
        </div>
      </main>
    </div>
  );
}
