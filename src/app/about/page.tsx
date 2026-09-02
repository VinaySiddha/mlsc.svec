import type { Metadata } from "next";
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import { WobbleCard } from '@/components/ui/wobble-card';
import { Target, Eye, Code, Lightbulb, Globe } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "About — MLSC SVEC",
  description: "Learn about Microsoft Learn Student Club at Sri Vasavi Engineering College — our mission, history, and the team driving student innovation.",
  openGraph: {
    title: "About — MLSC SVEC",
    description: "Learn about Microsoft Learn Student Club at Sri Vasavi Engineering College — our mission, history, and the team driving student innovation.",
    url: "https://mlscsvec.com/about",
  },
};

const timeline = [
    { date: 'Oct 2023', title: 'Club Founded', desc: 'MLSC SVEC officially inaugurated at Sri Vasavi Engineering College, becoming part of the global Microsoft Learn Student Club network.' },
    { date: 'Oct 2023', title: 'Azure Workshop', desc: 'First major event — a hands-on Azure Cloud workshop with 300+ student attendees, setting the bar for what MLSC events would become.' },
    { date: 'Mar 2024', title: 'Web Dev Bootcamp', desc: 'A two-day intensive bootcamp covering HTML, CSS, React, and deployment — from zero to full-stack.' },
    { date: '2024',     title: 'Chapter 2 Begins', desc: 'Expanded leadership into specialized technical and non-technical teams, growing the club\'s reach across the campus.' },
    { date: '2025',     title: 'Chapter 3 Launch', desc: 'MLSC 3.0 — new leadership, bolder goals, and the most ambitious chapter yet.' },
];

