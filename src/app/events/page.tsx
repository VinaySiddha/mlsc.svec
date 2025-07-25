
import { getEvents } from "@/app/actions";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Clock, Mic, Image as ImageIcon, Book, Code } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
];

export default async function EventsPage() {
    const { events, error } = await getEvents();

    if (error) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <h2 className="text-2xl font-bold text-destructive">Failed to load events</h2>
                <p className="text-muted-foreground">{error}</p>
                 <Button asChild variant="link" className="mt-4">
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
        )
    }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold tracking-tight">
              Microsoft Learn Student Club
            </span>
          </Link>
          <nav className="navbar hidden lg:flex items-center gap-6 text-sm font-medium">
             {navLinks.map(link => (
                 <Link key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors">{link.label}</Link>
             ))}
             <a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a>
             <a href="#" className="text-gray-300 hover:text-white transition-colors">Projects</a>
          </nav>
          <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-transparent border-gray-400 hover:bg-white/10">
                        <Menu />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-gray-900/90 border-r-gray-700/50 text-white">
                    <div className="p-4">
                        <nav className="flex flex-col gap-4">
                            {navLinks.map(link => (
                                <SheetClose key={link.href} asChild>
                                    <Link href={link.href} className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                        <link.icon className="h-5 w-5" /> {link.label}
                                    </Link>
                                </SheetClose>
                            ))}
                            <SheetClose asChild>
                                <a href="#" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                    <Book className="h-5 w-5" /> Blog
                                </a>
                            </SheetClose>
                            <SheetClose asChild>
                                <a href="#" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                    <Code className="h-5 w-5" /> Projects
                                </a>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/apply" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                    <Send className="h-5 w-5" /> Apply
                                </Link>
                            </SheetClose>
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section id="events" className="w-full py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="space-y-12">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our <span className="text-cyan-400">Events</span></h2>
                        <p className="max-w-[900px] text-gray-300 md:text-xl">
                            We host a variety of events to help our members learn, grow, and connect.
                        </p>
                    </div>
                    {events.length > 0 ? (
                        <div className="grid gap-8 lg:gap-12">
                            {events.map((event: any) => (
                            <Card key={event.id} className="glass-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col lg:flex-row">
                                <div className="lg:w-1/3">
                                <Image 
                                    src={event.image} 
                                    alt={event.title} 
                                    width={600} 
                                    height={400} 
                                    className="rounded-t-lg lg:rounded-l-lg lg:rounded-t-none object-cover h-full w-full" 
                                    data-ai-hint="event photo"
                                />
                                </div>
                                <div className="p-6 flex flex-col flex-1 lg:w-2/3">
                                    <p className="text-sm text-cyan-400 font-medium">{format(new Date(event.date), "MMMM d, yyyy")}</p>
                                    <CardTitle className="pt-2 text-2xl">{event.title}</CardTitle>
                                    <p className="text-gray-300 mt-2 flex-1">{event.description}</p>
                                    
                                    {event.bannerLink && (
                                        <div className="mt-4">
                                             <Button asChild variant="secondary">
                                                <a href={event.bannerLink} target="_blank" rel="noopener noreferrer">View Event Banner</a>
                                             </Button>
                                        </div>
                                    )}

                                    {event.speakers && (
                                        <div className="mt-4">
                                            <h4 className="font-semibold flex items-center gap-2"><Mic className="h-5 w-5"/> Speakers</h4>
                                            <p className="text-gray-300">{event.speakers}</p>
                                        </div>
                                    )}

                                    {event.highlightImages && event.highlightImages.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-semibold flex items-center gap-2"><ImageIcon className="h-5 w-5"/> Highlights</h4>
                                            <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-md mt-2" opts={{loop: true}}>
                                              <CarouselContent>
                                                {event.highlightImages.map((img: string, index: number) => (
                                                  <CarouselItem key={index}>
                                                      <Image src={img} alt={`Highlight ${index + 1}`} width={400} height={300} className="rounded-lg object-cover" data-ai-hint="event highlight"/>
                                                  </CarouselItem>
                                                ))}
                                              </CarouselContent>
                                              <CarouselPrevious />
                                              <CarouselNext />
                                            </Carousel>
                                        </div>
                                    )}

                                    <div className="mt-6">
                                       <EventRegistrationForm eventId={event.id} registrationOpen={event.registrationOpen} />
                                    </div>
                                </div>
                            </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <p>No upcoming events at the moment. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
      </main>

       {/* Footer */}
      <footer className="bg-background/60 backdrop-blur-sm border-t border-border/50 py-6">
          <div className="container mx-auto text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
          </div>
      </footer>
    </div>
  );
}
