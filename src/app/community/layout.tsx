import type { Metadata } from "next";
import { MLSCLogo } from '@/components/icons';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Community — MLSC SVEC",
  description: "Join the MLSC SVEC community — share posts, discuss ideas, and connect with fellow student innovators.",
  openGraph: {
    title: "Community — MLSC SVEC",
    description: "Join the MLSC SVEC community — share posts, discuss ideas, and connect with fellow student innovators.",
    url: "https://mlscsvec.com/community",
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black bg-[#FFE600] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[3]" />
              <span className="hidden sm:inline">PORTAL</span>
            </Link>
            <Link href="/community" className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#4285F4] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <MLSCLogo className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-display font-black tracking-tight text-black uppercase">
                  COMMUNITY
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 bg-[#00FF66] text-black text-[9px] font-black uppercase tracking-widest border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                  FEED
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/community/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000000] transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>NEW POST [↗]</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 container mx-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}

