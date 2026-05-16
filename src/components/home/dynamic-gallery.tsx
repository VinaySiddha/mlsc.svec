"use client";

import Image from "next/image";
import type { GalleryImage } from "@/app/home-actions";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";

const defaultImages: GalleryImage[] = [
    { id: "d1", url: "/team1.jpg", type: "moments" },
    { id: "d2", url: "/g2.jpg", type: "milestones" }
];

export function DynamicGallery({ images = [] }: { images?: GalleryImage[] }) {
    const displayImages = [...defaultImages, ...images];

    return (
        <section className="relative py-24 md:py-40 bg-black overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6 relative z-10">
                <ScrollReveal>
                    <div className="mb-20">
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic">Moments & <br/> <span className="text-[#34A853]">Memories.</span></h2>
                        <p className="text-xl text-white/50 max-w-xl font-medium tracking-tight">A visual glimpse into the energy and passion of our community.</p>
                    </div>
                </ScrollReveal>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayImages.map((image) => (
                        <StaggerItem key={image.id}>
                            <div className="relative aspect-[4/3] group overflow-hidden rounded-[2rem] border border-white/5 bg-[#0A0A0A]">
                                <Image
                                    src={image.url}
                                    alt={`Gallery image (${image.type})`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                <div className="absolute bottom-8 left-8 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-6 group-hover:translate-y-0">
                                    <span className="text-[0.6rem] font-black bg-[#4285F4] text-white px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl">
                                        {image.type}
                                    </span>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
