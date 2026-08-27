import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Image } from "@/components/image";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";

export const metadata: Metadata = {
  title: "Blog — MLSC SVEC",
  description: "Read articles, tutorials, and updates from the Microsoft Learn Student Club SVEC community.",
  openGraph: {
    title: "Blog — MLSC SVEC",
    description: "Read articles, tutorials, and updates from the Microsoft Learn Student Club SVEC community.",
    url: "https://mlscsvec.com/blog",
  },
};

import { blogPosts } from "@/lib/blog-posts";

const posts = [
  {
    slug: "inauguration",
    title: "Unveiling Excellence: The Inauguration of MLSC at SVEC.",
    description: "Diving deep into the momentous occasion that marked the birth of a new era of technology and collaboration at our campus.",
    image: "/blog1.jpg",
    date: "November 2023",
    category: "Medium Publication",
    url: "https://link.medium.com/4aHNce3OlEb",
    isMedium: true,
  },
  ...blogPosts.map(p => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    image: p.image,
    date: p.date,
    category: p.category,
    url: `/blog/${p.slug}`,
    isMedium: false,
  }))
];

export default function BlogPage() {
  const featuredPost = posts.find(p => p.slug === "inauguration");
  const regularPosts = posts.filter(p => p.slug !== "inauguration");

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1">
        
        {/* ── Hero section ── */}
        <section className="relative w-full pt-32 pb-24 overflow-hidden">
          <div className="glow-sphere top-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#FBBC04]/20" />
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-6">
                Insights & updates
              </p>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] max-w-3xl">
                Our <span className="text-[#FBBC04]">stories.</span>
              </h1>
              <p className="mt-8 text-white/40 text-lg font-medium max-w-xl leading-relaxed">
                Insightful articles, technical roadmaps, and updates from the heart of our student club.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Featured Blog Post ── */}
        {featuredPost && (
          <section className="pb-12 container mx-auto px-6">
            <ScrollReveal>
              <div className="rounded-3xl border border-white/[0.08] bg-[#0e0e0e] overflow-hidden flex flex-col lg:flex-row h-full group hover:border-[#FBBC04]/20 transition-all duration-300">
                <div className="relative h-72 lg:h-auto lg:w-1/2 overflow-hidden">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    width={800}
                    height={600}
                    className="object-cover h-full w-full opacity-60 group-hover:opacity-85 transition-all duration-1000 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent lg:block hidden" />
                </div>
                <div className="p-8 lg:p-16 flex flex-col justify-between flex-1 lg:w-1/2">
                  <div>
                    <div className="flex flex-wrap items-center gap-4 text-[#FBBC04] mb-6">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.2em] bg-[#FBBC04]/10 border border-[#FBBC04]/20 px-3 py-1 rounded-full">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{featuredPost.category}</span>
                      </div>
                      <span className="text-[10px] text-white/40 font-medium flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {featuredPost.date}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic mb-6 leading-tight text-white group-hover:text-white transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed mb-8">
                      {featuredPost.description}
                    </p>
                  </div>
                  <Button asChild className="rounded-xl bg-white text-black font-bold hover:bg-white/90 px-6 h-11 text-xs tracking-wider uppercase transition-transform active:scale-95 w-fit">
                    <a href={featuredPost.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      Read Story <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* ── Regular Blog Grid ── */}
        <section className="py-12 pb-32 container mx-auto px-6 border-t border-white/[0.06] mt-12">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {regularPosts.map((post) => (
              <StaggerItem key={post.slug}>
                <div className="h-full rounded-2xl border border-white/[0.08] bg-[#0e0e0e] overflow-hidden flex flex-col justify-between group hover:border-[#FBBC04]/20 transition-all duration-300">
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={600}
                        height={400}
                        className="object-cover h-full w-full opacity-60 group-hover:opacity-80 transition-all duration-1000 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="p-8">
                      <div className="flex flex-wrap items-center gap-4 text-[#FBBC04] mb-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#FBBC04]/10 border border-[#FBBC04]/20 px-2.5 py-0.5 rounded-full">
                          <span>{post.category}</span>
                        </div>
                        <span className="text-[10px] text-white/40 font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {post.date}
                        </span>
                      </div>
                      <h4 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic mb-4 leading-snug text-white">
                        {post.title}
                      </h4>
                      <p className="text-white/40 text-sm font-medium leading-relaxed">
                        {post.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-8 pt-0">
                    {post.isMedium ? (
                      <Button asChild className="rounded-xl bg-white text-black font-bold hover:bg-white/90 px-5 h-10 text-[10px] tracking-wider uppercase transition-transform active:scale-95 w-fit">
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                          Read Story <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild className="rounded-xl bg-white text-black font-bold hover:bg-white/90 px-5 h-10 text-[10px] tracking-wider uppercase transition-transform active:scale-95 w-fit">
                        <Link href={post.url} className="flex items-center gap-1.5">
                          Read Article <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

      </main>
    </div>
  );
}
