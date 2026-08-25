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
    url: "https://mlscsvec.com/team",
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

const renderTeamSection = (teams: TeamCategory[], title: string, description: string, tag: string, tagColor: string) => {
    if (teams.length === 0 || teams.every(team => team.members.length === 0)) return null;

    return (
        <section className="w-full py-20 md:py-28 border-t-2 border-black font-sans bg-white">
            <div className="container mx-auto px-6">
                {/* Section header */}
                <ScrollReveal>
                    <div className="mb-14">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 ${tagColor} text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-4`}>
                            {tag}
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tighter text-black uppercase italic leading-none mb-3">
                            {title}
                        </h2>
                        <p className="text-zinc-700 text-sm md:text-base font-semibold max-w-lg">{description}</p>
                    </div>
                </ScrollReveal>

                {/* Sub-domains */}
                <div className="space-y-16">
                    {teams.map(category => {
                        if (category.members.length === 0) return null;
                        return (
                            <div key={category.id}>
                                {category.subDomain && (
                                    <ScrollReveal>
                                        <div className="inline-block px-2.5 py-1 bg-[#F9F9FB] border-2 border-black text-[11px] font-mono font-bold uppercase tracking-widest text-black mb-6 shadow-[2px_2px_0px_0px_#000000]">
                                            // {category.subDomain}
                                        </div>
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
            <div className="flex flex-col items-center justify-center min-h-screen text-center bg-white text-black font-sans">
                <div className="p-8 bg-white border-2 border-black shadow-[8px_8px_0px_0px_#FF0055] max-w-md">
                    <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-[#FF0055]">ERROR</h2>
                    <p className="text-zinc-700 mt-3 text-sm">{error || "Failed to load team members."}</p>
                    <Link href="/" className="inline-block mt-6 px-6 py-2.5 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                        RETURN TO HOME [↗]
                    </Link>
                </div>
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
        <div className="flex flex-col min-h-screen bg-white text-black font-sans">
            <main className="flex-1">

                {/* ── Hero header ── */}
                <section className="relative w-full pt-32 pb-20 overflow-hidden border-b-2 border-black bg-white">
                    <div className="container mx-auto px-6">
                        <ScrollReveal>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-6">
                                [ ⚡ CHAPTER {activeChapter} ROSTER ]
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.88] max-w-4xl">
                                WE ARE A CREW OF{" "}
                                <span className="text-[#4285F4]">STUDENT BUILDERS</span>{" "}
                                & CREATORS.
                            </h1>
                            <p className="mt-8 text-zinc-700 text-base md:text-xl font-semibold max-w-xl leading-relaxed">
                                A dedicated group of architects, engineers, designers, and organizers — driving the technical ecosystem forward at SVEC.
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── Team sections ── */}
                {renderTeamSection(
                    teamData.coreTeam,
                    "CORE LEADERSHIP",
                    "The strategic leaders shaping the vision, culture, and operational trajectory of MLSC SVEC.",
                    "[ LEADERSHIP WING ]",
                    "bg-[#FFE600]"
                )}
                {renderTeamSection(
                    teamData.technicalTeam,
                    "TECHNICAL ARCHITECTS",
                    "Engineers and developers architecting systems, conducting deep-dive sessions, and building open software.",
                    "[ ENGINEERING WING ]",
                    "bg-[#00FF66]"
                )}
                {renderTeamSection(
                    teamData.nonTechnicalTeam,
                    "CREATIVE & OPERATIONS",
                    "Designers, storytellers, operations leads, and community managers powering club visibility.",
                    "[ OPERATIONS & DESIGN ]",
                    "bg-[#FF0055]"
                )}

                {/* ── Join CTA ── */}
                <section className="border-t-2 border-black py-24 md:py-32 bg-[#F9F9FB]">
                    <div className="container mx-auto px-6 text-center max-w-3xl">
                        <ScrollReveal>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-6">
                                [ JOIN THE SQUAD ]
                            </div>
                            <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter text-black uppercase italic leading-[0.9] mb-6">
                                WANT TO BUILD WITH US?
                            </h2>
                            <p className="text-zinc-700 text-base md:text-lg font-semibold mb-8 leading-relaxed">
                                {isHiringOpen
                                    ? `Chapter ${activeChapter} recruitments are active right now. Submit your application and claim your domain.`
                                    : `Chapter ${activeChapter} recruitments are currently concluded. Watch for upcoming announcements!`}
                            </p>
                            {isHiringOpen && (
                                <Link
                                    href="/apply"
                                    className="inline-block px-10 py-4 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[5px_5px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                    APPLY FOR CHAPTER {activeChapter} [↗]
                                </Link>
                            )}
                        </ScrollReveal>
                    </div>
                </section>

            </main>
        </div>
    );
}
