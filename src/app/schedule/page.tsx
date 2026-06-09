import type { Metadata } from "next";
import { getEvents } from "@/app/actions";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    ...staticEvents.map(e => ({ ...e, id: e.title, description: undefined, location: "SVEC Campus" })),
    ...dynamicEvents.map((e: any) => ({ 
        id: e.id, 
        title: e.title, 
        date: new Date(e.date),
        description: e.description,
        location: e.location || "SVEC Campus"
    }))
  ];

  const now = new Date();
  const currentMonth = startOfMonth(now);
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1">
        <section className="relative w-full py-24 md:py-40 text-center overflow-hidden border-b border-white/5">
            <div className="glow-sphere top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4285F4]/10" />
            <div className="container mx-auto px-6 relative z-10">
                <h1 className="hero-heading">
                    EVENT <br/> <span className="text-[#4285F4]">CALENDAR.</span>
                </h1>
                <p className="max-w-xl mx-auto mt-8 text-white/50 text-xl font-medium leading-relaxed">
                    Track the heartbeat of our community. Discover upcoming workshops, hackathons, and innovation sessions.
                </p>
            </div>
        </section>

        <section className="py-24 md:py-40 container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Calendar View */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">{format(now, 'MMMM yyyy')}.</h2>
                        <div className="flex gap-4">
                             <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5 disabled:opacity-30" disabled>
                                <ChevronLeft className="h-5 w-5" />
                             </Button>
                             <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5 disabled:opacity-30" disabled>
                                <ChevronRight className="h-5 w-5" />
                             </Button>
                        </div>
                    </div>

                    <div className="bento-card !p-0 overflow-hidden border-white/5 bg-[#050505]">
                        <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-4 text-center text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/40">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7">
                            {days.map((day, i) => {
                                const dayEvents = allEvents.filter(e => isSameDay(e.date, day));
                                return (
                                    <div key={i} className={cn(
                                        "min-h-[120px] p-4 border-r border-b border-white/5 transition-all group hover:bg-white/[0.02]",
                                        !isSameDay(day, now) && "opacity-80"
                                    )}>
                                        <span className={cn(
                                            "text-sm font-black tracking-tighter",
                                            isToday(day) ? "text-[#4285F4]" : "text-white/40"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        <div className="mt-4 space-y-1">
                                            {dayEvents.map((event, j) => (
                                                <div key={j} className="h-1.5 w-full rounded-full bg-[#4285F4] shadow-[0_0_10px_rgba(66,133,244,0.5)]" title={event.title} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Event List */}
                <div className="space-y-12">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white/50">Upcoming.</h2>
                    <div className="space-y-6">
                        {allEvents.filter(e => e.date >= now).length > 0 ? (
                            allEvents.filter(e => e.date >= now).sort((a,b) => a.date.getTime() - b.date.getTime()).map((event, i) => (
                                <div key={i} className="bento-card p-8 border-white/5 hover:border-[#4285F4]/30 group transition-all">
                                    <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#4285F4] mb-4">
                                        {format(event.date, 'MMM d • h:mm a')}
                                    </p>
                                    <h3 className="text-xl font-black tracking-tighter uppercase mb-4">{event.title}.</h3>
                                    <div className="flex items-center gap-3 text-white/40 text-xs font-bold uppercase tracking-widest">
                                        <MapPin className="h-4 w-4" />
                                        {event.location || "Online"}
                                    </div>
                                    <Button asChild variant="ghost" className="text-[#4285F4] p-0 font-black uppercase tracking-[0.2em] mt-8 hover:no-underline hover:bg-transparent group-hover:translate-x-2 transition-transform">
                                        <Link href={`/events/${event.id}`}>Details →</Link>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="bento-card p-12 text-center border-white/5">
                                <p className="text-white/30 font-black uppercase italic tracking-widest text-xs">No imminent events scheduled.</p>
                            </div>
                        )}
                        
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white/50 pt-12">Past Highlights.</h2>
                         {allEvents.filter(e => e.date < now).slice(0, 3).map((event, i) => (
                             <div key={i} className="flex items-center gap-6 p-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <CalendarIcon className="h-5 w-5 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-white/30">{format(event.date, 'MMMM yyyy')}</p>
                                    <h4 className="font-bold tracking-tight">{event.title}</h4>
                                </div>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
