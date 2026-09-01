import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-none border-2 border-black bg-white px-4 py-2 text-sm text-black placeholder:text-zinc-400 transition-all duration-200 hover:border-black focus:bg-white focus-visible:outline-none focus-visible:border-black focus-visible:shadow-[3px_3px_0px_0px_#000000] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
