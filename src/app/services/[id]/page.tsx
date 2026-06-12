"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ServiceDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/services");
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <Loader2 className="h-8 w-8 animate-spin text-[#4285F4] mb-3" />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 animate-pulse">
        Redirecting to Services Hub...
      </p>
    </div>
  );
}
