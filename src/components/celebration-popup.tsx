'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Megaphone } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export function CelebrationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const seenRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenCelebrationPopup');
    if (hasSeenPopup) return;

    // Listen for the latest notification in real-time
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;

      const latest = snap.docs[0].data();
      const msg = latest.message as string;

      if (!seenRef.current && msg) {
        seenRef.current = true;
        setMessage(msg);
        setIsOpen(true);
        sessionStorage.setItem('hasSeenCelebrationPopup', 'true');
      }
    });

    return () => unsub();
  }, []);

  if (!mounted || !isOpen || !message) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-center gap-2.5 text-white text-lg font-black uppercase italic tracking-tight">
            <div className="h-9 w-9 rounded-xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center">
              <Megaphone className="h-4.5 w-4.5 text-[#4285F4]" />
            </div>
            What&apos;s New at MLSC?
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4 text-sm text-white/60 text-center leading-relaxed">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3 mt-2">
          <AlertDialogAction
            onClick={() => setIsOpen(false)}
            className="bg-white text-black font-bold hover:bg-white/90 rounded-xl px-8 h-10 text-xs uppercase tracking-widest"
          >
            Got it!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
