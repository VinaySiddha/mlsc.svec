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
        <div className="flex flex-col min-h-screen bg-white text-black font-sans">
            <main className="flex-1">

                {/* ── Hero ── */}
                <section className="relative w-full pt-32 pb-20 overflow-hidden border-b-2 border-black bg-white">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-6">
                                [ 01 // MISSION & VISION ]
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.88] max-w-5xl">
                                BUILDING THE FUTURE,{" "}
                                <span className="text-[#4285F4] underline decoration-[#FFE600] decoration-8 underline-offset-8">ONE STUDENT</span>{" "}
                                AT A TIME.
                            </h1>
                            <p className="mt-8 text-zinc-700 text-base md:text-xl font-semibold max-w-2xl leading-relaxed">
                                Microsoft Learn Student Club SVEC — a student-led technology community at Sri Vasavi Engineering College dedicated to hands-on engineering, leadership, and real-world impact.
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── Stats bar ── */}
                <section className="border-b-2 border-black bg-[#F9F9FB]">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x-2 divide-black">
                                {stats.map((s, idx) => (
                                    <div key={s.label} className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                        <AnimatedCounter
                                            target={s.value}
                                            suffix={s.suffix}
                                            className="text-5xl md:text-7xl font-display font-black tracking-tighter"
                                            style={{ color: s.color }}
                                        />
                                        <p className="text-black text-xs font-black uppercase tracking-widest mt-2">
                                            {s.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── What we do (Neo-Brutalist Cards) ── */}
                <section className="py-20 md:py-32 container mx-auto px-6 bg-white">
                    <ScrollReveal>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF66] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                            [ 02 // WHAT WE DO ]
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tighter text-black uppercase italic leading-none mb-12 max-w-2xl">
                            EVERYTHING YOU NEED TO{" "}
                            <span className="text-[#4285F4]">GROW AS A BUILDER.</span>
                        </h2>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">

                        {/* Mission — spans 2 cols */}
                        <div className="col-span-1 lg:col-span-2 min-h-[260px] bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_#4285F4] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-[#4285F4] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                                    <Target className="h-5 w-5 stroke-[2.5]" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-[#4285F4]">OUR MISSION</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-display font-black tracking-tight text-black mb-3 leading-tight uppercase">
                                EMPOWERING STUDENTS WITH TECHNICAL EXCELLENCE TO SHAPE TOMORROW.
                            </h3>
                            <p className="text-zinc-700 text-sm md:text-base font-medium leading-relaxed">
                                To foster a culture of continuous learning by equipping students with high-velocity engineering skills, leadership mindset, and real-world problem-solving abilities.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="col-span-1 min-h-[260px] bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_#00FF66] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                                    <Eye className="h-5 w-5 stroke-[2.5]" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-black">OUR VISION</span>
                            </div>
                            <h3 className="text-2xl font-display font-black tracking-tight text-black mb-3 leading-tight uppercase">
                                THE DEFINITIVE TECH LAUNCHPAD OF SVEC.
                            </h3>
                            <p className="text-zinc-700 text-sm font-medium leading-relaxed">
                                Bridging the gap between academic textbooks and industry-grade product development — one builder at a time.
                            </p>
                        </div>

                        {/* Hackathons */}
                        <div className="col-span-1 min-h-[220px] bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#FFE600] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-9 h-9 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                                    <Lightbulb className="h-4 w-4 stroke-[2.5]" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-black">HACKATHONS</span>
                            </div>
                            <h3 className="text-xl font-display font-black tracking-tight text-black mb-2 leading-tight uppercase">
                                BUILD UNDER PRESSURE. WIN BIG.
                            </h3>
                            <p className="text-zinc-700 text-xs font-medium leading-relaxed">
                                Competitive engineering challenges where prototype ideas become shipped products overnight.
                            </p>
                        </div>

                        {/* Workshops */}
                        <div className="col-span-1 min-h-[220px] bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#4285F4] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-9 h-9 bg-[#4285F4] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                                    <Code className="h-4 w-4 stroke-[2.5]" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-[#4285F4]">WORKSHOPS</span>
                            </div>
                            <h3 className="text-xl font-display font-black tracking-tight text-black mb-2 leading-tight uppercase">
                                PRACTICAL CODE SESSIONS.
                            </h3>
                            <p className="text-zinc-700 text-xs font-medium leading-relaxed">
                                GenAI, Cloud Computing, Full-Stack and Systems — taught interactively by active student practitioners.
                            </p>
                        </div>

                        {/* Community */}
                        <div className="col-span-1 min-h-[220px] bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#FF0055] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-9 h-9 bg-[#FF0055] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                                    <Globe className="h-4 w-4 stroke-[2.5]" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-[#FF0055]">COMMUNITY</span>
                            </div>
                            <h3 className="text-xl font-display font-black tracking-tight text-black mb-2 leading-tight uppercase">
                                300+ AND GROWING STRONG.
                            </h3>
                            <p className="text-zinc-700 text-xs font-medium leading-relaxed">
                                An active cross-disciplinary ecosystem of software developers, designers, and domain leaders.
                            </p>
                        </div>

                    </div>
                </section>

                {/* ── Timeline ── */}
                <section className="border-t-2 border-black py-20 md:py-32 container mx-auto px-6 bg-[#F9F9FB]">
                    <ScrollReveal>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                            [ 03 // OUR TIMELINE ]
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tighter text-black uppercase italic leading-none mb-16 max-w-xl">
                            OUR <span className="text-[#4285F4]">JOURNEY.</span>
                        </h2>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {timeline.map((item, i) => (
                            <ScrollReveal key={i}>
                                <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                    <div className="inline-block px-3 py-1 bg-[#4285F4] text-white text-[11px] font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-3">
                                        {item.date}
                                    </div>
                                    <h4 className="text-xl font-display font-black tracking-tight text-black uppercase mb-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-zinc-700 text-xs font-medium leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>

                {/* ── Contact Section ── */}
                <section className="border-t-2 border-black py-20 md:py-32 container mx-auto px-6 bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
                        <ScrollReveal>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF0055] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                                [ 04 // CONTACT US ]
                            </div>
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tighter text-black uppercase italic leading-none mb-6">
                                CONTACT OUR <span className="text-[#4285F4]">TEAM.</span>
                            </h2>
                            <p className="text-zinc-700 text-sm md:text-base leading-relaxed font-medium mb-8">
                                Have questions about our upcoming events, learning roadmaps, domain recruitments, or partnerships? Reach out to us directly through this form, and we will get back to you promptly.
                            </p>
                            <div className="space-y-4 text-xs font-black uppercase tracking-wider text-black">
                                <div className="flex items-center gap-3 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#4285F4]">
                                    <div className="w-8 h-8 bg-[#FFE600] text-black border-2 border-black flex items-center justify-center font-bold">
                                        📍
                                    </div>
                                    <span>Sri Vasavi Engineering College, Tadepalligudem</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#00FF66]">
                                    <div className="w-8 h-8 bg-[#00FF66] text-black border-2 border-black flex items-center justify-center font-bold">
                                        ✉️
                                    </div>
                                    <span className="lowercase font-mono text-black font-bold">svecmlsc@outlook.com</span>
                                </div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal>
                            <ContactForm />
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="border-t-2 border-black py-20 md:py-32 bg-[#F9F9FB]">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                                        [ JOIN THE REVOLUTION ]
                                    </div>
                                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.9] max-w-xl">
                                        READY TO JOIN <span className="text-[#4285F4]">MLSC SVEC?</span>
                                    </h2>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                                    <Link
                                        href="/apply"
                                        className="px-8 py-3.5 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all text-center"
                                    >
                                        APPLY NOW [↗]
                                    </Link>
                                    <Link
                                        href="/team"
                                        className="px-8 py-3.5 bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all text-center"
                                    >
                                        MEET THE TEAM [↗]
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

            </main>
        </div>
    );
}
