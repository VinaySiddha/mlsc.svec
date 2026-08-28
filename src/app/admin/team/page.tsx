import { getAllTeamMembersWithCategory } from "@/app/actions";
import { TeamMembersTable } from "@/components/team-members-table";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

export default async function TeamManagementPage() {
    const headersList = await headers();
    const userRole = headersList.get('X-User-Role');

    if (userRole !== 'super_admin') {
        redirect('/admin');
    }

    const { members, error } = await getAllTeamMembersWithCategory();

    if (error || !members) {
        return <div className="p-6 font-mono text-sm font-bold text-red-600">Error loading team members: {error || "Unknown error"}</div>
    }

    const hasPending = members.some(m => m.status === 'pending');
    const hasActive = members.some(m => m.status === 'active');

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-[3px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000000]">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-black uppercase italic">
                        Manage <span className="text-[#4285F4]">Team</span>
                    </h1>
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider mt-1">Create, update, and manage core team roster & domains</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="rounded-xl px-5 bg-[#FFE600] text-black hover:bg-yellow-300 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                        <Link href="/admin/team/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Member
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl px-5 bg-white text-black hover:bg-zinc-100 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000000]">
                        <Link href="/admin/team/categories">
                            Categories
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="bg-white border-[3px] border-black rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_#000000]">
                <TeamMembersTable members={members} hasPending={hasPending} hasActive={hasActive} />
            </div>
        </div>
    );
}
