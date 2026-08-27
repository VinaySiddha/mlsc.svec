import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Domains — MLSC SVEC",
  description: "Explore the six technical and non-technical domains of Microsoft Learn Student Club SVEC — each with a full learning roadmap.",
};

const domains = [
  { slug: "generative-ai",     name: "GENERATIVE AI & LLMs",    category: "Technical",     color: "#4285F4", bg: "bg-[#0d1a2d]", border: "border-[#4285F4]/20", description: "Build with Large Language Models, prompt engineering, AI agents, and Microsoft Azure AI.", icon: "🤖" },
  { slug: "data-science",      name: "DATA SCIENCE & ML",        category: "Technical",     color: "#34A853", bg: "bg-[#0d2218]", border: "border-[#34A853]/20", description: "Master predictive analytics, neural networks, and machine learning pipelines.", icon: "📊" },
  { slug: "cloud-devops",      name: "CLOUD & DEVOPS",           category: "Technical",     color: "#FBBC04", bg: "bg-[#1a1200]", border: "border-[#FBBC04]/20", description: "Azure cloud architecture, CI/CD pipelines, Docker, Kubernetes, and DevOps workflows.", icon: "☁️" },
  { slug: "web-development",   name: "WEB & APP DEVELOPMENT",    category: "Technical",     color: "#7c3aed", bg: "bg-[#100d1a]", border: "border-[#7c3aed]/20", description: "Modern web apps with React, Next.js, and full-stack deployments.", icon: "💻" },
  { slug: "media-marketing",   name: "MEDIA & MARKETING",        category: "Non-Technical", color: "#EA4335", bg: "bg-[#1a0d0d]", border: "border-[#EA4335]/20", description: "Shape the MLSC brand through social media, content creation, and digital campaigns.", icon: "📱" },
  { slug: "events-operations", name: "EVENTS & OPERATIONS",      category: "Non-Technical", color: "#FF6D00", bg: "bg-[#1a1000]", border: "border-[#FF6D00]/20", description: "Plan and execute world-class hackathons, workshops, and speaker sessions.", icon: "🎯" },
];

export default function DomainsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1">
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="glow-sphere top-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#4285F4]/20" />
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-6">What we build</p>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] max-w-3xl">
                Explore our <span className="text-[#4285F4]">domains.</span>
              </h1>
              <p className="mt-8 text-white/40 text-lg font-medium max-w-xl leading-relaxed">
                Six specialized tracks — technical and non-technical — each with a clear roadmap to help you grow from beginner to industry-ready.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="pb-32 container mx-auto px-6">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <StaggerItem key={domain.slug}>
                <Link href={`/domains/${domain.slug}`} className="group block h-full">
                  <div className={`h-full min-h-[260px] rounded-2xl border ${domain.border} ${domain.bg} p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border" style={{ color: domain.color, borderColor: `${domain.color}30`, backgroundColor: `${domain.color}10` }}>
                          {domain.category}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white mb-3 leading-tight">
                        {domain.name}
                      </h2>
                      <p className="text-white/40 text-sm font-medium leading-relaxed">{domain.description}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-6 text-sm font-bold transition-all group-hover:gap-3" style={{ color: domain.color }}>
                      View Roadmap <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </main>
    </div>
  );
}
