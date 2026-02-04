"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

interface GalleryImage {
    id: string;
    url: string;
    type: 'moments' | 'milestones';
}

export function DynamicGallery() {
    const [images, setImages] = useState<GalleryImage[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const q = query(collection(db, "home_gallery"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryImage[];
                setImages(data);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            }
        };
        fetchImages();
    }, []);

    // Fallback
    const displayImages = images.length > 0 ? images : [
        { id: "d1", url: "/team1.jpg", type: "moments" },
        { id: "d2", url: "/g2.jpg", type: "milestones" }
    ];

    return (
        <section className="py-20 bg-transparent">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-12">Gallery: <span className="text-primary">Moments & Milestones</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayImages.map((image) => (
                        <div key={image.id} className="relative aspect-video group overflow-hidden rounded-lg shadow-lg">
                            <Image
                                src={image.url}
                                alt="Gallery Image"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
