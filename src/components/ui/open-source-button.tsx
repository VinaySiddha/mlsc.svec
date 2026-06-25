"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpenSourceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export const OpenSourceButton = React.forwardRef<HTMLButtonElement, OpenSourceButtonProps>(
  ({ children, onClick, href, className = "", disabled = false, type = "button", ...props }, ref) => {
    const buttonContent = (
      <>
        <span className="relative z-10 transition-all duration-500">
          {children}
        </span>
        <div className="absolute right-1 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45 shrink-0">
          <ArrowUpRight size={16} />
        </div>
      </>
    );

    const commonClasses = "relative text-xs font-bold rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden cursor-pointer bg-white text-black border border-white hover:bg-white/95 flex items-center justify-center shadow-lg active:scale-95 uppercase tracking-wider";

    if (href) {
      return (
        <Button
          asChild
          interactive={false}
          className={cn(commonClasses, className)}
        >
          <Link href={href}>
            {buttonContent}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        type={type}
        interactive={false}
        onClick={onClick}
        disabled={disabled}
        className={cn(commonClasses, className)}
        {...props}
      >
        {buttonContent}
      </Button>
    );
  }
);

OpenSourceButton.displayName = "OpenSourceButton";
