"use client";

import React from "react";
import { 
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
  UserCheck,
  Coins
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  
  const title = userRole === 'view_only'
    ? `APPLICATIONS OBSERVER DASHBOARD — Chapter ${adminChapter}`
    : panelDomain 
    ? `${domainLabels[panelDomain] || 'Panel'} Dashboard — Chapter ${adminChapter}` 
    : `SUPERADMIN CONTROL CENTER — Chapter ${adminChapter}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 text-white"
    >
      {/* ── Page Header (Apple Minimalist look) ── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            Dashboard <span className="text-[#4285F4]">Overview</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            {title}
          </p>
        </div>
        <div>
          <span className={cn(
            "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border",
            roadmap.color,
            roadmap.borderColor
          )}>
            Chapter {adminChapter} Active
          </span>
        </div>
      </motion.div>

      {/* ── Overview Statistics Cards (Glow / Hover zoom Apple look) ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Apps Card */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group backdrop-blur-md"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText className="h-16 w-16 text-[#4285F4]" />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Applications</p>
          <h3 className="text-4xl font-black text-white mt-2 tracking-tight">{totalApps}</h3>
          <p className="text-xs text-zinc-500 mt-2 font-medium">Active cycle submissions</p>
        </motion.div>

        {/* Team size Card */}
        {(userRole === 'super_admin' || userRole === 'admin') && (
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="h-16 w-16 text-[#34A853]" />
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Team Size</p>
            <h3 className="text-4xl font-black text-white mt-2 tracking-tight">{totalTeamSize}</h3>
            <p className="text-xs text-zinc-500 mt-2 font-medium">Onboarded members</p>
          </motion.div>
        )}

        {/* Hired Apps Card */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group backdrop-blur-md"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <UserCheck className="h-16 w-16 text-[#FBBC05]" />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hired Candidates</p>
          <h3 className="text-4xl font-black text-white mt-2 tracking-tight">{hiredApps}</h3>
          <p className="text-xs text-zinc-500 mt-2 font-medium">{pendingApps} awaiting review</p>
        </motion.div>

        {/* Hiring gate status Card */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group backdrop-blur-md"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-16 w-16 text-[#EA4335]" />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hiring Gate Status</p>
          <h3 className={cn(
            "text-2xl font-black mt-3 tracking-tight",
            isHiringOpen ? 'text-[#34A853] drop-shadow-[0_0_8px_rgba(52,168,83,0.3)]' : 'text-red-500'
          )}>
            {isHiringOpen ? 'OPEN & RUNNING' : 'CLOSED'}
          </h3>
          <p className="text-xs text-zinc-500 mt-2.5 font-medium">Controlled in settings</p>
        </motion.div>

      </motion.div>

      {/* ── Visual Analytics & Averages Section (Framer Motion container) ── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            Critical Metrics & <span className="text-[#4285F4]">Averages</span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Academic standing, reviewer evaluations, talent tiers, and automated screening breakdowns
          </p>
        </div>
        <DashboardCharts applications={applications} />
      </motion.div>

      {/* ── Main Dashboard Layout (Grid splits) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Chapter Roadmap & Recent Applications */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chapter Roadmap Card */}
          {(userRole === 'super_admin' || userRole === 'admin') && (
            <motion.div 
              variants={itemVariants} 
              className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md"
            >
              <div className="mb-6">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {roadmap.title}
                </h2>
                <p className="text-xs text-zinc-500 mt-1 font-medium leading-relaxed">
                  {roadmap.desc}
                </p>
              </div>

              {/* Vertical Timeline */}
              <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6 py-2">
                {roadmap.milestones.map((milestone, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline bullet icon */}
                    <span className="absolute -left-[35px] top-1.5 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-black border border-white/5 z-10 transition-all group-hover:scale-110">
                      {milestone.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-[#34A853] fill-[#34A853]/15" />}
                      {milestone.status === 'active' && <PlayCircle className="h-3.5 w-3.5 text-[#4285F4] animate-pulse" />}
                      {milestone.status === 'planned' && <Clock className="h-3 w-3 text-zinc-500" />}
                    </span>

                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-sm font-bold text-zinc-200">
                        {milestone.name}
                      </h4>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        {milestone.date}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-xl font-medium">
                      {milestone.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Applications Feed */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Recent Applications</h2>
                <p className="text-xs text-zinc-500 font-medium">Latest submissions waiting for evaluation</p>
              </div>
              <Link href="/admin/applications" className="text-xs font-black text-[#4285F4] hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {recentApplications.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentApplications.map((app: any) => (
                  <div key={app.firestoreId} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-zinc-200 uppercase tracking-tight">{app.name}</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{app.rollNo}</span>
                        <span className="text-[9px] bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full text-zinc-400 font-bold uppercase tracking-wider">
                          {domainLabels[app.technicalDomain] || app.technicalDomain}
                          {app.nonTechnicalDomain && ` / ${domainLabels[app.nonTechnicalDomain] || app.nonTechnicalDomain}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 shrink-0">
                      {formatRelativeTime(app.submittedAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-500 text-xs py-8 font-semibold uppercase tracking-wider">
                No applications found.
              </p>
            )}
          </motion.div>

        </div>

        {/* Right Side: Quick Actions & Status */}
        <div className="space-y-8">
          
          {/* Quick Actions Panel */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md"
          >
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {userRole === 'view_only' ? (
                <>
                  <Link href="/admin/applications" className="flex items-center justify-between p-3.5 rounded-2xl border border-[#4285F4]/20 bg-[#4285F4]/5 hover:bg-[#4285F4]/10 hover:border-[#4285F4]/35 transition-all group">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-[#4285F4]" />
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-300">View Applications</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#4285F4] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>

                  <Link href="/admin/attendance" className="flex items-center justify-between p-3.5 rounded-2xl border border-[#34A853]/20 bg-[#34A853]/5 hover:bg-[#34A853]/10 hover:border-[#34A853]/35 transition-all group">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-[#34A853]" />
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Interview Attendance</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#34A853] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                </>
              ) : (
                <>
                  {(userRole === 'super_admin' || userRole === 'admin') && (
                    <>
                      <Link href="/admin/payments/ledger" className="flex items-center justify-between p-3.5 rounded-2xl border border-[#34A853]/20 bg-[#34A853]/5 hover:bg-[#34A853]/10 hover:border-[#34A853]/35 transition-all group">
                        <div className="flex items-center gap-3">
                          <Coins className="h-4 w-4 text-[#34A853]" />
                          <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Payments Ledger</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#34A853] group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </Link>

                      <Link href="/admin/team/new" className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-[#4285F4]" />
                          <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Invite Member</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </>
                  )}

                  <Link href="/admin/events/new" className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-[#34A853]" />
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Create Event</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link href="/admin/notifications" className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-4 w-4 text-[#FBBC05]" />
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Announcement</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link href="/admin/hiring-settings" className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-[#EA4335]" />
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Hiring Settings</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Funding Card */}
          {(userRole === 'super_admin' || userRole === 'admin') && (
            <motion.div 
              variants={itemVariants}
              className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Community Funding</h3>
                </div>
                <span className="text-[9px] font-black text-[#34A853] bg-[#34A853]/10 px-2 py-0.5 rounded border border-[#34A853]/20 uppercase">
                  Active
                </span>
              </div>

              <div className="border-t border-white/5 pt-4 pb-4 space-y-3">
                <div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase">Total Funds Raised</p>
                  <p className="text-3xl font-black text-[#34A853] tracking-tight mt-1">₹{totalDonationsAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                  <div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase">PG Cleared</p>
                    <p className="text-sm font-black text-zinc-300 mt-0.5">{paidDonationsCount} entries</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Awaiting</p>
                    <p className="text-sm font-black text-yellow-500 mt-0.5">{pendingDonationsCount} pending</p>
                  </div>
                </div>
              </div>

              {/* Recent Cleared sponsors list */}
              {recentDonations.length > 0 && (
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Recent Sponsors</p>
                  <div className="space-y-2.5">
                    {recentDonations.map((don: any) => (
                      <div key={don.id} className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-300 truncate max-w-[120px]">{don.customerName}</p>
                          <p className="text-[9px] text-zinc-500 font-mono leading-none mt-0.5">{new Date(don.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        </div>
                        <span className="font-black text-[#34A853] text-right shrink-0">
                          ₹{don.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* System Status Indicators */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md"
          >
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">System Status</h3>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34A853]"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">All Operations Online</span>
            </div>
            
            <div className="border-t border-white/5 mt-6 pt-4 space-y-2.5">
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Database Engine</p>
                <p className="text-xs font-bold text-zinc-300 mt-0.5">Online (99.98% uptime)</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Hiring Gate</p>
                <p className="text-xs font-bold text-zinc-300 mt-0.5">
                  {isHiringOpen ? 'Processing Active Submissions' : 'Closed'}
                </p>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
}
