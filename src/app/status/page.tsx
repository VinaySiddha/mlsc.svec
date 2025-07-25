
import { MLSCLogo } from "@/components/icons";
import { StatusCheckForm } from "@/components/status-check-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home, User, Menu, Users, Calendar, Group, LogIn, Send } from "lucide-react";
import Link from "next/link";

export default function StatusPage() {
  return (
    <div className="flex flex-col min-h-screen">
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
                                    <Home className="h-5 w-5" /> Home
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
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Check Application Status</CardTitle>
            <CardDescription>
              Enter your reference ID to see the current status of your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusCheckForm />
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 px-4 sm:px-6 md:px-8 border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MLSC Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
