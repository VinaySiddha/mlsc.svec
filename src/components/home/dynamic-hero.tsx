"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Github, ChevronDown } from "lucide-react";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import type { HeroImage } from "@/app/home-actions";

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

const defaultImages: HeroImage[] = [
    { id: "default1", url: "/team1.jpg" }
];

export function DynamicHero({ images = [] }: { images?: HeroImage[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 });

    useEffect(() => {
        if (emblaApi) {
            const autoplay = setInterval(() => {
                if (emblaApi.canScrollNext()) {
                    emblaApi.scrollNext();
                } else {
                    emblaApi.scrollTo(0);
                }
            }, 4000);
            return () => clearInterval(autoplay);
        }
    }, [emblaApi]);

    const heroImages = [...defaultImages, ...images];

    return (
        <section className="relative overflow-hidden min-h-[80vh] flex flex-col justify-center">
            <div className="absolute inset-0 z-0" ref={emblaRef}>
                <div className="flex h-full">
                    {heroImages.map((img) => (
                        <div key={img.id} className="flex-[0_0_100%] min-w-0 relative h-[80vh] md:h-screen">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('${img.url}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-primary/10 backdrop-brightness-50"></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute inset-0 -z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-16 h-16 text-primary/30 animate-float">
                    <VsCodeIconComponent />
                </div>
                <div className="absolute top-1/2 right-1/4 w-24 h-24 text-accent/20 animate-float" style={{ animationDelay: '1s' }}>
                    <AzureIconComponent />
                </div>
                <div className="absolute bottom-1/4 left-1/3 w-20 h-20 text-foreground/10 animate-float" style={{ animationDelay: '2s' }}>
                    <Github className="w-full h-full" />
                </div>
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="text-5xl md:text-7xl font-bold text-foreground [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)] font-graffiti"
                >
                    MLSC X <span className="gradient-text">SVEC</span>
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-3xl md:text-4xl font-semibold my-4 text-foreground/90 [text-shadow:_0_1px_3px_rgb(0_0_0_/_30%)]"
                >
                    <h3>Learn-Train-Serve</h3>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="max-w-2xl text-lg text-muted-foreground mx-auto [text-shadow:_0_1px_2px_rgb(0_0_0_/_20%)]"
                >
                    Microsoft Learn Student Club, is a Technical Club which is dedicated to elevating the coding culture
                    at Sri Vasavi Engineering College, Tadepalligudem by mentoring to refine
                    their critical thinking and logical reasoning making them unrivalled!
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex justify-center gap-8 md:gap-16 mt-10"
                >
                    <div className="text-center">
                        <AnimatedCounter target={300} suffix="+" className="text-3xl font-bold gradient-text" />
                        <p className="text-sm text-muted-foreground mt-1">Members</p>
                    </div>
                    <div className="text-center">
                        <AnimatedCounter target={15} suffix="+" className="text-3xl font-bold gradient-text" />
                        <p className="text-sm text-muted-foreground mt-1">Events</p>
                    </div>
                    <div className="text-center">
                        <AnimatedCounter target={3} className="text-3xl font-bold gradient-text" />
                        <p className="text-sm text-muted-foreground mt-1">Chapters</p>
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <ChevronDown className="h-6 w-6 text-muted-foreground" />
            </motion.div>
        </section>
    );
}
