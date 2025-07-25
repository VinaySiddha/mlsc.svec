
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

const VsCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21.428 5.968l-4.286-4.286-12.214 4.286v12.062l4.286 4.286 12.214-4.286v-12.062zm-4.286-2.4l2.4 2.4-10.371 3.629-2.4-2.4 10.371-3.629zm-11.286 13.514v-9.628l10.371-3.629v9.629l-10.371 3.628zm15.571-3.628l-2.4 2.4-10.371-3.629 2.4-2.4 10.371 3.629z"/>
    </svg>
);

const AzureIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.45 2.43L6.1 13.9l-2.18-3.87.5-1.12L12.45 2.43zm1.1.06l7.53 13.04-1.87 3.3-7.6-5.46 1.94-10.88zM6.6 15.3l5.53 6.27-7.22-1.2.5-4.26 1.19-.81z"/>
    </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.034c-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);


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
    <div className="flex flex-col min-h-screen text-foreground bg-gray-900 text-white">
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
             <Button asChild>
                <Link href="/apply">Apply Now</Link>
             </Button>
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
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center text-center py-24 md:py-32 lg:py-48 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900 -z-10">
                <div className="absolute top-1/4 left-1/4 w-16 h-16 text-blue-500/20 animate-pulse-slow">
                    <VsCodeIcon />
                </div>
                 <div className="absolute top-1/2 right-1/4 w-24 h-24 text-cyan-400/10 animate-spin-slow">
                    <AzureIcon />
                </div>
                 <div className="absolute bottom-1/4 left-1/3 w-20 h-20 text-white/10 animate-pulse">
                    <GithubIcon />
                </div>
            </div>
            <div className="home-content container mx-auto px-4 md:px-8 relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-white [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">MLSC X <span className="text-blue-400">SVEC</span></h1>
                <div className="text-animate text-3xl md:text-4xl font-semibold my-4 text-white/90 [text-shadow:_0_1px_3px_rgb(0_0_0_/_30%)]">
                    <h3>Learn-Train-Serve</h3>
                </div>
                <p className="max-w-2xl text-lg text-gray-200 mx-auto [text-shadow:_0_1px_2px_rgb(0_0_0_/_20%)]">
                    Microsoft Learn Student Club, is a Technical Club which is dedicated to elevating the coding culture 
                    at Sri Vasavi Engineering College, Tadepalligudem by mentoring to refine 
                    their critical thinking and logical reasoning making them unrivalled!
                </p>
            </div>
             <div className="home-sci absolute right-8 bottom-1/2 translate-y-1/2 flex-col gap-4 hidden md:flex z-10">
                <a href="https://whatsapp.com/channel/0029VaJiNv72ER6emJMEl41u" target="_blank" className="bg-gray-800/50 p-2 rounded-full hover:bg-blue-500 transition-colors backdrop-blur-sm">
                    <Image src="/whatsapp.svg" alt="whatsapp" width={24} height={24} />
                </a>
                <a href="https://www.instagram.com/mlsc.svec?igsh=MXNvandqbDJqdjhzOQ==" target="_blank" className="bg-gray-800/50 p-2 rounded-full hover:bg-blue-500 transition-colors backdrop-blur-sm">
                    <Image src="/instagram.svg" alt="instagram" width={24} height={24} />
                </a>
                <a href="https://www.linkedin.com/company/microsoft-learn-student-club-svec/" target="_blank" className="bg-gray-800/50 p-2 rounded-full hover:bg-blue-500 transition-colors backdrop-blur-sm">
                    <Image src="/linkedin.svg" alt="linkedin" width={24} height={24} />
                </a>
            </div>
        </section>
        
        {/* Ambassador Section */}
        <section className="py-12 md:py-16 bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Meet Our <span className="text-blue-400">Ambassadors!</span></h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="glass-card p-6 flex flex-col items-center">
                <Image src="https://placehold.co/400x400.png" alt="Chandu Neelam" width={120} height={120} className="object-cover rounded-full mb-4" data-ai-hint="person portrait"/>
                <h3 className="text-2xl font-bold">Chandu Neelam</h3>
                <h4 className="text-xl font-semibold text-blue-400 my-1">MLSA</h4>
                <p className="text-sm text-gray-300">Our pioneering MLSA leader, with exceptional leadership and technical prowess.</p>
              </div>
              <div className="glass-card p-6 flex flex-col items-center">
                <Image src="https://placehold.co/400x400.png" alt="Vinay Siddha" width={120} height={120} className="object-cover rounded-full mb-4" data-ai-hint="person portrait"/>
                <h3 className="text-2xl font-bold">Vinay Siddha</h3>
                <h4 className="text-xl font-semibold text-blue-400 my-1">MLSA</h4>
                <p className="text-sm text-gray-300">A passionate advocate for technology and community building.</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="about py-20 bg-gray-900/70">
            <div className="container mx-auto px-4 md:grid md:grid-cols-2 md:gap-12 items-center">
                <div className="image-container overflow-hidden rounded-lg shadow-lg mb-8 md:mb-0">
                    <div className="image-slider flex">
                        <Image src="https://placehold.co/600x400.png" alt="Team Image 1" width={600} height={400} className="w-full shrink-0" data-ai-hint="group photo"/>
                        <Image src="https://placehold.co/600x400.png" alt="Team Image 2" width={600} height={400} className="w-full shrink-0" data-ai-hint="people working"/>
                    </div>
                </div>
                <div className="about-content text-center md:text-left">
                    <h2 className="heading text-4xl font-bold mb-4">About <span className="text-blue-400">Us</span></h2>
                    <p className="text-lg text-gray-300 mb-8">
                        Microsoft Learn Student Club is paramount in creating one of the most influential events. Our peer-to-peer learning strategy has made our response rate phenomenal and has helped the participants by a substantial improvement in their vocational skills, problem-solving skills, and advancements in the technical domain.
                    </p>
                    <Button asChild size="lg">
                       <Link href="/team">Our Team</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Events Section */}
        <section className="py-20 bg-gray-900">
            <h2 className="heading text-center text-4xl font-bold mb-16">Our <span className="text-blue-400">Flagship Events</span></h2>
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass-card p-6">
                        <div className="event-content">
                            <div className="content">
                                <div className="year flex items-center gap-2 text-sm text-gray-400 mb-2"><Calendar className="h-4 w-4" />18th October 2023</div>
                                <h3 className="text-xl font-bold">Azure Cloud Workshop</h3>
                                <p className="mt-2 text-gray-300">Successfully conducted a hands-on event on the Azure Cloud Platform with more than 300 attendees, empowering numerous skilled peers in their cloud journey.</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-6">
                         <div className="event-content">
                            <div className="content">
                                <div className="year flex items-center gap-2 text-sm text-gray-400 mb-2"><Calendar className="h-4 w-4" />16th October 2023</div>
                                <h3 className="text-xl font-bold">Inauguration Ceremony</h3>
                                <p className="mt-2 text-gray-300">The inauguration of the Microsoft Learn Student Club marked a momentous occasion, fostering a dynamic hub for technology enthusiasts empowered by the Microsoft Learn ecosystem.</p>
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
      <footer className="footer bg-gray-900/70 border-t border-white/10 py-6">
          <div className="container mx-auto text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
          </div>
      </footer>
    </div>
  );
}
