import { getApplications, getTeamMembers, getGlobalSettings } from "@/app/actions";
import { headers, cookies } from "next/headers";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminDashboardClient } from "./dashboard-client";

export const dynamic = 'force-dynamic';

interface Milestone {
  name: string;
  status: 'completed' | 'active' | 'planned';
  date: string;
  desc: string;
}

const CHAPTER_ROADMAPS: Record<string, {
  title: string;
  desc: string;
  color: string;
  textColor: string;
  borderColor: string;
  milestones: Milestone[];
}> = {
  '3.0': {
    title: "Chapter 3.0: Foundational Growth",
    desc: "Establishing MLSC SVEC, forming the core student tech community, and setting up learning structures.",
    color: "bg-[#4285F4]/10 text-[#4285F4]",
    textColor: "text-[#4285F4]",
    borderColor: "border-[#4285F4]/30",
    milestones: [
      { name: "Official Club Charter", status: "completed", date: "Aug 2024", desc: "Received official Microsoft Learn Student Club approval for SVEC." },
      { name: "Core Committee Selection", status: "completed", date: "Sep 2024", desc: "Hired 15 core leads to guide developer, design, and operations domains." },
      { name: "Launch Event: Cloud Odyssey", status: "completed", date: "Oct 2024", desc: "Conducted hands-on git & Azure bootcamp with 250+ student registrations." },
      { name: "Foundational Projects", status: "completed", date: "Jan 2025", desc: "Launched core club tools and open-sourced the SVEC student study portal." }
    ]
  },
  '4.0': {
    title: "Chapter 4.0: Scaling & Impact",
    desc: "Scaling developer operations, launching hackathons, and expanding recruitment limits.",
    color: "bg-[#34A853]/10 text-[#34A853]",
    textColor: "text-[#34A853]",
    borderColor: "border-[#34A853]/30",
    milestones: [
      { name: "Chapter 4.0 Launch & Info Session", status: "completed", date: "May 2026", desc: "Conducted club orientation reaching 500+ juniors across branches." },
      { name: "Active Recruitments", status: "active", date: "Jun 2026", desc: "Currently reviewing technical, creative, and operational applications." },
      { name: "Azure & AI bootcamp", status: "planned", date: "Jul 2026", desc: "Structured training sessions focusing on building AI-powered Web apps." },
      { name: "MLSC State Hackathon", status: "planned", date: "Sep 2026", desc: "36-hour physical hackathon bringing innovators from regional campuses." }
    ]
  },
  '5.0': {
    title: "Chapter 5.0: Advanced Innovation",
    desc: "Research, incubation, cross-campus projects, and launch of specialized R&D sandbox labs.",
    color: "bg-[#FBBC05]/10 text-[#FBBC05]",
    textColor: "text-[#FBBC05]",
    borderColor: "border-[#FBBC05]/30",
    milestones: [
      { name: "R&D Lab Initiative", status: "planned", date: "Jan 2027", desc: "Setting up sandboxed research hubs for open-source AI and blockchain tooling." },
      { name: "Global Web3 & AI Summit", status: "planned", date: "Mar 2027", desc: "Joint virtual coding summit in partnership with elite student chapters." },
      { name: "Student Incubator Fund", status: "planned", date: "Jun 2027", desc: "Providing project mentorship and cloud credits for top 3 student startups." },
      { name: "Chapter 5.0 Transition", status: "planned", date: "Aug 2027", desc: "Handover of club resources, repositories, and credentials to the next cycle." }
    ]
  }
};

export default async function AdminPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role') || 'panel';
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;

  // Fetch data
  const [teamResult, settingsResult] = await Promise.all([
    getTeamMembers(),
    getGlobalSettings()
  ]);

  const cookieStore = await cookies();
  const adminChapter = cookieStore.get('admin_chapter')?.value || settingsResult.settings?.activeChapter || '3.0';

  const appsResult = await getApplications({ fetchAll: true, chapter: adminChapter });

  // Fetch donations (only for super_admin and admin)
  let donations: any[] = [];
  let totalDonationsAmount = 0;
  let paidDonationsCount = 0;
  let pendingDonationsCount = 0;
  if (userRole === 'super_admin' || userRole === 'admin') {
    try {
      const donationsSnap = await getDocs(collection(db, 'donations'));
      donationsSnap.forEach(doc => {
        const data = doc.data();
        donations.push({ id: doc.id, ...data });
        if (data.status === 'PAID') {
          totalDonationsAmount += Number(data.amount) || 0;
          paidDonationsCount++;
        } else if (data.status === 'PENDING') {
          pendingDonationsCount++;
        }
      });
    } catch (err) {
      console.error('Error fetching donations for admin dashboard:', err);
    }
  }

  const recentDonations = donations
    .filter(d => d.status === 'PAID')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const applications = 'applications' in appsResult ? appsResult.applications || [] : [];
  const membersByCategory = 'membersByCategory' in teamResult ? teamResult.membersByCategory || [] : [];
  const settings = 'settings' in settingsResult ? settingsResult.settings || {} : {};

  // Compute stats
  const totalApps = applications.length;
  const hiredApps = applications.filter((a: any) => a.status === 'Hired').length;
  const pendingApps = applications.filter((a: any) => a.status !== 'Hired' && a.status !== 'Rejected').length;
  const totalTeamSize = membersByCategory.reduce((acc: number, cat: any) => acc + (cat.members?.length || 0), 0);

  const isHiringOpen = settings?.chapters?.[adminChapter]?.isHiringOpen || false;

  // Filter recent applications
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const roadmap = CHAPTER_ROADMAPS[adminChapter] || {
    title: `Chapter ${adminChapter}: Community Expansion`,
    desc: "Focusing on outreach, technical workshops, and expanding student developer channels.",
    color: "bg-[#EA4335]/10 text-[#EA4335]",
    textColor: "text-[#EA4335]",
    borderColor: "border-[#EA4335]/30",
    milestones: [
      { name: `Inception of Chapter ${adminChapter}`, status: "active", date: "TBD", desc: "Setting up administrative domains and student sync meetings." },
      { name: "Student Skills Bootcamp", status: "planned", date: "TBD", desc: "Conducting basic web design and app building sessions." },
      { name: "Open Source Initiative", status: "planned", date: "TBD", desc: "Encouraging collaborative contributions to shared club repos." }
    ]
  };

  return (
    <AdminDashboardClient
      userRole={userRole}
      panelDomain={panelDomain}
      adminChapter={adminChapter}
      totalApps={totalApps}
      totalTeamSize={totalTeamSize}
      hiredApps={hiredApps}
      pendingApps={pendingApps}
      isHiringOpen={isHiringOpen}
      recentApplications={recentApplications}
      roadmap={roadmap}
      totalDonationsAmount={totalDonationsAmount}
      paidDonationsCount={paidDonationsCount}
      pendingDonationsCount={pendingDonationsCount}
      recentDonations={recentDonations}
      applications={applications}
    />
  );
}
