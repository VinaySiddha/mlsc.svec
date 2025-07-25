
'use client';

import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LogIn, Menu, Users, Calendar, Send, Group, Home as HomeIcon, Book, Code } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
];

export default function Home() {

  useEffect(() => {
    const imageSlider = document.querySelector('.image-slider') as HTMLElement | null;
    if (!imageSlider) return;
    
    const images = imageSlider.querySelectorAll('img');
    let imageIndex = 0;
    const totalImages = images.length;

    if (totalImages <= 1) return;

    const intervalId = setInterval(() => {
        imageIndex = (imageIndex + 1) % totalImages;
        const translateValue = imageIndex * 100;
        if (imageSlider) {
          imageSlider.style.transition = 'transform 0.5s ease-in-out';
          imageSlider.style.transform = `translateX(-${translateValue}%)`;
        }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-foreground bg-background">
      {/* Header */}
      <header className="header sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 md:px-8">
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
             <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a>
             <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Projects</a>
             <Button asChild>
                <Link href="/apply">Apply Now</Link>
             </Button>
          </nav>
          <div className="lg:hidden">
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
                            {navLinks.map(link => (
                                <SheetClose key={link.href} asChild>
                                    <Link href={link.href} className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted">
                                        <link.icon className="h-5 w-5" /> {link.label}
                                    </Link>
                                </SheetClose>
                            ))}
                            <SheetClose asChild>
                                <a href="#" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted">
                                    <Book className="h-5 w-5" /> Blog
                                </a>
                            </SheetClose>
                             <SheetClose asChild>
                                <a href="#" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted">
                                    <Code className="h-5 w-5" /> Projects
                                </a>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/apply" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted">
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
        {/* Hero Section */}
        <section className="relative flex items-center justify-center text-center py-24 md:py-32 lg:py-48" style={{ backgroundImage: "url('/home.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            <div className="home-content container mx-auto px-4 md:px-8 relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-white">MLSC X <span className="text-primary-foreground/80">SVEC</span></h1>
                <div className="text-animate text-3xl md:text-4xl font-semibold my-4 text-white/90">
                    <h3>Learn-Train-Serve</h3>
                </div>
                <p className="max-w-2xl text-lg text-gray-200 mx-auto">
                    Microsoft Learn Student Club, is a Technical Club which is dedicated to elevating the coding culture 
                    at Sri Vasavi Engineering College, Tadepalligudem by mentoring to refine 
                    their critical thinking and logical reasoning making them unrivalled!
                </p>
                <div className="home-sci absolute bottom-16 right-8 flex-col gap-4 hidden md:flex">
                  <a href="https://whatsapp.com/channel/0029VaJiNv72ER6emJMEl41u" target="_blank" className="bg-background/80 p-2 rounded-full hover:bg-primary transition-colors"><Image src="/whatsapp.svg" alt="whatsapp" width={24} height={24} /></a>
                  <a href="https://www.instagram.com/mlsc.svec?igsh=MXNvandqbDJqdjhzOQ==" target="_blank" className="bg-background/80 p-2 rounded-full hover:bg-primary transition-colors"><Image src="/instagram.svg" alt="instagram" width={24} height={24} /></a>
                  <a href="https://www.linkedin.com/company/microsoft-learn-student-club-svec/" target="_blank" className="bg-background/80 p-2 rounded-full hover:bg-primary transition-colors"><Image src="/linkedin.svg" alt="linkedin" width={24} height={24} /></a>
                </div>
            </div>
        </section>
        
        {/* Ambassador Section */}
        <section className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-2">Meet Our <span className="text-primary">Ambassador!</span></h2>
                <div className="glass-card max-w-sm mx-auto p-6 flex flex-col items-center">
                    <Image src="https://placehold.co/400x400.png" alt="Chandu Image" width={120} height={120} className="object-cover rounded-full mb-4" data-ai-hint="person portrait"/>
                    <h3 className="text-2xl font-bold">Chandu Neelam</h3>
                    <h4 className="text-xl font-semibold text-primary my-1">MLSA</h4>
                    <p className="text-sm text-muted-foreground">Our pioneering MLSA leader, stands out with exceptional leadership and technical prowess.</p>
                </div>
            </div>
        </section>

        {/* About Us Section */}
        <section className="about py-20 bg-secondary/30">
            <div className="container mx-auto px-4 md:grid md:grid-cols-2 md:gap-12 items-center">
                <div className="image-container overflow-hidden rounded-lg shadow-lg mb-8 md:mb-0">
                    <div className="image-slider flex">
                        <Image src="https://placehold.co/600x400.png" alt="Team Image 1" width={600} height={400} className="w-full shrink-0" data-ai-hint="group photo"/>
                        <Image src="https://placehold.co/600x400.png" alt="Team Image 2" width={600} height={400} className="w-full shrink-0" data-ai-hint="people working"/>
                    </div>
                </div>
                <div className="about-content text-center md:text-left">
                    <h2 className="heading text-4xl font-bold mb-4">About <span className="text-primary">Us</span></h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Microsoft Learn Student Club is paramount in creating one of the most influential events. Our peer-to-peer learning strategy has made our response rate phenomenal and has helped the participants by a substantial improvement in their vocational skills, problem-solving skills, and advancements in the technical domain.
                    </p>
                    <Button asChild size="lg">
                       <Link href="/team">Our Team</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Events Section */}
        <section className="py-20 bg-background">
            <h2 className="heading text-center text-4xl font-bold mb-16">Our <span className="text-primary">Flagship Events</span></h2>
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass-card p-6">
                        <div className="event-content">
                            <div className="content">
                                <div className="year flex items-center gap-2 text-sm text-muted-foreground mb-2"><Calendar className="h-4 w-4" />18th October 2023</div>
                                <h3 className="text-xl font-bold">Azure Cloud Workshop</h3>
                                <p className="mt-2 text-muted-foreground">Successfully conducted a hands-on event on the Azure Cloud Platform with more than 300 attendees, empowering numerous skilled peers in their cloud journey.</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-6">
                         <div className="event-content">
                            <div className="content">
                                <div className="year flex items-center gap-2 text-sm text-muted-foreground mb-2"><Calendar className="h-4 w-4" />16th October 2023</div>
                                <h3 className="text-xl font-bold">Inauguration Ceremony</h3>
                                <p className="mt-2 text-muted-foreground">The inauguration of the Microsoft Learn Student Club marked a momentous occasion, fostering a dynamic hub for technology enthusiasts empowered by the Microsoft Learn ecosystem.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-12">
                     <Button asChild size="lg">
                       <Link href="/events">More Events</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer bg-secondary/30 border-t py-6">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
          </div>
      </footer>
    </div>
  );
}
