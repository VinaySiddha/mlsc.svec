import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
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

const categoryBadges: Record<string, { bg: string; text: string }> = {
  Workshop: { bg: 'bg-[#4285F4]', text: 'text-white' },
  Bootcamp: { bg: 'bg-[#00FF66]', text: 'text-black' },
  Hackathon: { bg: 'bg-[#FFE600]', text: 'text-black' },
  Community: { bg: 'bg-[#FF0055]', text: 'text-white' },
  default: { bg: 'bg-white', text: 'text-black' },
};

function EventCard({ event, index = 0 }: { event: any; index?: number }) {
  const category = event.category || 'Workshop';
  const badgeStyle = categoryBadges[category] || categoryBadges.default;
  const shadowOptions = [
    'shadow-[6px_6px_0px_0px_#4285F4]',
    'shadow-[6px_6px_0px_0px_#FFE600]',
    'shadow-[6px_6px_0px_0px_#00FF66]',
    'shadow-[6px_6px_0px_0px_#FF0055]'
  ];
  const shadow = shadowOptions[index % shadowOptions.length];

  const dateStr = event.date && !isNaN(new Date(event.date).getTime())
    ? format(new Date(event.date), 'MMM d, yyyy')
    : 'DATE TBA';

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <article className={`bg-white border-2 border-black ${shadow} transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] h-full flex flex-col`}>

        {/* Image */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-zinc-100 border-b-2 border-black">
          <NextImage
            src={event.listImage || event.bannerImage || '/images/event-placeholder.png'}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Category badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${badgeStyle.bg} ${badgeStyle.text}`}>
              {category}
            </span>
          </div>
          {/* Registration badge */}
          {event.registrationOpen && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00FF66] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <span className="h-2 w-2 rounded-full bg-black animate-ping" />
                OPEN
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 mb-2">
            [ {dateStr} ]
          </div>
          <h3 className="text-xl font-display font-black text-black tracking-tight leading-snug mb-2 uppercase group-hover:text-[#4285F4] transition-colors duration-200">
            {event.title}
          </h3>
          <p className="text-zinc-700 text-xs font-semibold leading-relaxed flex-1 line-clamp-2">
            {event.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t-2 border-black">
            <span className="text-[10px] font-mono uppercase text-zinc-600 tracking-wider font-bold">MLSC SVEC</span>
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black group-hover:text-[#4285F4] transition-colors">
              DETAILS <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function FeaturedEventCard({ event }: { event: any }) {
  const category = event.category || 'Workshop';
  const badgeStyle = categoryBadges[category] || categoryBadges.default;
  const dateStr = event.date && !isNaN(new Date(event.date).getTime())
    ? format(new Date(event.date), 'MMM d, yyyy')
    : 'DATE TBA';

  return (
    <Link href={`/events/${event.id}`} className="group block w-full">
      <article className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#4285F4] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-300 flex flex-col md:flex-row">

        {/* Image — left half */}
        <div className="relative w-full md:w-1/2 aspect-[16/10] md:aspect-auto overflow-hidden bg-zinc-100 md:border-r-2 border-b-2 md:border-b-0 border-black shrink-0 min-h-[260px]">
          <NextImage
            src={event.listImage || event.bannerImage || '/images/event-placeholder.png'}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute top-4 left-4 z-10">
            <span className={`inline-flex items-center px-3.5 py-1 text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${badgeStyle.bg} ${badgeStyle.text}`}>
              {category}
            </span>
          </div>
          {event.registrationOpen && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#00FF66] text-black text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <span className="h-2 w-2 rounded-full bg-black animate-ping" />
                REGISTRATION OPEN
              </span>
            </div>
          )}
        </div>

        {/* Content — right half */}
        <div className="flex flex-col flex-1 p-8 md:p-10 justify-between">
          <div>
            <div className="inline-block px-3 py-1 bg-[#FFE600] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-4">
              [ FEATURED EVENT // {dateStr} ]
            </div>
            <h3 className="text-3xl md:text-5xl font-display font-black tracking-tight text-black uppercase italic leading-none mb-4 group-hover:text-[#4285F4] transition-colors duration-200">
              {event.title}
            </h3>
            <p className="text-zinc-700 text-sm md:text-base font-semibold leading-relaxed">
              {event.description}
            </p>
          </div>
          <div className="mt-8">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] group-hover:bg-[#4285F4] group-hover:text-white transition-all">
              EXPLORE EVENT [↗]
            </span>
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
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1">

        {/* ── Header ── */}
        <section className="pt-32 pb-16 container mx-auto px-6 border-b-2 border-black bg-white">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-5">
              [ 01 // EVENTS & WORKSHOPS ]
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.88] max-w-4xl">
              LATEST EVENTS & <br />
              <span className="text-[#4285F4]">EXPERIENCES.</span>
            </h1>
            <p className="mt-6 text-zinc-700 text-base md:text-xl font-semibold max-w-xl leading-relaxed">
              Hands-on workshops, 24-hour hackathons, community meetups, and technical deep-dives hosted by MLSC SVEC.
            </p>
          </ScrollReveal>
        </section>

        {/* ── Events Grid ── */}
        <section className="py-20 container mx-auto px-6">
          {combinedEvents.length > 0 ? (
            <div className="flex flex-col gap-8">
              {/* Featured card */}
              {featured && (
                <ScrollReveal>
                  <FeaturedEventCard event={featured} />
                </ScrollReveal>
              )}
              {/* Rest grid */}
              {rest.length > 0 && (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((event: any, index: number) => (
                    <StaggerItem key={event.id} className="flex flex-col">
                      <EventCard event={event} index={index} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          ) : (
            <ScrollReveal>
              <div className="text-center text-black bg-white border-2 border-black p-20 shadow-[6px_6px_0px_0px_#4285F4]">
                <p className="text-xl font-display font-black uppercase tracking-widest italic">NO UPCOMING EVENTS. STAY TUNED.</p>
              </div>
            </ScrollReveal>
          )}
        </section>

      </main>
    </div>
  );
}
