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
        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Finalize Cycle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Finalize Hiring Cycle
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to finalize the hiring cycle? This is a destructive action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm">
          <p>This action will perform the following:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Archive Current Team:</strong> All active team members will be moved to Alumni status.</li>
            <li><strong>Promote New Hires:</strong> Any application marked as "Hired" will be moved into the active team and sent an invitation.</li>
            <li><strong>Archive Applications:</strong> All current applications will be hidden from this dashboard to prepare for the next cycle.</li>
            <li><strong>Close Registrations:</strong> The hiring form will be automatically closed.</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleFinalize} disabled={loading} variant="destructive" className="bg-red-600">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            I understand, Finalize Cycle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
