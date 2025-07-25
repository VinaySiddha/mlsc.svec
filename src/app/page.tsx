import { getDeadline } from "@/app/actions";
import { ApplicationForm } from "@/components/application-form";
import { CountdownTimer } from "@/components/countdown-timer";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileSearch, LogIn, Menu, Clock, Users, Calendar, Mic } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

const events = [
  {
    title: "Innovate AI Hackathon",
    description: "A 24-hour hackathon focused on developing innovative AI-powered solutions to real-world problems. Participants collaborated in teams to build and present their projects.",
    image: "https://placehold.co/600x400.png",
    aiHint: "hackathon team"
  },
  {
    title: "Azure Cloud Workshop",
    description: "An interactive workshop where members learned the fundamentals of cloud computing with Microsoft Azure. It covered virtual machines, storage, and serverless functions.",
    image: "https://placehold.co/600x400.png",
    aiHint: "cloud workshop"
  },
  {
    title: "Data Science Bootcamp",
    description: "A week-long intensive bootcamp on data science and machine learning. Topics included data analysis, visualization, and building predictive models with Python.",
    image: "https://placehold.co/600x400.png",
    aiHint: "data science"
  },
];

export default async function Home() {
  const { deadlineTimestamp } = await getDeadline();
  const isClosed = deadlineTimestamp ? new Date() > new Date(deadlineTimestamp) : false;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              MLSC SVEC
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/status">
                <FileSearch />
                <span>Check Status</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                <LogIn />
                <span>Admin Login</span>
              </Link>
            </Button>
          </nav>
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/status">
                    <FileSearch className="mr-2" />
                    <span>Check Status</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <LogIn className="mr-2" />
                    <span>Admin Login</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-card/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
                  Build the Future of Tech with MLSC 3.0
                </h1>
                <p className="max-w-[600px] text-lg text-muted-foreground">
                  We are a community of innovators, thinkers, and creators at SVEC. Join us to learn, build, and grow your skills in technology and beyond.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                   <Button asChild size="lg">
                    <Link href="#apply">Apply Now</Link>
                  </Button>
                </div>
                {deadlineTimestamp && <CountdownTimer deadline={deadlineTimestamp} />}
              </div>
              <div className="w-full flex justify-center">
                <Image
                  src="/logo.png"
                  data-ai-hint="logo"
                  width={400}
                  height={400}
                  alt="Microsoft Learn Student Club (MLSC) SVEC Logo"
                  className="rounded-full object-contain shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="w-full py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">About MLSC SVEC</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        The Microsoft Learn Student Club (MLSC) at Sri Vasavi Engineering College is a dynamic community dedicated to fostering a culture of continuous learning and innovation. We empower students with technical skills, leadership qualities, and a collaborative spirit to tackle real-world challenges. Through workshops, hackathons, and projects, we bridge the gap between academic knowledge and industry demands.
                    </p>
                </div>
            </div>
        </section>

        {/* Events Section */}
        <section className="w-full py-20 md:py-28 bg-card/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="space-y-12">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Past Events</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl">
                            We host a variety of events to help our members learn, grow, and connect.
                        </p>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => (
                          <Card key={event.title} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                              <CardHeader>
                                  <Image 
                                    src={event.image} 
                                    alt={event.title} 
                                    width={600} 
                                    height={400} 
                                    className="rounded-t-lg object-cover" 
                                    data-ai-hint={event.aiHint}
                                  />
                                  <CardTitle className="pt-4">{event.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <p className="text-muted-foreground">{event.description}</p>
                              </CardContent>
                          </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Application Form Section */}
        <section id="apply" className="w-full py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl">Application Form</CardTitle>
                <CardDescription>
                  {isClosed
                    ? "Submissions are now closed. Thank you for your interest."
                    : "Complete the form to apply for a role at MLSC."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isClosed ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-lg">
                    <Clock className="h-16 w-16 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Registrations are closed</h3>
                    <p className="text-muted-foreground mt-2">
                      We are no longer accepting applications. Follow us for future announcements.
                    </p>
                  </div>
                ) : (
                  <ApplicationForm />
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 border-t">
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
                          <li><Link href="#about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                          <li><Link href="#events" className="text-muted-foreground hover:text-primary">Events</Link></li>
                          <li><Link href="#apply" className="text-muted-foreground hover:text-primary">Apply</Link></li>
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
