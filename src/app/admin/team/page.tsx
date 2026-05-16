
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

    if (error || !members) {
        return <div>Error loading team members: {error || "Unknown error"}</div>
    }

    const hasPending = members.some(m => m.status === 'pending');
    const hasActive = members.some(m => m.status === 'active');

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full glass-panel !rounded-none !border-t-0 !border-x-0 !shadow-none py-2">
                <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-12">
                    <Link href="/admin" className="flex items-center gap-3 group">
                        <MLSCLogo className="h-9 w-9 text-primary transition-transform group-hover:scale-105" />
                        <h1 className="text-2xl font-black tracking-tighter">
                            Manage <span className="text-muted-foreground/50">Team</span>
                        </h1>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Button asChild variant="outline" className="rounded-full px-6">
                            <Link href="/admin/team/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Member
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="rounded-full px-6">
                            <Link href="/admin/team/categories">
                                Categories
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="rounded-full px-6">
                            <Link href="/admin">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-8 md:p-12 lg:p-16">
                <div className="container mx-auto">
                    <div className="apple-card p-10">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black tracking-tighter">Team Directory.</h2>
                            <p className="text-muted-foreground font-medium">Create, update, and manage all team members.</p>
                        </div>
                        <TeamMembersTable members={members} hasPending={hasPending} hasActive={hasActive} />
                    </div>
                </div>
            </main>
        </div>
    );
}
