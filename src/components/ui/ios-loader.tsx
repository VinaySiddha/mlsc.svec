import React from "react";
import { cn } from "@/lib/utils";

interface IosLoaderProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
}

const sizeClasses = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function IosLoader({ className, size = "sm", color }: IosLoaderProps) {
  // 12 spokes for genuine iOS spinner
  const spokes = Array.from({ length: 12 });

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="loading"
    >
      {spokes.map((_, i) => {
        const rotation = i * 30; // 360 / 12 = 30 deg
        const delay = -((12 - i) / 12).toFixed(3); // staggered opacity

        return (
          <div
            key={i}
            className="absolute left-1/2 top-0 h-full w-[10%] -translate-x-1/2"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <div
              className={cn(
                "h-[28%] w-full rounded-full bg-current opacity-20 animate-ios-spinner",
                color
              )}
              style={{
                animationDelay: `${delay}s`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
