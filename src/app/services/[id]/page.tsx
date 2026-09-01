"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServiceDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/services");
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans">
      <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0px_0px_#000000] text-center space-y-3">
        <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto" />
        <p className="text-xs font-black uppercase tracking-widest text-black">
          Redirecting to Services Hub...
        </p>
      </div>
    </div>
  );
}
