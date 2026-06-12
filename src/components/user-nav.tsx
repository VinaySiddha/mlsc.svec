'use client';

import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, User, MessageSquare, Calendar, LogOut, Bug } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BugReportForm } from '@/components/bug-report-form';

export function UserNav() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [ticketOpen, setTicketOpen] = useState(false);

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <Button asChild variant="glass" size="sm">
        <Link href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}>
          <LogIn className="h-4 w-4 mr-1" /> Sign In
        </Link>
      </Button>
    );
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || '?';

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-60 bg-[#080808]/95 backdrop-blur-xl border border-white/[0.10] rounded-2xl p-2 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_24px_80px_rgba(0,0,0,0.95),0_8px_32px_rgba(0,0,0,0.7)]" 
        align="end" 
        sideOffset={32}
        forceMount
      >
        <DropdownMenuLabel className="font-normal px-3 py-3 select-none">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-white/95 leading-none">{user.displayName}</p>
            <p className="text-xs text-white/40 leading-none mt-0.5">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.06] my-1.5" />
        <DropdownMenuItem asChild>
          <Link 
            href="/profile/me" 
            className="group cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
          >
            <User className="h-4 w-4 text-white/40 group-hover:text-white/80 group-focus:text-white/80 transition-colors" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            href="/community" 
            className="group cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
          >
            <MessageSquare className="h-4 w-4 text-white/40 group-hover:text-white/80 group-focus:text-white/80 transition-colors" /> Community
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            href="/events" 
            className="group cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
          >
            <Calendar className="h-4 w-4 text-white/40 group-hover:text-white/80 group-focus:text-white/80 transition-colors" /> Events
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault();
            setTicketOpen(true);
          }}
          className="group cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white transition-colors flex items-center gap-2.5"
        >
          <Bug className="h-4 w-4 text-white/40 group-hover:text-white/80 group-focus:text-white/80 transition-colors" /> Raise Ticket
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/[0.06] my-1.5" />
        <DropdownMenuItem 
          onClick={() => signOut()} 
          className="group cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500/90 hover:bg-rose-500/10 hover:text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 transition-colors flex items-center gap-2.5"
        >
          <LogOut className="h-4 w-4 text-rose-500/50 group-hover:text-rose-500/80 group-focus:text-rose-500/80 transition-colors" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
      <DialogContent className="max-w-md bg-[#080808]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-black tracking-tight text-white uppercase italic flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            Raise Ticket / <span className="text-[#4285F4]">Report Bug</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 font-medium">
            Submit your ticket below. Our technical support leads will investigate this issue immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-transparent border-none p-0">
          <BugReportForm isDialog={true} onSuccess={() => setTicketOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
