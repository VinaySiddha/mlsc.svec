import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
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
  const shadowOptions = [
    'shadow-[6px_6px_0px_0px_#4285F4]',
    'shadow-[6px_6px_0px_0px_#FFE600]',
    'shadow-[6px_6px_0px_0px_#00FF66]',
    'shadow-[6px_6px_0px_0px_#FF0055]'
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="pt-32 pb-16 container mx-auto px-6 border-b-2 border-black bg-white">
          <Link
            href="/domains"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black bg-[#FFE600] border-2 border-black px-4 py-2 shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all mb-8"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3]" /> [ ALL DOMAINS ]
          </Link>
          <ScrollReveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-4">
              [ {category} ]
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.88] max-w-4xl">
              {name}
            </h1>
            <p className="mt-6 text-zinc-700 text-base md:text-xl font-semibold max-w-2xl leading-relaxed">
              {description}
            </p>
          </ScrollReveal>
        </section>

        {/* ── Roadmap ── */}
        <section className="py-20 container mx-auto px-6">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF66] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
              [ 02 // LEARNING PATH ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black uppercase italic tracking-tight text-black mb-12">
              CURRICULUM & ROADMAP.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmap.map((phase, i) => (
              <ScrollReveal key={i}>
                <div className={`bg-white border-2 border-black ${shadowOptions[i % shadowOptions.length]} p-8 h-full flex flex-col justify-between transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px]`}>
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                        {phase.phase}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase text-black bg-[#F9F9FB] border-2 border-black px-3 py-1">
                        {phase.duration}
                      </span>
                    </div>
                    <h3 className="text-2xl font-display font-black uppercase italic tracking-tight text-black mb-6">
                      {phase.title}
                    </h3>
                    <ul className="space-y-3">
                      {phase.topics.map((topic, j) => (
                        <li key={j} className="flex items-start gap-3 bg-[#F9F9FB] border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_#000000]">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[#00A844]" />
                          <span className="text-zinc-800 text-xs font-bold leading-relaxed">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Resources ── */}
        <section className="border-t-2 border-black py-20 container mx-auto px-6 bg-[#F9F9FB]">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
              [ 03 // CURATED REFERENCES ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black uppercase italic tracking-tight text-black mb-12">
              LEARNING RESOURCES.
            </h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((r, i) => (
              <StaggerItem key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 bg-white border-2 border-black px-6 py-5 shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-[#FFE600] text-black border-2 border-black shrink-0">
                      {r.tag}
                    </span>
                    <span className="text-sm font-black text-black group-hover:text-[#4285F4] transition-colors truncate">
                      {r.name}
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-black group-hover:text-[#4285F4] shrink-0 transition-colors stroke-[2.5]" />
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

      </main>
    </div>
  );
}
