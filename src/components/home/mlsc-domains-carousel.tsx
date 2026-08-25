"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const DomainContent = ({
  description,
  image,
  slug,
}: {
  description: string;
  image: string;
  slug: string;
}) => {
  return (
    <div className="bg-white border-2 border-black p-8 md:p-14 shadow-[6px_6px_0px_0px_#000000] mb-4">
      <p className="text-zinc-800 text-base md:text-xl font-semibold max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
      <img
        src={image}
        alt="Domain illustration"
        className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-8 border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
      />
      <div className="mt-8 flex justify-center">
        <Link
          href={`/domains/${slug}`}
          className="inline-flex items-center gap-2 bg-[#FFE600] text-black font-black uppercase text-xs tracking-wider border-2 border-black px-6 py-3 shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
        >
          View Full Roadmap <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

const data = [
  {
    category: "Technical Domain",
    title: "GENERATIVE AI & LLMs",
    src: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=70&w=800&auto=format&fit=crop",
    content: (
      <DomainContent
        slug="generative-ai"
        description="Dive into the world of Large Language Models, prompt engineering, AI agents, and real-world GenAI deployments. Build the future with Microsoft Azure AI and Copilot."
        image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=70&w=800&auto=format&fit=crop"
      />
    ),
  },
  {
    category: "Technical Domain",
    title: "DATA SCIENCE & ML",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=70&w=800&auto=format&fit=crop",
    content: (
      <DomainContent
        slug="data-science"
        description="Master predictive analytics, neural networks, and machine learning pipelines. Work with real datasets and learn to build intelligent systems from scratch."
        image="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=70&w=800&auto=format&fit=crop"
      />
    ),
  },
  {
    category: "Technical Domain",
    title: "CLOUD & DEVOPS",
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=70&w=800&auto=format&fit=crop",
    content: (
      <DomainContent
        slug="cloud-devops"
        description="Learn Azure cloud architecture, CI/CD pipelines, containerization with Docker & Kubernetes, and enterprise-grade DevOps workflows."
        image="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=70&w=800&auto=format&fit=crop"
      />
    ),
  },
  {
    category: "Technical Domain",
    title: "WEB & APP DEVELOPMENT",
    src: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=70&w=800&auto=format&fit=crop",
    content: (
      <DomainContent
        slug="web-development"
        description="Build modern, scalable web applications using React, Next.js, and cutting-edge frontend tooling. From pixel-perfect UIs to full-stack deployments."
        image="https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=70&w=800&auto=format&fit=crop"
      />
    ),
  },
  {
    category: "Non-Technical Domain",
    title: "MEDIA & MARKETING",
    src: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=70&w=800&auto=format&fit=crop",
    content: (
      <DomainContent
        slug="media-marketing"
        description="Shape the MLSC brand through social media strategy, content creation, graphic design, and digital campaigns that reach thousands of students."
        image="https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?q=70&w=800&auto=format&fit=crop"
      />
    ),
  },
  {
    category: "Non-Technical Domain",
    title: "EVENTS & OPERATIONS",
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=70&w=800&auto=format&fit=crop",
    content: (
      <DomainContent
        slug="events-operations"
        description="Plan and execute world-class hackathons, workshops, and speaker sessions. The backbone of every successful MLSC event — logistics, coordination, and flawless execution."
        image="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=70&w=800&auto=format&fit=crop"
      />
    ),
  },
];

export function MLSCDomainsCarousel() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} layout={true} />
  ));

  return (
    <div className="w-full h-full py-4">
      <Carousel items={cards} />
    </div>
  );
}
