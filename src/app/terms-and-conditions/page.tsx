import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { FileText, Lock, UserX, Ban, Scale, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions — MLSC SVEC",
  description: "Read the terms and conditions for the Microsoft Learn Student Club SVEC website.",
  openGraph: {
    title: "Terms and Conditions — MLSC SVEC",
    url: "https://mlscsvec.in/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1 py-24 md:py-40">
        <div className="container mx-auto px-6 max-w-5xl relative">
          {/* Ambient Glow */}
          <div className="glow-sphere top-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#4285F4]/10" />
          <div className="glow-sphere bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-[#34A853]/10" />

          {/* Header */}
          <div className="mb-20 relative z-10">
            <ScrollReveal>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
                Terms & <br /> <span className="text-[#4285F4]">Conditions.</span>
              </h1>
              <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">
                Last updated: {currentDate}
              </p>
            </ScrollReveal>
          </div>

          {/* Content Card */}
          <div className="bg-zinc-950/40 border border-white/[0.08] backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative z-10 space-y-12 text-white/70 leading-relaxed text-lg font-medium">
            
            {/* Section 1 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    1. Agreement to Terms
                  </h3>
                </div>
                <p>
                  By accessing and using this website, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 2 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    2. Intellectual Property
                  </h3>
                </div>
                <p>
                  All content, branding, features, and assets displayed on this site, including logos, text, designs, roadmaps, and custom software, are the exclusive intellectual property of MLSC SVEC. Unauthorized replication, adaptation, or exploitation of these materials is strictly forbidden.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 3 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FBBC04]/10 border border-[#FBBC04]/20 text-[#FBBC04]">
                    <UserX className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    3. Site Conduct and Copy Restrictions
                  </h3>
                </div>
                <p>
                  To protect content integrity, this platform actively restricts data extraction. Sitewide text selection, copy-pasting, right-clicking, and automated content-scraping are disabled. You agree not to attempt to bypass these restrictions or compile any databases from this site.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 4 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335]">
                    <Ban className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    4. Termination of Access
                  </h3>
                </div>
                <p>
                  We reserve the right, in our sole discretion, to terminate or restrict your access to the website or community platform at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users, the club, or third parties. Malicious actions will result in permanent IP blocking.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 5 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#7c3aed]">
                    <Scale className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    5. Limitation of Liability
                  </h3>
                </div>
                <p>
                  MLSC SVEC and its members shall not be held liable for any damages (including, without limitation, damages for loss of data, profits, or club membership opportunities) arising out of the use or inability to use the materials on this website.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 6 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4]">
                    <Globe className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    6. Governing Law
                  </h3>
                </div>
                <p>
                  Any claim relating to the MLSC SVEC website shall be governed by the laws of India, without regard to its conflict of law provisions.
                </p>
              </section>
            </ScrollReveal>

          </div>
        </div>
      </main>
    </div>
  );
}
