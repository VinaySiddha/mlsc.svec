import type { Metadata } from "next";
import { getEvents } from "@/app/actions";
import { CalendarDays, Sparkles } from "lucide-react";
import { InteractiveCalendar } from "@/components/interactive-calendar";

export const metadata: Metadata = {
  title: "Event Schedule — MLSC SVEC",
  description: "View the official calendar of upcoming events, workshops, hackathons, and meetups organized by Microsoft Learn Student Club SVEC.",
};

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const result = await getEvents();
  const dynamicEvents = result.events || [];
  
  // Use exclusively real data from Firestore
  const allEvents = dynamicEvents.map((e: any) => ({ 
    id: e.id, 
    title: e.title, 
    dateStr: new Date(e.date).toISOString(),
    description: e.description || "",
    location: e.location || "SVEC Campus",
    category: e.category || "Workshop",
    registrationLink: e.registrationLink || ""
  }));

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 Event Dispatch — Real-Time Interactive Schedule
      </div>

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Hero Header */}
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-1.5 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase tracking-widest text-black">
              <CalendarDays className="h-4 w-4" /> [ COMMUNITY TIMELINE // LIVE DISPATCH ]
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.95] text-black">
              Event <br />
              <span className="text-[#4285F4]">Calendar.</span>
            </h1>

            <p className="text-zinc-700 text-sm sm:text-base font-bold max-w-2xl leading-relaxed">
              Track the heartbeat of MLSC SVEC. Discover upcoming technical bootcamps, hackathons, speaker sessions, and project showcases.
            </p>
          </div>

          {/* Interactive Calendar Component */}
          <section className="w-full">
            <InteractiveCalendar initialEvents={allEvents} />
          </section>

        </div>
      </main>
    </div>
  );
}
