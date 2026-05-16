import type { Metadata } from "next";
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger-container';
import { Target, Eye, Code, Lightbulb, Users, Handshake } from 'lucide-react';
import Image from "next/image";

export const metadata: Metadata = {
  title: "About — MLSC SVEC",
  description: "Learn about Microsoft Learn Student Club at Sri Vasavi Engineering College — our mission, history, and the team driving student innovation.",
  openGraph: {
    title: "About — MLSC SVEC",
    description: "Learn about Microsoft Learn Student Club at Sri Vasavi Engineering College — our mission, history, and the team driving student innovation.",
    url: "https://mlscsvec.in/about",
  },
};

const timeline = [
    { date: 'Oct 2023', title: 'Club Founded', desc: 'MLSC inaugurated at Sri Vasavi Engineering College' },
    { date: 'Oct 2023', title: 'Azure Workshop', desc: 'First major event with 300+ attendees' },
    { date: 'Mar 2024', title: 'Web Dev Bootcamp', desc: 'Comprehensive web development training' },
    { date: '2024', title: 'Chapter 2 Begins', desc: 'Expanded into specialized technical and non-technical teams' },
    { date: '2025', title: 'Chapter 3 Launch', desc: 'MLSC 3.0 with new leadership and ambitious goals' },
];

const activities = [
    { icon: Code, title: 'Workshops', desc: 'Hands-on technical workshops on latest technologies' },
    { icon: Lightbulb, title: 'Hackathons', desc: 'Competitive coding and innovation challenges' },
    { icon: Users, title: 'Mentorship', desc: 'Peer-to-peer learning and expert guidance' },
    { icon: Handshake, title: 'Networking', desc: 'Industry connections and career opportunities' },
];

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-sans">
            <main className="flex-1">
                <section className="relative w-full py-40 md:py-60 text-center overflow-hidden border-b border-white/5">
                    {/* Background Glows */}
                    <div className="glow-sphere top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4285F4]/20" />
                    <div className="glow-sphere bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#34A853]/20" />

                    <div className="relative z-10 container mx-auto px-6">
                         <div className="mb-8">
                            <span className="text-white/50 text-sm font-black uppercase tracking-[0.4em]">Our Vision & Mission</span>
                        </div>
                        <h1 className="hero-heading">
                            ABOUT <br/> <span className="text-[#4285F4]">MLSC SVEC.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto mt-10 text-white/60 text-xl font-medium leading-relaxed">
                            A premier technology community at Sri Vasavi Engineering College, dedicated to student innovation and leadership.
                        </p>
                    </div>
                </section>

                <section className="py-24 md:py-40 container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <ScrollReveal>
                            <div className="bento-card h-full">
                                <div className="absolute top-0 right-0 p-8">
                                    <Target className="h-10 w-10 text-[#EA4335]" />
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter mb-6 uppercase italic">Mission.</h3>
                                <p className="text-white/60 text-lg font-medium leading-relaxed">
                                    To foster a culture of continuous learning by empowering students
                                    with technical skills and leadership to tackle real-world challenges.
                                </p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal>
                            <div className="bento-card h-full border-[#34A853]/20">
                                <div className="absolute top-0 right-0 p-8">
                                    <Eye className="h-10 w-10 text-[#34A853]" />
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter mb-6 uppercase italic">Vision.</h3>
                                <p className="text-white/60 text-lg font-medium leading-relaxed">
                                    To be the hub of technology at SVEC, bridging the gap between
                                    academic theory and high-velocity industry innovation.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                <section className="py-24 md:py-40 bg-[#050505] border-y border-white/5">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <AnimatedCounter target={300} suffix="+" className="text-6xl font-black tracking-tighter text-[#4285F4]" />
                                    <p className="text-white/40 text-[0.6rem] font-black uppercase tracking-[0.4em] mt-4">Active Members</p>
                                </div>
                                <div className="text-center">
                                    <AnimatedCounter target={15} suffix="+" className="text-6xl font-black tracking-tighter text-[#34A853]" />
                                    <p className="text-white/40 text-[0.6rem] font-black uppercase tracking-[0.4em] mt-4">Events Done</p>
                                </div>
                                <div className="text-center">
                                    <AnimatedCounter target={3} className="text-6xl font-black tracking-tighter text-[#FBBC04]" />
                                    <p className="text-white/40 text-[0.6rem] font-black uppercase tracking-[0.4em] mt-4">Chapters</p>
                                </div>
                                <div className="text-center">
                                    <AnimatedCounter target={50} suffix="+" className="text-6xl font-black tracking-tighter text-[#EA4335]" />
                                    <p className="text-white/40 text-[0.6rem] font-black uppercase tracking-[0.4em] mt-4">Core Team</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                <section className="py-24 md:py-40 container mx-auto px-6">
                    <ScrollReveal>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-20 uppercase italic">Our <span className="text-[#FBBC04]">Journey.</span></h2>
                    </ScrollReveal>
                    <div className="relative border-l border-white/5 ml-4 pl-12 space-y-16">
                        {timeline.map((item, i) => (
                            <ScrollReveal key={i}>
                                <div className="relative">
                                    <div className="absolute -left-[3.25rem] top-2 w-4 h-4 rounded-full bg-white ring-8 ring-black" />
                                    <p className="text-[#4285F4] text-xs font-black uppercase tracking-[0.3em] mb-2">{item.date}</p>
                                    <h4 className="text-3xl font-black tracking-tighter uppercase mb-4">{item.title}</h4>
                                    <p className="text-white/50 font-medium text-lg max-w-xl">{item.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
