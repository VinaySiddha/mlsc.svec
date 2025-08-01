
import { getTeamMemberByToken } from "@/app/actions";
import { OnboardingForm } from "@/components/onboarding-form";
import { MLSCLogo } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OnboardingPage({ params }: { params: { token: string } }) {
    if (!params.token) {
        notFound();
    }

    const { member, error } = await getTeamMemberByToken(params.token);

    if (error || !member) {
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
                        <p className="text-muted-foreground">{error || "This onboarding link is either invalid or has expired. Please contact an admin for a new invitation."}</p>
                        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
                           Return to Home
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
                        <CardTitle className="text-3xl">Welcome to the Team, {member.name}!</CardTitle>
                        <CardDescription>
                            You&apos;ve been invited to join as <span className="font-bold text-primary">{member.role}</span>.
                            Please complete your profile below to get started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OnboardingForm member={member} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
