
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Image } from "@/components/image";
import NextImage from "next/image";
import { format } from "date-fns";
import { getEvents } from "@/app/actions";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";

export const metadata: Metadata = {
  title: "Events — MLSC SVEC",
  description: "Explore upcoming and past events hosted by Microsoft Learn Student Club SVEC — workshops, hackathons, bootcamps, and more.",
  openGraph: {
    title: "Events — MLSC SVEC",
    description: "Explore upcoming and past events hosted by Microsoft Learn Student Club SVEC — workshops, hackathons, bootcamps, and more.",
    url: "https://mlscsvec.in/events",
  },
};

export const revalidate = 60;

const staticEvents = [
  {
    id: 'static-3',
    title: 'Blue Day',
    description: 'Blue Day',
    date: new Date('2025-01-25T00:00:00Z').toISOString(),
    listImage: '/blueday.png',
    registrationOpen: false,
  },
  {
    id: 'static-4',
    title: 'The Flask Edition',
    description: 'The Flask Edition',
    date: new Date('2025-02-06T00:00:00Z').toISOString(),
    listImage: '/flask.png',
    registrationOpen: false,
  },
  {
    id: 'static-2',
    title: 'Web development BootCamp',
    description: 'Web development BootCamp',
    date: new Date('2024-03-14T00:00:00Z').toISOString(),
    listImage: '/web.jpg',
    registrationOpen: false,
  },
  {
    id: 'static-1',
    title: 'Azure Cloud Workshop',
    description: 'Azure Cloud Workshop',
    date: new Date('2023-10-18T00:00:00Z').toISOString(),
    listImage: '/azure.jpg',
    registrationOpen: false,
  },
];

export default async function EventsPage() {
  const result = await getEvents();
  const dynamicEvents = result.events || [];
  const combinedEvents = [...staticEvents, ...dynamicEvents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1">
        <section className="relative w-full py-40 md:py-60 text-center overflow-hidden border-b border-white/5">
            <div className="glow-sphere top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#EA4335]/10" />
            <div className="relative z-10 container mx-auto px-6">
                <div className="mb-8">
                    <span className="text-white/50 text-sm font-black uppercase tracking-[0.4em]">The Big Picture</span>
                </div>
                <h1 className="hero-heading">
                    OUR <br/> <span className="text-[#EA4335]">EVENTS.</span>
                </h1>
                <p className="max-w-2xl mx-auto mt-10 text-white/60 text-xl font-medium leading-relaxed">
                    We host a variety of high-impact events to help our members learn, grow, and lead.
                </p>
            </div>
        </section>

        <section className="py-24 md:py-40 container mx-auto px-6">
            {combinedEvents.length > 0 ? (
                <StaggerContainer className="grid gap-10">
                {combinedEvents.map((event: any) => (
                    <StaggerItem key={event.id}>
                    <div className="bento-card overflow-hidden flex flex-col lg:flex-row !p-0 h-full group hover:border-[#4285F4]/20 transition-all">
                        <div className="relative h-64 lg:h-auto lg:w-2/5 overflow-hidden">
                        <NextImage
                            src={event.listImage || event.bannerImage || '/images/event-placeholder.png'}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        />
                         <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60" />
                        </div>
                        <div className="p-10 lg:p-16 flex flex-col flex-1 lg:w-3/5">
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#4285F4] mb-6">
                            {event.date && !isNaN(new Date(event.date).getTime())
                            ? format(new Date(event.date), "MMM d • yyyy")
                            : "Date TBA"}
                        </p>
                        <h3 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic mb-6">{event.title}.</h3>
                        <p className="text-white/50 text-lg font-medium leading-relaxed mb-10 flex-1">{event.description}</p>
                        <Button asChild className="btn-primary w-fit px-12">
                            <Link href={`/events/${event.id}`}>
                                View Event
                            </Link>
                        </Button>
                        </div>
                    </div>
                    </StaggerItem>
                ))}
                </StaggerContainer>
            ) : (
                <ScrollReveal>
                <div className="text-center text-white/30 bento-card p-20">
                    <p className="text-xl font-bold uppercase tracking-widest italic">No upcoming events. Stay tuned.</p>
                </div>
                </ScrollReveal>
            )}
        </section>
      </main>
    </div>
  );
}
