import type { Metadata } from "next";
import { getEvents } from "@/app/actions";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Sparkles } from "lucide-react";
import { InteractiveCalendar } from "@/components/interactive-calendar";

export const metadata: Metadata = {
  title: "Schedule — MLSC SVEC",
  description: "View the calendar of upcoming events, workshops, and meetups organized by Microsoft Learn Student Club SVEC.",
};

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

const staticEvents = [
    { title: 'Blue Day', date: new Date('2025-01-25') },
    { title: 'The Flask Edition', date: new Date('2025-02-06') },
    { title: 'Web Bootcamp', date: new Date('2024-03-14') },
    { title: 'Azure Workshop', date: new Date('2023-10-18') },
];

export default async function SchedulePage() {
  const result = await getEvents();
  const dynamicEvents = result.events || [];
  
  const allEvents = [
    ...staticEvents.map(e => ({ 
        id: e.title, 
        title: e.title, 
        dateStr: e.date.toISOString(), 
        description: "A past hallmark event by Microsoft Learn Student Club SVEC.",
        location: "SVEC Campus" 
    })),
    ...dynamicEvents.map((e: any) => ({ 
        id: e.id, 
        title: e.title, 
        dateStr: new Date(e.date).toISOString(),
        description: e.description || "",
        location: e.location || "SVEC Campus"
    }))
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1">
        {/* ── Hero section ── */}
        <section className="relative w-full pt-36 pb-12 overflow-hidden">
          <div className="glow-sphere top-[-5%] right-[-5%] w-[45%] h-[45%] bg-[#4285F4]/10 pointer-events-none" />
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-xs font-semibold tracking-wider text-white/50 mb-6 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#4285F4]" /> Community Timeline
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] uppercase italic">
                Event <span className="text-[#4285F4]">Calendar.</span>
              </h1>
              <p className="mt-8 text-white/40 text-lg font-medium max-w-2xl leading-relaxed">
                Track the heartbeat of our community. Discover upcoming workshops, hackathons, and innovation sessions organized by Microsoft Learn Student Club SVEC.
              </p>
            </div>
          </div>
        </section>

        {/* ── Calendar / Event Section ── */}
        <section className="container mx-auto px-6 pb-32">
            <ScrollReveal>
                <InteractiveCalendar initialEvents={allEvents} />
            </ScrollReveal>
        </section>
      </main>
    </div>
  );
}
