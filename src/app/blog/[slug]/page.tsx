import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, User, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-black text-white py-24 md:py-32">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Navigation Breadcrumbs */}
        <ScrollReveal>
          <div className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-8">
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#FBBC04]">{post.category}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60 truncate max-w-[200px] md:max-w-sm">
              {post.title}
            </span>
          </div>
        </ScrollReveal>

        {/* Back Button */}
        <ScrollReveal>
          <Button
            asChild
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/5 mb-8 -ml-3"
          >
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </ScrollReveal>

        {/* Article Title */}
        <ScrollReveal>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase italic leading-none mb-6">
            {post.title}
          </h1>
        </ScrollReveal>

        {/* Metadata Details */}
        <ScrollReveal>
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-white/50 border-y border-white/10 py-4 mb-10">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#FBBC04]" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#FBBC04]" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#FBBC04]" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Featured Image */}
        <ScrollReveal>
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/10 mb-12 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover opacity-80"
              priority
            />
          </div>
        </ScrollReveal>

        {/* Article Content Body */}
        <ScrollReveal>
          <article className="prose prose-invert max-w-none text-white/80 leading-relaxed text-base md:text-lg space-y-6 blog-article-content font-medium">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="space-y-6"
            />
          </article>
        </ScrollReveal>

        {/* Article Footer Divider */}
        <div className="border-t border-white/10 mt-16 pt-8 flex justify-between items-center">
          <p className="text-xs text-white/30 font-bold uppercase tracking-widest">
            © MLSC SVEC Editorial
          </p>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-white/10 hover:bg-white/5 hover:text-white"
          >
            <Link href="/blog">All Stories</Link>
          </Button>
        </div>
      </div>

    </div>
  );
}
