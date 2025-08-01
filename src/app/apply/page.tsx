
import { ApplicationForm } from "@/components/application-form";
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
    { href: "/blog", label: "Blog", icon: Book },
];

export default async function ApplyPage() {
  const isClosed = true;

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
      
      {/* Main Content */}
      <main className="flex-1 py-12 md:py-20">
        {/* Application Form Section */}
        <section id="apply" className="w-full">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="max-w-3xl mx-auto shadow-lg glass-card text-foreground">
              <CardHeader>
                <CardTitle className="text-3xl">Application Form</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {isClosed
                    ? "Submissions are now closed. Thank you for your interest."
                    : "Complete the form to apply for a role at MLSC."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isClosed ? (
                   <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/60 rounded-lg">
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
      <footer className="bg-background/60 backdrop-blur-sm border-t border-border/50 py-6">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
          </div>
      </footer>
    </div>
  );
}
