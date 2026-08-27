'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bell, Megaphone, X, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  message: string;
  createdAt: any;
}

interface LiveNotificationBellProps {
  /** Initial notifications loaded server-side (optional hydration) */
  initialNotifications?: Notification[];
}

function extractLink(message: string): string | null {
  // Regex to match URLs starting with http/https
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urlMatch = message.match(urlRegex);
  if (urlMatch) {
    return urlMatch[0];
  }

  // Regex to match internal routes (starts with / followed by alphanumeric/slashes)
  const routeRegex = /(?:\s|^)(\/(?:events|contribute|services|profile|issue-tracker|auth)[a-zA-Z0-9_\-\/]*)/i;
  const routeMatch = message.match(routeRegex);
  if (routeMatch) {
    return routeMatch[1].trim();
  }

  const msgLower = message.toLowerCase();
  // If message mentions "Event Calendar" or similar, default to /events
  if (msgLower.includes('event calendar') || msgLower.includes('new event') || msgLower.includes('scheduled for')) {
    return '/events';
  }
  // If message mentions "contribute" or "contributor", default to /contribute
  if (msgLower.includes('contribute') || msgLower.includes('contributor')) {
    return '/contribute';
  }
  // If message mentions "resume" or "ats", default to /services/resume
  if (msgLower.includes('resume') || msgLower.includes('ats')) {
    return '/services/resume';
  }
  // If message mentions "bug" or "issue", default to /issue-tracker
  if (msgLower.includes('bug') || msgLower.includes('issue')) {
    return '/issue-tracker';
  }
  
  return null;
}

export function LiveNotificationBell({ initialNotifications = [] }: LiveNotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const prevCountRef = useRef(initialNotifications.length);
  const isFirstLoad = useRef(true);

  // Live Firestore listener
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Notification, 'id'>),
      }));

      setNotifications(docs);

      // On first snapshot, just set the baseline count silently
      if (isFirstLoad.current) {
        prevCountRef.current = docs.length;
        isFirstLoad.current = false;
        return;
      }

      // New notifications arrived while page is open
      const newCount = docs.length - prevCountRef.current;
      if (newCount > 0) {
        setUnread((u) => u + newCount);
        const newest = docs[0];
        toast({
          title: '📣 New Announcement',
          description: newest.message,
          duration: 6000,
        });
      }
      prevCountRef.current = docs.length;
    });

    return () => unsub();
  }, [toast]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((o) => !o);
    setUnread(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailsOpen(true);
    setOpen(false);
  };

  const detectedLink = selectedNotification ? extractLink(selectedNotification.message) : null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
      >
        <Bell className="h-4 w-4 text-white/70" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-[#EA4335] text-white text-[9px] font-black border border-black animate-bounce">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-[300] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Megaphone className="h-3.5 w-3.5 text-[#4285F4]" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Announcements</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/30 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className="h-6 w-6 text-white/20" />
                <p className="text-xs text-white/30 font-medium">No announcements yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNotificationClick(n);
                  }}
                  className="w-full text-left px-4 py-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] transition-colors focus:outline-none flex flex-col gap-1"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4285F4] shrink-0" />
                    <p className="text-xs text-white/70 leading-relaxed line-clamp-2">{n.message}</p>
                  </div>
                  {n.createdAt && (
                    <p className="text-[10px] text-white/25 pl-4">
                      {new Date(n.createdAt?.toDate?.() ?? n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md bg-[#0A0A0A] border border-white/10 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
              <Megaphone className="h-4 w-4 text-[#4285F4]" />
              Announcement Details
            </DialogTitle>
            <DialogDescription className="text-xs text-white/40">
              {selectedNotification && selectedNotification.createdAt && (
                <span>
                  Posted on {new Date(selectedNotification.createdAt?.toDate?.() ?? selectedNotification.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {selectedNotification?.message}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t border-white/5 pt-4">
            {detectedLink && (
              <Button asChild variant="gradient" className="rounded-xl text-xs font-bold uppercase tracking-wider h-10 px-5">
                <Link href={detectedLink} onClick={() => { setDetailsOpen(false); setOpen(false); }}>
                  {detectedLink.startsWith('http') ? (
                    <>
                      Open External Link <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Go to Page <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </>
                  )}
                </Link>
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl border-white/10 text-white/70 hover:bg-white/5 hover:text-white text-xs font-bold uppercase tracking-wider h-10">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
