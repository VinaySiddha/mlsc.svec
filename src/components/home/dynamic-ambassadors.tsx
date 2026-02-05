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
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ambassador[];
                setAmbassadors(data);
            } catch (error) {
                console.error("Error fetching ambassadors:", error);
            }
        };
        fetchAmbassadors();
    }, []);

    // If no ambassadors, you might want to show default ones, or nothing. 
    // Given strict "deployment ready", let's fallback to defaults if empty to preserve UI
    const displayAmbassadors = ambassadors.length > 0 ? ambassadors : [
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

    return (
        <section className="py-12 md:py-16 bg-transparent">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-2">Our Team</h2>
                <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                    Meet the leaders guiding our community.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                            {/* Assuming "MLSA" or similar title isn't stored in DB based on previous step, or part of description */}
                            <p className="text-sm text-muted-foreground mt-2">{person.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
