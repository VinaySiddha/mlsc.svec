import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Image } from "@/components/image";
import NextImage from "next/image";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Blog — MLSC SVEC",
  description: "Read articles, tutorials, and updates from the Microsoft Learn Student Club SVEC community.",
  openGraph: {
    title: "Blog — MLSC SVEC",
    description: "Read articles, tutorials, and updates from the Microsoft Learn Student Club SVEC community.",
    url: "https://mlscsvec.in/blog",
  },
};

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1">
        <section className="relative w-full py-24 md:py-40 text-center overflow-hidden border-b border-white/5">
            <div className="glow-sphere top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FBBC04]/10" />
            <div className="container mx-auto px-6 relative z-10">
                <h1 className="hero-heading">
                    OUR <br/> <span className="text-[#FBBC04]">STORIES.</span>
                </h1>
                <p className="max-w-xl mx-auto mt-8 text-white/50 text-xl font-medium leading-relaxed">
                    Insightful articles, technical tutorials, and updates from the heart of our student community.
                </p>
            </div>
        </section>

        <section className="py-24 md:py-40 container mx-auto px-6">
            <div className="grid gap-12 max-w-6xl mx-auto">
                <div className="bento-card overflow-hidden flex flex-col lg:flex-row !p-0 h-full group hover:border-[#FBBC04]/20 transition-all">
                    <div className="relative h-72 lg:h-auto lg:w-2/5 overflow-hidden">
                        <Image
                            src="/blog1.jpg"
                            alt="Blog Post Image"
                            width={800}
                            height={600}
                            className="object-cover h-full w-full opacity-70 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
                        />
                         <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="p-12 lg:p-16 flex flex-col flex-1 lg:w-3/5">
                        <div className="flex items-center gap-4 text-[#FBBC04] mb-8">
                            <BookOpen className="h-6 w-6" />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">Medium Publication</span>
                        </div>
                        <h3 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase italic mb-8 leading-tight">
                            Unveiling Excellence: The Inauguration of MLSC at SVEC.
                        </h3>
                        <p className="text-white/50 text-lg font-medium leading-relaxed mb-12 flex-1">
                            Diving deep into the momentous occasion that marked the birth of a new era of technology and collaboration at our campus.
                        </p>
                        <Button asChild className="btn-primary w-fit px-12 h-14 bg-[#FBBC04] text-black hover:bg-[#FBBC04]/90">
                            <a href="https://link.medium.com/4aHNce3OlEb" target="_blank" rel="noopener noreferrer" className="flex items-center">
                                Read Story <ArrowRight className="ml-3 h-5 w-5" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
