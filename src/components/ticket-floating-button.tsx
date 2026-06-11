'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bug } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { BugReportForm } from '@/components/bug-report-form';
import { Button } from '@/components/ui/button';

export function TicketFloatingButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Do not show on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 z-45">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-zinc-900/80 hover:bg-[#4285F4] text-white border border-white/10 hover:border-[#4285F4]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          title="Raise Ticket / Report Bug"
        >
          <Bug className="h-5.5 w-5.5 text-white/80 group-hover:text-white transition-transform group-hover:-rotate-12 duration-300" />
        </Button>
      </div>

      {/* Dialog Modal containing BugReportForm */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

          {/* Form component without its card wrapper wrapper to fit dialog perfectly */}
          <div className="bg-transparent border-none p-0">
            <BugReportForm isDialog={true} onSuccess={() => setIsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
