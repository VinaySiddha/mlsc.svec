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
      <DialogContent className="max-w-md bg-zinc-950/95 border border-red-500/20 text-white shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
            <AlertTriangle className="size-7 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/50 leading-relaxed max-w-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        {(itemName || itemDetails) && (
          <div className="my-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center text-center">
            {itemName && <span className="font-bold text-sm text-white">{itemName}</span>}
            {itemDetails && <span className="text-xs text-white/40 font-mono mt-0.5">{itemDetails}</span>}
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 pt-3 sm:justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <IosLoader size="xs" color="text-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Confirm Delete</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
