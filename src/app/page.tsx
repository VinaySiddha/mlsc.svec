
'use client';

import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LogIn, Menu, Users, Calendar, Send, Group, Home as HomeIcon, Book, Code, Instagram, Linkedin, Github } from "lucide-react";
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

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.48 1.34 5l-1.41 5.15 5.25-1.38c1.45.81 3.09 1.23 4.73 1.23h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM12.04 20.09h-.01c-1.47 0-2.92-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.82-1.26-4.38 0-4.43 3.6-8.03 8.04-8.03s8.04 3.6 8.04 8.03-3.6 8.03-8.04 8.03zm4.52-6.13c-.27-.13-1.59-.78-1.84-.87-.25-.09-.43-.13-.62.13-.19.27-.7.87-.86 1.04-.16.18-.32.2-.59.06-.27-.13-1.14-.42-2.17-1.34-.8-.72-1.34-1.62-1.5-1.9-.16-.27-.02-.42.12-.55.12-.12.27-.3.4-.4.13-.12.18-.2.27-.34.09-.13.04-.27-.02-.39-.06-.13-.62-1.49-.84-2.04-.23-.55-.46-.48-.62-.48-.15 0-.33-.02-.51-.02s-.43.06-.66.33c-.23.27-.88.85-.88 2.07 0 1.22.9 2.39 1.02 2.56.12.18 1.76 2.69 4.27 3.78 2.51 1.08 2.51.72 2.96.69.45-.03 1.59-.65 1.81-1.26.22-.61.22-1.14.16-1.26-.06-.13-.24-.2-.51-.33z"/>
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
      <header className="header sticky top-0 z-50 w-full border-b border-white/20">
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
          <div className="flex items-center gap-4">
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
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="home relative flex items-center justify-center text-center py-24 md:py-32 lg:py-48 overflow-hidden bg-cover bg-center" style={{backgroundImage: "url('/team1.jpg')"}}>
            <div className="absolute inset-0 bg-black/60 backdrop-brightness-75"></div>
            <div className="absolute inset-0 bg-gray-900 -z-10">
                <div className="absolute top-1/4 left-1/4 w-16 h-16 text-blue-500/20 animate-pulse-slow">
                    <VsCodeIcon />
                </div>
                 <div className="absolute top-1/2 right-1/4 w-24 h-24 text-cyan-400/10 animate-spin-slow">
                    <AzureIcon />
                </div>
                 <div className="absolute bottom-1/4 left-1/3 w-20 h-20 text-white/10 animate-pulse">
                    <Github className="w-full h-full" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-[20vw] font-black text-white/5 font-graffiti select-none">MLSC</h1>
                </div>
            </div>
            <div className="home-content container mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center">
                <h1 className="text-5xl md:text-7xl font-bold text-white [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)] animate-fade-in-down font-graffiti" style={{animationDelay: '0.2s'}}>MLSC X <span className="text-blue-400">SVEC</span></h1>
                <div className="text-animate text-3xl md:text-4xl font-semibold my-4 text-white/90 [text-shadow:_0_1px_3px_rgb(0_0_0_/_30%)] animate-fade-in-down" style={{animationDelay: '0.4s'}}>
                    <h3>Learn-Train-Serve</h3>
                </div>
                <p className="max-w-2xl text-lg text-gray-200 mx-auto [text-shadow:_0_1px_2px_rgb(0_0_0_/_20%)] animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                    Microsoft Learn Student Club, is a Technical Club which is dedicated to elevating the coding culture 
                    at Sri Vasavi Engineering College, Tadepalligudem by mentoring to refine 
                    their critical thinking and logical reasoning making them unrivalled!
                </p>
            </div>
             <div className="home-sci absolute right-8 bottom-1/2 translate-y-1/2 flex-col gap-4 hidden md:flex z-10">
                <a href="https://whatsapp.com/channel/0029VaJiNv72ER6emJMEl41u" target="_blank" className="bg-gray-800/50 p-2 rounded-full hover:bg-blue-500 transition-colors backdrop-blur-sm animate-fade-in-left" style={{animationDelay: '0.8s'}}>
                    <WhatsappIcon className="h-6 w-6"/>
                </a>
                <a href="https://www.instagram.com/mlsc.svec?igsh=MXNvandqbDJqdjhzOQ==" target="_blank" className="bg-gray-800/50 p-2 rounded-full hover:bg-blue-500 transition-colors backdrop-blur-sm animate-fade-in-left" style={{animationDelay: '1s'}}>
                    <Instagram className="h-6 w-6" />
                </a>
                <a href="https://www.linkedin.com/company/microsoft-learn-student-club-svec/" target="_blank" className="bg-gray-800/50 p-2 rounded-full hover:bg-blue-500 transition-colors backdrop-blur-sm animate-fade-in-left" style={{animationDelay: '1.2s'}}>
                    <Linkedin className="h-6 w-6" />
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
                        <Image src="/team1.jpg" alt="MLSC Team" width={600} height={400} className="w-full shrink-0" data-ai-hint="group photo"/>
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
      <footer className="footer bg-gray-900/50 border-t border-white/10 py-6">
          <div className="container mx-auto text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
          </div>
      </footer>
    </div>
  );
}
