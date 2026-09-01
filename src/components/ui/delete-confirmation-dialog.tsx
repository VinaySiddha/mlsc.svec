'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { IosLoader } from './ios-loader';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description?: string;
  itemName?: string;
  itemDetails?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description = "This action cannot be undone. The record and its related data will be permanently removed from the system.",
  itemName,
  itemDetails,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-4 border-black text-black shadow-[10px_10px_0px_0px_#000000] p-6 sm:p-8 font-sans">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="size-14 bg-[#FF0055] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000]">
            <AlertTriangle className="size-7 stroke-[2.5]" />
          </div>
          <DialogTitle className="text-xl font-display font-black uppercase tracking-tight text-black italic">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-600 font-bold leading-relaxed max-w-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        {(itemName || itemDetails) && (
          <div className="my-2 p-3.5 bg-zinc-100 border-2 border-black flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_0px_#000000]">
            {itemName && <span className="font-black text-sm text-black uppercase">{itemName}</span>}
            {itemDetails && <span className="text-xs text-zinc-600 font-mono font-bold mt-0.5">{itemDetails}</span>}
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 pt-3 sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto text-xs text-black border-2 border-black bg-white hover:bg-zinc-100 font-black uppercase shadow-[2px_2px_0px_0px_#000000]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto bg-[#FF0055] hover:bg-[#FF0055]/90 text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <IosLoader size="xs" color="text-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5 stroke-[2.5]" />
                <span>Confirm Delete</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
