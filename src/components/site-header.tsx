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
  { href: '/community', label: 'Community', icon: MessageSquare },
  { href: '/about', label: 'About', icon: Users },
  { href: '/blog', label: 'Blog', icon: Book },
];

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-transparent"
      style={{ borderImage: 'linear-gradient(90deg, transparent, hsl(217 91% 60% / 0.3), hsl(262 83% 58% / 0.3), transparent) 1' }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <MLSCLogo className="h-10 w-10 text-primary" />
          <span className="text-xl font-bold tracking-tight">
            Microsoft Learn Student Club
          </span>
        </Link>
        <nav className="navbar hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative py-1 transition-colors",
                isActive(link.href)
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent" />
              )}
            </Link>
          ))}
          <Link
            href="/projects"
            className={cn(
              "relative py-1 transition-colors",
              isActive('/projects')
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Projects
            {isActive('/projects') && (
              <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent" />
            )}
          </Link>
          <a
            href="https://mlscsvec.openstatus.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Status
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex">
            <UserNav />
          </div>
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-transparent border-border hover:bg-background/80"
                >
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="glass-card">
                <div className="p-4">
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 text-lg font-semibold p-2 rounded-md",
                            isActive(link.href)
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted/50"
                          )}
                        >
                          <link.icon className="h-5 w-5" /> {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                    <SheetClose asChild>
                      <Link
                        href="/projects"
                        className={cn(
                          "flex items-center gap-3 text-lg font-semibold p-2 rounded-md",
                          isActive('/projects') ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                        )}
                      >
                        <Code className="h-5 w-5" /> Projects
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <a
                        href="https://mlscsvec.openstatus.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50"
                      >
                        <Activity className="h-5 w-5" /> Status
                      </a>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/apply"
                        className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50"
                      >
                        <Send className="h-5 w-5" /> Apply
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50"
                      >
                        <LogIn className="h-5 w-5" /> Admin Login
                      </Link>
                    </SheetClose>
                  </nav>
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <UserNav />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
