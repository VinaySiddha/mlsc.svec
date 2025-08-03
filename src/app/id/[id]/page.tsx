
import { getTeamMemberById } from "@/app/actions";
import { DigitalIdCard } from "@/components/digital-id-card";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MemberIdCardPage({ params }: { params: { id: string } }) {
    const { member, error } = await getTeamMemberById(params.id);

    if (error || !member) {
        notFound();
    }

    return (
         <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
            <header className="absolute top-0 left-0 w-full p-4">
              <div className="container mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <MLSCLogo className="h-10 w-10 text-primary" />
                      <span className="text-xl font-bold tracking-tight">Microsoft Learn Student Club</span>
                  </div>
                  <Button asChild variant="glass">
                      <Link href="/team">
                          <Home className="mr-2 h-4 w-4" />
                          View Team
                      </Link>
                  </Button>
              </div>
          </header>
            <main className="flex items-center justify-center flex-1">
                <Card className="w-full max-w-md glass-card">
                    <CardHeader>
                        <CardTitle>Digital ID Card</CardTitle>
                        <CardDescription>
                            This is your official MLSC team member ID card. You can download it as an image.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DigitalIdCard
                            name={member.name}
                            referenceId={member.role}
                        />
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
