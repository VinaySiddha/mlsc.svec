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
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl relative">
          
          {/* Header */}
          <div className="mb-14">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF66] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                [ DATA PROTECTION // PRIVACY ]
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tight uppercase italic leading-[0.88] text-black mb-4">
                PRIVACY <span className="text-[#00A844]">POLICY.</span>
              </h1>
              <p className="text-zinc-600 font-sans font-bold uppercase tracking-widest text-xs">
                LAST REVISED // {currentDate.toUpperCase()}
              </p>
            </ScrollReveal>
          </div>

          {/* Content Card */}
          <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[10px_10px_0px_0px_#00FF66] space-y-12 text-zinc-800 leading-relaxed text-sm md:text-base font-semibold">
            
            {/* Section 1 */}
            <ScrollReveal>
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#00FF66] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Shield className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
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
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#4285F4] border-2 border-black text-white shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Database className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
                    2. Information We Collect
                  </h3>
                </div>
                <p>
                  We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-3 text-sm text-zinc-800 font-medium">
                  <li>
                    <strong className="text-black font-black">Personal Data:</strong> Personally identifiable information, such as your name, email address, roll number, and phone number, that you voluntarily give to us when you register for an event, submit an application, or send a contact query.
                  </li>
                  <li>
                    <strong className="text-black font-black">Application Data:</strong> Information related to your academic and professional profile, such as your resume, CGPA, branch, and domain interests. All application data is stored securely.
                  </li>
                  <li>
                    <strong className="text-black font-black">Visitor Data:</strong> For security and monitoring purposes, we automatically log the IP address and user agent of every visitor to our website.
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            {/* Section 3 */}
            <ScrollReveal>
              <section className="space-y-3 pb-8 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#FFE600] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Lock className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
                    3. Content Protection
                  </h3>
                </div>
                <p>
                  To protect our intellectual property and maintain the security of our platform, we have implemented several security measures:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-3 text-sm text-zinc-800 font-medium">
                  <li>
                    <strong className="text-black font-black">No-Copy Policy:</strong> Text and other content on this website cannot be copied.
                  </li>
                  <li>
                    <strong className="text-black font-black">Right-Click Disabled:</strong> The context menu is disabled sitewide to prevent easy access to content saving options.
                  </li>
                  <li>
                    <strong className="text-black font-black">Monitoring:</strong> We monitor site activity to prevent unauthorized access. Any user found engaging in such activities will have their access and IP address permanently blocked.
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            {/* Section 4 */}
            <ScrollReveal>
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#FF0055] border-2 border-black text-white shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <Mail className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic text-black">
                    4. Contact Us
                  </h3>
                </div>
                <p>
                  If you have questions or comments about this Privacy Policy, please contact us through the contact form on our About page or directly at <a href="mailto:svecmlsc@outlook.com" className="text-[#4285F4] hover:underline font-black">svecmlsc@outlook.com</a>.
                </p>
              </section>
            </ScrollReveal>

          </div>
        </div>
      </main>
    </div>
  );
}
