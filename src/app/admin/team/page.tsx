
import { getAllTeamMembersWithCategory } from "@/app/actions";
import { TeamMembersTable } from "@/components/team-members-table";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TeamManagementPage() {
    const headersList = headers();
    const userRole = headersList.get('X-User-Role');

    if (userRole !== 'admin') {
        redirect('/admin');
    }

    const { members, error } = await getAllTeamMembersWithCategory();

    if (error) {
        return <div>Error loading team members: {error}</div>
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MLSCLogo className="h-10 w-10 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Team Management
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button asChild variant="glass">
                            <Link href="/admin/team/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Member
                            </Link>
                        </Button>
                        <Button asChild variant="glass">
                            <Link href="/admin/team/categories">
                                Manage Categories
                            </Link>
                        </Button>
                        <Button asChild variant="glass">
                            <Link href="/admin">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="container mx-auto space-y-8">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>All Team Members</CardTitle>
                            <CardDescription>
                                Here you can create, update, and manage all team members.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeamMembersTable members={members} />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
