"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { 
  Bot, 
  Database, 
  Cloud, 
  Code, 
  Megaphone, 
  Calendar, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Terminal,
  Zap,
  BookOpen,
  X
} from "lucide-react";
import Link from "next/link";

interface DomainItem {
  id: string;
  slug: string;
  category: "ai" | "cloud" | "dev" | "creative";
  categoryLabel: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  color: string;
  bgAccent: string;
  badge: string;
  icon: any;
  techStack: string[];
  projectsCount: string;
  difficulty: string;
  image: string;
  highlights: string[];
}

const DOMAINS_DATA: DomainItem[] = [
  {
    id: "gen-ai",
    slug: "generative-ai",
    category: "ai",
    categoryLabel: "AI & INTELLIGENCE",
    title: "GENERATIVE AI & LLMs",
    subtitle: "Prompt Systems · Agentic Workflows · Fine-Tuning",
    tagline: "Build with Next-Gen Intelligence",
    description: "Dive deep into Large Language Models, autonomous agent swarms, vector databases (RAG), and Azure OpenAI services to build intelligent production applications.",
    color: "#4285F4",
    bgAccent: "bg-[#EBF3FF]",
    badge: "⚡ FASTEST GROWING",
    icon: Bot,
    techStack: ["OpenAI API", "LangChain", "LlamaIndex", "Azure AI", "ChromaDB", "Python"],
    projectsCount: "12+ Live Builds",
    difficulty: "Beginner to Advanced",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=75&w=800&auto=format&fit=crop",
    highlights: [
      "Building Custom RAG pipelines with Pinecone & LangChain",
      "Multi-Agent Orchestration with AutoGen & CrewAI",
      "Deploying Models onto Microsoft Azure AI Studio",
      "Fine-tuning Open-Source LLMs (DeepSeek & Llama-3)",
    ],
  },
  {
    id: "data-science",
    slug: "data-science",
    category: "ai",
    categoryLabel: "AI & INTELLIGENCE",
    title: "DATA SCIENCE & ML",
    subtitle: "Predictive Engines · Neural Nets · Computer Vision",
    tagline: "Uncover Truth in Massive Datasets",
    description: "Transform raw data into predictive intelligence. Master pandas, statistical modeling, computer vision, PyTorch architectures, and enterprise analytics pipelines.",
    color: "#00AA44",
    bgAccent: "bg-[#E8F8EE]",
    badge: "🔥 HIGH DEMAND",
    icon: Database,
    techStack: ["PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "OpenCV", "Azure ML"],
    projectsCount: "10+ Research Prototypes",
    difficulty: "Intermediate",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=75&w=800&auto=format&fit=crop",
    highlights: [
      "End-to-End Machine Learning Pipelines with MLflow",
      "Deep Learning for Computer Vision & Object Recognition",
      "Time-Series Forecasting & Real-Time Analytics Dashboards",
      "Model Interpretability and Production Serving",
    ],
  },
  {
    id: "cloud-devops",
    slug: "cloud-devops",
    category: "cloud",
    categoryLabel: "INFRASTRUCTURE",
    title: "CLOUD & DEVOPS",
    subtitle: "Azure Infra · Kubernetes · GitOps Pipelines",
    tagline: "Scale Systems to Millions of Users",
    description: "Architect unbreakable high-availability cloud infrastructure. Master Docker containerization, Kubernetes clusters, GitHub Actions CI/CD, and Azure Cloud services.",
    color: "#8B5CF6",
    bgAccent: "bg-[#F3E8FF]",
    badge: "🛡️ ENTERPRISE GRADE",
    icon: Cloud,
    techStack: ["Microsoft Azure", "Docker", "Kubernetes", "GitHub Actions", "Terraform", "Linux"],
    projectsCount: "8+ Cloud Clusters",
    difficulty: "Intermediate to Advanced",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=75&w=800&auto=format&fit=crop",
    highlights: [
      "Containerizing Microservices with Docker & Compose",
      "Deploying Scalable Clusters with Azure Kubernetes (AKS)",
      "Automated CI/CD Workflows via GitHub Actions",
      "Infrastructure as Code (IaC) with Terraform & Bicep",
    ],
  },
  {
    id: "web-dev",
    slug: "web-development",
    category: "dev",
    categoryLabel: "SOFTWARE ENGINEERING",
    title: "WEB & APP DEVELOPMENT",
    subtitle: "React · Next.js · Full-Stack Systems · Mobile",
    tagline: "Craft Pixel-Perfect Full-Stack Software",
    description: "Build reactive, high-performance web and mobile platforms with React, Next.js, TypeScript, PostgreSQL, and modern full-stack architectures.",
    color: "#FF0055",
    bgAccent: "bg-[#FFE8EF]",
    badge: "🚀 CORE DOMAIN",
    icon: Code,
    techStack: ["Next.js 15", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Node.js"],
    projectsCount: "16+ Shipped Apps",
    difficulty: "All Skill Levels",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=75&w=800&auto=format&fit=crop",
    highlights: [
      "Server-Side Rendering & App Router Architecture",
      "Robust Database Schema Design & Realtime WebSockets",
      "Building Fluid Neo-Brutalist & Modern Web Interfaces",
      "Production Deployment on Vercel & AWS/Azure",
    ],
  },
  {
    id: "media-marketing",
    slug: "media-marketing",
    category: "creative",
    categoryLabel: "GROWTH & CREATIVE",
    title: "MEDIA & GROWTH MARKETING",
    subtitle: "Visual Identity · Social Strategy · Content Engine",
    tagline: "Amplify Impact to Thousands",
    description: "The creative engine powering the MLSC SVEC brand. Drive digital marketing campaigns, high-impact motion graphics, storytelling, and campus-wide outreach.",
    color: "#FFE600",
    bgAccent: "bg-[#FFFDE5]",
    badge: "🎨 CREATIVE ENGINE",
    icon: Megaphone,
    techStack: ["Figma", "Premiere Pro", "After Effects", "Brand Strategy", "Analytics", "Copywriting"],
    projectsCount: "25+ Campaigns",
    difficulty: "Beginner Friendly",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=75&w=800&auto=format&fit=crop",
    highlights: [
      "Brand Identity Systems and UI/UX Prototyping",
      "High-Conversion Social Media Growth Campaigns",
      "Technical Storytelling & Event Hype Content",
      "Video Production & Community Photography",
    ],
  },
  {
    id: "events-operations",
    slug: "events-operations",
    category: "creative",
    categoryLabel: "MANAGEMENT & OPS",
    title: "EVENTS & OPERATIONS",
    subtitle: "Hackathons · Logistical Mastery · Speaker Summits",
    tagline: "Orchestrate Legendary Tech Events",
    description: "The execution powerhouse behind our 24-hour hackathons, bootcamps, and technical symposiums. Master logistical planning, sponsorship pipelines, and leadership.",
    color: "#FF6600",
    bgAccent: "bg-[#FFF0E6]",
    badge: "👑 LEADERSHIP HUB",
    icon: Calendar,
    techStack: ["Event Architecture", "Sponsorship Outreach", "Operations", "Team Logistics", "Public Relations"],
    projectsCount: "15+ Flagship Events",
    difficulty: "Beginner Friendly",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=75&w=800&auto=format&fit=crop",
    highlights: [
      "Organizing 24h Inter-College Hackathons & Code-a-thons",
      "Securing Industry Sponsorships & Tech Partnerships",
      "Stage Management & Keynote Speaker Coordination",
      "Building Seamless On-Ground Community Operations",
    ],
  },
];

export function CreativeDomainsShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedDomain, setSelectedDomain] = useState<DomainItem | null>(null);

  const filteredDomains = activeCategory === "all"
    ? DOMAINS_DATA
    : DOMAINS_DATA.filter(d => d.category === activeCategory);

  return (
    <section className="py-24 md:py-32 bg-[#F9F9FB] border-b-2 border-black font-sans relative overflow-hidden">
      {/* Background Graphic Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }} 
      />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                [ 02 // TECH DOMAINS & SPECIALIZATIONS ]
              </div>

              <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.88] text-black">
                CURIOSITY NEEDS A{" "}
                <span className="text-[#4285F4] underline decoration-[#FFE600] decoration-8 underline-offset-8">
                  DIRECTION.
                </span>
              </h2>

              <p className="text-zinc-700 font-medium text-base md:text-lg mt-5 leading-relaxed">
                Choose your track, collaborate with mentors and fellow builders, and turn theoretical knowledge into shipped software and certified skills.
              </p>
            </div>

            {/* Quick Track Filter Pills */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {[
                { key: "all", label: "ALL 06 TRACKS" },
                { key: "ai", label: "AI & DATA" },
                { key: "cloud", label: "CLOUD & DEVOPS" },
                { key: "dev", label: "WEB & MOBILE" },
                { key: "creative", label: "OPS & MEDIA" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
                    activeCategory === tab.key
                      ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000] -translate-y-0.5"
                      : "bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black shadow-[2px_2px_0px_0px_#000000]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Dynamic Colorful Domain Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDomains.map((domain, index) => {
            const Icon = domain.icon;

            return (
              <ScrollReveal key={domain.id}>
                <div 
                  className="group bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex flex-col justify-between h-full relative overflow-hidden"
                >
                  {/* Top Color Header Banner */}
                  <div 
                    className="p-4 border-b-2 border-black flex items-center justify-between"
                    style={{ backgroundColor: domain.color }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                        <Icon className="h-4 w-4 text-black stroke-[2.5]" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-black font-mono">
                        {domain.categoryLabel}
                      </span>
                    </div>

                    <span className="text-[10px] font-black uppercase bg-black text-white px-2.5 py-1 border border-black shadow-[1px_1px_0px_0px_#FFFFFF]">
                      {domain.badge}
                    </span>
                  </div>

                  {/* Visual Card Image Banner */}
                  <div className="relative h-44 w-full border-b-2 border-black bg-zinc-900 overflow-hidden">
                    <img 
                      src={domain.image} 
                      alt={domain.title}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Floating Meta Stamps */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold font-mono">
                      <span className="bg-black/80 px-2 py-0.5 border border-white/20">
                        {domain.projectsCount}
                      </span>
                      <span className="bg-[#FFE600] text-black px-2 py-0.5 border border-black font-black">
                        {domain.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-black tracking-tight uppercase italic text-black group-hover:text-[#4285F4] transition-colors leading-tight">
                        {domain.title}
                      </h3>
                      
                      <p className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                        // {domain.subtitle}
                      </p>

                      <p className="text-sm font-semibold text-zinc-700 leading-relaxed">
                        {domain.description}
                      </p>
                    </div>

                    {/* Tech Stack Chips */}
                    <div className="space-y-2 pt-2 border-t-2 border-black/10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono">
                        [ TECH ARSENAL ]
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {domain.techStack.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-[#F4F4F8] border border-black text-zinc-800 shadow-[1px_1px_0px_0px_#000000]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3">
                      <button
                        onClick={() => setSelectedDomain(domain)}
                        className="px-4 py-2 bg-white text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        SYLLABUS
                      </button>

                      <Link
                        href={`/domains/${domain.slug}`}
                        className="flex-1 text-center px-4 py-2 bg-[#FFE600] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-1"
                      >
                        ROADMAP <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Global Track CTA Bar */}
        <ScrollReveal>
          <div className="mt-16 bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_#FFE600] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-black font-mono">
                <Zap className="h-4 w-4 text-[#4285F4]" />
                CROSS-DOMAIN COLLABORATION ENGINE
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-black uppercase italic text-black mt-1">
                NOT SURE WHICH DOMAIN FITS YOU BEST?
              </h3>
              <p className="text-sm font-semibold text-zinc-600 mt-1">
                Our onboarding workshops allow members to explore multiple domains before locking in their primary track.
              </p>
            </div>

            <Link
              href="/apply"
              className="px-8 py-3.5 bg-[#4285F4] text-white font-black uppercase text-xs tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all shrink-0"
            >
              APPLY FOR RECRUITMENT [↗]
            </Link>
          </div>
        </ScrollReveal>

      </div>

      {/* Domain Syllabus Deep Dive Modal */}
      <AnimatePresence>
        {selectedDomain && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-black p-6 sm:p-10 max-w-2xl w-full shadow-[12px_12px_0px_0px_#000000] relative space-y-6"
            >
              <button
                onClick={() => setSelectedDomain(null)}
                className="absolute top-4 right-4 h-8 w-8 bg-[#FF0055] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>

              <div className="flex items-center gap-2">
                <span 
                  className="px-3 py-1 text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  style={{ backgroundColor: selectedDomain.color }}
                >
                  {selectedDomain.categoryLabel}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-500">
                  REF // {selectedDomain.id.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl font-display font-black uppercase italic text-black">
                  {selectedDomain.title}
                </h3>
                <p className="text-sm font-bold text-[#4285F4] uppercase tracking-wider mt-1">
                  {selectedDomain.tagline}
                </p>
                <p className="text-sm font-semibold text-zinc-700 leading-relaxed mt-3">
                  {selectedDomain.description}
                </p>
              </div>

              {/* Key Highlights */}
              <div className="p-5 bg-zinc-50 border-2 border-black space-y-3">
                <div className="text-xs font-black uppercase text-black font-mono flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-[#4285F4]" />
                  [ KEY LEARNING MILESTONES & WORKSHOP MODULES ]
                </div>
                <div className="space-y-2">
                  {selectedDomain.highlights.map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2.5 text-xs font-bold text-zinc-800">
                      <CheckCircle2 className="h-4 w-4 text-[#00AA44] shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs font-mono font-bold text-zinc-500">
                  STACK: {selectedDomain.techStack.join(" · ")}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedDomain(null)}
                    className="px-5 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                  >
                    CLOSE [✕]
                  </button>
                  <Link
                    href={`/domains/${selectedDomain.slug}`}
                    className="px-6 py-2.5 bg-[#FFE600] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center gap-1.5"
                  >
                    VIEW FULL ROADMAP <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
