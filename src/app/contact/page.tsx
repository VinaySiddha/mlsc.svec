import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ContactForm } from "@/components/contact-form";
import { Mail, MapPin, Clock, MessageSquare, Sparkles, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us — MLSC SVEC",
  description: "Get in touch with the Microsoft Learn Student Club at Sri Vasavi Engineering College. Reach out for event inquiries, partnerships, or community questions.",
  openGraph: {
    title: "Contact Us — MLSC SVEC",
    description: "Get in touch with the Microsoft Learn Student Club at Sri Vasavi Engineering College.",
    url: "https://mlscsvec.com/contact",
  },
};

const faqs = [
  {
    q: "How can I join MLSC SVEC as a member or core team member?",
    a: "We conduct recruitment cycles at the start of each academic semester across technical domains (AI/ML, Web, Cloud, Cybersecurity) and management/creative domains. You can apply directly through our Apply page when recruitment windows open.",
  },
  {
    q: "Are MLSC SVEC workshops and hackathons open to non-SVEC students?",
    a: "Most of our major virtual hackathons, webinars, and open-source challenges are open to students globally. In-person workshops at the college campus may have capacity limits specified during event registration.",
  },
  {
    q: "How can tech organizations or mentors partner with MLSC SVEC?",
    a: "We welcome industry speakers, tech companies, and developer mentors. Please send an email to microsoftlearnstudentclub@gmail.com or use the contact form with details about your proposed collaboration or session.",
  },
  {
    q: "What is the typical response time for queries?",
    a: "Our core communications team reviews incoming messages daily and aims to respond to all inquiries within 24 to 48 hours.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1">
        
        {/* ── Hero Section ── */}
        <section className="relative w-full pt-32 pb-20 overflow-hidden">
          <div className="glow-sphere top-[-5%] right-[-5%] w-[45%] h-[45%] bg-[#4285F4]/20" />
          <div className="glow-sphere bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-[#34A853]/15" />
          
          <div className="container mx-auto px-6 max-w-6xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4] text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
                <MessageSquare className="h-3.5 w-3.5" />
                Direct Communication
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] max-w-4xl">
                Get in <span className="text-[#4285F4]">touch.</span>
              </h1>
              <p className="mt-8 text-white/40 text-lg font-medium max-w-2xl leading-relaxed">
                Have questions about our club activities, technical bootcamps, student hiring, or partnerships? Reach out directly to our core team.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Contact Details & Form Section ── */}
        <section className="py-12 pb-24 container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Direct Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <ScrollReveal>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-7 space-y-6">
                  
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[#4285F4] shrink-0 mt-1">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Email Us</p>
                      <a href="mailto:microsoftlearnstudentclub@gmail.com" className="text-base font-bold text-white hover:text-[#4285F4] transition-colors">
                        microsoftlearnstudentclub@gmail.com
                      </a>
                      <p className="text-xs text-white/40 mt-1">Official communication channel for all inquiries.</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-xl bg-[#34A853]/10 border border-[#34A853]/20 flex items-center justify-center text-[#34A853] shrink-0 mt-1">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Campus Location</p>
                      <p className="text-sm font-semibold text-white/90 leading-snug">
                        Sri Vasavi Engineering College
                      </p>
                      <p className="text-xs text-white/40 mt-1 leading-relaxed">
                        Pedatadepalli, Tadepalligudem, West Godavari District, Andhra Pradesh 534101, India.
                      </p>
                    </div>
                  </div>

                  {/* Operational Hours */}
                  <div className="flex items-start gap-4 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-xl bg-[#FBBC04]/10 border border-[#FBBC04]/20 flex items-center justify-center text-[#FBBC04] shrink-0 mt-1">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Response Time</p>
                      <p className="text-sm font-semibold text-white/90">
                        Monday – Saturday (9:00 AM – 6:00 PM IST)
                      </p>
                      <p className="text-xs text-white/40 mt-1">Usually replies within 24–48 hours.</p>
                    </div>
                  </div>

                </div>
              </ScrollReveal>

              {/* Social Channels Card */}
              <ScrollReveal>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Connect on Socials</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://linkedin.com/company/mlscsvec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white hover:bg-[#4285F4]/20 hover:border-[#4285F4]/40 transition-all duration-200"
                    >
                      LinkedIn
                    </a>
                    <a
                      href="https://instagram.com/mlsc.svec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white hover:bg-[#EA4335]/20 hover:border-[#EA4335]/40 transition-all duration-200"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://github.com/mlscsvec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                    >
                      GitHub
                    </a>
                    <a
                      href="https://twitter.com/mlscsvec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white hover:bg-sky-500/20 hover:border-sky-500/40 transition-all duration-200"
                    >
                      Twitter / X
                    </a>
                  </div>
                </div>
              </ScrollReveal>

            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <ScrollReveal>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-8 md:p-10 shadow-2xl">
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white mb-2">
                      Send Us a <span className="text-[#4285F4]">Message</span>
                    </h2>
                    <p className="text-white/40 text-sm font-medium">
                      Fill out the form below and our leadership team will respond directly to your email address.
                    </p>
                  </div>
                  <ContactForm />
                </div>
              </ScrollReveal>
            </div>

          </div>
        </section>

        {/* ── Frequently Asked Questions ── */}
        <section className="py-20 border-t border-white/[0.06] bg-[#050505]">
          <div className="container mx-auto px-6 max-w-5xl">
            <ScrollReveal>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBBC04]/10 border border-[#FBBC04]/20 text-[#FBBC04] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Common Questions
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
                  Frequently Asked <span className="text-[#FBBC04]">Questions.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, i) => (
                <ScrollReveal key={i}>
                  <div className="h-full rounded-2xl border border-white/[0.08] bg-black/40 p-6 space-y-3">
                    <h3 className="text-base font-bold text-white tracking-tight flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-[#FBBC04] shrink-0 mt-1" />
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed font-medium pl-6">
                      {faq.a}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
