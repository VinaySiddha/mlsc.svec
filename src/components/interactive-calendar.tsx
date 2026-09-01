"use client";

import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek,
  isSameMonth,
  parseISO
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Clock, 
  CalendarDays,
  ArrowRight,
  ExternalLink,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  dateStr: string;
  description?: string;
  location: string;
  category?: string;
  registrationLink?: string;
}

const colorBadges = [
  { bg: "bg-[#4285F4]", border: "border-black", text: "text-white" },
  { bg: "bg-[#FFE600]", border: "border-black", text: "text-black" },
  { bg: "bg-[#00FF66]", border: "border-black", text: "text-black" },
  { bg: "bg-[#EA4335]", border: "border-black", text: "text-white" }
];

export function InteractiveCalendar({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Parse event date strings back to Date objects
  const events = initialEvents.map(e => ({
    ...e,
    date: parseISO(e.dateStr)
  }));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const setToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Calculate calendar grid days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Events on the selected date
  const selectedDayEvents = selectedDate 
    ? events.filter(event => isSameDay(event.date, selectedDate))
    : [];

  // All upcoming events from today onwards
  const today = new Date();
  const upcomingEvents = events
    .filter(event => event.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Past events
  const pastEvents = events
    .filter(event => event.date < today)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Calendar Grid Section (2 columns on large screens) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Calendar Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000000]">
          <div className="flex items-center gap-3">
            <div className="p-2 border-2 border-black bg-[#FFE600] shadow-[2px_2px_0px_0px_#000000]">
              <CalendarDays className="h-5 w-5 text-black" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-black">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={setToday}
              className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] active:scale-95 transition-all"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-2 border-2 border-black bg-white hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000] active:scale-95 transition-all"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4 text-black" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 border-2 border-black bg-white hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000] active:scale-95 transition-all"
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4 text-black" />
            </button>
          </div>
        </div>

        {/* Calendar Grid Box */}
        <div className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000] overflow-hidden">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b-2 border-black bg-zinc-100">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div 
                key={day} 
                className={cn(
                  "py-3 text-center text-xs font-black uppercase tracking-wider text-black border-r-2 border-black last:border-r-0",
                  (idx === 0 || idx === 6) && "bg-zinc-200/60"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Cells Grid */}
          <div className="grid grid-cols-7">
            {gridDays.map((day, i) => {
              const dayEvents = events.filter(e => isSameDay(e.date, day));
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[85px] sm:min-h-[110px] p-2 sm:p-2.5 border-r-2 border-b-2 border-black transition-all text-left flex flex-col justify-between group outline-none relative",
                    (i + 1) % 7 === 0 && "border-r-0",
                    !isCurrentMonth && "bg-zinc-100/70 text-zinc-400",
                    isCurrentMonth && !isSelected && "bg-white hover:bg-zinc-50",
                    isSelected && "bg-[#FFE600]/30 ring-2 ring-inset ring-black"
                  )}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={cn(
                      "text-xs sm:text-sm font-black tracking-tight px-1.5 py-0.5 border-2",
                      isCurrentDay 
                        ? "border-black bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]"
                        : isSelected 
                          ? "border-black bg-black text-white" 
                          : isCurrentMonth 
                            ? "border-transparent text-black" 
                            : "border-transparent text-zinc-400"
                    )}>
                      {format(day, "d")}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-black uppercase tracking-tight bg-black text-white px-1 py-0.2 border border-black">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Markers / Badges */}
                  <div className="space-y-1 mt-2 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((event, idx) => {
                      const badge = colorBadges[idx % colorBadges.length];
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "text-[9px] sm:text-[10px] font-black uppercase truncate px-1 py-0.5 border border-black leading-tight",
                            badge.bg, badge.text
                          )}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-black text-black">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Details Panel (1 column) */}
      <div className="space-y-6">
        
        {/* 1. Selected Date Details Card */}
        <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <span className="text-xs font-black uppercase tracking-widest bg-[#FFE600] text-black px-2 py-0.5 border border-black">
              Selected Date
            </span>
            <span className="text-xs font-black font-mono">
              {selectedDate ? format(selectedDate, "EEE, MMM d, yyyy") : "None"}
            </span>
          </div>

          <div className="space-y-3">
            {selectedDate && selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event, idx) => {
                const badge = colorBadges[idx % colorBadges.length];
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={event.id}
                    className="border-2 border-black bg-zinc-50 p-4 space-y-3 shadow-[3px_3px_0px_0px_#000000]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border border-black", badge.bg, badge.text)}>
                        {event.category || "Event"}
                      </span>
                      <span className="text-[10px] font-black text-zinc-600 font-mono">
                        {format(event.date, "h:mm a")}
                      </span>
                    </div>

                    <h4 className="text-base font-black tracking-tight text-black uppercase">
                      {event.title}
                    </h4>

                    {event.description && (
                      <p className="text-xs text-zinc-700 font-medium line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-zinc-600 text-xs font-bold pt-1">
                      <MapPin className="h-3.5 w-3.5 text-black" />
                      <span>{event.location}</span>
                    </div>

                    <div className="pt-2">
                      <Button
                        asChild
                        className="w-full bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-9"
                      >
                        <Link href={`/events/${event.id}`}>
                          View Details & Register <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-black bg-zinc-50">
                <p className="text-zinc-600 font-black uppercase tracking-wider text-xs">
                  No events scheduled on this day.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Upcoming Schedule Highlights */}
        <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_0px_#4285F4] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <span className="text-xs font-black uppercase tracking-widest bg-[#4285F4] text-white px-2 py-0.5 border border-black">
              Upcoming Agenda
            </span>
            <span className="text-xs font-black font-mono">
              {upcomingEvents.length} Total
            </span>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedDate(event.date);
                    setCurrentMonth(event.date);
                  }}
                  className="p-3 border-2 border-black bg-zinc-50 hover:bg-[#FFE600]/20 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000000] flex items-start justify-between gap-2 group"
                >
                  <div className="space-y-1 min-w-0">
                    <h5 className="font-black text-xs uppercase tracking-tight text-black truncate group-hover:text-[#4285F4]">
                      {event.title}
                    </h5>
                    <p className="text-[10px] text-zinc-600 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-black" />
                      {format(event.date, "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform shrink-0 self-center" />
                </div>
              ))
            ) : (
              <p className="text-xs font-bold text-zinc-600">No imminent events scheduled at this moment.</p>
            )}
          </div>
        </div>

        {/* 3. Past Events Archive */}
        {pastEvents.length > 0 && (
          <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <span className="text-xs font-black uppercase tracking-widest bg-zinc-200 text-black px-2 py-0.5 border border-black">
                Past Archives
              </span>
            </div>

            <div className="space-y-2">
              {pastEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2.5 border border-black bg-zinc-50">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      {format(event.date, "MMMM yyyy")}
                    </p>
                    <h6 className="font-black text-xs uppercase text-black truncate">{event.title}</h6>
                  </div>
                  <Link href={`/events/${event.id}`} className="text-[10px] font-black uppercase text-[#4285F4] hover:underline">
                    Recap &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
