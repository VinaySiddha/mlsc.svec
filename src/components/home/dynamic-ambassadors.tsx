"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface Ambassador {
    id: string;
    name: string;
    description: string;
    photoUrl: string;
}

export function DynamicAmbassadors() {
    const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);

    useEffect(() => {
        const fetchAmbassadors = async () => {
            try {
                const q = query(collection(db, "home_ambassadors"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs
                    .map((doc) => {
                        const raw = doc.data();
                        if (
                            typeof raw.name !== "string" ||
                            typeof raw.description !== "string" ||
                            typeof raw.photoUrl !== "string"
                        ) {
                            return null;
                        }
                        return {
                            id: doc.id,
                            name: raw.name,
                            description: raw.description,
                            photoUrl: raw.photoUrl,
                        };
                    })
                    .filter((item): item is Ambassador => item !== null);
                setAmbassadors(data);
            } catch (error) {
                console.error("Error fetching ambassadors:", error);
            }
        };
        fetchAmbassadors();
    }, []);

    const defaultAmbassadors: Ambassador[] = [
        {
            id: "default1",
            name: "Chandu Neelam",
            description: "Our pioneering MLSA leader, with exceptional leadership and technical prowess.",
            photoUrl: "/a1.jpg"
        },
        {
            id: "default2",
            name: "Akash Pydipala",
            description: "A passionate advocate for technology and community building.",
            photoUrl: "/a2.jpg"
        }
    ];

    // Append Strategy: Defaults + Dynamic
    const displayAmbassadors = [...defaultAmbassadors, ...ambassadors];

    return (
        <section className="py-12 md:py-16 bg-transparent">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-2">Our Team</h2>
                <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                    Meet the leaders guiding our community.
                </p>
                {/* Adaptive Layout: Centered 2-col for defaults, expands to 3-col when more items added */}
                <div className={`grid gap-8 mx-auto ${displayAmbassadors.length <= 2 ? 'md:grid-cols-2 lg:grid-cols-2 max-w-4xl' : 'md:grid-cols-2 lg:grid-cols-3 max-w-6xl'}`}>
                    {displayAmbassadors.map((person) => (
                        <div key={person.id} className="glass-card p-6 flex flex-col items-center">
                            <div className="relative w-32 h-32 mb-4">
                                <Image
                                    src={person.photoUrl}
                                    alt={person.name}
                                    fill
                                    className="object-cover rounded-full"
                                    data-ai-hint="person portrait"
                                />
                            </div>
                            <h3 className="text-2xl font-bold">{person.name}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{person.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
