"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item?",
  description = "This action is permanent and cannot be undone.",
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  const [inputValue, setInputValue] = useState("");

  // Reset input when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  const isConfirmed = inputValue.trim().toLowerCase() === "confirm";

  const handleConfirm = () => {
    if (isConfirmed && !isLoading) {
      onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose(); }}>
      <DialogContent className="max-w-md border-rose-500/30 bg-white dark:bg-zinc-950/90 shadow-2xl backdrop-blur-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 mb-4 border border-rose-100 dark:border-rose-900/50">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-slate-900 dark:text-white font-black uppercase tracking-tight text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 dark:text-zinc-400 mt-2 font-medium leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-3 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">
            To proceed, type <span className="text-rose-500 select-all font-mono font-black">confirm</span> below:
          </label>
          <Input
            type="text"
            placeholder="Type 'confirm' to delete"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-center font-bold tracking-wide focus-visible:ring-rose-500 dark:focus-visible:ring-rose-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && isConfirmed) {
                handleConfirm();
              }
            }}
          />
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-xl border-slate-200 dark:border-zinc-800 font-bold uppercase tracking-wider text-xs h-10 select-none cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider text-xs h-10 select-none cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
