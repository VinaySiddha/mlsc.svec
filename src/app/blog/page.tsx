
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Book, Code, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
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

      <main className="flex-1">
        <section id="blogs" className="w-full py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="glass-card p-8 md:p-12 flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our <span className="text-primary">Blogs</span></h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl">
                        Read our latest articles and updates.
                    </p>
                </div>
                <div className="grid gap-8 lg:gap-12">
                    <Card className="glass-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col lg:flex-row">
                        <div className="lg:w-2/5">
                            <Image 
                                src="/blog1.jpg" 
                                alt="Blog Post Image" 
                                width={600} 
                                height={400} 
                                className="rounded-t-lg lg:rounded-l-lg lg:rounded-t-none object-cover h-full w-full" 
                                data-ai-hint="tech event photo"
                            />
                        </div>
                        <div className="p-6 flex flex-col flex-1 lg:w-3/5">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <BookOpen className="h-6 w-6" />
                                <span className="font-semibold">Medium</span>
                            </div>
                            <CardTitle className="pt-2 text-2xl">
                                Unveiling Excellence: The Inauguration of the Microsoft Learn Student Club at Sri Vasavi Engineering College
                            </CardTitle>
                            <div className="mt-auto pt-4">
                               <Button asChild variant="glass">
                                <a href="https://link.medium.com/4aHNce3OlEb" target="_blank" rel="noopener noreferrer">Read More</a>
                               </Button>
                            </div>
                        </div>
                    </Card>
                </div>
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
