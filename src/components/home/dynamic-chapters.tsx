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
                <section key={chapter.id} className="py-20 bg-transparent">
                    <div className="container mx-auto px-4 text-center">
                        <ScrollReveal>
                            <h2 className="text-4xl font-bold mb-2">{chapter.name}</h2>
                            <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                                {chapter.description}
                            </p>
                        </ScrollReveal>
                        <StaggerContainer className={`grid gap-8 justify-center ${getGridClass(chapter.cards ? chapter.cards.length : 0)}`}>
                            {(chapter.cards || []).map((card, idx) => (
                                <StaggerItem key={idx}>
                                    <div className="glass-card-hover p-6 text-left">
                                        <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                                        <p className="text-muted-foreground">{card.content}</p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                    <div className="section-divider mt-16" />
                </section>
            ))}
        </>
    );
}

function StaticChapters() {
    return (
        <>
            <div className="section-divider" />
            <section className="py-20 bg-transparent">
                <div className="container mx-auto px-4 text-center">
                    <ScrollReveal>
                        <h2 className="text-4xl font-bold mb-2">Chapter 1: <span className="gradient-text">The Journey So Far</span></h2>
                        <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                            A legacy of innovation, collaboration, and learning.
                        </p>
                    </ScrollReveal>
                    <StaggerContainer className="grid md:grid-cols-2 gap-8">
                        <StaggerItem>
                            <div className="glass-card-hover p-6">
                                <div className="year flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2"><Calendar className="h-4 w-4 text-primary" />18th October 2023</div>
                                <h3 className="text-xl font-bold">Azure Cloud Workshop</h3>
                                <p className="mt-2 text-muted-foreground">Successfully conducted a hands-on event on the Azure Cloud Platform with more than 300 attendees, empowering numerous skilled peers in their cloud journey.</p>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="glass-card-hover p-6">
                                <div className="year flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2"><Calendar className="h-4 w-4 text-primary" />16th October 2023</div>
                                <h3 className="text-xl font-bold">Inauguration Ceremony</h3>
                                <p className="mt-2 text-muted-foreground">The inauguration of the Microsoft Learn Student Club marked a momentous occasion, fostering a dynamic hub for technology enthusiasts empowered by the Microsoft Learn ecosystem.</p>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            <div className="section-divider" />

            <section className="py-20 bg-transparent">
                <div className="container mx-auto px-4 text-center">
                    <ScrollReveal>
                        <h2 className="text-4xl font-bold mb-2">Chapter 2: <span className="gradient-text">The Next Level</span></h2>
                        <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                            Unlock your potential with hands-on projects, expert mentorship, and a vibrant community of tech enthusiasts.
                        </p>
                    </ScrollReveal>
                    <StaggerContainer className="grid md:grid-cols-3 gap-8">
                        <StaggerItem>
                            <div className="glass-card-hover p-8 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <BrainCircuit className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Skill Development</h3>
                                <p className="text-muted-foreground">Gain hands-on experience with cutting-edge technologies and platforms through workshops and projects.</p>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="glass-card-hover p-8 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                    <Rocket className="h-8 w-8 text-accent" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Build & Innovate</h3>
                                <p className="text-muted-foreground">Collaborate on real-world projects, build your portfolio, and bring your innovative ideas to life.</p>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="glass-card-hover p-8 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Briefcase className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Career Opportunities</h3>
                                <p className="text-muted-foreground">Network with industry professionals and get a head start on your career in technology.</p>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                    <div className="text-center mt-12">
                        <Button variant="gradient" size="lg" asChild>
                            <Link href="/apply">
                                <CheckCircle className="mr-2 h-5 w-5" />
                                <span>Hiring Closed</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
            <div className="section-divider" />
        </>
    );
}
