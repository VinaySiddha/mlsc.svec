'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Flag, Loader2 } from 'lucide-react';
import { reportContent } from '@/app/community-actions';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

interface ReportDialogProps {
  contentType: 'post' | 'comment';
  contentId: string;
  postId: string;
}

export function ReportDialog({ contentType, contentId, postId }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user || !reason.trim()) return;
    setSubmitting(true);
    const result = await reportContent({
      contentType,
      contentId,
      postId,
      reason: reason.trim(),
      reporterId: user.uid,
      reporterName: user.displayName || 'Anonymous',
    });
    if (result.success) {
      toast({ title: 'Report Submitted', description: 'Thank you for helping keep the community safe.' });
      setOpen(false);
      setReason('');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-zinc-100 border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
        >
          <Flag className="h-3 w-3 stroke-[2.5] text-[#FF0055]" />
          <span>REPORT</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white text-black border-4 border-black shadow-[10px_10px_0px_0px_#000000] p-6 max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span className="p-1 bg-[#FF0055] text-white border-2 border-black">
              <Flag className="h-4 w-4 stroke-[3]" />
            </span>
            Report {contentType}
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-zinc-600">
            Please describe why this content violates community guidelines.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <textarea
            placeholder="Provide context or explanation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full min-h-[100px] p-3 text-xs md:text-sm text-black bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] font-sans placeholder:text-zinc-400"
          />
          <div className="flex justify-end text-[10px] font-mono text-zinc-500 font-bold">
            {reason.length} characters
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-white text-black border-2 border-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black uppercase tracking-wider bg-[#FF0055] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Submit Report
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

