import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 border-black px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider transition-colors shadow-[2px_2px_0px_0px_#000000]",
  {
    variants: {
      variant: {
        default:
          "bg-[#FFE600] text-black",
        secondary:
          "bg-white text-black",
        destructive:
          "bg-[#FF0055] text-white",
        outline: "bg-white text-black",
        blue: "bg-[#4285F4] text-white",
        green: "bg-[#00FF66] text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
