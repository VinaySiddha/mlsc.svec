'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { finalizeHiringCycle } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function FinalizeCycleDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const result = await finalizeHiringCycle();
      if (result.error) {
        toast({ title: 'Error finalizing cycle', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success!', description: 'Hiring cycle finalized. Dashboard cleared and new team promoted.' });
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to complete finalization.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-[#FF0055] hover:bg-[#FF0055]/90 text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] py-3 h-auto">
          <AlertTriangle className="mr-2 h-4 w-4 stroke-[2.5]" />
          Finalize Cycle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white text-black border-4 border-black p-6 shadow-[10px_10px_0px_0px_#000000] font-sans">
        <DialogHeader className="border-b-2 border-black pb-4">
          <DialogTitle className="flex items-center gap-2 text-[#FF0055] font-black uppercase text-lg font-display">
            <AlertTriangle className="h-5 w-5 stroke-[2.5]" />
            Finalize Hiring Cycle
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-600 font-bold mt-1">
            Are you sure you want to finalize the hiring cycle? This is an irreversible action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-xs font-semibold text-black">
          <p className="font-bold">This action will perform the following operations:</p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-700">
            <li><strong className="text-black">Archive Current Team:</strong> All active team members will be moved to Alumni status.</li>
            <li><strong className="text-black">Promote New Hires:</strong> Any application marked as "Hired" will be moved into the active team and sent an invitation.</li>
            <li><strong className="text-black">Archive Applications:</strong> All current applications will be hidden from this dashboard to prepare for the next cycle.</li>
            <li><strong className="text-black">Close Registrations:</strong> The hiring form will be automatically closed.</li>
          </ul>
        </div>

        <DialogFooter className="border-t-2 border-black pt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} className="border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000]">
            Cancel
          </Button>
          <Button onClick={handleFinalize} disabled={loading} className="bg-[#FF0055] hover:bg-[#FF0055]/90 text-white border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] px-4">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4 stroke-[2.5]" />}
            I understand, Finalize Cycle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
