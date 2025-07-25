
import { getDeadline } from "@/app/actions";
import { ApplicationForm } from "@/components/application-form";
import { CountdownTimer } from "@/components/countdown-timer";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { FileSearch, Home, LogIn, Menu, Clock, Users, Calendar, Mic, Send, Group } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ApplyPage() {
  const { deadlineTimestamp } = await getDeadline();
  const isClosed = deadlineTimestamp ? new Date() > new Date(deadlineTimestamp) : false;

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
             <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
             <Link href="/#events" className="text-muted-foreground hover:text-foreground transition-colors">Events</Link>
             <Link href="/#team" className="text-muted-foreground hover:text-foreground transition-colors">Team</Link>
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
                                    <Home className="h-5 w-5" /> Home
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/#about" className="flex items-center gap-2 text-lg font-semibold">
                                    <Users className="h-5 w-5" /> About
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/#events" className="flex items-center gap-2 text-lg font-semibold">
                                    <Calendar className="h-5 w-5" /> Events
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/#team" className="flex items-center gap-2 text-lg font-semibold">
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
      
      {/* Main Content */}
      <main className="flex-1 py-12 md:py-20">
        {/* Application Form Section */}
        <section id="apply" className="w-full">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl">Application Form</CardTitle>
                <CardDescription>
                  {isClosed
                    ? "Submissions are now closed. Thank you for your interest."
                    : "Complete the form to apply for a role at MLSC."}
                </CardDescription>
                {deadlineTimestamp && !isClosed && <CountdownTimer deadline={deadlineTimestamp} />}
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
      <footer className="bg-card/50 border-t backdrop-blur-sm">
          <div className="container mx-auto py-8 px-4 md:px-6 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
          </div>
      </footer>
    </div>
  );
}
