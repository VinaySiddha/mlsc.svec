import { getApplications, getTeamMembers, getGlobalSettings } from "@/app/actions";
import { headers, cookies } from "next/headers";
import { 
  Shield, 
  Users, 
  Calendar, 
  Megaphone, 
  Settings, 
  Activity, 
  FileText, 
  CheckCircle2, 
  PlayCircle, 
  Clock, 
  ChevronRight,
  TrendingUp,
  UserCheck
} from "lucide-react";
import Link from "next/link";


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

function formatRelativeTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Recently';
  }
}

export default async function AdminPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role') || 'panel';
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;

  const cookieStore = await cookies();
  const adminChapter = cookieStore.get('admin_chapter')?.value || '3.0';

  // Fetch data
  const [appsResult, teamResult, settingsResult] = await Promise.all([
    getApplications({ fetchAll: true }),
    getTeamMembers(),
    getGlobalSettings()
  ]);

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

  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };

  const title = panelDomain 
    ? `${domainLabels[panelDomain] || 'Panel'} Dashboard — Chapter ${adminChapter}` 
    : `SUPERADMIN CONTROL CENTER — Chapter ${adminChapter}`;

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
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Dashboard <span className="text-[#4285F4]">Overview</span>
          </h1>
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            {title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roadmap.color} border ${roadmap.borderColor}`}>
            Chapter {adminChapter} Active
          </span>
        </div>
      </div>

      {/* ── Overview Statistics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="h-16 w-16 text-[#4285F4]" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Total Applications</p>
          <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 tracking-tight">{totalApps}</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 font-medium">Recruitment cycle candidates</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-16 w-16 text-[#34A853]" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Active Team Size</p>
          <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 tracking-tight">{totalTeamSize}</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 font-medium">Onboarded chapter members</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <UserCheck className="h-16 w-16 text-[#FBBC05]" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Hired Candidates</p>
          <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 tracking-tight">{hiredApps}</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 font-medium">{pendingApps} pending evaluation</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-16 w-16 text-[#EA4335]" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Hiring Gate Status</p>
          <h3 className={`text-2xl font-black mt-3 tracking-tight ${isHiringOpen ? 'text-[#34A853]' : 'text-red-500'}`}>
            {isHiringOpen ? 'OPEN & RUNNING' : 'CLOSED'}
          </h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2.5 font-medium">Controlled via Hiring Settings</p>
        </div>
      </div>

      {/* ── Main Dashboard Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Chapter Roadmap & Recent Applications */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chapter Roadmap Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">
                {roadmap.title}
              </h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 font-medium leading-relaxed">
                {roadmap.desc}
              </p>
            </div>

            {/* Vertical Timeline */}
            <div className="relative border-l border-slate-100 dark:border-zinc-800 ml-3 pl-6 space-y-6 py-2">
              {roadmap.milestones.map((milestone, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline bullet icon */}
                  <span className="absolute -left-[35px] top-1.5 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 z-10 transition-all group-hover:scale-110">
                    {milestone.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-[#34A853] fill-[#34A853]/15" />}
                    {milestone.status === 'active' && <PlayCircle className="h-3.5 w-3.5 text-[#4285F4] animate-pulse" />}
                    {milestone.status === 'planned' && <Clock className="h-3 w-3 text-slate-400 dark:text-zinc-600" />}
                  </span>

                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {milestone.name}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      {milestone.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed max-w-xl font-medium">
                    {milestone.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications Feed */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Recent Applications</h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Latest submissions waiting for evaluation</p>
              </div>
              <Link href="/admin/applications" className="text-xs font-bold text-[#4285F4] hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {recentApplications.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {recentApplications.map((app: any) => (
                  <div key={app.firestoreId} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">{app.name}</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">{app.rollNo}</span>
                        <span className="text-[9px] bg-slate-100 dark:bg-zinc-850 px-2 py-0.5 rounded-md text-slate-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                          {domainLabels[app.technicalDomain] || app.technicalDomain}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 shrink-0">
                      {formatRelativeTime(app.submittedAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 dark:text-zinc-500 text-xs py-8 font-semibold uppercase tracking-wider">
                No applications found for Chapter {adminChapter}.
              </p>
            )}
          </div>

        </div>

        {/* Right Side: Quick Actions & Status */}
        <div className="space-y-8">
          
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/admin/team/new" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 hover:bg-slate-50 dark:hover:bg-zinc-950 hover:border-slate-200 dark:hover:border-zinc-700 transition-all group">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-[#4285F4]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Invite Team Member</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link href="/admin/events/new" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 hover:bg-slate-50 dark:hover:bg-zinc-950 hover:border-slate-200 dark:hover:border-zinc-700 transition-all group">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[#34A853]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Create Event</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link href="/admin/notifications" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 hover:bg-slate-50 dark:hover:bg-zinc-950 hover:border-slate-200 dark:hover:border-zinc-700 transition-all group">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-4 w-4 text-[#FBBC05]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">New Announcement</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link href="/admin/hiring-settings" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 hover:bg-slate-50 dark:hover:bg-zinc-950 hover:border-slate-200 dark:hover:border-zinc-700 transition-all group">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-[#EA4335]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Toggle Hiring Gate</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">System Status</h3>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#34A853]"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">All Systems Operational</span>
            </div>
            
            <div className="border-t border-slate-100 dark:border-zinc-800/80 mt-6 pt-4 space-y-2.5">
              <div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Database Engine</p>
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 mt-0.5">Online (99.98% uptime)</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Hiring Gate</p>
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 mt-0.5">
                  {isHiringOpen ? 'Active & Processing Applications' : 'Closed — Resting Stage'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>


    </div>
  );
}
