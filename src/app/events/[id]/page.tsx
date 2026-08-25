
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
        <div className="flex flex-col min-h-screen bg-white text-black relative font-sans">
            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-6 md:px-8 max-w-6xl space-y-8">
                    
                    {/* Navigation Header */}
                    <div className="flex items-center">
                        <Link 
                            href="/events"
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black bg-[#FFE600] border-2 border-black px-4 py-2 shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                            <ArrowLeft className="h-4 w-4 stroke-[3]" /> [ BACK TO EVENTS ]
                        </Link>
                    </div>

                    {/* Brutalist Hero Banner Section */}
                    <section className="relative w-full border-2 border-black bg-white shadow-[8px_8px_0px_0px_#4285F4] overflow-hidden">
                        <div className="aspect-[21/9] w-full relative overflow-hidden bg-zinc-100 border-b-2 border-black">
                            <Image
                                src={event.bannerImage || event.listImage}
                                alt={event.title}
                                width={1920}
                                height={820}
                                className="w-full h-full object-cover"
                                priority
                                data-ai-hint="event banner"
                            />
                        </div>
                        <div className="p-6 md:p-10 bg-white">
                            <div className="space-y-3 max-w-4xl">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                                    [ EVENT BRIEF ]
                                </div>
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black uppercase italic tracking-tight text-black break-words leading-[0.92]">
                                    {event.title}
                                </h1>
                            </div>
                        </div>
                    </section>

                    {isStatic ? (
                        /* Archived Event View */
                        <div className="max-w-3xl mx-auto border-2 border-black bg-white shadow-[6px_6px_0px_0px_#FFE600] p-8 md:p-10 space-y-4">
                            <div className="inline-block px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                                [ ARCHIVED EVENT ]
                            </div>
                            <p className="text-zinc-700 font-semibold text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        </div>
                    ) : (
                        /* Live Event View */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Left Column: Details & Program */}
                            <div className="lg:col-span-8 space-y-8">
                                
                                {/* About Section */}
                                <div className="border-2 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_#4285F4]">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-4">
                                        [ ABOUT THE EVENT ]
                                    </div>
                                    <h2 className="text-2xl font-display font-black uppercase italic tracking-tight text-black mb-4">
                                        OVERVIEW & DETAILS
                                    </h2>
                                    <p className="text-zinc-700 text-sm md:text-base leading-relaxed font-semibold whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </div>

                                {/* Timeline Section */}
                                {Array.isArray(event.timeline) && event.timeline.length > 0 && (
                                    <div className="border-2 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_#00FF66]">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00FF66] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-4">
                                            [ EVENT TIMELINE ]
                                        </div>
                                        <h2 className="text-2xl font-display font-black uppercase italic tracking-tight text-black mb-6">
                                            SCHEDULE & MILESTONES
                                        </h2>
                                        
                                        <div className="space-y-4">
                                            {event.timeline.map((item: any, index: number) => (
                                                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#F9F9FB] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                                                    <div className="shrink-0">
                                                        <span className="inline-block bg-[#00FF66] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000000]">
                                                            {item.time}
                                                        </span>
                                                    </div>
                                                    <div className="text-zinc-800 text-xs font-bold leading-relaxed">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Speakers Section */}
                                {Array.isArray(event.speakers) && event.speakers.length > 0 && (
                                    <div className="border-2 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_#FFE600]">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE600] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-4">
                                            [ SPEAKERS ]
                                        </div>
                                        <h2 className="text-2xl font-display font-black uppercase italic tracking-tight text-black mb-6">
                                            FEATURED SPEAKERS
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {event.speakers.map((speaker: any, index: number) => (
                                                <div 
                                                    key={index} 
                                                    className="border-2 border-black bg-[#F9F9FB] p-5 text-center shadow-[4px_4px_0px_0px_#000000]"
                                                >
                                                    <div className="relative w-20 h-20 mx-auto mb-3 border-2 border-black bg-zinc-200 overflow-hidden">
                                                        <Image 
                                                            src={speaker.image} 
                                                            alt={speaker.name} 
                                                            width={120} 
                                                            height={120} 
                                                            className="w-full h-full object-cover" 
                                                            data-ai-hint="speaker portrait" 
                                                        />
                                                    </div>
                                                    <h3 className="font-display font-black text-sm text-black uppercase tracking-tight truncate">{speaker.name}</h3>
                                                    <p className="text-[10px] text-zinc-700 font-black uppercase tracking-wider mt-1 truncate">{speaker.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Gallery Section */}
                                {Array.isArray(event.highlightImages) && event.highlightImages.length > 0 && (
                                    <div className="border-2 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_#FF0055]">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF0055] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-4">
                                            [ EVENT ARCHIVE ]
                                        </div>
                                        <h2 className="text-2xl font-display font-black uppercase italic tracking-tight text-black mb-6">
                                            HIGHLIGHT GALLERY
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {event.highlightImages.map((imgSrc: string, index: number) => (
                                                <div 
                                                    key={index} 
                                                    className="aspect-video relative overflow-hidden border-2 border-black bg-zinc-100 shadow-[3px_3px_0px_0px_#000000]"
                                                >
                                                    <Image 
                                                        src={imgSrc} 
                                                        alt={`Event highlight ${index + 1}`} 
                                                        layout="fill" 
                                                        objectFit="cover" 
                                                        className="hover:scale-105 transition-transform duration-300" 
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
                                    <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#4285F4]">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-5">
                                            [ KEY SPECIFICATIONS ]
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 bg-[#F9F9FB] border-2 border-black p-3 shadow-[2px_2px_0px_0px_#000000]">
                                                <div className="p-2 bg-[#4285F4] text-white border-2 border-black shrink-0">
                                                    <Calendar className="h-4 w-4 stroke-[2.5]" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">DATE</p>
                                                    <p className="text-xs font-black text-black uppercase mt-0.5">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-3 bg-[#F9F9FB] border-2 border-black p-3 shadow-[2px_2px_0px_0px_#000000]">
                                                <div className="p-2 bg-[#00FF66] text-black border-2 border-black shrink-0">
                                                    <Clock className="h-4 w-4 stroke-[2.5]" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">TIMING</p>
                                                    <p className="text-xs font-black text-black uppercase mt-0.5">{event.time}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-3 bg-[#F9F9FB] border-2 border-black p-3 shadow-[2px_2px_0px_0px_#000000]">
                                                <div className="p-2 bg-[#FFE600] text-black border-2 border-black shrink-0">
                                                    <MapPin className="h-4 w-4 stroke-[2.5]" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">VENUE</p>
                                                    <p className="text-xs font-black text-black uppercase mt-0.5">{event.venue}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-3 bg-[#F9F9FB] border-2 border-black p-3 shadow-[2px_2px_0px_0px_#000000]">
                                                <div className="p-2 bg-[#FF0055] text-white border-2 border-black shrink-0">
                                                    <UserCheck className="h-4 w-4 stroke-[2.5]" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">AVAILABILITY</p>
                                                    <p className="text-xs font-black text-black uppercase mt-0.5">
                                                        {event.registrationCount} REGISTERED {event.registrationLimit > 0 && `(LIMIT: ${event.registrationLimit})`}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {event.registrationFee > 0 ? (
                                                <div className="flex items-center justify-between border-2 border-black bg-[#FFE600] text-black p-3 shadow-[3px_3px_0px_0px_#000000]">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">[ PAID PASS ]</span>
                                                    <p className="text-sm font-black italic">₹{event.registrationFee} FEE</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between border-2 border-black bg-[#00FF66] text-black p-3 shadow-[3px_3px_0px_0px_#000000]">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">[ FREE PASS ]</span>
                                                    <p className="text-sm font-black italic">100% FREE ADMISSION</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* RSVP Pass Card */}
                                    <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#FFE600]">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE600] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-4">
                                            [ RSVP PORTAL ]
                                        </div>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
