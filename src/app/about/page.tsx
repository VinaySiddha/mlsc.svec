
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger-container';
import { Target, Eye, Code, Lightbulb, Users, Handshake } from 'lucide-react';

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
        <div className="flex flex-col min-h-screen bg-transparent text-foreground">
            <main className="flex-1">
                <section className="relative w-full py-24 md:py-32 text-center bg-cover bg-center" style={{ backgroundImage: "url('/team1.jpg')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background"></div>
                    <div className="relative z-10 container mx-auto px-4 md:px-6">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                            About <span className="gradient-text">MLSC SVEC</span>
                        </h1>
                        <p className="max-w-[700px] mx-auto mt-4 text-muted-foreground text-lg">
                            A vibrant community of student innovators at Sri Vasavi Engineering College.
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-8">
                            <ScrollReveal direction="left">
                                <div className="glass-card-hover p-8 h-full">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <Target className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        To foster a culture of continuous learning and innovation by empowering students
                                        with technical skills, leadership qualities, and a collaborative spirit to tackle
                                        real-world challenges.
                                    </p>
                                </div>
                            </ScrollReveal>
                            <ScrollReveal direction="right">
                                <div className="glass-card-hover p-8 h-full">
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                        <Eye className="h-6 w-6 text-accent" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        To be the premier student technology community at SVEC, bridging the gap between
                                        academic knowledge and industry demands through workshops, hackathons, and collaborative projects.
                                    </p>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                <div className="section-divider" />

                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <ScrollReveal>
                            <div className="glass-card p-8 flex flex-wrap justify-center gap-12 md:gap-20">
                                <div className="text-center">
                                    <AnimatedCounter target={300} suffix="+" className="text-4xl font-bold gradient-text" />
                                    <p className="text-muted-foreground mt-2">Active Members</p>
                                </div>
                                <div className="text-center">
                                    <AnimatedCounter target={15} suffix="+" className="text-4xl font-bold gradient-text" />
                                    <p className="text-muted-foreground mt-2">Events Conducted</p>
                                </div>
                                <div className="text-center">
                                    <AnimatedCounter target={3} className="text-4xl font-bold gradient-text" />
                                    <p className="text-muted-foreground mt-2">Successful Chapters</p>
                                </div>
                                <div className="text-center">
                                    <AnimatedCounter target={50} suffix="+" className="text-4xl font-bold gradient-text" />
                                    <p className="text-muted-foreground mt-2">Team Members</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                <div className="section-divider" />

                <section className="py-16">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <ScrollReveal>
                            <h2 className="text-3xl font-bold text-center mb-12">Our <span className="gradient-text">Journey</span></h2>
                        </ScrollReveal>
                        <div className="relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-accent/50 to-transparent" />
                            {timeline.map((item, i) => (
                                <ScrollReveal key={i} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.1}>
                                    <div className={`flex items-start mb-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className={`w-[45%] ${i % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                                            <div className="glass-card-hover p-4">
                                                <p className="text-sm text-primary font-medium">{item.date}</p>
                                                <h4 className="font-bold mt-1">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10 shrink-0 mt-4" />
                                        <div className="w-[45%]" />
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="section-divider" />

                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <ScrollReveal>
                            <h2 className="text-3xl font-bold text-center mb-12">What We <span className="gradient-text">Do</span></h2>
                        </ScrollReveal>
                        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {activities.map((item, i) => (
                                <StaggerItem key={i}>
                                    <div className="glass-card-hover p-6 text-center h-full">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <item.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>
            </main>
        </div>
    );
}
