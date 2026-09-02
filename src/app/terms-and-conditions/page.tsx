import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { FileText, ShieldCheck, UserCheck, AlertTriangle, Scale, Globe, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions — MLSC SVEC",
  description: "Review the Terms and Conditions for using the Microsoft Learn Student Club SVEC website and services.",
  openGraph: {
    title: "Terms and Conditions — MLSC SVEC",
    description: "Review the Terms and Conditions for using the Microsoft Learn Student Club SVEC website and services.",
    url: "https://mlscsvec.com/terms-and-conditions",
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
          <div className="mb-16 relative z-10">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4] text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
                <FileText className="h-3.5 w-3.5" />
                Legal Framework
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
                Terms & <br /> <span className="text-[#4285F4]">Conditions.</span>
              </h1>
              <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">
                Last updated: {currentDate}
              </p>
            </ScrollReveal>
          </div>

          {/* Content Card */}
          <div className="bg-zinc-950/60 border border-white/[0.08] backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative z-10 space-y-12 text-white/70 leading-relaxed text-base md:text-lg font-medium">
            
            {/* Section 1 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    1. Acceptance of Terms
                  </h2>
                </div>
                <p>
                  By accessing and using this website (<a href="https://mlscsvec.com" className="text-[#4285F4] hover:underline">https://mlscsvec.com</a>), you agree to comply with and be bound by these Terms and Conditions, all applicable local, national, and international laws, and regulations. If you do not agree with any of these terms, you should refrain from accessing our services.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 2 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    2. Educational Use and Intellectual Property
                  </h2>
                </div>
                <p>
                  All educational content, technical articles, roadmaps, project source code, graphics, and club logos made available on this website are authored and maintained by MLSC SVEC and its student contributors for educational purposes. 
                </p>
                <p>
                  Users may read, learn from, and reference code snippets for personal educational and learning purposes in accordance with open-source licenses and academic integrity guidelines.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 3 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FBBC04]/10 border border-[#FBBC04]/20 text-[#FBBC04]">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    3. User Conduct and Acceptable Use
                  </h2>
                </div>
                <p>
                  When interacting with our community features, event registrations, and discussion boards, you agree to:
                </p>
                <ul className="list-disc pl-8 space-y-2 text-sm md:text-base">
                  <li>Provide accurate, truthful student credentials and contact information during application submissions.</li>
                  <li>Maintain respectful, inclusive, and professional communication adhering to our <Link href="/guidelines" className="text-[#4285F4] hover:underline">Community Guidelines</Link>.</li>
                  <li>Not attempt to disrupt server stability, conduct vulnerability exploitation, or interfere with system availability.</li>
                </ul>
              </section>
            </ScrollReveal>

            {/* Section 4 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335]">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    4. External Links and Third-Party Services
                  </h2>
                </div>
                <p>
                  Our website contains references and links to third-party services, including Microsoft Learn, GitHub, LinkedIn, Medium, and Google services. MLSC SVEC does not control third-party websites and is not responsible for their content or external privacy practices.
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
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    5. Disclaimer of Warranties and Limitation of Liability
                  </h2>
                </div>
                <p>
                  All materials, roadmaps, and software tools provided on this website are delivered on an "as is" and "as available" basis without express or implied warranties. MLSC SVEC shall not be held liable for any damages resulting from the use or inability to use materials on this site.
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
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    6. Governing Law and Jurisdiction
                  </h2>
                </div>
                <p>
                  These Terms shall be governed and interpreted in accordance with the laws of India, under the jurisdiction of Andhra Pradesh.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 7 - Contact */}
            <ScrollReveal>
              <section className="space-y-4 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    7. Inquiries Regarding Terms
                  </h2>
                </div>
                <p>
                  For questions regarding these Terms and Conditions, please contact us at <a href="mailto:microsoftlearnstudentclub@gmail.com" className="text-[#4285F4] hover:underline font-semibold">microsoftlearnstudentclub@gmail.com</a> or via our <Link href="/contact" className="text-[#4285F4] hover:underline font-semibold">Contact Us</Link> page.
                </p>
              </section>
            </ScrollReveal>

          </div>
        </div>
      </main>
    </div>
  );
}
