import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, User, Clock, ChevronRight } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found — MLSC SVEC",
    };
  }

  return {
    title: `${post.title} — MLSC SVEC`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://mlscsvec.com/blog/${post.slug}`,
      images: [{ url: post.image }],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: RouteParams) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-black py-24 md:py-32 font-sans">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Navigation Breadcrumbs */}
        <ScrollReveal>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider mb-8">
            <Link href="/blog" className="hover:text-[#4285F4] transition-colors underline">
              BLOG
            </Link>
            <ChevronRight className="h-3 w-3 text-black" />
            <span className="text-[#4285F4] font-black">{post.category}</span>
            <ChevronRight className="h-3 w-3 text-black" />
            <span className="text-zinc-500 truncate max-w-[200px] md:max-w-sm">
              {post.title}
            </span>
          </div>
        </ScrollReveal>

        {/* Back Button */}
        <ScrollReveal>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-200 border-2 border-black hover:bg-zinc-300 text-black text-xs font-black uppercase tracking-wider mb-8 transition-all shadow-[2px_2px_0px_0px_#000000]"
          >
            <ArrowLeft className="h-4 w-4" />
            [ BACK TO STORIES ]
          </Link>
        </ScrollReveal>

        {/* Article Title */}
        <ScrollReveal>
          <div className="inline-block px-3 py-1 bg-[#FFE600] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-4">
            [ {post.category.toUpperCase()} ]
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight uppercase italic leading-[0.9] mb-8 text-black">
            {post.title}
          </h1>
        </ScrollReveal>

        {/* Metadata Details */}
        <ScrollReveal>
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs font-mono font-bold text-zinc-700 border-y-2 border-black py-4 mb-10 bg-[#F9F9FB] px-4">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#4285F4]" />
              <span>BY: {post.author.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#00A844]" />
              <span>DATE: {post.date.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-black" />
              <span>READ TIME: {post.readTime.toUpperCase()}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Featured Image */}
        <ScrollReveal>
          <div className="relative aspect-video w-full overflow-hidden border-2 border-black shadow-[8px_8px_0px_0px_#4285F4] mb-12 bg-white">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </ScrollReveal>

        {/* Article Content Body */}
        <ScrollReveal>
          <article className="prose max-w-none text-zinc-800 leading-relaxed text-base md:text-lg space-y-6 blog-article-content bg-white p-8 md:p-12 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="space-y-6 font-medium"
            />
          </article>
        </ScrollReveal>

        {/* Article Footer Divider */}
        <div className="border-t-2 border-black mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono text-zinc-600 font-bold uppercase tracking-widest">
            © MLSC SVEC TECHNICAL EDITORIAL
          </p>
          <Link
            href="/blog"
            className="px-5 py-2.5 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            EXPLORE ALL STORIES [→]
          </Link>
        </div>
      </div>

    </div>
  );
}
