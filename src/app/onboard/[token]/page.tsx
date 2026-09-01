'use client';

import { useState, useEffect, use } from "react";
import { getTeamMemberByToken, completeOnboarding } from "@/app/actions";
import { OnboardingForm } from "@/components/onboarding-form";
import { AlertTriangle, ThumbsUp, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DigitalIdCard } from "@/components/digital-id-card";
import { Button } from "@/components/ui/button";

interface OnboardingPageProps {
  params: Promise<{ token: string }>;
}

export default function OnboardingPage({ params }: OnboardingPageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const [step, setStep] = useState('loading');
  const [memberData, setMemberData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid onboarding link.");
        setStep('error');
        return;
      }
      
      const { member, error } = await getTeamMemberByToken(token);
      
      if (error || !member) {
        setError(error || "This onboarding link is either invalid or has expired.");
        setStep('error');
      } else {
        setMemberData(member);
        setStep('form');
      }
    };
    verifyToken();
  }, [token]);

  const handleOnboardingComplete = async (formData: FormData) => {
    formData.append('token', token);
    const result = await completeOnboarding(formData);
    if (result.error || !result.member) {
      setError(result.error || "Failed to activate profile.");
      setStep('error');
    } else {
      setMemberData(result.member);
      setStep('success');
    }
    return { error: result.error };
  };

  if (step === 'loading') {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-white text-black font-sans">
        <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0px_0px_#000000] text-center space-y-3 max-w-md w-full">
          <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-black uppercase text-black">Verifying Invitation Token...</h2>
          <p className="text-xs text-zinc-600 font-bold">Connecting to MLSC credential vault.</p>
        </div>
      </div>
    );
  }
  
  if (step === 'error') {
     return (
        <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-white text-black font-sans">
            <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] text-center space-y-4 max-w-md w-full">
                <div className="p-4 bg-[#EA4335] text-white border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000000]">
                   <AlertTriangle className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-black uppercase italic tracking-tight text-black">Invalid or Expired Link</h2>
                <p className="text-xs text-zinc-600 font-bold leading-relaxed">{error}</p>
                <div className="pt-2">
                  <Button asChild className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 px-6 shadow-[3px_3px_0px_0px_#000000]">
                    <Link href="/">
                       <ArrowLeft className="h-4 w-4 mr-2" /> Return to Home
                    </Link>
                  </Button>
                </div>
            </div>
        </div>
    );
  }

  if (step === 'success') {
      return (
        <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-white text-black font-sans py-16">
          <div className="w-full max-w-lg space-y-6">
            
            <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] text-center space-y-4">
              <div className="p-3 bg-[#00FF66] border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000000]">
                <ThumbsUp className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-black">
                Welcome to the Team!
              </h2>
              <p className="text-xs text-zinc-600 font-bold">
                Your profile is now active on the MLSC SVEC network. Here is your official Chapter 4 Member ID.
              </p>

              <div className="pt-2">
                <DigitalIdCard member={memberData} />
              </div>

              <div className="space-y-2 pt-4">
                <Button asChild className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[3px_3px_0px_0px_#000000]">
                  <Link href={`/profile/me`}>Manage Your Profile</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-white hover:bg-zinc-50 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[2px_2px_0px_0px_#000000]">
                  <Link href="/team">View Team Roster <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
    );
  }
    
  return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-white text-black font-sans py-16">
          <header className="absolute top-0 left-0 w-full p-4 border-b-2 border-black bg-[#FFE600]">
              <div className="container mx-auto flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-black">
                    ⚡ Microsoft Learn Student Club — SVEC Chapter
                  </span>
                  <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
                    Core Onboarding
                  </span>
              </div>
          </header>
          
          <main className="w-full max-w-lg mt-12">
              <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
                  <div className="border-b-2 border-black pb-4 text-center space-y-1">
                      <h1 className="text-2xl font-black uppercase italic tracking-tight text-black">
                        Welcome, {memberData.name}!
                      </h1>
                      <p className="text-xs text-zinc-600 font-bold">
                        Invited to join as <span className="bg-[#FFE600] border border-black px-1.5 py-0.5 font-black text-black">{memberData.role}</span>. Complete your profile details below.
                      </p>
                  </div>
                  <OnboardingForm onComplete={handleOnboardingComplete} />
              </div>
          </main>
      </div>
  );
}
