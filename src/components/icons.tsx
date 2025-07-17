import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function MLSCLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>MLSC Hub Logo</title>
      <path d="M4 4h16v16H4z" fill="hsl(var(--primary) / 0.1)" stroke="none" />
      <path d="M7 7v10" />
      <path d="M7 12h4l4 5V7l-4 5" />
      <path d="M17 7v10" />
    </svg>
  );
}
