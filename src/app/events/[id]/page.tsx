
import { getEventById } from "@/app/actions";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Book, Code, ArrowLeft, Mic, List, Clock, Image as ImageIcon, Linkedin, Globe, Twitter, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Image } from "@/components/image";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CountdownTimer } from "@/components/countdown-timer";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

export default async function EventDetailPage({ params }: { params: { id: string }}) {
    const { event, error } = await getEventById(params.id);

    if (error || !event) {
        notFound();
    }
    
    const timelineItems = event.timeline?.split('\n').filter((item: string) => item.trim() !== '') || [];

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
                <div className="flex items-center gap-4">
                    <Button asChild variant="glass" size="sm">
                        <Link href="/events"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Events</Link>
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
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                    </div>
                </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="container mx-auto max-w-5xl py-8 px-4">
                    {/* Banner Image */}
                    {event.image && (
                        <div className="w-full h-64 relative mb-6">
                             <Image
                                src={event.image}
                                alt={`${event.title} banner`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg shadow-lg"
                                data-ai-hint="event banner"
                            />
                        </div>
                    )}
                    
                    {/* Event Title Section */}
                    <div className="glass-card p-6 mb-8">
                        <h1 className="text-4xl font-bold">{event.title}</h1>
                        <p className="text-md text-muted-foreground mt-2">
                             GDG On-Campus Sri Vasavi Engineering College - Tadepalligudem, India
                        </p>
                        <p className="text-md text-muted-foreground mt-2">
                             Join us for our very first GDG OnCampus SVEC Info Session, a dynamic 1-hour event that marks the beginning of an exciting...
                        </p>
                        <div className="flex items-center space-x-2 mt-4">
                            <Button variant="outline" size="icon" asChild>
                                <a href="#" target="_blank" rel="noopener noreferrer"><Globe className="h-5 w-5"/></a>
                            </Button>
                             <Button variant="outline" size="icon" asChild>
                                <a href="#" target="_blank" rel="noopener noreferrer"><Twitter className="h-5 w-5"/></a>
                            </Button>
                             <Button variant="outline" size="icon" asChild>
                                <a href="#" target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5"/></a>
                            </Button>
                              <Button variant="outline" size="icon" asChild>
                                <a href="#" target="_blank" rel="noopener noreferrer"><LinkIcon className="h-5 w-5"/></a>
                            </Button>
                        </div>
                    </div>
                    
                    {/* Date and RSVP Info */}
                    <div className="border-y border-border/50 py-4 mb-8">
                        <p className="text-foreground font-semibold">{format(new Date(event.date), "MMM d, h:mm a")} (GMT+5:30) &middot; {event.registrationOpen ? "Open" : "Closed"}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-2">KEY THEMES</h3>
                                <Badge variant="outline">Community Building</Badge>
                            </div>
                            
                            <div className="glass-card p-6">
                                <h2 className="text-2xl font-bold mb-4">About this event</h2>
                                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                            </div>

                             {timelineItems.length > 0 && (
                                <div className="glass-card p-6">
                                    <h2 className="text-2xl font-bold mb-6">What&apos;s Happening</h2>
                                    <div className="relative pl-6">
                                        <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                                        {timelineItems.map((item: string, index: number) => {
                                            const [time, ...textParts] = item.split('-');
                                            const text = textParts.join('-').trim();
                                            return (
                                                <div key={index} className="relative pl-8 mb-8 last:mb-0">
                                                    <div className="absolute -left-2.5 top-1 h-5 w-5 rounded-full bg-primary border-4 border-background"></div>
                                                    <p className="font-semibold text-primary">{time.trim()}</p>
                                                    <p className="text-muted-foreground">{text}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                             <div className="glass-card p-6">
                                <h2 className="text-2xl font-bold mb-4">Discussions</h2>
                                <div className="border rounded-lg p-6 text-center bg-background/50">
                                    <p className="text-muted-foreground">No discussions are currently posted</p>
                                    <Button variant="outline" className="mt-4">Login to add discussion</Button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Sidebar */}
                        <div className="md:col-span-1 space-y-8">
                           {Array.isArray(event.speakers) && event.speakers.length > 0 && (
                                <div className="glass-card p-6">
                                    <h2 className="text-2xl font-bold mb-4">Organizers</h2>
                                    <div className="space-y-4">
                                        {event.speakers.map((speaker: any, index: number) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <Image src={speaker.image || '/placeholder.jpg'} alt={speaker.name} width={48} height={48} className="rounded-full object-cover w-12 h-12" data-ai-hint="speaker portrait" />
                                                <div>
                                                    <h4 className="font-semibold">{speaker.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{speaker.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="sticky top-24 glass-card p-6">
                                <EventRegistrationForm eventId={event.id} registrationOpen={event.registrationOpen} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

    