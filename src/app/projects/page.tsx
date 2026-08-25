import type { Metadata } from "next";
import Link from "next/link";
import { Github, Globe, ArrowUpRight, Code2 } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";

export const metadata: Metadata = {
  title: "Projects — MLSC SVEC",
  description: "Discover production systems and open-source applications engineered by Microsoft Learn Student Club SVEC members.",
  openGraph: {
    title: "Projects — MLSC SVEC",
    description: "Discover production systems and open-source applications engineered by Microsoft Learn Student Club SVEC members.",
    url: "https://mlscsvec.com/projects",
  },
};

const flagshipProjects = [
  {
    title: "MLSC SVEC OFFICIAL PLATFORM",
    tagline: "High-performance community web portal & event management system",
    description: "Production web platform featuring dynamic alumni feedback wall, real-time event registrations, admin role-based CRUD panel, Firebase auth, and Cashfree payment gateway integration.",
    tags: ["Next.js 15", "TypeScript", "TailwindCSS", "Firebase", "Cashfree SDK"],
    status: "PRODUCTION",
    statusBg: "bg-[#00FF66] text-black",
    shadow: "shadow-[8px_8px_0px_0px_#4285F4]",
    github: "https://github.com/vinaysiddha/mlsc.svec",
    demo: "https://mlscsvec.com",
    badge: "[ CHAPTER 3.0 CORE ]"
  },
  {
    title: "CAMPUS PLACEMENT ANALYTICS HUB",
    tagline: "AI-assisted interview preparation and placement tracker",
    description: "Intelligent career preparation platform that analyzes company test trends, previous campus interview questions, and provides real-time coding benchmark stats for students.",
    tags: ["Python", "FastAPI", "React", "PostgreSQL", "Gemini 1.5 Pro"],
    status: "ACTIVE BETA",
    statusBg: "bg-[#FFE600] text-black",
    shadow: "shadow-[8px_8px_0px_0px_#FFE600]",
    github: "https://github.com/vinaysiddha",
    demo: "#",
    badge: "[ AI & DATA WING ]"
  },
  {
    title: "AZURE CLOUD BOT & DISCORD MANAGER",
    tagline: "Automated community moderation and cloud event notifier",
    description: "Multi-purpose community bot handling verification of hundreds of active club members, automated workshop reminders, leaderboard tracking, and Azure container deployment alerts.",
    tags: ["Node.js", "Discord.js", "Azure Container Apps", "MongoDB"],
    status: "ACTIVE",
    statusBg: "bg-[#00F0FF] text-black",
    shadow: "shadow-[8px_8px_0px_0px_#00FF66]",
    github: "https://github.com/vinaysiddha",
    demo: "#",
    badge: "[ CLOUD & DEVOPS ]"
  },
  {
    title: "HACKATHON PORTAL & SUBMISSION ENGINE",
    tagline: "Real-time project submission and peer voting system",
    description: "Tailored portal for 24-hour hackathons enabling real-time project judging, rubrics scoring, automated team matchmaking, and live certificate verification.",
    tags: ["Next.js", "Tailwind CSS", "Supabase", "Docker", "Radix UI"],
    status: "MAINTAINED",
    statusBg: "bg-[#FF0055] text-white",
    shadow: "shadow-[8px_8px_0px_0px_#FF0055]",
    github: "https://github.com/vinaysiddha",
    demo: "#",
    badge: "[ WEB & APP DEV ]"
  }
];

export default function ProjectsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1">
        
        {/* Header */}
        <section className="pt-32 pb-16 container mx-auto px-6 border-b-2 border-black bg-white">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-5">
              [ 01 // OPEN SOURCE & PRODUCTION ]
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.88] max-w-4xl">
              FLAGSHIP <br />
              <span className="text-[#4285F4]">PROJECTS.</span>
            </h1>
            <p className="mt-6 text-zinc-700 text-base md:text-xl font-semibold max-w-xl leading-relaxed">
              Explore battle-tested tools, open-source repositories, and web architectures built and maintained by MLSC SVEC developers.
            </p>
          </ScrollReveal>
        </section>

        {/* Projects Grid */}
        <section className="py-20 container mx-auto px-6">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {flagshipProjects.map((project, index) => (
              <StaggerItem key={index} className="flex flex-col">
                <div className={`bg-white border-2 border-black ${project.shadow} p-8 flex flex-col justify-between h-full transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px]`}>
                  <div>
                    {/* Badges Bar */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-black bg-[#F9F9FB] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000000]">
                        {project.badge}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${project.statusBg}`}>
                        {project.status}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-display font-black text-black tracking-tight uppercase italic mb-2 leading-tight">
                      {project.title}
                    </h2>
                    <p className="text-xs font-mono font-bold uppercase text-[#4285F4] tracking-wider mb-4">
                      {project.tagline}
                    </p>
                    <p className="text-zinc-700 text-xs md:text-sm font-semibold leading-relaxed mb-6">
                      {project.description}
                    </p>

                    {/* Tech Stack Chips */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.tags.map((tag, tIndex) => (
                        <span key={tIndex} className="text-[11px] font-mono font-bold px-2.5 py-1 bg-[#F9F9FB] border-2 border-black text-black shadow-[1px_1px_0px_0px_#000000]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-6 border-t-2 border-black flex-wrap gap-4">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-[#4285F4] hover:text-white transition-all"
                    >
                      <Github className="h-4 w-4" /> REPOSITORY [↗]
                    </a>
                    {project.demo !== "#" && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-[#FFE600] transition-all"
                      >
                        <Globe className="h-4 w-4" /> LIVE DEMO [↗]
                      </a>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Contribute CTA */}
        <section className="pb-32 container mx-auto px-6">
          <ScrollReveal>
            <div className="border-2 border-black bg-[#F9F9FB] p-8 md:p-12 shadow-[8px_8px_0px_0px_#00FF66] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-block px-3 py-1 bg-[#00FF66] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-3">
                  [ CONTRIBUTE WITH US ]
                </div>
                <h3 className="text-2xl sm:text-4xl font-display font-black text-black uppercase italic tracking-tight">
                  BUILD SOMETHING MASSIVE WITH MLSC.
                </h3>
                <p className="text-zinc-700 text-xs sm:text-sm font-semibold mt-2 max-w-xl">
                  Have an open-source project or idea you want to build? Join our engineering wing and deploy to real users.
                </p>
              </div>
              <Link
                href="/apply"
                className="px-8 py-4 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all shrink-0"
              >
                JOIN THE CLUB [↗]
              </Link>
            </div>
          </ScrollReveal>
        </section>

      </main>
    </div>
  );
}
