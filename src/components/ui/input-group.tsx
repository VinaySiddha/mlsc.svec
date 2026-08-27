import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

export interface InputGroupTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, InputGroupTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500 min-h-24 resize-none",
          className
        )}
        {...props}
      />
    )
  }
)
InputGroupTextarea.displayName = "InputGroupTextarea"

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "block-start" | "block-end"
}

export function InputGroupAddon({ className, align = "block-end", ...props }: InputGroupAddonProps) {
  return (
    <div
      className={cn(
        "flex px-4 py-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 text-xs",
        align === "block-end" ? "justify-end" : "justify-start",
        className
      )}
      {...props}
    />
  )
}

export interface InputGroupTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span
      className={cn("text-slate-400 dark:text-zinc-500 select-none", className)}
      {...props}
    />
  )
}
