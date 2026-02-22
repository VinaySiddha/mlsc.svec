"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, BrainCircuit, Rocket, Briefcase, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ChapterCard {
    title: string;
    content: string;
}

interface Chapter {
    id: string;
    name: string;
    description: string;
    cards: ChapterCard[];
}

export function DynamicChapters() {
    const [chapters, setChapters] = useState<Chapter[]>([]);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const q = query(collection(db, "home_chapters"), orderBy("createdAt", "asc")); // asc to show in order 1, 2, ...
                const snapshot = await getDocs(q);
                const data = snapshot.docs
                    .map((doc) => {
                        const raw = doc.data();
                        if (typeof raw.name !== "string" || typeof raw.description !== "string" || !Array.isArray(raw.cards)) {
                            return null;
                        }
                        const cards = raw.cards.filter(
                            (card: any): card is ChapterCard =>
                                card &&
                                typeof card.title === "string" &&
                                typeof card.content === "string"
                        );

                        return {
                            id: doc.id,
                            name: raw.name,
                            description: raw.description,
                            cards,
                        };
                    })
                    .filter((item): item is Chapter => item !== null);
                setChapters(data);
            } catch (error) {
                console.error("Error fetching chapters:", error);
            }
        };
        fetchChapters();
    }, []);

    const getGridClass = (count: number) => {
        if (count >= 3) return "grid-cols-1 md:grid-cols-3";
        if (count === 2) return "grid-cols-1 md:grid-cols-2";
        return "grid-cols-1";
    };

    return (
        <>
            <StaticChapters />
            {chapters.map((chapter) => (
                <section key={chapter.id} className="py-20 bg-transparent">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold mb-2">{chapter.name}</h2>
                        <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                            {chapter.description}
                        </p>
                        <div className={`grid gap-8 justify-center ${getGridClass(chapter.cards ? chapter.cards.length : 0)}`}>
                            {(chapter.cards || []).map((card, idx) => (
                                <div key={idx} className="glass-card p-6 text-left">
                                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                                    <p className="text-muted-foreground">{card.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}
        </>
    );
}

function StaticChapters() {
    return (
        <>
            {/* Chapter 1: The Journey So Far */}
            <section className="py-20 bg-transparent">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-2">Chapter 1: The Journey So Far</h2>
                    <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                        A legacy of innovation, collaboration, and learning.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass-card p-6">
                            <div className="event-content">
                                <div className="content">
                                    <div className="year flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2"><Calendar className="h-4 w-4" />18th October 2023</div>
                                    <h3 className="text-xl font-bold">Azure Cloud Workshop</h3>
                                    <p className="mt-2 text-muted-foreground">Successfully conducted a hands-on event on the Azure Cloud Platform with more than 300 attendees, empowering numerous skilled peers in their cloud journey.</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="event-content">
                                <div className="content">
                                    <div className="year flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2"><Calendar className="h-4 w-4" />16th October 2023</div>
                                    <h3 className="text-xl font-bold">Inauguration Ceremony</h3>
                                    <p className="mt-2 text-muted-foreground">The inauguration of the Microsoft Learn Student Club marked a momentous occasion, fostering a dynamic hub for technology enthusiasts empowered by the Microsoft Learn ecosystem.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chapter 2: The Next Level */}
            <section className="py-20 bg-transparent">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-2">Chapter 2: The Next Level</h2>
                    <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                        Unlock your potential with hands-on projects, expert mentorship, and a vibrant community of tech enthusiasts.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-card p-8 text-center flex flex-col items-center">
                            <BrainCircuit className="h-12 w-12 text-primary mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Skill Development</h3>
                            <p className="text-muted-foreground">Gain hands-on experience with cutting-edge technologies and platforms through workshops and projects.</p>
                        </div>
                        <div className="glass-card p-8 text-center flex flex-col items-center">
                            <Rocket className="h-12 w-12 text-primary mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Build & Innovate</h3>
                            <p className="text-muted-foreground">Collaborate on real-world projects, build your portfolio, and bring your innovative ideas to life.</p>
                        </div>
                        <div className="glass-card p-8 text-center flex flex-col items-center">
                            <Briefcase className="h-12 w-12 text-primary mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Career Opportunities</h3>
                            <p className="text-muted-foreground">Network with industry professionals and get a head start on your career in technology.</p>
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <Button variant="glass" size="lg" asChild>
                            <Link href="/apply">
                                <CheckCircle className="mr-2 h-5 w-5" />
                                <span>Hiring Closed</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    )
}
