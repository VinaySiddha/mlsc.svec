import { getTeamMemberById } from "@/app/actions";
import { DigitalIdCard } from "@/components/digital-id-card";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MemberIdCardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { member, error } = await getTeamMemberById(resolvedParams.id);

    if (error || !member) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-white text-black font-sans items-center justify-center p-4 sm:p-6 selection:bg-[#FFE600] selection:text-black">
            
            {/* Top Navigation */}
            <div className="w-full max-w-2xl flex items-center justify-between mb-8 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000000]">
                <Link href="/" className="flex items-center gap-2">
                    <MLSCLogo className="h-7 w-7 text-black" />
                    <span className="text-base font-black tracking-tighter text-black uppercase italic">MLSC SVEC</span>
                </Link>
                <Button asChild className="bg-zinc-100 hover:bg-zinc-200 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-black uppercase tracking-wider text-[11px] h-9 px-4">
                    <Link href="/team">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> View Team
                    </Link>
                </Button>
            </div>

            <main className="relative z-10 w-full max-w-2xl text-center space-y-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] px-3 py-1 shadow-[2px_2px_0px_0px_#000000] text-[10px] font-black uppercase tracking-widest text-black">
                        <ShieldCheck className="h-3.5 w-3.5" /> [ IDENTITY VERIFICATION // CORE TEAM ]
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase italic text-black">
                        Identity <span className="text-[#4285F4]">Credential.</span>
                    </h1>
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
                        Official Microsoft Learn Student Club Verification Pass
                    </p>
                </div>

                <div className="border-2 border-black bg-zinc-50 p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000000]">
                    <DigitalIdCard member={member} />
                </div>

                <div>
                    <p className="text-zinc-500 text-xs font-bold">
                        Digitally signed credential issued by Sri Vasavi Engineering College Chapter 4.0.
                    </p>
                </div>
            </main>
        </div>
    );
}
