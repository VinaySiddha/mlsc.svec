"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { FlipWords } from "@/components/ui/flip-words";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InteractiveButton } from "@/components/ui/interactive-button";

const flipWords = ["Innovators.", "Builders.", "Leaders.", "Creators.", "Hackers."];

export function DynamicHero({ images = [] }: { images?: any[] }) {
    return (
        <section className="relative overflow-hidden min-h-screen flex flex-col justify-center bg-black">
            {/* Background Glows */}
            <div className="glow-sphere top-[20%] left-[10%] w-[35%] h-[35%] bg-[#4285F4]" />
            <div className="glow-sphere bottom-[15%] right-[10%] w-[28%] h-[28%] bg-[#EA4335]" />

            <div className="container relative z-10 mx-auto px-4 text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10 flex justify-center"
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/50 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4] animate-pulse" />
                        Microsoft Learn Student Club · SVEC
                    </span>
                </motion.div>

                {/* Main headline */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Static line with PointerHighlight */}
                    <h1 className="hero-heading text-white flex flex-col items-center justify-center">
                        <span className="block">We are</span>

                        {/* FlipWords on the second line with wrapper to prevent layout shift */}
                        <span className="relative inline-flex items-center justify-center h-[1.15em] min-w-[220px] sm:min-w-[320px]">
                            <FlipWords
                                words={flipWords}
                                duration={2500}
                                className="text-[#4285F4] !p-0 !m-0 font-black tracking-tighter"
                            />
                        </span>

                        {/* PointerHighlight on the third line */}
                        <span className="flex justify-center mt-2">
                            <PointerHighlight
                                rectangleClassName="border-white/15 bg-white/[0.02]"
                                pointerClassName="text-white/50 h-5 w-5"
                                containerClassName="inline-block"
                            >
                                <span className="relative z-10">MLSC SVEC.</span>
                            </PointerHighlight>
                        </span>
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-2xl text-lg md:text-xl text-white/50 mx-auto mt-10 mb-14 font-medium leading-relaxed"
                >
                    Join a community of innovators, builders, and creators at
                    Sri Vasavi Engineering College — powered by Microsoft.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <InteractiveButton href="/apply" className="min-w-[180px]">
                        Apply Now
                    </InteractiveButton>
                    <Button asChild variant="outline" className="btn-outline min-w-[180px]">
                        <Link href="/schedule" className="flex items-center gap-2">
                            Explore Schedule
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </motion.div>

                {/* Stats */}
                {/* <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap justify-center gap-12 mt-32 pt-16 border-t border-white/[0.06]"
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
                </motion.div> */}
            </div>
        </section>
    );
}
