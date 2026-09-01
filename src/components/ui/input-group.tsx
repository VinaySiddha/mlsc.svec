import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col w-full rounded-none border-2 border-black bg-white focus-within:shadow-[3px_3px_0px_0px_#000000] transition-all overflow-hidden",
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
          "w-full bg-white text-black px-4 py-3 text-sm outline-none placeholder:text-zinc-400 min-h-24 resize-none",
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
        "flex px-4 py-2 border-t-2 border-black bg-zinc-50 text-xs text-black font-medium",
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
      className={cn("text-zinc-500 select-none text-xs font-bold uppercase tracking-wider", className)}
      {...props}
    />
  )
}
