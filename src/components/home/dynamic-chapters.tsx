import { Calendar, BrainCircuit, Rocket, Briefcase, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";
import type { Chapter } from "@/app/home-actions";

function getGridClass(count: number) {
    if (count >= 3) return "grid-cols-1 md:grid-cols-3";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1";
}

export function DynamicChapters({ chapters = [] }: { chapters?: Chapter[] }) {
    return (
        <>
            <StaticChapters />
            {chapters.map((chapter) => (
                <section key={chapter.id} className="relative py-24 md:py-32 bg-background overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <ScrollReveal>
                            <div className="text-center mb-20">
                                <h2 className="section-header">{chapter.name}</h2>
                                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                                    {chapter.description}
                                </p>
                            </div>
                        </ScrollReveal>
                        <StaggerContainer className={`grid gap-12 justify-center ${getGridClass(chapter.cards ? chapter.cards.length : 0)}`}>
                            {(chapter.cards || []).map((card, idx) => (
                                <StaggerItem key={idx}>
                                    <div className="apple-card p-12 h-full border-primary/5 hover:border-primary/20">
                                        <h3 className="text-3xl font-black tracking-tighter mb-6 text-foreground">{card.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed font-medium text-lg">{card.content}</p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>
            ))}
        </>
    );
}

function StaticChapters() {
    return (
        <>
            <section className="relative py-24 md:py-32 bg-background overflow-hidden">
                <div className="glow-accent top-[-20%] left-[-10%] w-[40%] h-[40%] opacity-5" />
                <div className="container mx-auto px-4 relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-20">
                            <h2 className="section-header">Chapter 1: <span className="text-primary">The Journey.</span></h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                                A legacy of innovation, collaboration, and learning that shaped our foundation.
                            </p>
                        </div>
                    </ScrollReveal>
                    <StaggerContainer className="grid md:grid-cols-2 gap-12">
                        <StaggerItem>
                            <div className="apple-card p-12 border-primary/10">
                                <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-primary mb-8">
                                    <Calendar className="h-6 w-6" />
                                    18th Oct 2023
                                </div>
                                <h3 className="text-4xl font-black mb-6 tracking-tighter">Azure Cloud.</h3>
                                <p className="text-muted-foreground leading-relaxed font-medium text-lg">Successfully empowered 300+ students through a high-impact workshop, diving deep into cloud infrastructure and deployment.</p>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="apple-card p-12 border-primary/10">
                                <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-primary mb-8">
                                    <Calendar className="h-6 w-6" />
                                    16th Oct 2023
                                </div>
                                <h3 className="text-4xl font-black mb-6 tracking-tighter">Genesis.</h3>
                                <p className="text-muted-foreground leading-relaxed font-medium text-lg">The official inauguration marked the birth of a dynamic tech ecosystem, uniting innovators under the Microsoft Learn umbrella.</p>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            <section className="relative py-24 md:py-32 bg-background overflow-hidden">
                <div className="glow-accent bottom-[-20%] right-[-10%] w-[50%] h-[50%] opacity-5" />
                <div className="container mx-auto px-4 relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-20">
                            <h2 className="section-header">Chapter 2: <span className="text-primary">Next Level.</span></h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                                Scaling our impact through hands-on mentorship and high-velocity project collaboration.
                            </p>
                        </div>
                    </ScrollReveal>
                    <StaggerContainer className="grid md:grid-cols-3 gap-12">
                        <StaggerItem>
                            <div className="apple-card p-12 text-center flex flex-col items-center border-primary/5 hover:border-primary/20">
                                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-10 shadow-xl shadow-primary/5">
                                    <BrainCircuit className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="text-3xl font-black mb-4 tracking-tighter">Growth.</h3>
                                <p className="text-muted-foreground leading-relaxed font-medium">Intensive skill-building workshops tailored for future-proof engineering roles.</p>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="apple-card p-12 text-center flex flex-col items-center border-primary/5 hover:border-primary/20">
                                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-10 shadow-xl shadow-primary/5">
                                    <Rocket className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="text-3xl font-black mb-4 tracking-tighter">Launch.</h3>
                                <p className="text-muted-foreground leading-relaxed font-medium">Incubating real-world projects that solve meaningful problems in our community.</p>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="apple-card p-12 text-center flex flex-col items-center border-primary/5 hover:border-primary/20">
                                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-10 shadow-xl shadow-primary/5">
                                    <Briefcase className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="text-3xl font-black mb-4 tracking-tighter">Career.</h3>
                                <p className="text-muted-foreground leading-relaxed font-medium">Bridging the gap between student innovation and industry leadership.</p>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                    <div className="text-center mt-24">
                        <Button variant="outline" size="lg" className="discovery-btn rounded-full px-16 border-2 border-primary/20 hover:border-primary text-primary" asChild>
                            <Link href="/apply">
                                <CheckCircle className="mr-3 h-6 w-6" />
                                <span>Hiring Closed</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
