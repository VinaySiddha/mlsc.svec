"use client";

import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import Link from "next/link";

interface InteractiveButtonProps extends ButtonProps {
  href?: string;
}

export const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ children, href, className, ...props }, ref) => {
    if (href) {
      return (
        <Button
          asChild
          className={className}
          {...props}
        >
          <Link href={href}>
            {children}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

InteractiveButton.displayName = "InteractiveButton";
