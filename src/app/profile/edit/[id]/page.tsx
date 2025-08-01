
import { getTeamMemberById, getTeamCategories } from "@/app/actions";
import { TeamMemberForm } from "@/components/team-member-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditProfilePage({ params }: { params: { id: string } }) {
    // This is a placeholder for a real session check.
    // In a real app, you would verify the user's token or session here
    // to ensure they are authorized to edit this profile.
    const isAuthorized = true; // For now, we assume authorized.

    if (!isAuthorized) {
        redirect('/login');
    }

    const { member, error: memberError } = await getTeamMemberById(params.id);
    const { categories, error: categoriesError } = await getTeamCategories();

    if (memberError || categoriesError || !member) {
        notFound();
    }

    return (
         <div className="flex flex-col min-h-screen">
            <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MLSCLogo className="h-10 w-10 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Edit Your Profile
                        </h1>
                    </div>
                     <Button asChild variant="glass">
                        <Link href="/team">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Team Page
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="container mx-auto">
                     <Card className="max-w-2xl mx-auto glass-card">
                        <CardHeader>
                            <CardTitle>Update Your Profile</CardTitle>
                            <CardDescription>
                                Keep your profile information up to date.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeamMemberForm member={member as any} categories={categories} isAdmin={false} />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
