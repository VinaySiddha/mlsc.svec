import * as React from "react"
import { cn } from "@/lib/utils"

export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FieldGroup({ className, ...props }: FieldGroupProps) {
  return (
    <div
      className={cn("flex flex-col gap-5", className)}
      {...props}
    />
  )
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

export function Field({ className, orientation = "vertical", ...props }: FieldProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row items-center justify-between w-full",
        className
      )}
      {...props}
    />
  )
}

export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <label
      className={cn(
        "text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 select-none cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <p
      className={cn("text-[11px] text-slate-400 dark:text-zinc-500 leading-normal mt-1", className)}
      {...props}
    />
  )
}

export interface FieldErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  errors?: { message: string }[]
}

export function FieldError({ className, errors, ...props }: FieldErrorProps) {
  if (!errors || errors.length === 0) return null

  return (
    <div
      className={cn("text-xs font-semibold text-red-500 dark:text-red-400 mt-1", className)}
      {...props}
    >
      {errors.map((err, idx) => (
        <p key={idx}>{err.message}</p>
      ))}
    </div>
  )
}
