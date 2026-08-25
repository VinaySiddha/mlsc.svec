import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Domains — MLSC SVEC",
  description: "Explore the technical and non-technical domains of Microsoft Learn Student Club SVEC — each with a full learning roadmap.",
};

const domains = [
  { slug: "generative-ai",     name: "GENERATIVE AI & LLMs",    category: "TECHNICAL",     color: "#4285F4", shadow: "shadow-[6px_6px_0px_0px_#4285F4]", description: "Build with Large Language Models, prompt engineering, AI agents, and Microsoft Azure AI.", badgeBg: "bg-[#4285F4] text-white" },
  { slug: "data-science",      name: "DATA SCIENCE & ML",        category: "TECHNICAL",     color: "#00FF66", shadow: "shadow-[6px_6px_0px_0px_#00FF66]", description: "Master predictive analytics, neural networks, and machine learning pipelines.", badgeBg: "bg-[#00FF66] text-black" },
  { slug: "cloud-devops",      name: "CLOUD & DEVOPS",           category: "TECHNICAL",     color: "#FFE600", shadow: "shadow-[6px_6px_0px_0px_#FFE600]", description: "Azure cloud architecture, CI/CD pipelines, Docker, Kubernetes, and DevOps workflows.", badgeBg: "bg-[#FFE600] text-black" },
  { slug: "web-development",   name: "WEB & APP DEVELOPMENT",    category: "TECHNICAL",     color: "#A733FF", shadow: "shadow-[6px_6px_0px_0px_#A733FF]", description: "Modern web apps with React, Next.js, and full-stack deployments.", badgeBg: "bg-[#A733FF] text-white" },
  { slug: "media-marketing",   name: "MEDIA & MARKETING",        category: "CREATIVE & OPS", color: "#FF0055", shadow: "shadow-[6px_6px_0px_0px_#FF0055]", description: "Shape the MLSC brand through social media, content creation, and digital campaigns.", badgeBg: "bg-[#FF0055] text-white" },
  { slug: "events-operations", name: "EVENTS & OPERATIONS",      category: "CREATIVE & OPS", color: "#00F0FF", shadow: "shadow-[6px_6px_0px_0px_#00F0FF]", description: "Plan and execute world-class hackathons, workshops, and speaker sessions.", badgeBg: "bg-[#00F0FF] text-black" },
  { slug: "public-relations",  name: "PUBLIC RELATIONS",         category: "OUTREACH",      color: "#FFE600", shadow: "shadow-[6px_6px_0px_0px_#FFE600]", description: "Manage collaborations, sponsorships, and external communications with industry.", badgeBg: "bg-[#FFE600] text-black" },
  { slug: "creativity-design", name: "CREATIVITY & DESIGN",      category: "CREATIVE & OPS", color: "#FF0055", shadow: "shadow-[6px_6px_0px_0px_#FF0055]", description: "Design stunning graphics, visual assets, 3D designs, and UI/UX for all club products.", badgeBg: "bg-[#FF0055] text-white" },
];

export default function DomainsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1">
        
        {/* Header */}
        <section className="pt-32 pb-16 container mx-auto px-6 border-b-2 border-black bg-white">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-5">
              [ 01 // CLUB SPECIALIZATIONS ]
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.88] max-w-4xl">
              EXPLORE OUR <br />
              <span className="text-[#4285F4]">DOMAINS.</span>
            </h1>
            <p className="mt-6 text-zinc-700 text-base md:text-xl font-semibold max-w-xl leading-relaxed">
              Eight specialized tracks with structured, step-by-step roadmaps to help you grow from fundamentals to production-grade engineering.
            </p>
          </ScrollReveal>
        </section>

        {/* Domains Grid */}
        <section className="py-20 container mx-auto px-6">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <StaggerItem key={domain.slug} className="flex flex-col">
                <Link href={`/domains/${domain.slug}`} className="group block h-full">
                  <div className={`h-full min-h-[280px] bg-white border-2 border-black ${domain.shadow} p-8 flex flex-col justify-between transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px]`}>
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${domain.badgeBg}`}>
                          {domain.category}
                        </span>
                      </div>
                      <h2 className="text-2xl font-display font-black tracking-tight text-black uppercase italic mb-3 leading-tight group-hover:text-[#4285F4] transition-colors">
                        {domain.name}
                      </h2>
                      <p className="text-zinc-700 text-xs font-semibold leading-relaxed">{domain.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-8 pt-4 border-t-2 border-black text-xs font-black uppercase tracking-wider text-black group-hover:text-[#4285F4] transition-colors">
                      <span>VIEW ROADMAP</span>
                      <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
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
