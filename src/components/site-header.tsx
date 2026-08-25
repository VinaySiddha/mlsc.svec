'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { GooeyInput } from '@/components/ui/gooey-input';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {
    Calendar,
    Menu,
    ChevronDown,
    Sparkles,
    BarChart3,
    Cloud,
    Code2,
    Megaphone,
    Palette,
    ArrowRight,
    Handshake,
    BookOpen,
    PenTool,
    Heart,
    CreditCard,
    MessageSquareQuote,
} from 'lucide-react';
import Link from 'next/link';
import { UserNav } from '@/components/user-nav';
import { LiveNotificationBell } from '@/components/live-notification-bell';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/team', label: 'Team' },
    { href: '/events', label: 'Events' },
    { href: '/what-our-alumni-say', label: 'Alumni Words' },
    { href: '/domains', label: 'Domains' },
    { href: '/track', label: 'Track' },
    { href: '/contributors', label: 'Contributors' },
    { href: '/study', label: 'Study' },
    { href: '/blog', label: 'Blog' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/donate', label: 'Donate' },
];

export function SiteHeader() {
    const pathname = usePathname();
    const isMoreActive = ['/contributors', '/study', '/blog', '/schedule', '/what-our-alumni-say'].some(
        (href) => pathname.startsWith(href)
    );
    const [domainsOpen, setDomainsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setDomainsOpen(true);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setDomainsOpen(false);
        }, 150);
    };

    const [notifications, setNotifications] = useState<any[]>([]);

    // Live Firestore ticker — updates in real-time when admin adds/removes announcements
    useEffect(() => {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setNotifications(docs);
        });
        return () => unsub();
    }, []);

    const tickerText = notifications.length > 0
        ? notifications.map(n => n.message).join('  •  ')
        : 'MLSC Chapter 3.0  •  Join the future of innovation';

    const fullText = `${tickerText}  •  ${tickerText}  •  ${tickerText}  •  ${tickerText}`;

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white w-full font-sans">
            {/* Announcement Ticker Bar */}
            <div className="w-full max-w-full overflow-hidden h-7 bg-[#FFE600] text-black border-b-2 border-black select-none relative flex items-center justify-center">
                <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
                    <span className="animate-marquee-left inline-block whitespace-nowrap text-black text-[10px] font-black uppercase tracking-[0.25em]">
                        {fullText}
                    </span>
                </div>
            </div>

            {/* Nav bar row */}
            <div className="w-full px-4 sm:px-6 md:px-8 py-3 bg-white/95 backdrop-blur-md border-b-2 border-black">
                <header className="mx-auto max-w-6xl w-full border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] h-14 flex items-center px-3 md:px-5 transition-all">
                    <div className="w-full flex items-center justify-between gap-2">

                        {/* ── Logo ── */}
                        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                            <div className="flex items-center justify-center h-8 w-8 bg-[#4285F4] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] group-hover:scale-105 transition-transform shrink-0">
                                <MLSCLogo className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-display font-black tracking-tight text-black uppercase hidden sm:block">
                                MLSC <span className="text-[#4285F4]">SVEC</span>
                            </span>
                        </Link>

                        {/* ── Center Nav ── */}
                        <nav className="hidden lg:flex items-center gap-1 text-[11px] font-black tracking-wider uppercase text-zinc-800 font-sans">
                            {/* About */}
                            <Link
                                href="/about"
                                className={cn(
                                    "transition-all duration-150 px-3 py-1.5 border border-transparent hover:border-black hover:bg-[#FFE600] hover:text-black",
                                    isActive('/about') ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-black" : ""
                                )}
                            >
                                About
                            </Link>

                            {/* Team */}
                            <Link
                                href="/team"
                                className={cn(
                                    "transition-all duration-150 px-3 py-1.5 border border-transparent hover:border-black hover:bg-[#FFE600] hover:text-black",
                                    isActive('/team') ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-black" : ""
                                )}
                            >
                                Team
                            </Link>

                            {/* Events */}
                            <Link
                                href="/events"
                                className={cn(
                                    "transition-all duration-150 px-3 py-1.5 border border-transparent hover:border-black hover:bg-[#FFE600] hover:text-black",
                                    isActive('/events') ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-black" : ""
                                )}
                            >
                                Events
                            </Link>

                            {/* Domains (Hover mega-menu) */}
                            <button
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                className={cn(
                                    "flex items-center gap-1 transition-all duration-150 px-3 py-1.5 border border-transparent hover:border-black hover:bg-[#FFE600] hover:text-black uppercase outline-none focus:outline-none cursor-pointer",
                                    domainsOpen ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]" : ""
                                )}
                            >
                                Domains
                                <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", domainsOpen ? "rotate-180" : "")} />
                            </button>

                            {/* Track */}
                            <Link
                                href="/track"
                                className={cn(
                                    "transition-all duration-150 px-3 py-1.5 border border-transparent hover:border-black hover:bg-[#FFE600] hover:text-black",
                                    isActive('/track') ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-black" : ""
                                )}
                            >
                                Track
                            </Link>

                            {/* More Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={cn(
                                            "flex items-center gap-1 transition-all duration-150 px-3 py-1.5 border border-transparent hover:border-black hover:bg-[#FFE600] hover:text-black uppercase outline-none focus:outline-none cursor-pointer",
                                            isMoreActive ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-black" : ""
                                        )}
                                    >
                                        More
                                        <ChevronDown className="h-3 w-3 opacity-60" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56 bg-white border-2 border-black p-2 text-black shadow-[6px_6px_0px_0px_#000000] font-sans rounded-none"
                                    align="end"
                                    sideOffset={28}
                                >
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/what-our-alumni-say"
                                            className="group cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#FFE600] focus:bg-[#FFE600] transition-colors flex items-center gap-2.5 border-b border-zinc-200"
                                        >
                                            <MessageSquareQuote className="h-4 w-4 text-[#4285F4]" />
                                            Alumni Words
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/contributors"
                                            className="group cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#FFE600] focus:bg-[#FFE600] transition-colors flex items-center gap-2.5 border-b border-zinc-200"
                                        >
                                            <Handshake className="h-4 w-4 text-[#00FF66]" />
                                            Contributors
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/study"
                                            className="group cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#FFE600] focus:bg-[#FFE600] transition-colors flex items-center gap-2.5 border-b border-zinc-200"
                                        >
                                            <BookOpen className="h-4 w-4 text-[#4285F4]" />
                                            Study Material
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/blog"
                                            className="group cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#FFE600] focus:bg-[#FFE600] transition-colors flex items-center gap-2.5 border-b border-zinc-200"
                                        >
                                            <PenTool className="h-4 w-4 text-[#FF0055]" />
                                            Blog
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/schedule"
                                            className="group cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#FFE600] focus:bg-[#FFE600] transition-colors flex items-center gap-2.5 border-b border-zinc-200"
                                        >
                                            <Calendar className="h-4 w-4 text-[#00F0FF]" />
                                            Schedule
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/donate"
                                            className="group cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#FFE600] focus:bg-[#FFE600] transition-colors flex items-center gap-2.5"
                                        >
                                            <Heart className="h-4 w-4 text-[#FF0055]" />
                                            Donate
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </nav>

                        {/* ── Right Actions ── */}
                        <div className="flex items-center gap-3 shrink-0">
                            {mounted && (
                                <div className="hidden lg:flex items-center">
                                    <GooeyInput
                                        placeholder="Search..."
                                        collapsedWidth={42}
                                        expandedWidth={180}
                                        expandedOffset={138}
                                        gooeyBlur={6}
                                        variant="light"
                                    />
                                </div>
                            )}
                            <div className="hidden lg:flex items-center gap-3">
                                {mounted && <LiveNotificationBell />}
                                {mounted && <UserNav />}
                                <Link 
                                    href="/apply" 
                                    className="px-4 py-2 bg-[#FFE600] text-black font-sans font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all"
                                >
                                    Join Club [↗]
                                </Link>
                            </div>
                            {/* Mobile hamburger */}
                            <div className="lg:hidden flex items-center gap-3">
                                {mounted && <LiveNotificationBell />}
                                {mounted && <UserNav />}
                                {mounted && (
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-black h-9 w-9 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000000]">
                                                <Menu className="h-6 w-6" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="bg-white border-l-2 border-black w-full p-8 flex flex-col justify-between overflow-y-auto font-sans text-black">
                                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                            <SheetDescription className="sr-only">Mobile navigation links</SheetDescription>
                                            <div className="flex flex-col gap-6 my-auto py-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-[11px] font-black uppercase tracking-wider w-fit border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                                                    ⚡ MLSC SVEC // MENU
                                                </div>
                                                <nav className="flex flex-col gap-3">
                                                    {navLinks.map((link) => (
                                                        <SheetClose key={link.href} asChild>
                                                            <Link
                                                                href={link.href}
                                                                className={cn(
                                                                    "text-2xl sm:text-3xl font-display font-black tracking-tight uppercase italic transition-colors p-2 border-b-2 border-zinc-200",
                                                                    isActive(link.href) ? "text-black bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000000] pl-3" : "text-black hover:text-[#4285F4]"
                                                                )}
                                                            >
                                                                {link.label}
                                                            </Link>
                                                        </SheetClose>
                                                    ))}
                                                </nav>
                                                <div className="mt-4 pt-4 border-t-2 border-black">
                                                    <SheetClose asChild>
                                                        <Link 
                                                            href="/apply" 
                                                            className="w-full py-4 bg-[#FFE600] text-black font-sans font-black uppercase tracking-wider text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center gap-2 text-center"
                                                        >
                                                            APPLY NOW / JOIN MLSC [↗]
                                                        </Link>
                                                    </SheetClose>
                                                </div>
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* ══════════════════════════════════════════════════════════
                MEGA DROPDOWN — direct child of sticky wrapper, rendered
                BELOW the full navbar band. Gap from navbar = 12px.
                ══════════════════════════════════════════════════════════ */}
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "absolute left-1/2 -translate-x-1/2 w-[760px] z-[200]",
                    "pointer-events-none",
                    domainsOpen
                        ? "opacity-100 visible translate-y-0 pointer-events-auto"
                        : "opacity-0 invisible translate-y-3",
                    "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                )}
                style={{ top: 'calc(100% + 8px)' }}
            >
                {/* Invisible bridge so mouse can travel from navbar button to panel */}
                <div className="absolute -top-[20px] left-0 right-0 h-[20px]" />
                {/* White panel */}
                <div className="w-full border-2 border-black bg-white shadow-[8px_8px_0px_0px_#000000] overflow-hidden font-sans">
                    <div className="p-7 grid grid-cols-12 gap-7">

                        {/* ── Col 1: Technical ── */}
                        <div className="col-span-4">
                            <p className="text-[10px] font-black tracking-widest uppercase text-[#4285F4] mb-5 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-[#4285F4] inline-block border border-black"></span> Technical
                            </p>
                            <div className="space-y-3">
                                {[
                                    { icon: <Sparkles className="h-4 w-4" />, label: 'Generative AI', desc: 'LLMs, prompt engineering & agents.', color: '#4285F4', slug: 'generative-ai' },
                                    { icon: <BarChart3 className="h-4 w-4" />, label: 'Data Science & ML', desc: 'Predictive analytics and neural nets.', color: '#34A853', slug: 'data-science' },
                                    { icon: <Cloud className="h-4 w-4" />, label: 'Cloud & DevOps', desc: 'Azure systems and cloud workflows.', color: '#FBBC05', slug: 'cloud-devops' },
                                    { icon: <Code2 className="h-4 w-4" />, label: 'Web & App Dev', desc: 'Modern frontends and mobile software.', color: '#EA4335', slug: 'web-development' },
                                ].map((item) => (
                                    <Link href={`/domains/${item.slug}`} key={item.label} className="group/item flex gap-3 items-start p-2 hover:bg-[#FFE600]/20 border border-transparent hover:border-black transition-all">
                                        <div
                                            className="flex items-center justify-center h-8 w-8 border-2 border-black text-black transition-all duration-200 shrink-0 bg-[#F4F4F5] shadow-[2px_2px_0px_0px_#000000]"
                                        >
                                            <span className="group-hover/item:scale-110 transition-transform">
                                                {item.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black tracking-wide text-black uppercase group-hover/item:text-[#4285F4] transition-colors">{item.label}</div>
                                            <p className="text-[10px] text-zinc-600 leading-normal mt-0.5 normal-case tracking-normal font-normal">{item.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* ── Col 2: Non-Technical ── */}
                        <div className="col-span-4">
                            <p className="text-[10px] font-black tracking-widest uppercase text-[#FF0055] mb-5 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-[#FF0055] inline-block border border-black"></span> Non-Technical
                            </p>
                            <div className="space-y-3">
                                {[
                                    { icon: <Calendar className="h-4 w-4" />, label: 'Events & Ops', desc: 'Hassle-free execution of club projects.', slug: 'events-operations' },
                                    { icon: <Handshake className="h-4 w-4" />, label: 'Public Relations', desc: 'Sponsorships and external outreach.', slug: 'public-relations' },
                                    { icon: <Megaphone className="h-4 w-4" />, label: 'Media & Marketing', desc: 'Social branding and public outreach.', slug: 'media-marketing' },
                                    { icon: <Palette className="h-4 w-4" />, label: 'Creativity & Design', desc: 'Stunning UI/UX assets and graphics.', slug: 'creativity-design' },
                                ].map((item) => (
                                    <Link href={`/domains/${item.slug}`} key={item.label} className="group/item flex gap-3 items-start p-2 hover:bg-[#FFE600]/20 border border-transparent hover:border-black transition-all">
                                        <div className="flex items-center justify-center h-8 w-8 bg-[#F4F4F5] border-2 border-black text-black group-hover/item:scale-110 transition-all duration-200 shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black tracking-wide text-black uppercase group-hover/item:text-[#FF0055] transition-colors">{item.label}</div>
                                            <p className="text-[10px] text-zinc-600 leading-normal mt-0.5 normal-case tracking-normal font-normal">{item.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* ── Col 3: Spotlight ── */}
                        <div className="col-span-4 flex flex-col justify-between border-l-2 border-black pl-7">
                            <div>
                                <p className="text-[10px] font-black tracking-widest uppercase text-[#00FF66] mb-5 flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-[#00FF66] inline-block border border-black"></span> Spotlight
                                </p>
                                <div className="relative aspect-video border-2 border-black mb-4 bg-[#FFE600] shadow-[4px_4px_0px_0px_#000000] p-4 flex flex-col justify-end">
                                    <div className="text-[9px] font-black tracking-widest text-black uppercase mb-1">[ RECRUITMENT ACTIVE ]</div>
                                    <div className="text-sm font-display font-black text-black leading-tight uppercase italic">Chapter 3.0 Core Team</div>
                                </div>
                                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                                    Step into the future of tech, open-source building, and community.
                                </p>
                            </div>
                            <Link 
                                href="/apply" 
                                className="w-full text-center mt-5 py-2.5 bg-[#FFE600] text-black font-sans font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                                Apply Now [↗]
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
