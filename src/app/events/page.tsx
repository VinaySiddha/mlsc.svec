
import { getEvents, registerForEvent } from "@/app/actions";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              MLSC SVEC
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
             <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
             <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
             <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">Events</Link>
             <Link href="/team" className="text-muted-foreground hover:text-foreground transition-colors">Team</Link>
             <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
             <Button asChild>
              <Link href="/apply">
                Apply
              </Link>
            </Button>
          </nav>
          <div className="sm:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <div className="p-4">
                        <nav className="flex flex-col gap-4">
                            <SheetClose asChild>
                                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                                    <HomeIcon className="h-5 w-5" /> Home
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/about" className="flex items-center gap-2 text-lg font-semibold">
                                    <Users className="h-5 w-5" /> About
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/events" className="flex items-center gap-2 text-lg font-semibold">
                                    <Calendar className="h-5 w-5" /> Events
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/team" className="flex items-center gap-2 text-lg font-semibold">
                                    <Group className="h-5 w-5" /> Team
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/login" className="flex items-center gap-2 text-lg font-semibold">
                                    <LogIn className="h-5 w-5" /> Login
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/apply" className="flex items-center gap-2 text-lg font-semibold">
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
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Events</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl">
                            We host a variety of events to help our members learn, grow, and connect.
                        </p>
                    </div>
                    {events.length > 0 ? (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                            <Card key={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-2 flex flex-col">
                                <CardHeader className="p-0">
                                    <Image 
                                        src={event.image} 
                                        alt={event.title} 
                                        width={600} 
                                        height={400} 
                                        className="rounded-t-lg object-cover aspect-[3/2]" 
                                        data-ai-hint="event photo"
                                    />
                                </CardHeader>
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <p className="text-sm text-primary font-medium">{format(new Date(event.date), "MMMM d, yyyy")}</p>
                                    <CardTitle className="pt-2 text-xl">{event.title}</CardTitle>
                                    <p className="text-muted-foreground mt-2 flex-1">{event.description}</p>
                                    <div className="mt-6">
                                       <EventRegistrationForm eventId={event.id} registrationOpen={event.registrationOpen} />
                                    </div>
                                </CardContent>
                            </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <p>No upcoming events at the moment. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
      </main>

       {/* Footer */}
      <footer className="bg-card/50 border-t backdrop-blur-sm">
          <div className="container mx-auto py-12 px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                      <div className="flex items-center gap-2">
                          <MLSCLogo className="h-8 w-8" />
                          <h3 className="text-xl font-bold">MLSC SVEC</h3>
                      </div>
                      <p className="text-muted-foreground">Fostering innovation and learning in the tech community at Sri Vasavi Engineering College.</p>
                  </div>
                  <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Quick Links</h4>
                      <ul className="space-y-2">
                          <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                          <li><Link href="/events" className="text-muted-foreground hover:text-primary">Events</Link></li>
                          <li><Link href="/team" className="text-muted-foreground hover:text-primary">Team</Link></li>
                          <li><Link href="/apply" className="text-muted-foreground hover:text-primary">Apply</Link></li>
                      </ul>
                  </div>
                  <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Contact Us</h4>
                      <p className="text-muted-foreground">Tadepalligudem, Andhra Pradesh, 534101</p>
                      <p className="text-muted-foreground">Email: mlscsvec@gmail.com</p>
                  </div>
              </div>
              <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                  <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
              </div>
          </div>
      </footer>
    </div>
  );
}
