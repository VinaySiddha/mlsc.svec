import { cn } from "@/lib/utils";
import Image from "next/image";
import type { SVGProps } from "react";

export function MLSCLogo(props: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="MLSC Logo"
      width={40}
      height={40}
      className={cn(props.className)}
    />
  );
}
