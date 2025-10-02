
import { getEventById } from "@/app/actions";
import { CountdownTimer } from "@/components/countdown-timer";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { Image } from "@/components/image";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
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

            <main className="flex-1 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <Card className="max-w-4xl mx-auto glass-card overflow-hidden">
                        <Image
                            src={event.image}
                            alt={event.title}
                            width={1200}
                            height={400}
                            className="w-full h-64 object-cover"
                            data-ai-hint="event banner"
                        />
                        <CardHeader>
                            <CardTitle className="text-3xl">{event.title}</CardTitle>
                            <CardDescription className="text-base">
                                {format(new Date(event.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <CountdownTimer deadline={event.date} />
                            <div className="prose prose-invert max-w-none">
                                <p>{event.description}</p>
                            </div>
                            <div className="pt-4 border-t border-border/50">
                                <h3 className="text-xl font-bold mb-4">Register for this Event</h3>
                                <EventRegistrationForm eventId={event.id} registrationOpen={event.registrationOpen} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
