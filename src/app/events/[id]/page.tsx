
import type { Metadata } from "next";
import Link from "next/link";
import { getEventById } from "@/app/actions";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { Image } from "@/components/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Mic, Clock, MapPin, ListChecks, UserCheck, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CountdownTimer } from "@/components/countdown-timer";

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    if (resolvedParams.id.startsWith('static-')) {
        const event = staticEventsData[resolvedParams.id];
        return {
            title: event ? `${event.title} — MLSC SVEC` : "Event — MLSC SVEC",
            description: event?.description || "View event details on MLSC SVEC.",
        };
    }
    const { event } = await getEventById(resolvedParams.id);
    if (!event) return { title: "Event Not Found — MLSC SVEC" };
    return {
        title: `${event.title} — MLSC SVEC`,
        description: event.description?.slice(0, 160) || "View event details on MLSC SVEC.",
        openGraph: {
            title: event.title,
            description: event.description?.slice(0, 160),
            images: event.bannerImage ? [{ url: event.bannerImage }] : undefined,
            url: `https://mlscsvec.com/events/${resolvedParams.id}`,
        },
    };
}

const staticEventsData: { [key: string]: any } = {
    'static-1': {
        title: 'Azure Cloud Workshop',
        description: 'An archived event about Azure Cloud.',
        date: new Date('2023-10-18T00:00:00Z'),
        bannerImage: '/azure.jpg',
    },
    'static-2': {
        title: 'Web development BootCamp',
        description: 'An archived event about Web Development.',
        date: new Date('2024-03-14T00:00:00Z'),
        bannerImage: '/web.jpg',
    },
    'static-3': {
        title: 'Blue Day',
        description: 'An archived event: Blue Day.',
        date: new Date('2025-01-25T00:00:00Z'),
        bannerImage: '/blueday.png',
    },
    'static-4': {
        title: 'The Flask Edition',
        description: 'An archived event about Flask.',
        date: new Date('2025-02-06T00:00:00Z'),
        bannerImage: '/flask.png',
    }
};

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    let event: any;
    let isStatic = false;

    if (resolvedParams.id.startsWith('static-')) {
        isStatic = true;
        event = staticEventsData[resolvedParams.id];
    } else {
        const { event: dynamicEvent, error } = await getEventById(resolvedParams.id);
        if (error || !dynamicEvent) {
            notFound();
        }
        event = dynamicEvent;
    }

    if (!event) {
        notFound();
    }


    return (
        <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden font-sans">
            {/* Ambient background glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <main className="flex-1 py-12 md:py-20 relative z-10">
                <div className="container mx-auto px-6 md:px-8 max-w-6xl space-y-8">
                    
                    {/* Navigation Header */}
                    <div className="flex items-center">
                        <Link 
                            href="/events"
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-2 hover:border-white/10 shadow-lg shadow-black/20"
                        >
                            <ArrowLeft className="h-4 w-4 text-indigo-400" /> Back to Events
                        </Link>
                    </div>

                    {/* Premium Hero Banner Section */}
                    <section className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-950/20 group">
                        <div className="aspect-[21/9] w-full relative overflow-hidden bg-[#0a0a0a]">
                            <Image
                                src={event.bannerImage || event.listImage}
                                alt={event.title}
                                width={1920}
                                height={820}
                                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                                priority
                                data-ai-hint="event banner"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col justify-end">
                            <div className="space-y-4 max-w-4xl">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    Featured Event
                                </span>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase italic tracking-tight text-white drop-shadow-2xl break-words">
                                    {event.title}
                                </h1>
                            </div>
                        </div>
                    </section>

                    {isStatic ? (
                        /* Archived Event View */
                        <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-md p-10 space-y-6">
                            <h2 className="text-xl font-bold uppercase tracking-tight text-yellow-400 italic">Archived Event</h2>
                            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        </div>
                    ) : (
                        /* Live Event View */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                            
                            {/* Left Column: Details & Program */}
                            <div className="lg:col-span-8 space-y-10">
                                
                                {/* About Section */}
                                <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.01] to-transparent backdrop-blur-md p-8 md:p-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                                    
                                    <h2 className="text-lg font-black uppercase tracking-wider text-white/90 border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span> About the Event
                                    </h2>
                                    <p className="text-white/75 text-[13px] leading-relaxed font-medium whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </div>

                                {/* Timeline Section */}
                                {Array.isArray(event.timeline) && event.timeline.length > 0 && (
                                    <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.01] to-transparent backdrop-blur-md p-8 md:p-10 shadow-2xl relative">
                                        <h2 className="text-lg font-black uppercase tracking-wider text-white/90 border-b border-white/5 pb-4 mb-8 flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> Event Schedule
                                        </h2>
                                        
                                        <div className="relative pl-6 border-l border-white/10 space-y-8 py-2">
                                            {event.timeline.map((item: any, index: number) => (
                                                <div key={index} className="relative group">
                                                    {/* Timeline node */}
                                                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border border-emerald-500/30 bg-black flex items-center justify-center group-hover:border-emerald-400 transition-colors">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    </div>
                                                    
                                                    {/* Schedule Card */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.01] group-hover:border-white/10 group-hover:bg-white/[0.02] transition-all">
                                                        <div className="shrink-0">
                                                            <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide">
                                                                {item.time}
                                                            </span>
                                                        </div>
                                                        <div className="text-white/80 text-xs font-semibold leading-relaxed">
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Speakers Section */}
                                {Array.isArray(event.speakers) && event.speakers.length > 0 && (
                                    <div className="space-y-6">
                                        <h2 className="text-lg font-black uppercase tracking-wider text-white/90 flex items-center gap-2 px-1">
                                            <span className="w-1.5 h-6 bg-[#FBBC05] rounded-full"></span> Featured Speakers
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            {event.speakers.map((speaker: any, index: number) => (
                                                <div 
                                                    key={index} 
                                                    className="rounded-2xl border border-white/[0.06] bg-[#050505] p-6 text-center hover:border-white/10 hover:bg-[#080808] transition-all relative overflow-hidden group"
                                                >
                                                    {/* Speaker border shine */}
                                                    <div className="absolute -inset-px bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
                                                    
                                                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full p-1 border border-white/10 group-hover:border-indigo-500/35 transition-colors overflow-hidden">
                                                        <Image 
                                                            src={speaker.image} 
                                                            alt={speaker.name} 
                                                            width={120} 
                                                            height={120} 
                                                            className="rounded-full w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                            data-ai-hint="speaker portrait" 
                                                        />
                                                    </div>
                                                    
                                                    <h3 className="font-extrabold text-sm text-white uppercase tracking-tight truncate">{speaker.name}</h3>
                                                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1 truncate">{speaker.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Gallery Section */}
                                {Array.isArray(event.highlightImages) && event.highlightImages.length > 0 && (
                                    <div className="space-y-6">
                                        <h2 className="text-lg font-black uppercase tracking-wider text-white/90 flex items-center gap-2 px-1">
                                            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span> Event Gallery
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {event.highlightImages.map((imgSrc: string, index: number) => (
                                                <div 
                                                    key={index} 
                                                    className="aspect-video relative rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all group"
                                                >
                                                    <Image 
                                                        src={imgSrc} 
                                                        alt={`Event highlight ${index + 1}`} 
                                                        layout="fill" 
                                                        objectFit="cover" 
                                                        className="hover:scale-[1.03] transition-transform duration-500 ease-out brightness-95 group-hover:brightness-100" 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: RSVP Sidebar */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="sticky top-24 space-y-6">
                                    
                                    {/* Event Meta Info Card */}
                                    <Card className="glass-card border border-white/[0.08] shadow-2xl relative overflow-hidden bg-black/50 backdrop-blur-md rounded-3xl p-6">
                                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                                        
                                        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 border-b border-white/5 pb-3 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-indigo-400" /> Event Details
                                        </h3>
                                        
                                        <div className="space-y-5">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                                                    <Calendar className="h-4 w-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase">Date</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                                                    <Clock className="h-4 w-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase">Timing</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{event.time}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase">Venue</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{event.venue}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-4 border-t border-white/5 pt-4">
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                                                    <UserCheck className="h-4 w-4 text-indigo-450" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase">Availability</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">
                                                        {event.registrationCount} Registered {event.registrationLimit > 0 && `(Limit: ${event.registrationLimit})`}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {event.registrationFee > 0 ? (
                                                <div className="flex items-center gap-3 border border-yellow-500/20 bg-yellow-500/5 p-3 rounded-2xl mt-4">
                                                    <span className="text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-md uppercase font-black tracking-widest shrink-0 animate-pulse">Paid Ticket</span>
                                                    <p className="text-xs font-black text-yellow-400 italic">₹{event.registrationFee} Entry Fee</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 border border-emerald-500/20 bg-emerald-500/5 p-3 rounded-2xl mt-4">
                                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md uppercase font-black tracking-widest shrink-0">Free Entry</span>
                                                    <p className="text-xs font-black text-emerald-400 italic">Free Admission</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    {/* RSVP Pass Card */}
                                    <Card className="glass-card border border-white/[0.08] shadow-2xl bg-black/50 backdrop-blur-md rounded-3xl p-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4 border-b border-white/5 pb-3 flex items-center gap-2">
                                            <UserCheck className="h-4 w-4 text-indigo-400" /> RSVP Registration
                                        </h3>
                                        <div className="space-y-4">
                                            {event.registrationDeadline && <CountdownTimer deadline={event.registrationDeadline} />}
                                            <EventRegistrationForm
                                                eventId={event.id}
                                                registrationOpen={event.registrationOpen}
                                                deadline={event.registrationDeadline}
                                                limit={event.registrationLimit}
                                                currentCount={event.registrationCount}
                                                seatLimits={event.seatLimits}
                                                registrationFee={event.registrationFee || 0}
                                            />
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
