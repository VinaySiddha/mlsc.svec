'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
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
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Flag className="h-3.5 w-3.5" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {contentType}</DialogTitle>
          <DialogDescription>Please describe why you are reporting this content.</DialogDescription>
        </DialogHeader>
        <InputGroup className="bg-white/5 border-white/10">
          <InputGroupTextarea
            placeholder="Reason for reporting..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-24 text-sm text-white focus-visible:ring-0 placeholder:text-white/30"
          />
          <InputGroupAddon align="block-end" className="border-white/10 bg-white/5">
            <InputGroupText className="text-white/40 tabular-nums">
              {(reason || "").length} characters
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !reason.trim()}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
