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
        <section className="py-20 bg-transparent">
            <div className="container mx-auto px-4 text-center">
                <ScrollReveal>
                    <h2 className="text-4xl font-bold mb-12">Gallery: <span className="gradient-text">Moments & Milestones</span></h2>
                </ScrollReveal>
                <StaggerContainer className="flex flex-wrap justify-center gap-8">
                    {displayImages.map((image) => (
                        <StaggerItem key={image.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)]">
                            <div className="relative aspect-video group overflow-hidden rounded-lg shadow-lg">
                                <Image
                                    src={image.url}
                                    alt={`Gallery image (${image.type})`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="absolute bottom-2 left-2 text-xs font-medium bg-primary/80 text-primary-foreground px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {image.type}
                                </span>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
