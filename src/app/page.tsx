
import { getDeadline } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LogIn, Menu, Users, Calendar, Send, Group, Home as HomeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
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
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-40 lg:py-56">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
                Build the Future of Tech with MLSC 3.0
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
                We are a community of innovators, thinkers, and creators at SVEC. Join us to learn, build, and grow your skills in technology and beyond.
              </p>
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