const stats = [
    { value: 300, suffix: '+', label: 'Active Members',  color: '#4285F4' },
    { value: 15,  suffix: '+', label: 'Events Done',     color: '#34A853' },
    { value: 3,   suffix: '',  label: 'Chapters',        color: '#FBBC04' },
    { value: 50,  suffix: '+', label: 'Core Team',       color: '#EA4335' },
];

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-sans">
            <main className="flex-1">

                {/* ── Hero — left-aligned, matches team/events pages ── */}
                <section className="relative w-full pt-32 pb-20 overflow-hidden">
                    <div className="glow-sphere top-[-5%] right-[-5%] w-[45%] h-[45%] bg-[#4285F4]/20" />
                    <div className="glow-sphere bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-[#34A853]/15" />
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-6">
                                Our Vision & Mission
                            </p>
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] max-w-4xl">
                                Building the future,{" "}
                                <span className="text-[#4285F4]">one student</span>{" "}
                                at a time.
                            </h1>
                            <p className="mt-8 text-white/40 text-lg font-medium max-w-xl leading-relaxed">
                                Microsoft Learn Student Club SVEC — a premier technology community at Sri Vasavi Engineering College dedicated to student innovation, leadership, and real-world impact.
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── Stats bar ── */}
                <section className="border-y border-white/[0.06] bg-[#050505]">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06]">
                                {stats.map((s) => (
                                    <div key={s.label} className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                        <AnimatedCounter
                                            target={s.value}
                                            suffix={s.suffix}
                                            className="text-5xl md:text-6xl font-black tracking-tighter"
                                            style={{ color: s.color }}
                                        />
                                        <p className="text-white/30 text-[0.6rem] font-black uppercase tracking-[0.4em] mt-3">
                                            {s.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── WobbleCard Grid ── */}
                <section className="py-24 md:py-32 container mx-auto px-6">
                    <ScrollReveal>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-4">What we do</p>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95] mb-14 max-w-2xl">
                            Everything you need to{" "}
                            <span className="text-[#4285F4]">grow as a technologist.</span>
                        </h2>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">

                        {/* Mission — spans 2 cols */}
                        <WobbleCard containerClassName="col-span-1 lg:col-span-2 min-h-[280px] bg-[#0d1a2d] border border-[#4285F4]/20">
                            <div className="max-w-md relative z-10">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20">
                                        <Target className="h-4 w-4 text-[#4285F4]" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4285F4]/60">Our Mission</p>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-4 leading-tight">
                                    Empowering students with the skills to shape tomorrow.
                                </h3>
                                <p className="text-white/50 text-sm font-medium leading-relaxed">
                                    To foster a culture of continuous learning by equipping students with technical excellence, leadership mindset, and real-world problem-solving abilities through Microsoft technologies.
                                </p>
                            </div>
                        </WobbleCard>

                        {/* Vision */}
                        <WobbleCard containerClassName="col-span-1 min-h-[280px] bg-[#0d2218] border border-[#34A853]/20">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#34A853]/10 border border-[#34A853]/20">
                                    <Eye className="h-4 w-4 text-[#34A853]" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#34A853]/60">Our Vision</p>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white mb-4 leading-tight">
                                The definitive tech hub of SVEC.
                            </h3>
                            <p className="text-white/50 text-sm font-medium leading-relaxed">
                                Bridging the gap between academic theory and high-velocity industry innovation — one student at a time.
                            </p>
                        </WobbleCard>

                        {/* Hackathons */}
                        <WobbleCard containerClassName="col-span-1 min-h-[230px] bg-[#1a1200] border border-[#FBBC04]/20">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#FBBC04]/10 border border-[#FBBC04]/20">
                                    <Lightbulb className="h-4 w-4 text-[#FBBC04]" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FBBC04]/60">Hackathons</p>
                            </div>
                            <h3 className="text-xl font-black tracking-tighter text-white mb-3 leading-tight">
                                Build under pressure. Win big.
                            </h3>
                            <p className="text-white/50 text-sm font-medium leading-relaxed">
                                Competitive challenges where ideas become products overnight.
                            </p>
                        </WobbleCard>

                        {/* Workshops */}
                        <WobbleCard containerClassName="col-span-1 min-h-[230px] bg-[#100d1a] border border-[#7c3aed]/20">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                                    <Code className="h-4 w-4 text-[#7c3aed]" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7c3aed]/60">Workshops</p>
                            </div>
                            <h3 className="text-xl font-black tracking-tighter text-white mb-3 leading-tight">
                                Hands-on learning at every level.
                            </h3>
                            <p className="text-white/50 text-sm font-medium leading-relaxed">
                                GenAI, Cloud, Web Dev and more — taught by practitioners, for students.
                            </p>
                        </WobbleCard>

                        {/* Community */}
                        <WobbleCard containerClassName="col-span-1 min-h-[230px] bg-[#1a0d0d] border border-[#EA4335]/20">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20">
                                    <Globe className="h-4 w-4 text-[#EA4335]" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EA4335]/60">Community</p>
                            </div>
                            <h3 className="text-xl font-black tracking-tighter text-white mb-3 leading-tight">
                                300+ and growing strong.
                            </h3>
                            <p className="text-white/50 text-sm font-medium leading-relaxed">
                                A network of builders, mentors, and leaders across 3 chapters.
                            </p>
                        </WobbleCard>

                    </div>
                </section>

                {/* ── Timeline ── */}
                <section className="border-t border-white/[0.06] py-24 md:py-32 container mx-auto px-6">
                    <ScrollReveal>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-4">How we got here</p>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95] mb-20 max-w-xl">
                            Our <span className="text-[#FBBC04]">journey.</span>
                        </h2>
                    </ScrollReveal>

                    <div className="relative">
                        {/* vertical line */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.06] ml-[3px]" />

                        <div className="space-y-16 pl-10">
                            {timeline.map((item, i) => (
                                <ScrollReveal key={i}>
                                    <div className="relative">
                                        {/* dot */}
                                        <div className="absolute -left-[2.6rem] top-1.5 w-2 h-2 rounded-full bg-white/30 ring-4 ring-black" />
                                        <p className="text-[#4285F4] text-xs font-bold uppercase tracking-[0.3em] mb-2">{item.date}</p>
                                        <h4 className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-3">{item.title}</h4>
                                        <p className="text-white/40 font-medium text-base max-w-xl leading-relaxed">{item.desc}</p>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Contact Section ── */}
                <section className="border-t border-white/[0.06] py-24 md:py-32 container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
                        <ScrollReveal>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-4">Get in touch</p>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95] mb-6">
                                Contact our <span className="text-[#4285F4]">team.</span>
                            </h2>
                            <p className="text-white/40 text-base leading-relaxed font-medium mb-8">
                                Have questions about our upcoming events, learning roadmaps, domain recruitments, or partnerships? Reach out to us directly through this form, and we will get back to you as soon as possible.
                            </p>
                            <div className="space-y-4 text-xs font-bold uppercase tracking-wider text-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                                        📍
                                    </div>
                                    <span>Sri Vasavi Engineering College, Pedatadepalli, Tadepalligudem</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                                        ✉️
                                    </div>
                                    <span className="normal-case">microsoftlearnstudentclub@gmail.com</span>
                                </div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal>
                            <ContactForm />
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="border-t border-white/[0.06] py-24 md:py-32">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-4">Be part of it</p>
                                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95] max-w-xl">
                                        Ready to join <span className="text-[#4285F4]">MLSC SVEC?</span>
                                    </h2>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                                    <Button asChild className="btn-primary">
                                        <Link href="/apply">Apply Now →</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="btn-outline">
                                        <Link href="/team">Meet the Team</Link>
                                    </Button>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

            </main>
        </div>
    );
}
