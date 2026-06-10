"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/app/home-actions";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Award, Grid, Image as ImageIcon, Sparkles, Calendar } from "lucide-react";

const defaultImages: GalleryImage[] = [
    { id: "d1", url: "/team1.jpg", type: "moments" },
    { id: "d2", url: "/g2.jpg", type: "milestones" }
];

const defaultMetadata: Record<string, { title: string; desc: string; date: string }> = {
    d1: { title: "MLSC Core Assembly", desc: "The leadership team behind Microsoft Learn Student Club SVEC planning upcoming initiatives.", date: "October 2025" },
    d2: { title: "Technical Hackathons", desc: "Students building innovative solutions and presenting their projects during our coding sprint.", date: "November 2025" }
};

const googleColors = [
    { border: "hover:border-[#4285F4]/40", shadow: "hover:shadow-[0_0_35px_rgba(66,133,244,0.15)]", text: "text-[#4285F4]", bg: "bg-[#4285F4]/10 border-[#4285F4]/20 text-[#4285F4]" },
    { border: "hover:border-[#34A853]/40", shadow: "hover:shadow-[0_0_35px_rgba(52,168,83,0.15)]", text: "text-[#34A853]", bg: "bg-[#34A853]/10 border-[#34A853]/20 text-[#34A853]" },
    { border: "hover:border-[#FBBC05]/40", shadow: "hover:shadow-[0_0_35px_rgba(251,188,5,0.15)]", text: "text-[#FBBC05]", bg: "bg-[#FBBC05]/10 border-[#FBBC05]/20 text-[#FBBC05]" },
    { border: "hover:border-[#EA4335]/40", shadow: "hover:shadow-[0_0_35px_rgba(234,67,53,0.15)]", text: "text-[#EA4335]", bg: "bg-[#EA4335]/10 border-[#EA4335]/20 text-[#EA4335]" }
];

export function DynamicGallery({ images = [] }: { images?: GalleryImage[] }) {
    const [filter, setFilter] = useState<'all' | 'moments' | 'milestones'>('all');

    // Combine default and user uploaded images
    const displayImages = [...defaultImages, ...images];

    // Filter display images based on state
    const filteredImages = displayImages.filter(image => 
        filter === 'all' || image.type === filter
    );

    const getGridClass = (index: number, total: number) => {
        if (total >= 4) {
            if (index === 0) return "md:col-span-2 aspect-[1.8/1]";
            if (index === 3) return "md:col-span-2 aspect-[1.8/1]";
        }
        return "col-span-1 aspect-[4/3]";
    };

    return (
        <section className="relative py-24 md:py-40 bg-black overflow-hidden border-t border-white/5">
            {/* Background Glows */}
            <div className="absolute top-[10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-[#34A853]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-[#4285F4]/5 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <ScrollReveal>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-xs font-semibold tracking-wider text-white/50 mb-6 uppercase">
                                <Sparkles className="h-3.5 w-3.5 text-[#34A853]" /> Visual Archive
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic">
                                Moments & <br/> 
                                <span className="text-[#34A853] relative">
                                    Memories
                                    <span className="absolute left-0 bottom-1 w-full h-1 bg-[#34A853]/30 rounded" />
                                </span>
                            </h2>
                            <p className="text-xl text-white/40 max-w-xl font-medium tracking-tight mt-4">
                                A visual glimpse into the energy, milestones, and shared passion of our community.
                            </p>
                        </div>

                        {/* Interactive Filter Pills */}
                        <div className="flex flex-wrap gap-2.5 bg-[#0A0A0A] p-2 rounded-[2rem] border border-white/5 self-start md:self-end">
                            <button
                                onClick={() => setFilter('all')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                                    filter === 'all' 
                                    ? 'bg-white text-black shadow-lg scale-105' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Grid className="h-3.5 w-3.5" /> All
                            </button>
                            <button
                                onClick={() => setFilter('moments')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                                    filter === 'moments' 
                                    ? 'bg-[#34A853] text-white shadow-[0_0_20px_rgba(52,168,83,0.3)] scale-105' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Camera className="h-3.5 w-3.5" /> Moments
                            </button>
                            <button
                                onClick={() => setFilter('milestones')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                                    filter === 'milestones' 
                                    ? 'bg-[#4285F4] text-white shadow-[0_0_20px_rgba(66,133,244,0.3)] scale-105' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Award className="h-3.5 w-3.5" /> Milestones
                            </button>
                        </div>
                    </div>
                </ScrollReveal>

                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredImages.map((image, index) => {
                            const meta = defaultMetadata[image.id] || { 
                                title: image.type === 'moments' ? 'Special Moment' : 'Key Milestone',
                                desc: 'Moments from our interactive technical learning tracks.',
                                date: '2026'
                            };
                            const color = googleColors[index % googleColors.length];

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    key={image.id}
                                    className={`group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0A0A0A] transition-all duration-500 cursor-pointer ${color.border} ${color.shadow} ${getGridClass(index, filteredImages.length)}`}
                                >
                                    <Image
                                        src={image.url}
                                        alt={meta.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        style={{ objectFit: 'cover' }}
                                        className="transition-transform duration-1000 group-hover:scale-105 opacity-60 group-hover:opacity-90"
                                    />
                                    
                                    {/* Gradient Overlay for better contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-all duration-500" />
                                    
                                    {/* Category badge - top left */}
                                    <div className="absolute top-6 left-6 z-10">
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${color.bg}`}>
                                            {image.type === 'moments' ? <Camera className="h-3 w-3" /> : <Award className="h-3 w-3" />}
                                            {image.type}
                                        </span>
                                    </div>

                                    {/* Details overlay - bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 z-10 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">
                                            <Calendar className="h-3 w-3" />
                                            <span>{meta.date}</span>
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-white mb-2 leading-tight uppercase group-hover:text-white">
                                            {meta.title}
                                        </h3>
                                        <p className="text-white/40 text-xs font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-2">
                                            {meta.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {filteredImages.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-[2.5rem]">
                        <ImageIcon className="h-12 w-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-lg font-medium">No images found in this category.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
