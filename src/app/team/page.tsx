
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

export const revalidate = 60;

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

const renderTeamSection = (teams: TeamCategory[], title: string) => {
    if (teams.length === 0 || teams.every(team => team.members.length === 0)) {
        return null;
    }

    return (
        <section className="w-full bg-transparent py-16">
            <div className="container mx-auto px-4 md:px-6 space-y-12">
                <ScrollReveal>
                    <div className="w-full text-center glass-card p-8">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{title}</h2>
                    </div>
                </ScrollReveal>
                {teams.map(category => {
                    if (category.members.length === 0) return null;
                    return (
                        <div key={category.id} className="w-full">
                            <ScrollReveal>
                                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
                                    <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl gradient-text">{category.subDomain}</h3>
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
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <h2 className="text-2xl font-bold text-destructive">Failed to load team members</h2>
                <p className="text-muted-foreground">{error || "An unknown error occurred."}</p>
                <Button asChild variant="ghost" className="mt-4">
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
        <div className="flex flex-col min-h-screen bg-transparent text-foreground">
            <main className="flex-1">
                <section className="relative w-full py-20 md:py-28 text-center bg-cover bg-center" style={{ backgroundImage: "url('/team1.jpg')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background rounded-lg"></div>
                    <div className="relative z-10 container mx-auto px-4">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Meet Our <span className="gradient-text">Team</span></h1>
                        <p className="max-w-[900px] mx-auto mt-4 text-muted-foreground md:text-xl">The leaders and members driving the MLSC community forward.</p>
                    </div>
                </section>

                <div className="space-y-4">
                    {renderTeamSection(teamData.coreTeam, "Core Team")}
                    <div className="section-divider" />
                    {renderTeamSection(teamData.technicalTeam, "Technical Teams")}
                    <div className="section-divider" />
                    {renderTeamSection(teamData.nonTechnicalTeam, "Non-Technical Teams")}
                </div>

            </main>

        </div>
    );
}
