import type { Metadata } from "next";
import { getTeamMembers } from "@/app/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TeamMemberGrid } from "@/components/team-member-grid";

export const metadata: Metadata = {
  title: "Team — MLSC SVEC",
  description: "Meet the team behind Microsoft Learn Student Club SVEC — student leaders, developers, designers, and creators building the future together.",
  openGraph: {
    title: "Team — MLSC SVEC",
    description: "Meet the team behind Microsoft Learn Student Club SVEC — student leaders, developers, designers, and creators building the future together.",
    url: "https://mlscsvec.in/team",
  },
};

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
    linkedin: string;
    categoryId: string;
}

interface TeamCategory {
    id: string;
    name: string;
    subDomain: string;
    order: number;
    members: TeamMember[];
}

const renderTeamSection = (teams: TeamCategory[], title: string, color: string) => {
    if (teams.length === 0 || teams.every(team => team.members.length === 0)) {
        return null;
    }

    return (
        <section className="w-full">
            <div className="container mx-auto px-6 space-y-20">
                <ScrollReveal>
                    <div>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic" style={{ color }}>{title}.</h2>
                    </div>
                </ScrollReveal>
                {teams.map(category => {
                    if (category.members.length === 0) return null;
                    return (
                        <div key={category.id} className="w-full">
                            <ScrollReveal>
                                <div className="mb-12">
                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">{category.subDomain}</h3>
                                </div>
                            </ScrollReveal>
                            <TeamMemberGrid members={category.members} />
                        </div>
                    )
                })}
            </div>
        </section>
    );
};

export default async function TeamPage() {
    const { membersByCategory, error } = await getTeamMembers();

    if (error || !membersByCategory) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center bg-black text-white">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#EA4335]">Error.</h2>
                <p className="text-white/50 mt-4">{error || "Failed to load team members."}</p>
                <Button asChild variant="outline" className="mt-8 rounded-full border-white/20">
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
        );
    }

    const allCategories = membersByCategory as TeamCategory[];
    const teamData = {
        coreTeam: allCategories.filter(c => c.name === 'Core Team'),
        technicalTeam: allCategories.filter(c => c.name === 'Technical Team'),
        nonTechnicalTeam: allCategories.filter(c => c.name === 'Non-Technical Team'),
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-sans">
            <main className="flex-1">
                <section className="relative w-full py-40 md:py-60 text-center overflow-hidden border-b border-white/5">
                    <div className="glow-sphere top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FBBC04]/10" />
                    <div className="relative z-10 container mx-auto px-6">
                         <div className="mb-8">
                            <span className="text-white/50 text-sm font-black uppercase tracking-[0.4em]">The Minds Behind MLSC SVEC</span>
                        </div>
                        <h1 className="hero-heading">
                            MEET THE <br/> <span className="text-[#34A853]">FORCE.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto mt-10 text-white/60 text-xl font-medium leading-relaxed">
                            A dedicated team of student leaders, developers, and creators building the future together.
                        </p>
                    </div>
                </section>

                <div className="space-y-40 py-24 md:py-40">
                    {renderTeamSection(teamData.coreTeam, "Core Leadership", "#4285F4")}
                    {renderTeamSection(teamData.technicalTeam, "Technical Architects", "#34A853")}
                    {renderTeamSection(teamData.nonTechnicalTeam, "Creative Ecosystem", "#EA4335")}
                </div>
            </main>
        </div>
    );
}
