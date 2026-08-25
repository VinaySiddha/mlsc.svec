import type { Metadata } from "next";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Image } from "@/components/image";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — MLSC SVEC",
  description: "Read articles, tutorials, and updates from the Microsoft Learn Student Club SVEC community.",
  openGraph: {
    title: "Blog — MLSC SVEC",
    description: "Read articles, tutorials, and updates from the Microsoft Learn Student Club SVEC community.",
    url: "https://mlscsvec.com/blog",
  },
};

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
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1">
        
        {/* ── Hero section ── */}
        <section className="pt-32 pb-16 container mx-auto px-6 border-b-2 border-black bg-white">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-5">
              [ 01 // EDITORIAL & ARTICLES ]
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.88] max-w-4xl">
              OUR <span className="text-[#4285F4]">STORIES.</span>
            </h1>
            <p className="mt-6 text-zinc-700 text-base md:text-xl font-semibold max-w-xl leading-relaxed">
              Insightful articles, technical roadmaps, event recaps, and thought pieces from the Microsoft Learn Student Club community.
            </p>
          </ScrollReveal>
        </section>

        {/* ── Featured Blog Post ── */}
        {featuredPost && (
          <section className="py-16 container mx-auto px-6">
            <ScrollReveal>
              <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#FFE600] overflow-hidden flex flex-col lg:flex-row">
                <div className="relative h-72 lg:h-auto lg:w-1/2 overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-black">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    width={800}
                    height={600}
                    className="object-cover h-full w-full"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#FFE600] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                      [ FEATURED STORY ]
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-14 flex flex-col justify-between flex-1 lg:w-1/2 bg-white">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="text-xs font-black uppercase tracking-wider bg-[#4285F4] text-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 stroke-[2.5]" />
                        {featuredPost.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-600 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-black" /> {featuredPost.date}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-display font-black tracking-tight uppercase italic mb-6 leading-tight text-black">
                      {featuredPost.title}
                    </h3>
                    <p className="text-zinc-700 text-sm md:text-base font-semibold leading-relaxed mb-8">
                      {featuredPost.description}
                    </p>
                  </div>
                  <a
                    href={featuredPost.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all w-fit"
                  >
                    READ FULL STORY [↗]
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* ── Regular Blog Grid ── */}
        <section className="py-12 pb-32 container mx-auto px-6 border-t-2 border-black bg-[#F9F9FB]">
          <div className="inline-block px-3 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-8">
            [ ALL ARTICLES & TUTORIALS ]
          </div>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
            {regularPosts.map((post, idx) => {
              const shadowColor = idx % 2 === 0 ? "shadow-[6px_6px_0px_0px_#4285F4]" : "shadow-[6px_6px_0px_0px_#00FF66]";
              return (
                <StaggerItem key={post.slug}>
                  <div className={`h-full bg-white border-2 border-black ${shadowColor} flex flex-col justify-between overflow-hidden group`}>
                    <div>
                      <div className="relative aspect-video w-full overflow-hidden border-b-2 border-black">
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={600}
                          height={400}
                          className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-white text-black text-[9px] font-mono font-bold uppercase tracking-wider border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 md:p-8">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-600 mb-3">
                          <Calendar className="h-3.5 w-3.5 text-black" /> {post.date}
                        </div>
                        <h4 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase italic mb-3 text-black">
                          {post.title}
                        </h4>
                        <p className="text-zinc-700 text-xs md:text-sm font-semibold leading-relaxed">
                          {post.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 pt-0">
                      {post.isMedium ? (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-200 border-2 border-black hover:bg-zinc-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000]"
                        >
                          READ ON MEDIUM [↗]
                        </a>
                      ) : (
                        <Link
                          href={post.url}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          READ ARTICLE [→]
                        </Link>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>

      </main>
    </div>
  );
}
