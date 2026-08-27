import { getTeamMemberById } from "@/app/actions";
import { DigitalIdCard } from "@/components/digital-id-card";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

export default async function MemberIdCardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { member, error } = await getTeamMemberById(resolvedParams.id);

    if (error || !member) {
        notFound();
    }

    return (
         <div className="flex flex-col min-h-screen bg-black text-white font-sans items-center justify-center p-6">
            <div className="glow-sphere top-[20%] left-[20%] w-[30%] h-[30%] bg-[#4285F4]/10" />
            
            <header className="absolute top-0 left-0 w-full h-20 glass-nav">
              <div className="container mx-auto h-full flex items-center justify-between px-6 md:px-12">
                  <Link href="/" className="flex items-center gap-3">
                      <MLSCLogo className="h-9 w-9 text-white" />
                      <span className="text-2xl font-black tracking-tighter text-white uppercase italic">MLSC SVEC.</span>
                  </Link>
                  <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[0.6rem] px-8">
                      <Link href="/team">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          View Team
                      </Link>
                  </Button>
              </div>
          </header>

            <main className="relative z-10 w-full max-w-2xl text-center">
                 <div className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Identity <br/> <span className="text-[#4285F4]">Verification.</span></h1>
                    <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">Official Core Team Credential</p>
                </div>

                <div className="bento-card !p-0 overflow-hidden border-white/10 shadow-2xl shadow-[#4285F4]/10 bg-[#0A0A0A]">
                    <div className="p-10 md:p-16">
                         <DigitalIdCard member={member} />
                    </div>
                </div>

                <div className="mt-12">
                     <p className="text-white/30 text-sm font-medium">This is a digitally generated ID for verification purposes.</p>
                </div>
            </main>
        </div>
    )
}
