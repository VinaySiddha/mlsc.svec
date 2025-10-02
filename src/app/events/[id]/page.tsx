
import { getEventById } from "@/app/actions";
import { CountdownTimer } from "@/components/countdown-timer";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { Image } from "@/components/image";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function EventDetailPage({ params }: { params: { id: string }}) {
    const { event, error } = await getEventById(params.id);

    if (error || !event) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-transparent text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <MLSCLogo className="h-10 w-10 text-primary" />
                    <span className="text-xl font-bold tracking-tight">
                    Microsoft Learn Student Club
                    </span>
                </Link>
                <Button asChild variant="glass">
                    <Link href="/events"><ArrowLeft/> Back to Events</Link>
                </Button>
                </div>
            </header>

            <main className="flex-1">
                <section className="relative w-full h-[50vh] md:h-[60vh] text-white">
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        data-ai-hint="event banner"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="relative h-full flex flex-col justify-end p-4 md:p-8 lg:p-12">
                         <div className="container mx-auto">
                            <h1 className="text-4xl md:text-6xl font-bold [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">{event.title}</h1>
                         </div>
                    </div>
                </section>

                 <section className="w-full py-12 md:py-16">
                    <div className="container mx-auto grid md:grid-cols-3 gap-8 lg:gap-12">
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-2xl font-bold text-primary">About this event</h2>
                            <div className="prose prose-invert max-w-none text-muted-foreground">
                                <p>{event.description}</p>
                            </div>
                            <CountdownTimer deadline={event.date} />
                        </div>
                        <div className="space-y-6">
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle>Event Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-primary mt-1 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">Date & Time</h4>
                                            <p className="text-muted-foreground">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
                                            <p className="text-muted-foreground">{format(new Date(event.date), "h:mm a")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">Location</h4>
                                            <p className="text-muted-foreground">Online / SVEC Campus</p>
                                        </div>
                                    </div>
                                    {event.speakers && (
                                    <div className="flex items-start gap-3">
                                        <Users className="h-5 w-5 text-primary mt-1 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">Speakers</h4>
                                            <p className="text-muted-foreground">{event.speakers}</p>
                                        </div>
                                    </div>
                                    )}
                                </CardContent>
                            </Card>
                             <div className="pt-4">
                                <h3 className="text-xl font-bold mb-4">RSVP for this Event</h3>
                                <EventRegistrationForm eventId={event.id} registrationOpen={event.registrationOpen} />
                            </div>
                        </div>
                    </div>
                 </section>

            </main>
        </div>
    );
}
