import type { Metadata } from "next";
import { getTeamMembers, getGlobalSettings } from "@/app/actions";
import { TeamContributorView, TeamCategoryGroup } from "@/components/team/team-contributor-view";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Team — MLSC SVEC",
  description: "Meet the core leadership and technical committee behind Microsoft Learn Student Club SVEC.",
  openGraph: {
    title: "Team — MLSC SVEC",
    description: "Meet the core leadership and technical committee behind Microsoft Learn Student Club SVEC.",
    url: "https://mlscsvec.com/team",
  },
};

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const { membersByCategory } = await getTeamMembers();
  const { settings } = await getGlobalSettings();
  const activeChapter = settings?.activeChapter || '4.0';

  const categories = (membersByCategory as TeamCategoryGroup[]) || [];
  const totalMembers = categories.reduce((acc, cat) => acc + (cat.members?.length || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ MLSC SVEC Chapter {activeChapter} Executive Committee & Core Technical Crew
      </div>

      <main className="flex-1 py-12 md:py-16">

        {/* ── Minimalist Clean Header ── */}
        <section className="text-center px-4 max-w-4xl mx-auto space-y-3">
          <div className="inline-block px-3 py-1 bg-[#FFE600] text-black border-2 border-black font-mono font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_#000000]">
            CHAPTER {activeChapter} ROSTER
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight text-black uppercase italic leading-none">
            OUR <span className="bg-[#4285F4] text-white px-3 border-2 border-black shadow-[4px_4px_0px_0px_#000000]">TEAM</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-zinc-600 max-w-xl mx-auto pt-2">
            The student leaders, software architects, domain heads, and creators steering technology initiatives across Sri Vasavi Engineering College.
          </p>
        </section>

        {/* ── Content View ── */}
        {totalMembers > 0 ? (
          <TeamContributorView
            categories={categories}
            activeChapter={activeChapter}
          />
        ) : (
          <div className="container mx-auto px-4 py-16 max-w-md text-center">
            <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0px_0px_#000000] space-y-4">
              <div className="p-3 bg-[#FFE600] border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000000]">
                <Users className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-black">
                Chapter {activeChapter} Roster in Formation
              </h3>
              <p className="text-xs text-zinc-600 font-bold leading-relaxed">
                The core member directory for Chapter {activeChapter} is currently being verified and onboarded.
              </p>
              <div className="pt-2">
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000]"
                >
                  Apply to Join the Team <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
