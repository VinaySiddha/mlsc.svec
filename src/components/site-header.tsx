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
    Mail,
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
    { href: '/domains', label: 'Domains' },
    { href: '/track', label: 'Track' },
    { href: '/docs', label: 'Docs' },
    { href: '/contributors', label: 'Contributors' },
    { href: '/study', label: 'Study' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/donate', label: 'Donate' },
];

export function SiteHeader() {
    const pathname = usePathname();
    const isMoreActive = ['/contributors', '/study', '/blog', '/contact', '/schedule', '/docs'].some(
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-black w-full">
            {/* Announcement Ticker Bar */}
            <div className="w-full max-w-full overflow-hidden h-7 bg-[#4285F4] select-none relative flex items-center justify-center">
                <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
                    <span className="animate-marquee-left inline-block whitespace-nowrap text-white text-[10px] font-black uppercase tracking-[0.25em]">
                        {fullText}
                    </span>
                </div>
            </div>

            {/* Nav bar row */}
            <div className="w-full px-4 sm:px-6 md:px-8 py-3 bg-black border-b border-white/[0.06]">
                <header className="mx-auto max-w-6xl w-full rounded-2xl border border-white/[0.08] bg-[#0E0E0E] shadow-[0_4px_24px_rgba(0,0,0,0.6)] h-14 flex items-center px-3 md:px-5">
                    <div className="w-full flex items-center justify-between gap-2">

                        {/* ── Logo ── */}
                        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.06] border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all shrink-0">
                                <MLSCLogo className="h-5 w-5 text-white transition-transform group-hover:scale-110" />
                            </div>
                            <span className="text-sm font-black tracking-tighter text-white uppercase hidden sm:block">
                                MLSC <span className="text-[#4285F4]">SVEC</span>
                            </span>
                        </Link>

                        {/* ── Center Nav ── */}
                        <nav className="hidden lg:flex items-center gap-0.5 text-[11px] font-bold tracking-[0.12em] uppercase text-white/50">
                            {/* About */}
                            <Link
                                href="/about"
                                className={cn(
                                    "transition-all duration-200 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.06]",
                                    isActive('/about') ? "bg-white/[0.08] text-white" : ""
                                )}
                            >
                                About
                            </Link>

                            {/* Team */}
                            <Link
                                href="/team"
                                className={cn(
                                    "transition-all duration-200 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.06]",
                                    isActive('/team') ? "bg-white/[0.08] text-white" : ""
                                )}
                            >
                                Team
                            </Link>

                            {/* Events */}
                            <Link
                                href="/events"
                                className={cn(
                                    "transition-all duration-200 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.06]",
                                    isActive('/events') ? "bg-white/[0.08] text-white" : ""
                                )}
                            >
                                Events
                            </Link>

                            {/* Domains (Hover mega-menu) */}
                            <button
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                className={cn(
                                    "flex items-center gap-1 transition-all duration-200 px-3 py-1.5 rounded-lg uppercase outline-none focus:outline-none",
                                    domainsOpen ? "text-white bg-white/[0.06]" : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                                )}
                            >
                                Domains
                                <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", domainsOpen ? "rotate-180" : "")} />
                            </button>

                            {/* Track */}
                            <Link
                                href="/track"
                                className={cn(
                                    "transition-all duration-200 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.06]",
                                    isActive('/track') ? "bg-white/[0.08] text-white" : ""
                                )}
                            >
                                Track
                            </Link>

                            {/* More Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={cn(
                                            "flex items-center gap-1 transition-all duration-200 px-3 py-1.5 rounded-lg uppercase outline-none focus:outline-none",
                                            isMoreActive ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                                        )}
                                    >
                                        More
                                        <ChevronDown className="h-3 w-3 opacity-60" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56 bg-[#080808]/95 backdrop-blur-xl border border-white/[0.10] rounded-2xl p-2 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_24px_80px_rgba(0,0,0,0.95),0_8px_32px_rgba(0,0,0,0.7)]"
                                    align="end"
                                    sideOffset={34}
                                >
                                    <DropdownMenuItem asChild>
                                         <Link
                                             href="/docs"
                                             className="group cursor-pointer rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
                                         >
                                             <BookOpen className="h-4 w-4 text-[#4285F4] group-hover:text-blue-400 group-focus:text-blue-400 transition-colors" />
                                             Documentation (SSoT)
                                         </Link>
                                     </DropdownMenuItem>
                                     <DropdownMenuItem asChild>
                                         <Link
                                             href="/contributors"
                                             className="group cursor-pointer rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
                                         >
                                             <Handshake className="h-4 w-4 text-white/40 group-hover:text-white/80 group-focus:text-white/80 transition-colors" />
                                             Contributors
                                         </Link>
                                     </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/study"
                                            className="group cursor-pointer rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
                                        >
                                            <BookOpen className="h-4 w-4 text-white/40 group-hover:text-white/80 group-focus:text-white/80 transition-colors" />
                                            Study Material
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/blog"
                                            className="group cursor-pointer rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
                                        >
                                            <PenTool className="h-4 w-4 text-white/40 group-hover:text-white/80 group-focus:text-white/80 transition-colors" />
                                            Blog
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/schedule"
                                            className="group cursor-pointer rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
                                        >
                                            <Calendar className="h-4 w-4 text-white/40 group-hover:text-white/80 group-focus:text-white/80 transition-colors" />
                                            Schedule
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/contact"
                                            className="group cursor-pointer rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
                                        >
                                            <Mail className="h-4 w-4 text-white/40 group-hover:text-white/80 group-focus:text-white/80 transition-colors" />
                                            Contact Us
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/donate"
                                            className="group cursor-pointer rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
                                        >
                                            <Heart className="h-4 w-4 text-rose-500/80 group-hover:text-rose-500 group-focus:text-rose-500 transition-colors" />
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
                                        variant="dark"
                                    />
                                </div>
                            )}
                            <div className="hidden lg:flex items-center gap-3">
                                {mounted && <LiveNotificationBell />}
                                {mounted && <UserNav />}
                                <InteractiveButton href="/apply" className="px-5 h-9 text-[11px] tracking-wider uppercase">
                                    Apply Now
                                </InteractiveButton>
                            </div>
                            {/* Mobile hamburger */}
                            <div className="lg:hidden flex items-center gap-3">
                                {mounted && <LiveNotificationBell />}
                                {mounted && <UserNav />}
                                {mounted && (
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-white h-9 w-9">
                                                <Menu className="h-6 w-6" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="bg-black border-none w-full p-8 flex flex-col justify-between overflow-y-auto">
                                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                            <SheetDescription className="sr-only">Mobile navigation links</SheetDescription>
                                            <div className="flex flex-col gap-8 my-auto py-8">
                                                <nav className="flex flex-col gap-6">
                                                    {navLinks.map((link) => (
                                                        <SheetClose key={link.href} asChild>
                                                            <Link
                                                                href={link.href}
                                                                className={cn(
                                                                    "text-3xl sm:text-4xl font-black tracking-tighter transition-colors",
                                                                    isActive(link.href) ? "text-[#4285F4]" : "text-white hover:text-[#4285F4]"
                                                                )}
                                                            >
                                                                {link.label}
                                                            </Link>
                                                        </SheetClose>
                                                    ))}
                                                </nav>
                                                <div className="mt-4">
                                                    <SheetClose asChild>
                                                        <InteractiveButton href="/apply" className="text-base px-6 py-3.5 w-full justify-center">
                                                            Apply Now
                                                        </InteractiveButton>
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
                    "transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
                )}
                style={{ top: 'calc(100% + 8px)' }}
            >
                {/* Invisible bridge so mouse can travel from navbar button to panel */}
                <div className="absolute -top-[20px] left-0 right-0 h-[20px]" />
                {/* Dark panel */}
                <div className="w-full rounded-2xl border border-white/[0.10] bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_24px_80px_rgba(0,0,0,0.95),0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden">
                    <div className="p-7 grid grid-cols-12 gap-7">

                        {/* ── Col 1: Technical ── */}
                        <div className="col-span-4">
                            <p className="text-[9px] font-black tracking-[0.28em] uppercase text-white/25 mb-5">Technical Domains</p>
                            <div className="space-y-4">
                                {[
                                    { icon: <Sparkles className="h-4 w-4" />, label: 'Generative AI', desc: 'LLMs, prompt engineering & agents.', color: '#4285F4', slug: 'generative-ai' },
                                    { icon: <BarChart3 className="h-4 w-4" />, label: 'Data Science & ML', desc: 'Predictive analytics and neural nets.', color: '#34A853', slug: 'data-science' },
                                    { icon: <Cloud className="h-4 w-4" />, label: 'Cloud & DevOps', desc: 'Azure systems and cloud workflows.', color: '#FBBC05', slug: 'cloud-devops' },
                                    { icon: <Code2 className="h-4 w-4" />, label: 'Web & App Dev', desc: 'Modern frontends and mobile software.', color: '#EA4335', slug: 'web-development' },
                                ].map((item) => (
                                    <Link href={`/domains/${item.slug}`} key={item.label} className="group/item flex gap-3 items-start">
                                        <div
                                            className="flex items-center justify-center h-8 w-8 rounded-lg border text-white/40 transition-all duration-200 shrink-0"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                borderColor: 'rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            <span className="group-hover/item:text-current transition-colors" style={{ color: 'inherit' }}>
                                                {item.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold tracking-wide text-white/70 uppercase group-hover/item:text-white transition-colors">{item.label}</div>
                                            <p className="text-[10px] text-white/30 leading-normal mt-0.5 normal-case tracking-normal font-normal">{item.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* ── Col 2: Non-Technical ── */}
                        <div className="col-span-4">
                            <p className="text-[9px] font-black tracking-[0.28em] uppercase text-white/25 mb-5">Non-Technical</p>
                            <div className="space-y-4">
                                {[
                                    { icon: <Calendar className="h-4 w-4" />, label: 'Events & Ops', desc: 'Hassle-free execution of club projects.', slug: 'events-operations' },
                                    { icon: <Handshake className="h-4 w-4" />, label: 'Public Relations', desc: 'Sponsorships and external outreach.', slug: 'public-relations' },
                                    { icon: <Megaphone className="h-4 w-4" />, label: 'Media & Marketing', desc: 'Social branding and public outreach.', slug: 'media-marketing' },
                                    { icon: <Palette className="h-4 w-4" />, label: 'Creativity & Design', desc: 'Stunning UI/UX assets and graphics.', slug: 'creativity-design' },
                                ].map((item) => (
                                    <Link href={`/domains/${item.slug}`} key={item.label} className="group/item flex gap-3 items-start">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 group-hover/item:text-white/70 transition-all duration-200 shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold tracking-wide text-white/70 uppercase group-hover/item:text-white transition-colors">{item.label}</div>
                                            <p className="text-[10px] text-white/30 leading-normal mt-0.5 normal-case tracking-normal font-normal">{item.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* ── Col 3: Spotlight ── */}
                        <div className="col-span-4 flex flex-col justify-between border-l border-white/[0.06] pl-7">
                            <div>
                                <p className="text-[9px] font-black tracking-[0.28em] uppercase text-white/25 mb-5">Spotlight</p>
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.08] mb-4 bg-gradient-to-tr from-[#0F2027] via-[#203A43] to-[#2C5364]">
                                    <div className="absolute inset-0 bg-black/50" />
                                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                                        <div className="text-[9px] font-black tracking-[0.2em] text-[#4285F4] uppercase mb-1">Join MLSC</div>
                                        <div className="text-xs font-black text-white leading-tight uppercase tracking-wider">Chapter 3.0 Recruitments</div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/30 leading-relaxed normal-case tracking-normal font-normal">
                                    Step into the future of tech, collaboration, and learning.
                                </p>
                            </div>
                            <InteractiveButton href="/apply" className="w-full justify-center mt-5 text-[11px] py-2.5 h-auto">
                                                                Apply Now
                                                            </InteractiveButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
