"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>((({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4.5 w-4.5 shrink-0 rounded-md border border-white/20 bg-[#0A0A0A] focus-visible:outline-none focus-visible:border-[#4285F4]/60 focus-visible:ring-1 focus-visible:ring-[#4285F4]/60 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#4285F4] data-[state=checked]:border-[#4285F4] data-[state=checked]:text-white transition-all duration-200",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
