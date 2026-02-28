
import type { Metadata } from "next";
import { getEventById } from "@/app/actions";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { Image } from "@/components/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Mic, Clock, MapPin, ListChecks, UserCheck, Image as ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { CountdownTimer } from "@/components/countdown-timer";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    if (params.id.startsWith('static-')) {
        const event = staticEventsData[params.id];
        return {
            title: event ? `${event.title} — MLSC SVEC` : "Event — MLSC SVEC",
            description: event?.description || "View event details on MLSC SVEC.",
        };
    }
    const { event } = await getEventById(params.id);
    if (!event) return { title: "Event Not Found — MLSC SVEC" };
    return {
        title: `${event.title} — MLSC SVEC`,
        description: event.description?.slice(0, 160) || "View event details on MLSC SVEC.",
        openGraph: {
            title: event.title,
            description: event.description?.slice(0, 160),
            images: event.bannerImage ? [{ url: event.bannerImage }] : undefined,
            url: `https://mlscsvec.in/events/${params.id}`,
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

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    let event: any;
    let isStatic = false;

    if (params.id.startsWith('static-')) {
        isStatic = true;
        event = staticEventsData[params.id];
    } else {
        const { event: dynamicEvent, error } = await getEventById(params.id);
        if (error || !dynamicEvent) {
            notFound();
        }
        event = dynamicEvent;
    }

    if (!event) {
        notFound();
    }


    return (
        <div className="flex flex-col min-h-screen bg-transparent text-foreground">
            <main className="flex-1">
                <section className="relative w-full">
                    <Image
                        src={event.bannerImage || event.listImage}
                        alt={event.title}
                        width={1920}
                        height={1080}
                        className="w-full h-auto object-contain"
                        priority
                        data-ai-hint="event banner"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 container mx-auto">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg break-words max-w-full">{event.title}</h1>
                    </div>
                </section>

                <div className="container mx-auto p-4 relative z-10">
                    {isStatic ? (
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Archived Event</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{event.description}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle>About this event</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                                    </CardContent>
                                </Card>

                                {Array.isArray(event.timeline) && event.timeline.length > 0 && (
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><ListChecks /> Timeline</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {event.timeline.map((item: any, index: number) => (
                                                    <div key={index} className="flex gap-4">
                                                        <div className="font-semibold text-primary w-24 shrink-0">{item.time}</div>
                                                        <div className="text-muted-foreground">{item.description}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {Array.isArray(event.speakers) && event.speakers.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Mic /> Speakers</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            {event.speakers.map((speaker: any, index: number) => (
                                                <Card key={index} className="glass-card text-center p-4">
                                                    <Image src={speaker.image} alt={speaker.name} width={100} height={100} className="rounded-full mx-auto mb-3 object-cover" data-ai-hint="speaker portrait" />
                                                    <p className="font-semibold">{speaker.name}</p>
                                                    <p className="text-sm text-primary">{speaker.title}</p>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {Array.isArray(event.highlightImages) && event.highlightImages.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><ImageIcon /> Event Gallery</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {event.highlightImages.map((imgSrc: string, index: number) => (
                                                <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                                                    <Image src={imgSrc} alt={`Event highlight ${index + 1}`} layout="fill" objectFit="cover" className="hover:scale-105 transition-transform duration-300" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-1 space-y-6">
                                <div className="sticky top-20 space-y-6">
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle>Event Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                                                <p>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Clock className="h-5 w-5 text-primary mt-0.5" />
                                                <p>{event.time}</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                                <p>{event.venue}</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <UserCheck className="h-5 w-5 text-primary mt-0.5" />
                                                <p>{event.registrationCount} registered {event.registrationLimit > 0 && `/ ${event.registrationLimit}`}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle>RSVP</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {event.registrationDeadline && <CountdownTimer deadline={event.registrationDeadline} />}
                                            <EventRegistrationForm
                                                eventId={event.id}
                                                registrationOpen={event.registrationOpen}
                                                deadline={event.registrationDeadline}
                                                limit={event.registrationLimit}
                                                currentCount={event.registrationCount}
                                                seatLimits={event.seatLimits}
                                            />
                                        </CardContent>
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
