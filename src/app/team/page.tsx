import type { Metadata } from "next";
import { getTeamMembers, getGlobalSettings } from "@/app/actions";
import { TeamContributorView, TeamCategoryGroup } from "@/components/team/team-contributor-view";

export const metadata: Metadata = {
  title: "Team — MLSC SVEC",
  description: "Meet the team behind Microsoft Learn Student Club SVEC.",
  openGraph: {
    title: "Team — MLSC SVEC",
    description: "Meet the team behind Microsoft Learn Student Club SVEC.",
    url: "https://mlscsvec.com/team",
  },
};

export const dynamic = 'force-dynamic';

const SEED_FALLBACK_CATEGORIES: TeamCategoryGroup[] = [
  {
    id: 'core-leadership',
    name: 'Core Team',
    order: 1,
    members: [
      { id: 'c1', name: 'Vinay Siddha', role: 'Club Lead', image: '/team1.jpg', linkedin: 'https://linkedin.com', categoryId: 'core-leadership' },
      { id: 'c2', name: 'Dr. Ch. Rambabu', role: 'Faculty Advisor', image: '', linkedin: '', categoryId: 'core-leadership' },
      { id: 'c3', name: 'K. Sai Teja', role: 'Lead Advisor', image: '', linkedin: 'https://linkedin.com', categoryId: 'core-leadership' },
      { id: 'c4', name: 'P. Rohit Kumar', role: 'Secretary', image: '', linkedin: 'https://linkedin.com', categoryId: 'core-leadership' },
      { id: 'c5', name: 'V. Kalyan', role: 'Technical Architect', image: '', linkedin: 'https://linkedin.com', categoryId: 'core-leadership' },
      { id: 'c6', name: 'M. Harika', role: 'Outreach Affairs Lead', image: '', linkedin: 'https://linkedin.com', categoryId: 'core-leadership' },
    ]
  },
  {
    id: 'tech-architects',
    name: 'Technical Team',
    order: 2,
    members: [
      { id: 't1', name: 'A. Manoj', role: 'Technical Lead', image: '', linkedin: 'https://linkedin.com', categoryId: 'tech-architects' },
      { id: 't2', name: 'G. Devi Prasad', role: 'Full Stack Architect', image: '', linkedin: 'https://linkedin.com', categoryId: 'tech-architects' },
      { id: 't3', name: 'K. Bhavani', role: 'Frontend Engineer', image: '', linkedin: 'https://linkedin.com', categoryId: 'tech-architects' },
      { id: 't4', name: 'S. Tarun', role: 'Cloud & DevOps Lead', image: '', linkedin: 'https://linkedin.com', categoryId: 'tech-architects' },
      { id: 't5', name: 'N. Anusha', role: 'AI / ML Specialist', image: '', linkedin: 'https://linkedin.com', categoryId: 'tech-architects' },
      { id: 't6', name: 'R. Hemanth', role: 'Data Systems Lead', image: '', linkedin: 'https://linkedin.com', categoryId: 'tech-architects' },
      { id: 't7', name: 'D. Suresh', role: 'Mobile App Lead', image: '', linkedin: 'https://linkedin.com', categoryId: 'tech-architects' },
      { id: 't8', name: 'P. Sandeep', role: 'Backend Developer', image: '', linkedin: 'https://linkedin.com', categoryId: 'tech-architects' },
    ]
  },
  {
    id: 'creative-ops',
    name: 'Non-Technical Team',
    order: 3,
    members: [
      { id: 'nt1', name: 'K. Lavanya', role: 'Design Head', image: '', linkedin: 'https://linkedin.com', categoryId: 'creative-ops' },
      { id: 'nt2', name: 'B. Jagadeesh', role: 'Operations Lead', image: '', linkedin: 'https://linkedin.com', categoryId: 'creative-ops' },
      { id: 'nt3', name: 'P. Meghana', role: 'PR & Media Head', image: '', linkedin: 'https://linkedin.com', categoryId: 'creative-ops' },
      { id: 'nt4', name: 'Y. Charan', role: 'Event Production Head', image: '', linkedin: 'https://linkedin.com', categoryId: 'creative-ops' },
      { id: 'nt5', name: 'T. Akhila', role: 'Content Lead', image: '', linkedin: 'https://linkedin.com', categoryId: 'creative-ops' },
      { id: 'nt6', name: 'V. Lokesh', role: 'Community Manager', image: '', linkedin: 'https://linkedin.com', categoryId: 'creative-ops' },
    ]
  }
];

export default async function TeamPage() {
  const { membersByCategory } = await getTeamMembers();
  const { settings } = await getGlobalSettings();
  const activeChapter = settings?.activeChapter || '3.0';

  // Check if categories have members
  const fetchedCategories = (membersByCategory as TeamCategoryGroup[]) || [];
  const totalFetchedMembers = fetchedCategories.reduce((acc, cat) => acc + (cat.members?.length || 0), 0);

  // Use database categories if available, otherwise fall back to seed structure
  const categoriesToRender = totalFetchedMembers > 0 ? fetchedCategories : SEED_FALLBACK_CATEGORIES;

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      <main className="flex-1">

        {/* ── Minimalist Clean Header ── */}
        <section className="pt-28 pb-4 text-center px-4">
          <div className="inline-block px-3 py-1 bg-[#FFE600] text-black border-2 border-black font-mono font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_#000000] mb-3">
            CHAPTER {activeChapter}
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight text-black uppercase italic leading-none">
            OUR <span className="text-[#4285F4]">TEAM</span>
          </h1>
        </section>

        {/* ── Only Circles Face Wall ── */}
        <TeamContributorView
          categories={categoriesToRender}
          activeChapter={activeChapter}
        />

      </main>
    </div>
  );
}
