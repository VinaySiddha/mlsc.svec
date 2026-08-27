
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        glass: "bg-card/60 backdrop-blur-sm border border-border/50 text-foreground hover:border-primary/50 hover:shadow-primary/5 hover:shadow-lg transition-all duration-300",
        gradient: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity",
      },
      size: {
        default: "h-11 px-5 py-3",
        sm: "h-10 rounded-md px-4",
        lg: "h-12 rounded-md px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  interactive?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, interactive = true, children, ...props }, ref) => {
    if (!interactive) {
      const Comp = asChild ? Slot : "button"
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement;
      return React.cloneElement(child, {
        className: cn(buttonVariants({ variant, size, className }), "relative overflow-hidden group", child.props.className),
        children: (
          <>
            <span className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1/2 w-8 h-8 bg-white rounded-full scale-0 transition-transform duration-700 ease-in-out group-hover:scale-[18] pointer-events-none" />
            <span className="relative z-10 transition-colors duration-500 group-hover:text-black flex items-center justify-center gap-2">
              {child.props.children}
            </span>
          </>
        )
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden group")}
        ref={ref}
        {...props}
      >
        <span className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1/2 w-8 h-8 bg-white rounded-full scale-0 transition-transform duration-700 ease-in-out group-hover:scale-[18] pointer-events-none" />
        <span className="relative z-10 transition-colors duration-500 group-hover:text-black flex items-center justify-center gap-2 w-full h-full">
          {children}
        </span>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

    