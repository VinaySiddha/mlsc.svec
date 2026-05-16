'use client';

import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {
    Home as HomeIcon,
    Users,
    Calendar,
    Group,
    Book,
    Code,
    Activity,
    MessageSquare,
    Send,
    LogIn,
    Menu,
} from 'lucide-react';
import Link from 'next/link';

const navLinks = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/team', label: 'Team', icon: Group },
    { href: '/events', label: 'Events', icon: Calendar },
    //   { href: '/community', label: 'Community', icon: MessageSquare },
    { href: '/about', label: 'About', icon: Users },
    { href: '/blog', label: 'Blog', icon: Book },
];

export function SiteHeader() {
    const pathname = usePathname();

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <div className="flex flex-col w-full sticky top-0 z-50">
            <div className="ticker-bar text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-8">
                <span className="animate-marquee inline-block">MLSC Chapter 3.0  • Join the future of innovation • MLSC Chapter 3.0  • Join the future of innovation</span>
            </div>
            <header className="glass-nav h-20">
                <div className="container mx-auto flex h-full items-center justify-between px-6 md:px-12">
                    <Link href="/" className="flex items-center gap-3 group">
                        <MLSCLogo className="h-9 w-9 text-white transition-transform group-hover:scale-110" />
                        <span className="text-2xl font-black tracking-tighter text-white uppercase">
                            MLSC <span className="text-[#4285F4]">SVEC</span>
                        </span>

                    </Link>
                    <nav className="hidden lg:flex items-center gap-10 text-xs font-black tracking-[0.2em] uppercase text-white/70">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "transition-all duration-300 hover:text-white",
                                    isActive(link.href) ? "text-white" : ""
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/schedule"
                            className={cn(
                                "transition-all duration-300 hover:text-white",
                                isActive('/schedule') ? "text-white" : ""
                            )}
                        >
                            Schedule
                        </Link>
                    </nav>
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex">
                            <Button asChild className="rounded-full bg-white text-black font-bold hover:bg-white/90 px-8">
                                <Link href="/apply">Apply Now</Link>
                            </Button>
                        </div>
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white">
                                        <Menu className="h-7 w-7" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="bg-black border-none w-full p-12">
                                    <nav className="flex flex-col gap-10 mt-20">
                                        {navLinks.map((link) => (
                                            <SheetClose key={link.href} asChild>
                                                <Link
                                                    href={link.href}
                                                    className={cn(
                                                        "text-5xl font-black tracking-tighter transition-colors",
                                                        isActive(link.href) ? "text-[#4285F4]" : "text-white hover:text-[#4285F4]"
                                                    )}
                                                >
                                                    {link.label}
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}
