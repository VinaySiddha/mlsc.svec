
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
                            </SheetContent>
                    </Sheet>
                    </div>
                </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Full-width Banner Section */}
                {event.image && (
                    <section className="relative w-full h-[40vh] md:h-[50vh] bg-black">
                        <Image
                            src={event.image}
                            alt={`${event.title} banner`}
                            layout="fill"
                            objectFit="cover"
                            className="opacity-50"
                            data-ai-hint="event banner"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                        <div className="absolute inset-0 flex items-end p-4 md:p-8">
                           <div className="max-w-4xl">
                                <h1 className="text-3xl md:text-5xl font-bold text-white [text-shadow:_0_2px_4px_rgb(0_0_0_/_60%)]">{event.title}</h1>
                                <p className="text-lg md:text-xl text-primary/80 mt-2 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                                     {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                <div className="container mx-auto max-w-6xl py-8 px-4">
                    <div className="text-center mb-8">
                         <CountdownTimer deadline={event.date} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><List className="h-5 w-5" /> About this event</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                                </CardContent>
                            </Card>

                             {timelineItems.length > 0 && (
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Event Timeline</CardTitle>
                                    </CardHeader>
                                    <CardContent>
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
                                    </CardContent>
                                </Card>
                            )}

                            {Array.isArray(event.highlightImages) && event.highlightImages.length > 0 && (
                                <Card className="glass-card">
                                     <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Event Gallery</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Carousel className="w-full">
                                            <CarouselContent>
                                                {event.highlightImages.map((img: string, index: number) => (
                                                <CarouselItem key={index}>
                                                    <Image src={img} alt={`Event highlight ${'${index+1}'}`} width={800} height={450} className="rounded-lg object-cover w-full aspect-video" data-ai-hint="event photo" />
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
                        
                        {/* Right Sidebar */}
                        <div className="md:col-span-1 space-y-8">
                           {Array.isArray(event.speakers) && event.speakers.length > 0 && (
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5"/> Speakers</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {event.speakers.map((speaker: any, index: number) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <Image src={speaker.image || '/placeholder.jpg'} alt={speaker.name} width={48} height={48} className="rounded-full object-cover w-12 h-12" data-ai-hint="speaker portrait" />
                                                <div>
                                                    <h4 className="font-semibold">{speaker.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{speaker.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
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
