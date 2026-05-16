"use client";

import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DynamicHero({ images = [] }: { images?: any[] }) {
    return (
        <section className="relative overflow-hidden min-h-screen flex flex-col justify-center bg-black">
            {/* Background Glows */}
            <div className="glow-sphere top-[20%] left-[20%] w-[30%] h-[30%] bg-[#4285F4]" />
            <div className="glow-sphere bottom-[20%] right-[20%] w-[25%] h-[25%] bg-[#EA4335]" />

            <div className="container relative z-10 mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8"
                >
                    <span className="text-white/50 text-sm font-black uppercase tracking-[0.4em]">Microsoft Learn Student Club SVEC Presents</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="hero-heading text-white"
                >
                    MLSC <br className="hidden md:block"/>
                    <span className="text-[#4285F4]">SVEC.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-3xl text-xl md:text-2xl text-white/70 mx-auto mb-16 font-medium leading-relaxed"
                >
                    The official hub of Microsoft Learn Student Club at SVEC. <br className="hidden md:block"/>
                    Join a community of innovators, builders, and creators.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-8"
                >
                    <Button asChild className="btn-primary min-w-[200px]">
                        <Link href="/apply">Apply Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="btn-outline min-w-[200px]">
                        <Link href="/schedule" className="flex items-center">
                            Explore Schedule
                            <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap justify-center gap-12 mt-40 pt-20 border-t border-white/5"
                >
                    <div className="flex flex-col items-center">
                        <AnimatedCounter target={300} suffix="+" className="text-4xl md:text-5xl font-black text-white tracking-tighter" />
                        <p className="text-[0.6rem] text-white/40 mt-2 font-black uppercase tracking-[0.4em]">Members</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <AnimatedCounter target={15} suffix="+" className="text-4xl md:text-5xl font-black text-white tracking-tighter" />
                        <p className="text-[0.6rem] text-white/40 mt-2 font-black uppercase tracking-[0.4em]">Events Done</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <AnimatedCounter target={3} className="text-4xl md:text-5xl font-black text-white tracking-tighter" />
                        <p className="text-[0.6rem] text-white/40 mt-2 font-black uppercase tracking-[0.4em]">Chapters</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
