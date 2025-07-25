
import { getDeadline } from "@/app/actions";
import { ApplicationForm } from "@/components/application-form";
import { CountdownTimer } from "@/components/countdown-timer";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { FileSearch, Home, LogIn, Menu, Clock, Users, Calendar, Mic, Send, Group, Book, Code } from "lucide-react";
import Link from "next/link";

const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
];

export default async function ApplyPage() {
  const { deadlineTimestamp } = await getDeadline();
  const isClosed = deadlineTimestamp ? new Date() > new Date(deadlineTimestamp) : false;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
       <header className="header sticky top-0 z-50 w-full border-b border-white/20 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <span className="text-xl font-bold tracking-tight">
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
      
      {/* Main Content */}
      <main className="flex-1 py-12 md:py-20">
        {/* Application Form Section */}
        <section id="apply" className="w-full">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="max-w-3xl mx-auto shadow-lg glass-card text-white">
              <CardHeader>
                <CardTitle className="text-3xl">Application Form</CardTitle>
                <CardDescription className="text-gray-300">
                  {isClosed
                    ? "Submissions are now closed. Thank you for your interest."
                    : "Complete the form to apply for a role at MLSC."}
                </CardDescription>
                {deadlineTimestamp && !isClosed && <CountdownTimer deadline={deadlineTimestamp} />}
              </CardHeader>
              <CardContent>
                {isClosed ? (
                   <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/60 rounded-lg">
                      <Clock className="h-16 w-16 text-cyan-400 mb-4" />
                      <h3 className="text-xl font-semibold">Registrations are closed</h3>
                      <p className="text-gray-400 mt-2">
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
      <footer className="footer bg-gray-900/50 border-t border-white/10 py-6">
          <div className="container mx-auto text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
          </div>
      </footer>
    </div>
  );
}
