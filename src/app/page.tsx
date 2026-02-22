import { getNotifications } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LogIn, Menu, Users, Calendar, Send, Group, Home as HomeIcon, Book, Code, Instagram, Linkedin, Github, BrainCircuit, Rocket, Briefcase, ArrowRight, CheckCircle, Activity } from "lucide-react";
import Link from "next/link";
import { Image } from "@/components/image";
import { ImageSlider } from "@/components/image-slider";
import { NotificationTicker } from "@/components/notification-ticker";
import { DynamicHero } from "@/components/home/dynamic-hero";
import { DynamicAmbassadors } from "@/components/home/dynamic-ambassadors";
import { DynamicGallery } from "@/components/home/dynamic-gallery";
import { DynamicChapters } from "@/components/home/dynamic-chapters";

export const dynamic = 'force-dynamic';

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

const VsCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21.428 5.968l-4.286-4.286-12.214 4.286v12.062l4.286 4.286 12.214-4.286v-12.062zm-4.286-2.4l2.4 2.4-10.371 3.629-2.4-2.4 10.371-3.629zm-11.286 13.514v-9.628l10.371-3.629v9.629l-10.371 3.628zm15.571-3.628l-2.4 2.4-10.371-3.629 2.4-2.4 10.371 3.629z" />
    </svg>
);

const AzureIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.45 2.43L6.1 13.9l-2.18-3.87.5-1.12L12.45 2.43zm1.1.06l7.53 13.04-1.87 3.3-7.6-5.46 1.94-10.88zM6.6 15.3l5.53 6.27-7.22-1.2.5-4.26 1.19-.81z" />
    </svg>
);

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.48 1.34 5l-1.41 5.15 5.25-1.38c1.45.81 3.09 1.23 4.73 1.23h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM12.04 20.09h-.01c-1.47 0-2.92-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.82-1.26-4.38 0-4.43 3.6-8.03 8.04-8.03s8.04 3.6 8.04 8.03-3.6 8.03-8.04 8.03zm4.52-6.13c-.27-.13-1.59-.78-1.84-.87-.25-.09-.43-.13-.62.13-.19.27-.7.87-.86 1.04-.16.18-.32.2-.59.06-.27-.13-1.14-.42-2.17-1.34-.8-.72-1.34-1.62-1.5-1.9-.16-.27-.02-.42.12-.55.12-.12.27-.3.4-.4.13-.12.18-.2.27-.34.09-.13.04-.27-.02-.39-.06-.13-.62-1.49-.84-2.04-.23-.55-.46-.48-.62-.48-.15 0-.33-.02-.51-.02s-.43.06-.66.33c-.23.27-.88.85-.88 2.07 0 1.22.9 2.39 1.02 2.56.12.18 1.76 2.69 4.27 3.78 2.51 1.08 2.51.72 2.96.69.45-.03 1.59-.65 1.81-1.26.22-.61.22-1.14.16-1.26-.06-.13-.24-.2-.51-.33z" />
    </svg>
);


export default async function Home() {
    const { notifications } = await getNotifications();

    const galleryImages = [
        { src: "/team1.jpg", alt: "MLSC Team at an event", hint: "group photo" },
        { src: "/g2.jpg", alt: "Azure workshop in progress", hint: "tech workshop" },
    ];

    return (
        <div className="flex flex-col min-h-screen text-foreground bg-transparent">
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
                        <a href="https://mlscsvec.openstatus.dev/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Status</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="glass" size="sm" className="hidden lg:flex">
                            <Link href="/login"><LogIn /> Login</Link>
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
                                                <a href="https://mlscsvec.openstatus.dev/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                                    <Activity className="h-5 w-5" /> Status
                                                </a>
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
                {/* Notification Scroller */}
                <NotificationTicker notifications={notifications?.map(n => n.message) || []} />

                {/* Dynamic Hero Section */}
                <DynamicHero />

                {/* Dynamic Team Section (formerly Chapter 3) */}
                <DynamicAmbassadors />

                {/* Dynamic Gallery Section */}
                <DynamicGallery />

                {/* Dynamic Chapters (replaces 1 & 2 if present, else fallbacks) */}
                <DynamicChapters />
            </main>

        </div>
    );
}
