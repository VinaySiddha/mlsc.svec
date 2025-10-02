

import { getEventById } from "@/app/actions";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Book, Code, ArrowLeft, Mic, List, Clock, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Image } from "@/components/image";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CountdownTimer } from "@/components/countdown-timer";
import { cn } from "@/lib/utils";

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
                        <Link href="/events"><ArrowLeft/> Back to Events</Link>
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
                {/* Banner Section */}
                <section className="relative h-64 md:h-96 w-full">
                    <Image
                        src={event.image || '/placeholder.jpg'}
                        alt={`${event.title} banner`}
                        layout="fill"
                        objectFit="cover"
                        className="opacity-40"
                        data-ai-hint="event banner"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold text-foreground">{event.title}</h1>
                        <p className="text-lg text-primary mt-2">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
                    </div>
                </section>
                
                {event.registrationOpen && (
                    <section className="py-8 bg-background/50">
                        <div className="container mx-auto px-4 md:px-6">
                            <CountdownTimer deadline={event.date} />
                        </div>
                    </section>
                )}


                {/* Event Details Section */}
                <section className="py-12">
                    <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle>About this Event</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                                </CardContent>
                            </Card>
                            
                            {event.speakers && event.speakers.length > 0 && (
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5"/> Speakers</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {event.speakers.map((speaker: any, index: number) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <Image src={speaker.image || '/placeholder.jpg'} alt={speaker.name} width={80} height={80} className="rounded-full object-cover w-20 h-20" data-ai-hint="speaker portrait" />
                                                <div>
                                                    <h4 className="font-semibold">{speaker.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{speaker.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                            
                             {timelineItems.length > 0 && (
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Timeline</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative pl-6">
                                            <div className="absolute left-9 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                                            {timelineItems.map((item: string, index: number) => {
                                                const [time, ...textParts] = item.split('-');
                                                const text = textParts.join('-').trim();
                                                return (
                                                    <div key={index} className="relative mb-8 pl-6">
                                                         <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(50%_+_1px)] w-4 h-4 rounded-full",
                                                            index === 0 ? "bg-primary" : "bg-muted"
                                                         )}></div>
                                                         <p className="font-bold text-primary">{time.trim()}</p>
                                                         <p className="text-muted-foreground">{text}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                             {event.highlightImages && event.highlightImages.length > 0 && (
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5"/> Gallery</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex justify-center">
                                        <Carousel className="w-full max-w-lg" opts={{loop: true}}>
                                            <CarouselContent>
                                                {event.highlightImages.map((img: string, index: number) => (
                                                <CarouselItem key={index}>
                                                    <Image src={img} alt={`Highlight ${index + 1}`} width={800} height={600} className="rounded-lg object-cover" data-ai-hint="event highlight"/>
                                                </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                    </CardContent>
                                </Card>
                            )}

                        </div>

                        <div className="md:col-span-1">
                            <Card className="glass-card sticky top-24">
                                <CardHeader>
                                    <CardTitle>Register for this Event</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <EventRegistrationForm eventId={event.id} registrationOpen={event.registrationOpen} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
