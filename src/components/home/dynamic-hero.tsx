"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useEmblaCarousel from "embla-carousel-react";
import { Github } from "lucide-react";

// Re-defining icons locally to avoid import issues
const VsCodeIconComponent = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21.428 5.968l-4.286-4.286-12.214 4.286v12.062l4.286 4.286 12.214-4.286v-12.062zm-4.286-2.4l2.4 2.4-10.371 3.629-2.4-2.4 10.371-3.629zm-11.286 13.514v-9.628l10.371-3.629v9.629l-10.371 3.628zm15.571-3.628l-2.4 2.4-10.371-3.629 2.4-2.4 10.371 3.629z" />
    </svg>
);

const AzureIconComponent = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.45 2.43L6.1 13.9l-2.18-3.87.5-1.12L12.45 2.43zm1.1.06l7.53 13.04-1.87 3.3-7.6-5.46 1.94-10.88zM6.6 15.3l5.53 6.27-7.22-1.2.5-4.26 1.19-.81z" />
    </svg>
);

interface HeroImage {
    id: string;
    url: string;
}

export function DynamicHero() {
    const [images, setImages] = useState<HeroImage[]>([]);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 });

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const q = query(collection(db, "home_hero"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HeroImage[];
                setImages(data);
            } catch (error) {
                console.error("Error fetching hero images:", error);
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        if (emblaApi) {
            const autoplay = setInterval(() => {
                emblaApi.scrollNext();
            }, 5000);
            return () => clearInterval(autoplay);
        }
    }, [emblaApi]);

    // Fallback to static if no dynamic images
    const heroImages = images.length > 0 ? images : [{ id: "default", url: "/team1.jpg" }];

    return (
        <section className="relative overflow-hidden min-h-[80vh] flex flex-col justify-center">
            <div className="absolute inset-0 z-0" ref={emblaRef}>
                <div className="flex h-full">
                    {heroImages.map((img) => (
                        <div key={img.id} className="flex-[0_0_100%] min-w-0 relative h-[80vh] md:h-screen">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
                                style={{ backgroundImage: `url('${img.url}')` }}
                            />
                            <div className="absolute inset-0 bg-background/70 backdrop-brightness-50"></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute inset-0 -z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-16 h-16 text-primary/20 animate-pulse-slow">
                    <VsCodeIconComponent />
                </div>
                <div className="absolute top-1/2 right-1/4 w-24 h-24 text-primary/10 animate-spin-slow">
                    <AzureIconComponent />
                </div>
                <div className="absolute bottom-1/4 left-1/3 w-20 h-20 text-foreground/10 animate-pulse">
                    <Github className="w-full h-full" />
                </div>
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-7xl font-bold text-foreground [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)] animate-fade-in-down font-graffiti">MLSC X <span className="text-primary">SVEC</span></h1>
                <div className="text-animate text-3xl md:text-4xl font-semibold my-4 text-foreground/90 [text-shadow:_0_1px_3px_rgb(0_0_0_/_30%)] animate-fade-in-down" style={{ animationDelay: '0.4s' }}>
                    <h3>Learn-Train-Serve</h3>
                </div>
                <p className="max-w-2xl text-lg text-muted-foreground mx-auto [text-shadow:_0_1px_2px_rgb(0_0_0_/_20%)] animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    Microsoft Learn Student Club, is a Technical Club which is dedicated to elevating the coding culture
                    at Sri Vasavi Engineering College, Tadepalligudem by mentoring to refine
                    their critical thinking and logical reasoning making them unrivalled!
                </p>
            </div>
        </section>
    );
}
