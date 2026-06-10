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
    MapPinned, 
    CalendarDays 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CalendarEvent {
    id: string;
    title: string;
    dateStr: string;
    description?: string;
    location: string;
}

const googleColors = [
    { bg: "bg-[#4285F4]", glow: "shadow-[0_0_10px_rgba(66,133,244,0.6)]", border: "border-[#4285F4]/30" },
    { bg: "bg-[#34A853]", glow: "shadow-[0_0_10px_rgba(52,168,83,0.6)]", border: "border-[#34A853]/30" },
    { bg: "bg-[#FBBC05]", glow: "shadow-[0_0_10px_rgba(251,188,5,0.6)]", border: "border-[#FBBC05]/30" },
    { bg: "bg-[#EA4335]", glow: "shadow-[0_0_10px_rgba(234,67,53,0.6)]", border: "border-[#EA4335]/30" }
];

export function InteractiveCalendar({ initialEvents }: { initialEvents: CalendarEvent[] }) {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // Parse event date strings back to Date objects once
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

    // Calculate grid days (including padding days from adjacent months to make complete weeks)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    // Events on the currently selected date
    const selectedDayEvents = selectedDate 
        ? events.filter(event => isSameDay(event.date, selectedDate))
        : [];

    // All upcoming events (from today onwards)
    const today = new Date();
    const upcomingEvents = events
        .filter(event => event.date >= today)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Past events highlights
    const pastEvents = events
        .filter(event => event.date < today)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 3);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Calendar Main Grid (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-[#4285F4]" />
                        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
                            {format(currentMonth, "MMMM yyyy")}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={setToday}
                            className="rounded-full border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider"
                        >
                            Today
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={prevMonth}
                            className="rounded-full border-white/10 hover:bg-white/5"
                        >
                            <ChevronLeft className="h-5 w-5 text-white" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={nextMonth}
                            className="rounded-full border-white/10 hover:bg-white/5"
                        >
                            <ChevronRight className="h-5 w-5 text-white" />
                        </Button>
                    </div>
                </div>

                {/* Calendar Grid Sheet */}
                <div className="bento-card !p-0 overflow-hidden border-white/5 bg-[#050505] shadow-2xl relative">
                    <div className="absolute -z-10 top-[20%] left-[20%] w-[60%] h-[60%] bg-[#4285F4]/3 blur-[100px] pointer-events-none" />
                    
                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01]">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div key={day} className="py-4 text-center text-[0.65rem] font-black uppercase tracking-[0.25em] text-white/40 border-r border-white/5 last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Cells */}
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
                                        "min-h-[110px] p-3 border-r border-b border-white/5 transition-all text-left flex flex-col justify-between hover:bg-white/[0.02] last:border-r-0 group outline-none relative",
                                        !isCurrentMonth && "bg-black/40 opacity-25 hover:opacity-50",
                                        isSelected && "bg-white/[0.03] border-white/10"
                                    )}
                                    style={{
                                        borderRight: (i + 1) % 7 === 0 ? "none" : undefined
                                    }}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <span className={cn(
                                            "text-xs font-black tracking-tight rounded-md px-1.5 py-0.5",
                                            isCurrentDay && "bg-[#4285F4]/10 text-[#4285F4] shadow-[0_0_15px_rgba(66,133,244,0.15)]",
                                            !isCurrentDay && isSelected && "text-white bg-white/10",
                                            !isCurrentDay && !isSelected && (isCurrentMonth ? "text-white/70" : "text-white/20")
                                        )}>
                                            {format(day, "d")}
                                        </span>
                                    </div>

                                    {/* Event Indicators */}
                                    <div className="flex flex-wrap gap-1.5 mt-4 w-full">
                                        {dayEvents.slice(0, 3).map((event, idx) => {
                                            const color = googleColors[idx % googleColors.length];
                                            return (
                                                <div 
                                                    key={event.id}
                                                    className={cn("h-2 w-2 rounded-full", color.bg, color.glow)}
                                                    title={event.title}
                                                />
                                            );
                                        })}
                                        {dayEvents.length > 3 && (
                                            <span className="text-[0.55rem] font-bold text-white/40">+{dayEvents.length - 3}</span>
                                        )}
                                    </div>

                                    {/* Selected Border Accent */}
                                    {isSelected && (
                                        <div className="absolute inset-0 border border-[#4285F4]/40 rounded-sm pointer-events-none shadow-[inset_0_0_10px_rgba(66,133,244,0.05)]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Previews / Info Panel (lg:col-span-1) */}
            <div className="space-y-10">
                {/* 1. Selected Day Events */}
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#4285F4] mb-4">
                        {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Selected Date"}
                    </h3>
                    <div className="space-y-4">
                        {selectedDate && selectedDayEvents.length > 0 ? (
                            selectedDayEvents.map((event, idx) => {
                                const color = googleColors[idx % googleColors.length];
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={event.id}
                                        className={cn(
                                            "bento-card p-6 border bg-[#0e0e0e]/50 backdrop-blur-md hover:bg-[#111111]/80 transition-all",
                                            color.border
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#4285F4]">
                                                {format(event.date, "h:mm a")}
                                            </span>
                                            <span className="text-[0.6rem] font-bold uppercase bg-white/5 px-2 py-0.5 rounded text-white/50">
                                                Active
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-black tracking-tight text-white uppercase mb-3">
                                            {event.title}
                                        </h4>
                                        {event.description && (
                                            <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-3">
                                                {event.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-wider mb-4">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>{event.location}</span>
                                        </div>
                                        <Button asChild size="sm" className="w-full rounded-xl bg-white text-black font-extrabold hover:bg-white/90 uppercase text-[10px] tracking-wider h-8">
                                            <Link href={`/events/${event.id}`}>View Details &rarr;</Link>
                                        </Button>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="bento-card p-8 text-center border-white/5 bg-[#0e0e0e]/20">
                                <p className="text-white/30 font-bold uppercase tracking-wider text-xs">No events scheduled on this day.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Upcoming Highlights */}
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4">
                        Upcoming Schedule
                    </h3>
                    <div className="space-y-4">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.slice(0, 3).map((event, idx) => (
                                <div 
                                    key={event.id}
                                    onClick={() => {
                                        setSelectedDate(event.date);
                                        setCurrentMonth(event.date);
                                    }}
                                    className="p-4 rounded-2xl border border-white/5 bg-[#0A0A0A]/40 hover:border-white/10 hover:bg-[#0A0A0A]/80 transition-all cursor-pointer flex items-start justify-between gap-4 group"
                                >
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm tracking-tight text-white uppercase group-hover:text-[#4285F4] transition-colors leading-snug">
                                            {event.title}
                                        </h4>
                                        <p className="text-white/40 text-[10px] font-semibold flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(event.date, "MMM d, yyyy • h:mm a")}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-white/30 group-hover:translate-x-1 transition-transform shrink-0 self-center" />
                                </div>
                            ))
                        ) : (
                            <p className="text-white/30 text-xs font-semibold">No imminent events scheduled.</p>
                        )}
                    </div>
                </div>

                {/* 3. Past Highlights */}
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4">
                        Past Highlights
                    </h3>
                    <div className="space-y-4">
                        {pastEvents.length > 0 ? (
                            pastEvents.map((event) => (
                                <div key={event.id} className="flex items-center gap-4 p-3 opacity-40 hover:opacity-100 transition-all">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                        <CalendarIcon className="h-4.5 w-4.5 text-white/40" />
                                    </div>
                                    <div>
                                        <p className="text-[0.55rem] font-bold uppercase tracking-wider text-white/30 leading-none mb-1">
                                            {format(event.date, "MMMM yyyy")}
                                        </p>
                                        <h4 className="font-bold tracking-tight text-xs text-white uppercase">{event.title}</h4>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white/20 text-xs">No records available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
