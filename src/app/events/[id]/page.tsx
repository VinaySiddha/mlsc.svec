
import { getEventById } from "@/app/actions";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { MLSCLogo } from "@/components/icons";
import { Image } from "@/components/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { format } from "date-fns";
import { ArrowLeft, Book, Calendar, Code, Group, Home as HomeIcon, ImageIcon, LogIn, Menu, Mic, Send, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    
    // In a real app, you would fetch the event by ID.
    // For now, we use a placeholder. The static events will have to be migrated to the DB to be viewable.
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

            <main className="flex-1 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <Card className="glass-card max-w-4xl mx-auto overflow-hidden">
                        <Image src={event.image} alt={event.title} width={1200} height={400} className="w-full h-64 object-cover" data-ai-hint="event banner" />
                        <CardHeader>
                            <p className="text-sm text-primary font-medium">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
                            <CardTitle className="text-3xl md:text-4xl">{event.title}</CardTitle>
                            <CardDescription>{event.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             {event.speakers && (
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2 text-lg"><Mic className="h-5 w-5"/> Speakers</h3>
                                    <p className="text-muted-foreground mt-2">{event.speakers}</p>
                                </div>
                            )}

                            {event.highlightImages && Array.isArray(event.highlightImages) && event.highlightImages.length > 0 && (
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2 text-lg"><ImageIcon className="h-5 w-5"/> Highlights</h3>
                                    <Carousel className="w-full max-w-2xl mx-auto mt-4" opts={{loop: true}}>
                                        <CarouselContent>
                                        {event.highlightImages.map((img: string, index: number) => (
                                            <CarouselItem key={index}>
                                                <Image src={img} alt={`Highlight ${index + 1}`} width={800} height={450} className="rounded-lg object-cover" data-ai-hint="event highlight"/>
                                            </CarouselItem>
                                        ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                </div>
                            )}

                            <div className="pt-6 border-t border-border/50">
                                <h3 className="font-semibold text-xl mb-4 text-center">Register for this Event</h3>
                                <EventRegistrationForm eventId={event.id} registrationOpen={event.registrationOpen} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
