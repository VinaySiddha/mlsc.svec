import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Shield, Database, Lock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — MLSC SVEC",
  description: "Read the privacy policy for the Microsoft Learn Student Club SVEC website.",
  openGraph: {
    title: "Privacy Policy — MLSC SVEC",
    url: "https://mlscsvec.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1 py-24 md:py-40">
        <div className="container mx-auto px-6 max-w-5xl relative">
          {/* Ambient Glow */}
          <div className="glow-sphere top-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#34A853]/10" />
          <div className="glow-sphere bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-[#4285F4]/10" />

          {/* Header */}
          <div className="mb-20 relative z-10">
            <ScrollReveal>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
                Privacy <br /> <span className="text-[#34A853]">Policy.</span>
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
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    1. Introduction
                  </h3>
                </div>
                <p>
                  Welcome to the MLSC SVEC website. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, including any other media form, media channel, mobile website, or mobile application related or connected thereto.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 2 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4]">
                    <Database className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    2. Information We Collect
                  </h3>
                </div>
                <p>
                  We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                </p>
                <ul className="list-disc pl-8 mt-4 space-y-3 text-base">
                  <li>
                    <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, roll number, and phone number, that you voluntarily give to us when you register for an event, submit an application, or send a contact query.
                  </li>
                  <li>
                    <strong>Application Data:</strong> Information related to your academic and professional profile, such as your resume, CGPA, branch, and domain interests. All application data is stored securely.
                  </li>
                  <li>
                    <strong>Visitor Data:</strong> For security and monitoring purposes, we automatically log the IP address and user agent of every visitor to our website.
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            {/* Section 3 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FBBC04]/10 border border-[#FBBC04]/20 text-[#FBBC04]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    3. Content Protection
                  </h3>
                </div>
                <p>
                  To protect our intellectual property and maintain the security of our platform, we have implemented several security measures:
                </p>
                <ul className="list-disc pl-8 mt-4 space-y-3 text-base">
                  <li>
                    <strong>No-Copy Policy:</strong> Text and other content on this website cannot be copied.
                  </li>
                  <li>
                    <strong>Right-Click Disabled:</strong> The context menu is disabled sitewide to prevent easy access to content saving options.
                  </li>
                  <li>
                    <strong>Monitoring:</strong> We monitor site activity to prevent unauthorized access. Any user found engaging in such activities will have their access and IP address permanently blocked.
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            {/* Section 4 */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    4. Contact Us
                  </h3>
                </div>
                <p>
                  If you have questions or comments about this Privacy Policy, please contact us through the contact form on our About page or directly at <span className="text-[#4285F4] hover:underline font-semibold">svecmlsc@outlook.com</span>.
                </p>
              </section>
            </ScrollReveal>

          </div>
        </div>
      </main>
    </div>
  );
}
