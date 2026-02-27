
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
import { getNotifications } from '@/app/actions';

interface Notification {
    id: string;
    message: string;
}

export function CelebrationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenCelebrationPopup');

    if (!hasSeenPopup) {
      const fetchLatestNotification = async () => {
        try {
          const { notifications, error } = await getNotifications();
          if (!error && notifications && notifications.length > 0) {
            setLatestNotification(notifications[0]); // Get the most recent one
            setIsOpen(true);
            sessionStorage.setItem('hasSeenCelebrationPopup', 'true');
          }
        } catch (e) {
            // Silently fail if notifications can't be fetched
            console.error("Failed to fetch notifications for popup", e);
        }
      };
      
      fetchLatestNotification();
    }
  }, []);

  const handleAcknowledge = () => {
    setIsOpen(false);
  };

  if (!isOpen || !latestNotification) {
      return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="glass-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <PartyPopper className="h-8 w-8 text-primary animate-pulse" />
            <span>What's New at MLSC?</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4 text-lg text-foreground/90 text-center">
            {latestNotification.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAcknowledge}>
            Awesome!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
