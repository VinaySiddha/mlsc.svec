
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
    <div className="flex flex-col min-h-screen text-white">
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
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="home relative h-screen flex items-center justify-start text-left" style={{ backgroundImage: "url('/home.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="home-content container mx-auto px-4 md:px-8">
                <h1 className="text-5xl md:text-7xl font-bold">MLSC X <span className="text-cyan-400">SVEC</span></h1>
                <div className="text-animate text-3xl md:text-4xl font-semibold my-4">
                    <h3>Learn-Train-Serve</h3>
                </div>
                <p className="max-w-2xl text-lg text-gray-200">
                    Microsoft Learn Student Club, is a Technical Club which is dedicated to elevating the coding culture 
                    at Sri Vasavi Engineering College, Tadepalligudem by mentoring to refine 
                    their critical thinking and logical reasoning making them unrivalled!
                </p>

                <div className="btn-box mt-8">
                    <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-lg">
                        <Link href="/apply">Register</Link>
                    </Button>
                </div>
            </div>

            <div className="home-sci absolute bottom-16 right-8 flex flex-col gap-4">
                <a href="https://whatsapp.com/channel/0029VaJiNv72ER6emJMEl41u" target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-cyan-500 transition-colors"><Image src="/whatsapp.svg" alt="whatsapp" width={24} height={24} /></a>
                <a href="https://www.instagram.com/mlsc.svec?igsh=MXNvandqbDJqdjhzOQ==" target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-cyan-500 transition-colors"><Image src="/instagram.svg" alt="instagram" width={24} height={24} /></a>
                <a href="https://www.linkedin.com/company/microsoft-learn-student-club-svec/" target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-cyan-500 transition-colors"><Image src="/linkedin.svg" alt="linkedin" width={24} height={24} /></a>
            </div>
        </section>
        
        {/* Ambassador Section */}
        <section className="services py-20 bg-gray-900">
            <h2 className="heading text-center text-4xl font-bold mb-16">Meet Our <span className="text-cyan-400">Ambassador!</span></h2>
            <div className="container mx-auto px-4">
                <div className="services-box glass-card md:flex-row flex-col">
                    <div className="content md:text-left text-center p-8 flex-1">
                        <h3 className="text-4xl font-bold">Chandu Neelam</h3>
                        <h2 className="text-3xl font-semibold text-cyan-400 my-2">MLSA</h2>
                        <p className="text-lg text-gray-300">Our pioneering MLSA leader, stands out with exceptional leadership, technical prowess, and a relentless commitment to fostering a collaborative and innovative environment within our community.</p>
                    </div>
                    <div className="image-container flex-1">
                        <Image src="https://placehold.co/400x400.png" alt="Chandu Image" width={400} height={400} className="object-cover w-full h-full" data-ai-hint="person portrait"/>
                    </div>
                </div>
            </div>
        </section>

        {/* About Us Section */}
        <section className="about py-20 bg-gray-800">
            <div className="container mx-auto px-4 md:grid md:grid-cols-2 md:gap-12 items-center">
                <div className="image-container overflow-hidden rounded-lg shadow-lg mb-8 md:mb-0">
                    <div className="image-slider flex">
                        <Image src="https://placehold.co/600x400.png" alt="Team Image 1" width={600} height={400} className="w-full shrink-0" data-ai-hint="group photo"/>
                        <Image src="https://placehold.co/600x400.png" alt="Team Image 2" width={600} height={400} className="w-full shrink-0" data-ai-hint="people working"/>
                    </div>
                </div>
                <div className="about-content text-center md:text-left">
                    <h2 className="heading text-4xl font-bold mb-4">About <span className="text-cyan-400">Us</span></h2>
                    <p className="text-lg text-gray-300 mb-8">
                        Microsoft Learn Student Club is paramount in creating one of the most influential events. Our peer-to-peer learning strategy has made our response rate phenomenal and has helped the participants by a substantial improvement in their vocational skills, problem-solving skills, and advancements in the technical domain.
                    </p>
                    <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-lg">
                       <Link href="/team">Our Team</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Events Section */}
        <section className="event-down py-20 bg-gray-900">
            <h2 className="heading text-center text-4xl font-bold mb-16">Our <span className="text-cyan-400">Flagship Events</span></h2>
            <div className="container mx-auto px-4">
                <div className="event-row grid md:grid-cols-2 gap-8">
                    <div className="event-column">
                        <h3 className="title text-2xl font-bold text-center mb-6">Technical Events</h3>
                        <div className="event-box glass-card p-6">
                            <div className="event-content">
                                <div className="content">
                                    <div className="year flex items-center gap-2 text-sm text-gray-400 mb-2"><Calendar className="h-4 w-4" />18th October 2023</div>
                                    <h3 className="text-xl font-bold">Azure Cloud Workshop</h3>
                                    <p className="mt-2 text-gray-300">Successfully conducted a hands-on event on the Azure Cloud Platform with more than 300 attendees, empowering numerous skilled peers in their cloud journey.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="event-column">
                        <h3 className="title text-2xl font-bold text-center mb-6">Non-Technical Events</h3>
                        <div className="event-box glass-card p-6">
                             <div className="event-content">
                                <div className="content">
                                    <div className="year flex items-center gap-2 text-sm text-gray-400 mb-2"><Calendar className="h-4 w-4" />16th October 2023</div>
                                    <h3 className="text-xl font-bold">Inauguration Ceremony</h3>
                                    <p className="mt-2 text-gray-300">The inauguration of the Microsoft Learn Student Club marked a momentous occasion, fostering a dynamic hub for technology enthusiasts empowered by the Microsoft Learn ecosystem.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-12">
                     <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-lg">
                       <Link href="/events">More Events</Link>
                    </Button>
                </div>
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
