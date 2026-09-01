import { getTeamMemberById, getTeamCategories } from "@/app/actions";
import { TeamMemberForm } from "@/components/team-member-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const isAuthorized = true;

    if (!isAuthorized) {
        redirect('/login');
    }

    const resolvedParams = await params;
    const { member, error: memberError } = await getTeamMemberById(resolvedParams.id);
    const { categories, error: categoriesError } = await getTeamCategories();

    if (memberError || categoriesError || !member) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
            
            {/* Top Banner */}
            <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
                ⚡ Member Profile Maintenance Protocol
            </div>

            <header className="border-b-2 border-black bg-white py-4 px-4 sm:px-6 md:px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/team" className="p-2 border-2 border-black bg-zinc-100 hover:bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Core Team Member</span>
                            <h1 className="text-xl font-black uppercase italic tracking-tight text-black">
                                Edit Profile: {member.name}
                            </h1>
                        </div>
                    </div>
                    <Button asChild className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000]">
                        <Link href="/team">
                            <Users className="mr-2 h-4 w-4" /> Team Roster
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1 py-10 px-4 sm:px-6 md:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
                        <div className="border-b-2 border-black pb-4 space-y-1">
                            <h2 className="text-lg font-black uppercase italic tracking-tight text-black">
                                Update Profile Data
                            </h2>
                            <p className="text-xs text-zinc-600 font-bold">
                                Keep your club profile up to date. Only your portrait image and LinkedIn handle can be self-updated. Contact an admin to modify core role assignments.
                            </p>
                        </div>
                        <TeamMemberForm member={member as any} categories={categories || []} isAdmin={false} />
                    </div>
                </div>
            </main>
        </div>
    );
}
