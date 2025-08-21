
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
import { AlertTriangle } from 'lucide-react';

export function EntryWarningPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem('hasSeenEntryWarning');
    if (!hasSeenWarning) {
      setIsOpen(true);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem('hasSeenEntryWarning', 'true');
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <span>Usage Policy and Security Warning</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            Welcome to our platform. Please be aware that this website is monitored for security purposes. Any attempt to perform malicious activities, including but not limited to taking screenshots, copying content, or unauthorized access, may result in your IP address and access being permanently blocked.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAcknowledge}>
            I Understand and Agree
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
