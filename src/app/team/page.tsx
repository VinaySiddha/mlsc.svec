import type { Metadata } from "next";
import { getTeamMembers, getGlobalSettings } from "@/app/actions";
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

const renderTeamSection = (teams: TeamCategory[], title: string, description: string) => {
    if (teams.length === 0 || teams.every(team => team.members.length === 0)) return null;

    return (
        <section className="w-full py-20 md:py-28 border-t border-white/[0.06]">
            <div className="container mx-auto px-6">
                {/* Section header */}
                <ScrollReveal>
                    <div className="mb-16">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none mb-3">
                            {title}
                        </h2>
                        <p className="text-white/40 text-sm font-medium max-w-lg">{description}</p>
                    </div>
                </ScrollReveal>

                {/* Sub-domains */}
                <div className="space-y-20">
                    {teams.map(category => {
                        if (category.members.length === 0) return null;
                        return (
                            <div key={category.id}>
                                {category.subDomain && (
                                    <ScrollReveal>
                                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25 mb-8">
                                            {category.subDomain}
                                        </p>
                                    </ScrollReveal>
                                )}
                                <TeamMemberGrid members={category.members} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default async function TeamPage() {
    const { membersByCategory, error } = await getTeamMembers();
    const { settings } = await getGlobalSettings();
    const activeChapter = settings?.activeChapter || '3.0';
    const isHiringOpen = settings?.chapters?.[activeChapter]?.isHiringOpen || false;

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
        <div className="flex flex-col min-h-screen bg-black text-white">
            <main className="flex-1">

                {/* ── Hero header ── */}
                <section className="relative w-full pt-32 pb-24 overflow-hidden">
                    <div className="glow-sphere top-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#4285F4]/20" />
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 mb-6">
                                The minds behind MLSC SVEC
                            </p>
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] max-w-3xl">
                                We are a team of{" "}
                                <span className="text-[#4285F4]">student innovators</span>{" "}
                                and creators.
                            </h1>
                            <p className="mt-8 text-white/40 text-lg font-medium max-w-xl leading-relaxed">
                                A dedicated group of leaders, developers, designers, and storytellers — building the most active tech community at SVEC.
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── Team sections ── */}
                {renderTeamSection(
                    teamData.coreTeam,
                    "Core Leadership",
                    "The founding leaders who set the vision, culture, and direction of MLSC SVEC."
                )}
                {renderTeamSection(
                    teamData.technicalTeam,
                    "Technical Architects",
                    "Engineers and developers building products, running workshops, and pushing technical boundaries."
                )}
                {renderTeamSection(
                    teamData.nonTechnicalTeam,
                    "Creative Ecosystem",
                    "Designers, storytellers, event managers, and PR leads who make MLSC visible and vibrant."
                )}

                {/* ── Join CTA ── */}
                <section className="border-t border-white/[0.06] py-24 md:py-32">
                    <div className="container mx-auto px-6 text-center">
                        <ScrollReveal>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
                                Want to join the team?
                            </h2>
                            <p className="text-white/40 text-lg font-medium mb-10 max-w-lg mx-auto">
                                {isHiringOpen
                                    ? `Chapter ${activeChapter} recruitments are open. Apply now and become part of something great.`
                                    : `Chapter ${activeChapter} recruitments are currently closed. Stay tuned for future cycles!`}
                            </p>
                            {isHiringOpen && (
                                <Button asChild className="btn-primary">
                                    <Link href="/apply">Apply Now →</Link>
                                </Button>
                            )}
                        </ScrollReveal>
                    </div>
                </section>

            </main>
        </div>
    );
}
