
'use client'

import { getEvents } from "@/app/actions";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Book, Code, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Image } from "@/components/image";
import { format } from "date-fns";
import { useEffect, useState } from "react";

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

const staticEvents = [
    {
        id: "1",
        title: "The Flask Edition",
        date: "2025-02-06",
        description: "An event focused on the Flask web framework, exploring its capabilities for building powerful web applications.",
        image: "/flask.png",
        registrationOpen: false,
    },
    {
        id: "2",
        title: "Blue Day",
        date: "2025-01-25",
        description: "A special day celebrating our club's identity and community spirit, declared as MLSC Day.",
        image: "/blue-day.png",
        registrationOpen: false,
    },
    {
        id: "3",
        title: "Web development BootCamp",
        date: "2024-03-14",
        description: "We are going organize an engaging Web Development workshop, providing students with hands-on experience in Basic Web technologies. Participants delved into the diverse functionalities of HTML,CSS and JavaScript, gaining valuable insights into Web technology. The workshop equipped attendees with practical skills and a mini project knowledge essential for the evolving landscape of modern IT infrastructure",
        image: "/web-bootcamp.png",
        registrationOpen: false,
    },
    {
        id: "4",
        title: "Azure Cloud Workshop",
        date: "2023-10-18",
        description: "Our college recently organized an engaging Azure workshop, providing students with hands-on experience in cloud computing. Participants delved into the diverse functionalities of Azure services, gaining valuable insights into cloud technology. The workshop equipped attendees with practical skills essential for the evolving landscape of modern IT infrastructure.",
        image: "/azure-workshop.png",
        registrationOpen: false,
    },
    {
        id: "5",
        title: "A Dive into Azure Ocean Challenge",
        date: "2023-12-16",
        description: "Start Date: December 16, 2023, End Date: December 24, 2023. Incredible prizes await! Register soon!!!",
        image: "/azure-ocean-challenge.png",
        registrationOpen: false,
    }
]


export default function EventsPage() {
    const [events, setEvents] = useState<any[]>(staticEvents);
    const [loading, setLoading] = useState(false);

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
                <Link href="/login"><LogIn/> Login</Link>
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
                                <Button asChild variant="glass" size="sm">
                                    <Link href="/login"><LogIn/> Login</Link>
                                </Button>
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
        <section id="events" className="w-full py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="space-y-12">
                     <div className="relative w-full py-20 md:py-28 text-center bg-cover bg-center mb-12 rounded-lg" style={{backgroundImage: "url('/team1.jpg')"}}>
                        <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
                        <div className="relative z-10 container mx-auto px-4">
                            <div className="glass-card inline-block p-8">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our <span className="text-primary">Events</span></h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl mt-4">
                                    We host a variety of events to help our members learn, grow, and connect.
                                </p>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                         <div className="text-center text-muted-foreground glass-card p-8">
                            <p>Loading events...</p>
                        </div>
                    ) : events.length > 0 ? (
                        <div className="grid gap-8 lg:gap-12">
                            {events.map((event: any) => (
                            <Card key={event.id} className="glass-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
                                <div className="md:w-1/3">
                                <Image 
                                    src={event.image || '/placeholder.jpg'} 
                                    alt={event.title} 
                                    width={600} 
                                    height={400} 
                                    className="rounded-t-lg md:rounded-l-lg md:rounded-t-none object-cover h-full w-full" 
                                    data-ai-hint="event photo"
                                />
                                </div>
                                <div className="p-6 flex flex-col flex-1 md:w-2/3">
                                    <p className="text-sm text-primary font-medium">{format(new Date(event.date), "MMMM d, yyyy")}</p>
                                    <CardTitle className="pt-2 text-2xl">{event.title}</CardTitle>
                                    <p className="text-muted-foreground mt-2 flex-1 line-clamp-3">{event.description}</p>
                                    
                                    <div className="mt-auto pt-6">
                                       <Button disabled>
                                          <Clock className="mr-2 h-4 w-4" />
                                          Registrations Closed
                                       </Button>
                                    </div>
                                </div>
                            </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground glass-card p-8">
                            <p>No upcoming events at the moment. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
      </main>

    </div>
  );
}

    