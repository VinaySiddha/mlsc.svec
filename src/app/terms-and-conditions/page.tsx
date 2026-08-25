import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { FileText, Lock, UserX, Ban, Scale, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions — MLSC SVEC",
  description: "Read the terms and conditions for the Microsoft Learn Student Club SVEC website.",
  openGraph: {
    title: "Terms and Conditions — MLSC SVEC",
    url: "https://mlscsvec.com/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl relative">
          
          {/* Header */}
          <div className="mb-14">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                [ LEGAL PROTOCOL // COMPLIANCE ]
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tight uppercase italic leading-[0.88] text-black mb-4">
                TERMS & <span className="text-[#4285F4]">CONDITIONS.</span>
              </h1>
              <p className="text-zinc-600 font-sans font-bold uppercase tracking-widest text-xs">
                LAST REVISED // {currentDate.toUpperCase()}
              </p>
            </ScrollReveal>
          </div>

          {/* Content Card */}
          <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[10px_10px_0px_0px_#4285F4] space-y-12 text-zinc-800 leading-relaxed text-sm md:text-base font-semibold">
            
            {/* Section 1 */}
            <ScrollReveal>
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#4285F4] border-2 border-black text-white shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <FileText className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
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
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#00FF66] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Lock className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
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
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#FFE600] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <UserX className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
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
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#FF0055] border-2 border-black text-white shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Ban className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
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
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#4285F4] border-2 border-black text-white shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Scale className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
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
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#FFE600] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Globe className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
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
