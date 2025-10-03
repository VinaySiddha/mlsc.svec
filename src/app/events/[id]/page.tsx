
import { getEventById } from "@/app/actions";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { MLSCLogo } from "@/components/icons";
import { Image } from "@/components/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { format } from "date-fns";
import { ArrowLeft, Book, Calendar, Code, Group, Home as HomeIcon, LogIn, Menu, Mic, Send, Users, Clock, MapPin, ListChecks, UserCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountdownTimer } from "@/components/countdown-timer";

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const { event, error } = await getEventById(params.id);

    if (error || !event) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-transparent text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <MLSCLogo className="h-10 w-10 text-primary" />
                    <span className="text-xl font-bold tracking-tight">
                    Microsoft Learn Student Club
                    </span>
                </Link>
                <nav className="navbar hidden lg:flex items-center gap-6 text-sm font-medium">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
                    ))}
                    <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Button asChild variant="glass" size="sm" className="hidden lg:flex">
                        <Link href="/events"><ArrowLeft/> All Events</Link>
                    </Button>
                    <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="bg-transparent border-border hover:bg-background/80">
                                <Menu />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="glass-card">
                            <div className="p-4">
                                <nav className="flex flex-col gap-4">
                                    {navLinks.map(link => (
                                        <SheetClose key={link.href} asChild>
                                            <Link href={link.href} className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                                <link.icon className="h-5 w-5" /> {link.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                    <SheetClose asChild>
                                        <Link href="/projects" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                            <Code className="h-5 w-5" /> Projects
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link href="/apply" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                            <Send className="h-5 w-5" /> Apply
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link href="/login" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                        <LogIn className="h-5 w-5" /> Login
                                        </Link>
                                    </SheetClose>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                    </div>
                </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="relative w-full h-[50vh] min-h-[300px] text-white">
                    <Image src={event.bannerImage} alt={event.title} layout="fill" objectFit="cover" className="brightness-50" data-ai-hint="event banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="relative h-full flex flex-col justify-end p-4 md:p-8 container mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold [text-shadow:_0_2px_4px_rgb(0_0_0_/_60%)]">{event.title}</h1>
                    </div>
                </section>
                
                <div className="container mx-auto p-4 -mt-16 md:-mt-8 relative z-10">
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
                                                <Image src={speaker.image} alt={speaker.name} width={100} height={100} className="rounded-full mx-auto mb-3 object-cover" data-ai-hint="speaker portrait"/>
                                                <p className="font-semibold">{speaker.name}</p>
                                                <p className="text-sm text-primary">{speaker.title}</p>
                                            </Card>
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
                                            <Calendar className="h-5 w-5 text-primary mt-0.5"/>
                                            <p>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-primary mt-0.5"/>
                                            <p>{event.time}</p>
                                        </div>
                                         <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-primary mt-0.5"/>
                                            <p>{event.venue}</p>
                                        </div>
                                         <div className="flex items-start gap-3">
                                            <UserCheck className="h-5 w-5 text-primary mt-0.5"/>
                                            <p>{event.registrationCount} registered</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle>RSVP</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {event.registrationDeadline && <CountdownTimer deadline={event.registrationDeadline} />}
                                        <EventRegistrationForm eventId={event.id} registrationOpen={event.registrationOpen} deadline={event.registrationDeadline} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

    