
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Book, Code } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
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
             <Link href="/projects" className="text-gray-300 hover:text-white transition-colors">Projects</Link>
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
                                <Link href="/projects" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                    <Code className="h-5 w-5" /> Projects
                                </Link>
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

      <main className="flex-1 bg-gray-900 text-white">
        <section id="about" className="w-full py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">About <span className="text-blue-400">MLSC SVEC</span></h2>
                    <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        The Microsoft Learn Student Club (MLSC) at Sri Vasavi Engineering College is a dynamic community dedicated to fostering a culture of continuous learning and innovation. We empower students with technical skills, leadership qualities, and a collaborative spirit to tackle real-world challenges. Through workshops, hackathons, and projects, we bridge the gap between academic knowledge and industry demands.
                    </p>
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
