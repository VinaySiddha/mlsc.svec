import type { Metadata } from "next";
import { ApplicationForm } from "@/components/application-form";
import { getHiringStatus } from "@/app/actions";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Apply — MLSC SVEC",
  description: "Apply to join Microsoft Learn Student Club SVEC. Be part of a community of student innovators, tech enthusiasts, and future leaders.",
  openGraph: {
    title: "Apply — MLSC SVEC",
    description: "Apply to join Microsoft Learn Student Club SVEC. Be part of a community of student innovators, tech enthusiasts, and future leaders.",
    url: "https://mlscsvec.com/apply",
  },
};

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

export default async function ApplyPage() {
  const { isHiringOpen } = await getHiringStatus();
  const isClosed = !isHiringOpen;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1">
        <section className="relative w-full py-24 md:py-40 text-center overflow-hidden border-b border-white/5">
            <div className="glow-sphere top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4285F4]/10" />
            <div className="container mx-auto px-6 relative z-10">
                <h1 className="hero-heading">
                    APPLY <br/> <span className="text-[#4285F4]">NOW.</span>
                </h1>
                <p className="max-w-xl mx-auto mt-8 text-white/50 text-xl font-medium">
                    {isClosed 
                        ? "Hiring is currently closed. Stay tuned for future opportunities." 
                        : "Join the most active developer community at Sri Vasavi Engineering College."}
                </p>
            </div>
        </section>

        <section className="py-24 md:py-40 container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
                {isClosed ? (
                    <div className="bento-card p-20 text-center flex flex-col items-center">
                        <Clock className="h-20 w-20 text-[#EA4335] mb-8" />
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Closed.</h2>
                        <p className="text-white/50 text-lg font-medium max-w-sm mx-auto">
                            Applications are no longer being accepted at this time. 
                            Follow our social channels for updates.
                        </p>
                        <Button asChild variant="outline" className="mt-12 rounded-full border-white/10">
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="bento-card !p-0 overflow-hidden bg-[#0A0A0A] border-white/10">
                        <div className="p-12 md:p-16">
                             <ApplicationForm />
                        </div>
                    </div>
                )}
            </div>
        </section>
      </main>
    </div>
  );
}
