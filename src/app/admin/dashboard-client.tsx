"use client";

import React from "react";
import { 
  Users, 
  Calendar, 
  Settings, 
  Activity, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  UserCheck,
  Coins,
  Shield,
  Layers,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  QrCode
} from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { cn } from "@/lib/utils";

interface Milestone {
  name: string;
  status: 'completed' | 'active' | 'planned';
  date: string;
  desc: string;
}

interface DashboardClientProps {
  userRole: string;
  panelDomain?: string;
  adminChapter: string;
  totalApps: number;
  totalTeamSize: number;
  hiredApps: number;
  pendingApps: number;
  isHiringOpen: boolean;
  recentApplications: any[];
  roadmap: {
    title: string;
    desc: string;
    color: string;
    textColor: string;
    borderColor: string;
    milestones: Milestone[];
  };
  totalDonationsAmount: number;
  paidDonationsCount: number;
  pendingDonationsCount: number;
  recentDonations: any[];
  applications: any[];
}

const domainLabels: Record<string, string> = {
  gen_ai: "Generative AI",
  ds_ml: "Data Science & ML",
  azure: "Azure Cloud",
  web_app: "Web & App Development",
  event_management: "Event Management",
  public_relations: "Public Relations",
  media_marketing: "Media Marketing",
  creativity: "Creativity",
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

export function AdminDashboardClient({
  userRole,
  panelDomain,
  adminChapter,
  totalApps,
  totalTeamSize,
  hiredApps,
  pendingApps,
  isHiringOpen,
  recentApplications,
  roadmap,
  totalDonationsAmount,
  paidDonationsCount,
  pendingDonationsCount,
  recentDonations,
  applications
}: DashboardClientProps) {
  
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';

  return (
    <div className="space-y-8 font-sans text-black max-w-7xl mx-auto">
      
      {/* ── Top Header Banner (Neo-Brutalist Hero Card) ── */}
      <div className="bg-white border-[3px] border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] border-2 border-black rounded-lg font-mono text-xs font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_0px_#000000]">
            <Activity className="h-3.5 w-3.5" />
            <span>COMMAND CONSOLE // CHAPTER {adminChapter}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-black">
            {panelDomain ? `${domainLabels[panelDomain] || panelDomain} Panel` : 'Admin Dashboard'}
          </h1>
          <p className="text-zinc-600 font-medium text-xs sm:text-sm mt-1 max-w-xl">
            Real-time candidate telemetry, domain evaluation queues, and club operations manager.
          </p>
        </div>

        {/* Quick Shortcut Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/applications"
            className="px-4 py-2.5 bg-white hover:bg-[#4285F4] hover:text-white text-black rounded-xl border-2 border-black text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000000] transition-all"
          >
            <FileText className="h-4 w-4" />
            Applications ({totalApps})
          </Link>
          
          <Link
            href="/admin/attendance"
            className="px-4 py-2.5 bg-white hover:bg-[#00FF66] text-black rounded-xl border-2 border-black text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000000] transition-all"
          >
            <QrCode className="h-4 w-4" />
            Attendance
          </Link>
          
          {isSuperAdmin && (
            <Link
              href="/admin/hiring-settings"
              className="px-4 py-2.5 bg-[#FFE600] hover:bg-yellow-300 text-black rounded-xl border-2 border-black text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000000] transition-all"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          )}
        </div>
      </div>

      {/* ── Key Metrics Cards (Clean High-Contrast Neo-Brutalist) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Applications Card */}
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#4285F4] transition-all hover:translate-x-[2px] hover:translate-y-[2px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-black text-black uppercase tracking-wider">
              Total Applications
            </span>
            <div className="p-2.5 rounded-xl bg-[#4285F4] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-black text-black mt-4 font-mono">
            {totalApps}
          </div>
          <div className="text-xs text-zinc-600 mt-2 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
            Active submission pool
          </div>
        </div>

        {/* Active Team Size */}
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#00FF66] transition-all hover:translate-x-[2px] hover:translate-y-[2px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-black text-black uppercase tracking-wider">
              Core Team Size
            </span>
            <div className="p-2.5 rounded-xl bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-black text-black mt-4 font-mono">
            {totalTeamSize}
          </div>
          <div className="text-xs text-zinc-600 mt-2 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66]" />
            Onboarded club roster
          </div>
        </div>

        {/* Hired Candidates */}
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#FFE600] transition-all hover:translate-x-[2px] hover:translate-y-[2px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-black text-black uppercase tracking-wider">
              Hired Candidates
            </span>
            <div className="p-2.5 rounded-xl bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-black text-black mt-4 font-mono">
            {hiredApps}
          </div>
          <div className="text-xs text-zinc-600 mt-2 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFE600]" />
            {pendingApps} awaiting evaluation
          </div>
        </div>

        {/* Recruitment Gate Status */}
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#FF0055] transition-all hover:translate-x-[2px] hover:translate-y-[2px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-black text-black uppercase tracking-wider">
              Recruitment Gate
            </span>
            <div className={cn(
              "p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000]",
              isHiringOpen ? "bg-[#00FF66] text-black" : "bg-[#FF0055] text-white"
            )}>
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className={cn(
            "text-2xl font-black mt-4 font-mono uppercase",
            isHiringOpen ? "text-[#00B347]" : "text-[#FF0055]"
          )}>
            {isHiringOpen ? "OPEN & ACTIVE" : "CLOSED"}
          </div>
          <div className="text-xs text-zinc-600 mt-2 font-bold">
            Chapter {adminChapter} portal
          </div>
        </div>

      </div>

      {/* ── Critical Metrics & Visual Breakdown Charts ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-black">
            Talent Analytics & Screening Benchmark
          </h2>
          <p className="text-xs font-semibold text-zinc-500 mt-0.5">
            Academic standing distributions, interviewer competency radar, and resume parsing.
          </p>
        </div>
        <DashboardCharts applications={applications} />
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: Chapter Milestones & Recent Submissions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chapter Roadmap Timeline */}
          {isSuperAdmin && (
            <div className="bg-white border-[3px] border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000]">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-black">
                    {roadmap.title}
                  </h3>
                  <p className="text-xs text-zinc-600 font-medium mt-1">
                    {roadmap.desc}
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#FFE600] border-2 border-black rounded-lg text-xs font-mono font-black text-black shadow-[2px_2px_0px_0px_#000000] self-start sm:self-auto">
                  MILESTONES
                </span>
              </div>

              {/* Milestones list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roadmap.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-50 border-2 border-black rounded-xl space-y-2 hover:bg-[#FFE600]/10 transition-colors shadow-[3px_3px_0px_0px_#000000]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-black text-black">{m.name}</span>
                      <span className={cn(
                        "text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border-2 border-black",
                        m.status === 'completed' ? 'bg-[#00FF66] text-black' :
                        m.status === 'active' ? 'bg-[#4285F4] text-white' :
                        'bg-zinc-200 text-zinc-700'
                      )}>
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                      {m.desc}
                    </p>
                    <div className="text-[10px] font-mono text-zinc-500 font-black">
                      📅 {m.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Applications Feed */}
          <div className="bg-white border-[3px] border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight text-black">
                  Recent Submissions
                </h3>
                <p className="text-xs text-zinc-600 font-medium mt-0.5">
                  Latest applicant registrations awaiting panel evaluation.
                </p>
              </div>
              <Link
                href="/admin/applications"
                className="px-3 py-1.5 bg-[#4285F4] text-white border-2 border-black rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                View all ({totalApps}) <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-zinc-300 rounded-xl text-zinc-500 font-mono text-xs font-bold">
                No applications submitted yet for Chapter {adminChapter}.
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-zinc-50 border-2 border-black rounded-xl flex items-center justify-between gap-4 hover:bg-yellow-50 transition-colors shadow-[3px_3px_0px_0px_#000000]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-black truncate">{app.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-white text-black font-bold rounded border-2 border-black">
                          {app.regNo}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 font-medium mt-1 flex items-center gap-2">
                        <span className="font-bold text-black">{app.technicalDomain || app.domain}</span>
                        <span>•</span>
                        <span className="font-mono text-zinc-500">{formatRelativeTime(app.submittedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        "text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_#000000]",
                        app.status === 'Hired' ? 'bg-[#00FF66] text-black' :
                        app.status === 'Rejected' ? 'bg-[#FF0055] text-white' :
                        'bg-[#FFE600] text-black'
                      )}>
                        {app.status || 'Pending'}
                      </span>
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="p-2 bg-white hover:bg-[#FFE600] text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Col: Quick Control Dock */}
        <div className="space-y-6">
          
          {/* Quick Hub Navigation */}
          <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000000] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-black font-mono">
              Quick Admin Actions
            </h3>
            
            <div className="space-y-2.5">
              <Link
                href="/admin/applications"
                className="w-full flex items-center justify-between p-3.5 bg-zinc-50 border-2 border-black hover:bg-[#4285F4]/15 rounded-xl transition-all shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#4285F4] text-white rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-black group-hover:text-[#4285F4] transition-colors">Applicant Reviewer</div>
                    <div className="text-[10px] text-zinc-500 font-mono font-bold">Score & filter candidates</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-black group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/attendance"
                className="w-full flex items-center justify-between p-3.5 bg-zinc-50 border-2 border-black hover:bg-[#00FF66]/15 rounded-xl transition-all shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00FF66] text-black rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-black group-hover:text-[#00B347] transition-colors">Attendance Scanner</div>
                    <div className="text-[10px] text-zinc-500 font-mono font-bold">QR check-ins for events</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-black group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {isSuperAdmin && (
                <>
                  <Link
                    href="/admin/team"
                    className="w-full flex items-center justify-between p-3.5 bg-zinc-50 border-2 border-black hover:bg-[#FFE600]/25 rounded-xl transition-all shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#FFE600] text-black rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-black group-hover:text-black transition-colors">Manage Team Roster</div>
                        <div className="text-[10px] text-zinc-500 font-mono font-bold">Add, edit, or reorder members</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-black group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/admin/hiring-settings"
                    className="w-full flex items-center justify-between p-3.5 bg-zinc-50 border-2 border-black hover:bg-[#FF0055]/15 rounded-xl transition-all shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#FF0055] text-white rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                        <Settings className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-black group-hover:text-[#FF0055] transition-colors">Chapter & Gates</div>
                        <div className="text-[10px] text-zinc-500 font-mono font-bold">Switch chapter, deadlines, visibility</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-black group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Donation Ledger Card (Superadmin only) */}
          {isSuperAdmin && (
            <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-black font-mono">
                  Club Treasury / ATS
                </h3>
                <div className="p-2 bg-[#00FF66] text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  <Coins className="h-4 w-4" />
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000000]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase font-black">Total Inflow Collected</div>
                <div className="text-3xl font-black text-black font-mono mt-1">₹{totalDonationsAmount}</div>
                <div className="text-xs text-zinc-600 mt-1 font-bold">
                  {paidDonationsCount} confirmed transactions
                </div>
              </div>

              <Link
                href="/admin/payments"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#FFE600] hover:bg-yellow-300 text-black rounded-xl border-2 border-black text-xs font-mono font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                View Ledger [↗]
              </Link>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
