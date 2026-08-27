
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { format } from "date-fns";
import { getEvents } from "@/app/actions";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Events — MLSC SVEC",
  description: "Explore upcoming and past events hosted by Microsoft Learn Student Club SVEC — workshops, hackathons, bootcamps, and more.",
  openGraph: {
    title: "Events — MLSC SVEC",
    description: "Explore upcoming and past events hosted by Microsoft Learn Student Club SVEC — workshops, hackathons, bootcamps, and more.",
    url: "https://mlscsvec.com/events",
  },
};

export const dynamic = 'force-dynamic';

const staticEvents = [
  {
    id: 'static-3',
    title: 'Blue Day',
    description: 'A day celebrating the spirit of MLSC SVEC — packed with fun activities, tech challenges, and community bonding.',
    date: new Date('2025-01-25T00:00:00Z').toISOString(),
    listImage: '/blueday.png',
    category: 'Community',
    registrationOpen: false,
  },
  {
    id: 'static-4',
    title: 'The Flask Edition',
    description: 'A deep-dive workshop into Python Flask — building REST APIs, deploying apps, and understanding backend fundamentals.',
    date: new Date('2025-02-06T00:00:00Z').toISOString(),
    listImage: '/flask.png',
    category: 'Workshop',
    registrationOpen: false,
  },
  {
    id: 'static-2',
    title: 'Web Development BootCamp',
    description: 'An intensive bootcamp covering HTML, CSS, JavaScript, React and deployment — from zero to full-stack in two days.',
    date: new Date('2024-03-14T00:00:00Z').toISOString(),
    listImage: '/web.jpg',
    category: 'Bootcamp',
    registrationOpen: false,
  },
  {
    id: 'static-1',
    title: 'Azure Cloud Workshop',
    description: 'Hands-on introduction to Microsoft Azure — cloud fundamentals, virtual machines, storage, and real-world deployment.',
    date: new Date('2023-10-18T00:00:00Z').toISOString(),
    listImage: '/azure.jpg',
    category: 'Workshop',
    registrationOpen: false,
  },
];

const categoryColors: Record<string, string> = {
  Workshop: 'bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/20',
  Bootcamp: 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/20',
  Hackathon: 'bg-[#FBBC04]/15 text-[#FBBC04] border border-[#FBBC04]/20',
  Community: 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/20',
  default: 'bg-white/5 text-white/50 border border-white/10',
};

function EventCard({ event }: { event: any }) {
  const category = event.category || 'Workshop';
  const pillClass = categoryColors[category] || categoryColors.default;
  const dateStr = event.date && !isNaN(new Date(event.date).getTime())
    ? format(new Date(event.date), 'MMM d, yyyy')
    : 'Date TBA';

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <article className="bg-[#0e0e0e] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl h-full flex flex-col">

        {/* Image */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#111]">
          <NextImage
            src={event.listImage || event.bannerImage || '/images/event-placeholder.png'}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Category pill on image */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${pillClass}`}>
              {category}
            </span>
          </div>
          {/* Registration badge */}
          {event.registrationOpen && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#34A853] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Open
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          <h3 className="text-lg font-bold text-white tracking-tight leading-snug mb-2 group-hover:text-[#4285F4] transition-colors duration-200">
            {event.title}
          </h3>
          <p className="text-white/40 text-sm font-medium leading-relaxed flex-1 line-clamp-2">
            {event.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
            <span className="text-white/30 text-xs font-medium">{dateStr}</span>
            <span className="flex items-center gap-1 text-xs text-white/30 group-hover:text-[#4285F4] transition-colors duration-200 font-medium">
              View details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function FeaturedEventCard({ event }: { event: any }) {
  const category = event.category || 'Workshop';
  const pillClass = categoryColors[category] || categoryColors.default;
  const dateStr = event.date && !isNaN(new Date(event.date).getTime())
    ? format(new Date(event.date), 'MMM d, yyyy')
    : 'Date TBA';

  return (
    <Link href={`/events/${event.id}`} className="group block w-full">
      <article className="bg-[#0e0e0e] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 hover:shadow-2xl flex flex-col md:flex-row" style={{ minHeight: '320px' }}>

        {/* Image — left half */}
        <div className="relative w-full md:w-1/2 aspect-[16/10] md:aspect-auto overflow-hidden bg-[#111] shrink-0">
          <NextImage
            src={event.listImage || event.bannerImage || '/images/event-placeholder.png'}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute top-4 left-4 z-10">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${pillClass}`}>
              {category}
            </span>
          </div>
          {event.registrationOpen && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#34A853] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Registration Open
              </span>
            </div>
          )}
        </div>

        {/* Content — right half */}
        <div className="flex flex-col flex-1 p-8 md:p-10 justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 mb-4">{dateStr}</p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-white leading-tight mb-4 group-hover:text-[#4285F4] transition-colors duration-200">
              {event.title}
            </h3>
            <p className="text-white/40 text-sm font-medium leading-relaxed">
              {event.description}
            </p>
          </div>
          <div className="mt-8">
            <Button className="btn-primary w-fit gap-2">
              View Event <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function EventsPage() {
  const result = await getEvents();
  const dynamicEvents = (result.events || []).map((e: any) => ({
    ...e,
    category: e.category || 'Workshop',
  }));
  const combinedEvents = [...staticEvents, ...dynamicEvents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [featured, ...rest] = combinedEvents;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1">

        {/* ── Header ── */}
        <section className="pt-32 pb-16 container mx-auto px-6">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-4">
              Events & Changelog
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95] max-w-2xl">
              Latest events and updates from{" "}
              <span className="text-[#4285F4]">MLSC SVEC.</span>
            </h1>
          </ScrollReveal>
        </section>

        {/* ── Events Grid ── */}
        <section className="pb-32 container mx-auto px-6">
          {combinedEvents.length > 0 ? (
            <div className="flex flex-col gap-5">
              {/* Featured card — full width standalone row */}
              {featured && (
                <ScrollReveal>
                  <FeaturedEventCard event={featured} />
                </ScrollReveal>
              )}
              {/* Rest — 3-col grid */}
              {rest.length > 0 && (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((event: any) => (
                    <StaggerItem key={event.id} className="flex flex-col">
                      <EventCard event={event} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          ) : (
            <ScrollReveal>
              <div className="text-center text-white/30 border border-white/[0.07] rounded-2xl p-20">
                <p className="text-xl font-bold uppercase tracking-widest italic">No upcoming events. Stay tuned.</p>
              </div>
            </ScrollReveal>
          )}
        </section>

      </main>
    </div>
  );
}
