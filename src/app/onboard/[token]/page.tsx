
'use client'

import { useState } from "react";
import { getTeamMemberByToken, completeOnboarding } from "@/app/actions";
import { OnboardingForm } from "@/components/onboarding-form";
import { MLSCLogo } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { DigitalIdCard } from "@/components/digital-id-card";

interface OnboardingPageProps {
  params: { token: string };
}

export default function OnboardingPage({ params }: OnboardingPageProps) {
  const [step, setStep] = useState('loading');
  const [memberData, setMemberData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    const verifyToken = async () => {
      if (!params.token) {
        setError("Invalid onboarding link.");
        setStep('error');
        return;
      }
      
      const { member, error } = await getTeamMemberByToken(params.token);
      
      if (error || !member) {
        setError(error || "This onboarding link is either invalid or has expired.");
        setStep('error');
      } else {
        setMemberData(member);
        setStep('form');
      }
    };
    verifyToken();
  });

  const handleOnboardingComplete = async (values: { image: string, linkedin: string }) => {
    const result = await completeOnboarding({ token: params.token, ...values });
    if (result.error || !result.member) {
      setError(result.error || "Failed to activate profile.");
      setStep('error');
    } else {
      setMemberData(result.member);
      setStep('success');
    }
    return result;
  };

  if (step === 'loading') {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card text-center">
          <CardHeader>
            <CardTitle>Verifying Invitation...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please wait while we check your onboarding link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (step === 'error') {
     return (
        <div className="flex flex-col min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md glass-card text-center">
                <CardHeader>
                    <CardTitle className="flex justify-center items-center gap-2 text-destructive">
                       <AlertTriangle className="h-6 w-6" />
                       Invalid or Expired Link
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{error}</p>
                    <Link href="/" className="text-primary hover:underline mt-4 inline-block">
                       Return to Home
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (step === 'success') {
      return (
        <div className="flex flex-col min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-lg glass-card">
             <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl text-green-400">
                    <ThumbsUp className="h-8 w-8" />
                    <span>Welcome to the Team!</span>
                </CardTitle>
                <CardDescription>
                    Your profile is now active. Here is your official team member ID card.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <DigitalIdCard 
                    name={memberData.name}
                    referenceId={memberData.role}
                />
                 <Link href="/team" className="text-primary hover:underline mt-4 inline-block w-full text-center">
                    View the Team Page
                </Link>
            </CardContent>
          </Card>
        </div>
    );
  }
    
  return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
          <header className="absolute top-0 left-0 w-full p-4">
              <div className="container mx-auto flex items-center gap-2">
                  <MLSCLogo className="h-10 w-10 text-primary" />
                  <span className="text-xl font-bold tracking-tight">Microsoft Learn Student Club</span>
              </div>
          </header>
          <main>
              <Card className="w-full max-w-lg glass-card">
                  <CardHeader className="text-center">
                      <CardTitle className="text-3xl">Welcome to the Team, {memberData.name}!</CardTitle>
                      <CardDescription>
                          You&apos;ve been invited to join as <span className="font-bold text-primary">{memberData.role}</span>.
                          Please complete your profile below to get started.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <OnboardingForm onComplete={handleOnboardingComplete} />
                  </CardContent>
              </Card>
          </main>
      </div>
  );
}
