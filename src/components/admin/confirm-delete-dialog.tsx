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
      <DialogContent className="max-w-md border-4 border-black bg-white text-black shadow-[10px_10px_0px_0px_#000000] p-6 sm:p-8 font-sans">
        <DialogHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#FF0055] text-white mb-4 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <AlertTriangle className="h-7 w-7 stroke-[2.5]" />
          </div>
          <DialogTitle className="text-center text-black font-display font-black uppercase tracking-tight text-xl italic">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-600 mt-2 font-bold leading-relaxed text-xs">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-3 space-y-2">
          <label className="text-[10px] font-black text-black uppercase tracking-widest block">
            To proceed, type <span className="text-[#FF0055] select-all font-mono font-black">confirm</span> below:
          </label>
          <Input
            type="text"
            placeholder="Type 'confirm' to delete"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="w-full border-2 border-black bg-white text-black text-center font-black tracking-wide"
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
            className="w-full border-2 border-black bg-white hover:bg-zinc-100 text-black font-black uppercase tracking-wider text-xs h-10 select-none cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className="w-full bg-[#FF0055] hover:bg-[#FF0055]/90 text-white border-2 border-black font-black uppercase tracking-wider text-xs h-10 select-none cursor-pointer shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center gap-2"
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
