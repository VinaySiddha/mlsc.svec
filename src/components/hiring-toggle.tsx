'use client';

import { useState, useTransition } from 'react';
import { toggleHiringStatus } from '@/app/actions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function HiringToggle({ initialStatus }: { initialStatus: boolean }) {
  const [isOpen, setIsOpen] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleToggle = async (checked: boolean) => {
    setIsOpen(checked);
    startTransition(async () => {
      const result = await toggleHiringStatus(checked);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        setIsOpen(!checked); // revert
      } else {
        toast({ title: 'Success', description: `Hiring form is now ${checked ? 'Open' : 'Closed'}.` });
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg border">
      <Switch 
        id="hiring-mode" 
        checked={isOpen} 
        onCheckedChange={handleToggle} 
        disabled={isPending}
      />
      <Label htmlFor="hiring-mode" className="text-sm font-medium cursor-pointer">
        {isOpen ? 'Hiring Open' : 'Hiring Closed'}
      </Label>
    </div>
  );
}
