
'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PartyPopper } from 'lucide-react';
import { getLatestAnnouncement } from '@/app/actions';
import Link from 'next/link';

interface Announcement {
    type: 'notification' | 'event';
    message: string;
    link?: string;
}

export function CelebrationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenCelebrationPopup');

    if (!hasSeenPopup) {
      const fetchAnnouncement = async () => {
        try {
          const { announcement: latestAnnouncement, error } = await getLatestAnnouncement();
          if (!error && latestAnnouncement) {
            setAnnouncement(latestAnnouncement as Announcement);
            setIsOpen(true);
            sessionStorage.setItem('hasSeenCelebrationPopup', 'true');
          }
        } catch (e) {
            console.error("Failed to fetch announcement for popup", e);
        }
      };
      
      fetchAnnouncement();
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || !announcement) {
      return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="glass-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-center gap-2 text-xl">
            <PartyPopper className="h-8 w-8 text-primary animate-pulse" />
            <span>What's New at MLSC?</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4 text-lg text-foreground/90 text-center">
            {announcement.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='sm:justify-center'>
            {announcement.type === 'event' && announcement.link ? (
                <AlertDialogAction asChild>
                    <Link href={announcement.link} onClick={handleClose}>View Event</Link>
                </AlertDialogAction>
            ) : (
                <AlertDialogAction onClick={handleClose}>
                    Awesome!
                </AlertDialogAction>
            )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
