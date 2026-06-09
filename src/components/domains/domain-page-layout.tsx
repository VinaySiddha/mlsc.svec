import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";

export interface RoadmapPhase {
  phase: string;
  title: string;
  color: string;
  duration: string;
  topics: string[];
}

export interface Resource {
  name: string;
  url: string;
  tag: string;
}

interface DomainPageProps {
  name: string;
  color: string;
  icon: string;
  category: string;
  description: string;
  roadmap: RoadmapPhase[];
  resources: Resource[];
}

export function DomainPageLayout({ name, color, icon, category, description, roadmap, resources }: DomainPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/[0.06]">
          <div className="glow-sphere top-[-5%] right-[-5%] w-[40%] h-[40%] opacity-20 blur-[120px] rounded-full absolute -z-10" style={{ backgroundColor: color }} />
          <div className="container mx-auto px-6">
            <Link
              href="/domains"
              className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase tracking-[0.2em] mb-10 transition-colors duration-200"
            >
              <ArrowLeft className="h-3 w-3" /> All Domains
            </Link>
            <ScrollReveal>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block" style={{ color }}>
                {category}
              </span>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
                  {name}
                </h1>
              </div>
              <p className="text-white/40 text-lg font-medium max-w-2xl leading-relaxed mt-6">
                {description}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Roadmap ── */}
        <section className="py-24 md:py-32 container mx-auto px-6">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-4">Learning Path</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95] mb-16 max-w-xl">
              Your <span style={{ color }}>roadmap.</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {roadmap.map((phase, i) => (
              <ScrollReveal key={i}>
                <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e0e] p-8 h-full hover:border-white/15 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: phase.color }}>
                      {phase.phase}
                    </span>
                    <span className="text-[10px] font-medium text-white/25 bg-white/5 px-3 py-1 rounded-full">
                      {phase.duration}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter text-white mb-6 group-hover:text-white transition-colors">
                    {phase.title}
                  </h3>
                  <ul className="space-y-3">
                    {phase.topics.map((topic, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: phase.color, opacity: 0.7 }} />
                        <span className="text-white/60 text-sm font-medium leading-snug">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Resources ── */}
        <section className="border-t border-white/[0.06] py-24 md:py-32 container mx-auto px-6">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-4">Curated Links</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95] mb-16 max-w-xl">
              Learning <span style={{ color }}>resources.</span>
            </h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map((r, i) => (
              <StaggerItem key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#0e0e0e] px-6 py-4 hover:border-white/20 hover:bg-[#111] transition-all duration-200"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border shrink-0"
                      style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}
                    >
                      {r.tag}
                    </span>
                    <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors truncate">
                      {r.name}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

      </main>
    </div>
  );
}
