import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Shield, Database, Cookie, Lock, Eye, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — MLSC SVEC",
  description: "Read the complete privacy policy for Microsoft Learn Student Club SVEC, including data collection, cookies, and Google AdSense policies.",
  openGraph: {
    title: "Privacy Policy — MLSC SVEC",
    description: "Read the complete privacy policy for Microsoft Learn Student Club SVEC.",
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
          <div className="mb-16 relative z-10">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853] text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
                <Shield className="h-3.5 w-3.5" />
                Compliance & Trust
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
                Privacy <br /> <span className="text-[#34A853]">Policy.</span>
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
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    1. Introduction & Overview
                  </h2>
                </div>
                <p>
                  Welcome to <strong>Microsoft Learn Student Club — Sri Vasavi Engineering College (MLSC SVEC)</strong> (<a href="https://mlscsvec.com" className="text-[#4285F4] hover:underline">https://mlscsvec.com</a>). We are dedicated to maintaining the privacy and security of all visitors, members, and participants. This Privacy Policy details how we collect, store, utilize, and protect your information when you access our website, interact with educational materials, register for events, or submit membership applications.
                </p>
                <p>
                  By accessing or using our website, you agree to the terms described in this Privacy Policy. If you disagree with any part of this policy, please discontinue use of the site.
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
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    2. Information We Collect
                  </h2>
                </div>
                <p>
                  We collect information to deliver educational resources, facilitate event registrations, and evaluate membership applications:
                </p>
                <ul className="list-disc pl-8 space-y-3 text-sm md:text-base">
                  <li>
                    <strong>Directly Provided Information:</strong> When you submit a form, register for workshops, apply for recruitment, or message us via the contact form, we collect personal information such as your name, student roll number, college email address, branch, year of study, GitHub/LinkedIn URLs, and resume details.
                  </li>
                  <li>
                    <strong>Technical & Device Data:</strong> When you visit our website, our servers automatically collect non-personally identifiable diagnostic data including your Internet Protocol (IP) address, browser type, operating system, referring URLs, timestamps, and page interaction metrics.
                  </li>
                  <li>
                    <strong>Communications:</strong> If you contact us directly via email or our contact forms, we keep records of correspondence to assist in addressing inquiries.
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            {/* Section 3 - Google AdSense & Cookies */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FBBC04]/10 border border-[#FBBC04]/20 text-[#FBBC04]">
                    <Cookie className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    3. Google AdSense & DoubleClick DART Cookies
                  </h2>
                </div>
                <p>
                  Google is a third-party vendor on our site. Google uses cookies, known as <strong>DART cookies</strong>, to serve advertisements to visitors based upon their visit to <span className="text-white font-semibold">mlscsvec.com</span> and other sites across the Internet.
                </p>
                <ul className="list-disc pl-8 space-y-3 text-sm md:text-base">
                  <li>
                    Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.
                  </li>
                  <li>
                    Google's use of advertising cookies enables it and its partners to serve ads to users based on their visits to our site and/or other sites on the Internet.
                  </li>
                  <li>
                    Visitors may opt out of personalized advertising by visiting{" "}
                    <a
                      href="https://adssettings.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4285F4] hover:underline font-semibold"
                    >
                      Google Ads Settings
                    </a>{" "}
                    or by visiting{" "}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4285F4] hover:underline font-semibold"
                    >
                      aboutads.info
                    </a>.
                  </li>
                  <li>
                    You can also opt out of third-party vendor cookies for personalized advertising by visiting the{" "}
                    <a
                      href="https://optout.networkadvertising.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4285F4] hover:underline font-semibold"
                    >
                      Network Advertising Initiative opt-out page
                    </a>.
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            {/* Section 4 - Google Analytics & Third-Party Services */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335]">
                    <Eye className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    4. Web Analytics & Tracking Technologies
                  </h2>
                </div>
                <p>
                  We use <strong>Google Analytics</strong> to evaluate site performance, understand user traffic distribution, and improve our learning resources. Google Analytics uses cookies to generate statistical data without directly identifying individual visitors.
                </p>
                <p>
                  You may prevent Google Analytics from tracking your activity by installing the{" "}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4285F4] hover:underline font-semibold"
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 5 - How We Use & Protect Data */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#7c3aed]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    5. Data Usage and Security
                  </h2>
                </div>
                <p>
                  Information collected by MLSC SVEC is strictly used for:
                </p>
                <ul className="list-disc pl-8 space-y-2 text-sm md:text-base">
                  <li>Organizing student hackathons, coding workshops, and tech seminars.</li>
                  <li>Processing and evaluating applications for club leadership and domain tracks.</li>
                  <li>Responding to feedback, inquiries, and support requests.</li>
                  <li>Maintaining site reliability, uptime monitoring, and security defenses.</li>
                </ul>
                <p className="mt-4">
                  We implement industry-standard encryption protocols (HTTPS/TLS) and secure database storage powered by Google Cloud / Firebase Firestore. We do not sell, rent, or trade your personal information to third-party marketing companies.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 6 - User Rights */}
            <ScrollReveal>
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    6. Your Data Protection Rights
                  </h2>
                </div>
                <p>
                  Depending on your jurisdiction, you have specific rights regarding your personal information:
                </p>
                <ul className="list-disc pl-8 space-y-2 text-sm md:text-base">
                  <li><strong>The Right to Access:</strong> You may request copies of your personal data stored with us.</li>
                  <li><strong>The Right to Rectification:</strong> You may request corrections to any inaccurate or incomplete records.</li>
                  <li><strong>The Right to Erasure:</strong> You may request that we delete your submitted application or contact data.</li>
                  <li><strong>The Right to Restrict Processing:</strong> You may request limitations on how your personal data is utilized.</li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please reach out directly through our <Link href="/contact" className="text-[#4285F4] hover:underline font-semibold">Contact Page</Link> or email us at <span className="text-white font-semibold">microsoftlearnstudentclub@gmail.com</span>.
                </p>
              </section>
            </ScrollReveal>

            {/* Section 7 - Contact Us */}
            <ScrollReveal>
              <section className="space-y-4 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    7. Contacting Our Data Privacy Team
                  </h2>
                </div>
                <p>
                  If you have questions, feedback, or concerns regarding this Privacy Policy or our compliance practices, please contact us at:
                </p>
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/80 space-y-2">
                  <p><strong>Organization:</strong> Microsoft Learn Student Club (MLSC) SVEC</p>
                  <p><strong>Campus:</strong> Sri Vasavi Engineering College, Pedatadepalli, Tadepalligudem, Andhra Pradesh 534101, India</p>
                  <p><strong>Email:</strong> <a href="mailto:microsoftlearnstudentclub@gmail.com" className="text-[#4285F4] hover:underline">microsoftlearnstudentclub@gmail.com</a></p>
                  <p><strong>Official Website:</strong> <a href="https://mlscsvec.com" className="text-[#4285F4] hover:underline">https://mlscsvec.com</a></p>
                </div>
              </section>
            </ScrollReveal>

          </div>
        </div>
      </main>
    </div>
  );
}
