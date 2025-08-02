
import { TeamMemberForm } from "@/components/team-member-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTeamCategories } from "@/app/actions";

export default async function NewTeamMemberPage() {
    const headersList = headers();
    const userRole = headersList.get('X-User-Role');

    if (userRole !== 'admin') {
        redirect('/admin');
    }

    const { categories, error } = await getTeamCategories();
    if (error) {
        return <div>{error}</div>
    }

    return (
         <div className="flex flex-col min-h-screen">
            <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MLSCLogo className="h-10 w-10 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Add New Team Member
                        </h1>
                    </div>
                     <Button asChild variant="glass">
                        <Link href="/admin/team">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Team
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="container mx-auto">
                     <Card className="max-w-2xl mx-auto glass-card">
                        <CardHeader>
                            <CardTitle>New Team Member Details</CardTitle>
                            <CardDescription>
                                Fill out the form below to invite a new member to the team. They will receive an email to complete their onboarding.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeamMemberForm categories={categories} />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
