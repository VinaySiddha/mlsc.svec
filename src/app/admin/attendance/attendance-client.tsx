"use client";

import React, { useState, useTransition } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  User, 
  Phone, 
  Mail, 
  RefreshCw, 
  Calendar,
  Sparkles,
  Users2
} from "lucide-react";
import { updateAttendance } from "@/app/actions/application-actions";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AttendanceClientProps {
  initialApplications: any[];
  userRole: string | null;
  panelDomain?: string;
}

const domainLabels: Record<string, string> = {
  gen_ai: "Generative AI",
  ds_ml: "Data Science & ML",
  azure: "Azure Cloud",
  web_app: "Web & App Dev",
  event_management: "Event Management",
  public_relations: "Public Relations",
  media_marketing: "Media Marketing",
  creativity: "Creativity",
};

export function AttendanceClient({ initialApplications, userRole, panelDomain }: AttendanceClientProps) {
  const [apps, setApps] = useState(initialApplications);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleToggleAttendance = (firestoreId: string, currentStatus: boolean, name: string) => {
    setUpdatingId(firestoreId);
    const newStatus = !currentStatus;

    startTransition(async () => {
      const result = await updateAttendance(firestoreId, newStatus);
      setUpdatingId(null);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "Status Updated",
          description: `${name} marked as ${newStatus ? "Attended" : "Absent"}.`,
        });
        // Update local state instantly
        setApps((prev) =>
          prev.map((app) =>
            app.firestoreId === firestoreId ? { ...app, interviewAttended: newStatus } : app
          )
        );
      }
    });
  };

  // Filter calculations
  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      app.id.toLowerCase().includes(search.toLowerCase());

    const matchesDomain =
      domainFilter === "all" ||
      app.technicalDomain === domainFilter ||
      app.nonTechnicalDomain === domainFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "attended" && app.interviewAttended) ||
      (statusFilter === "pending" && !app.interviewAttended);

    return matchesSearch && matchesDomain && matchesStatus;
  });

  // Count calculations
  const totalCount = apps.length;
  const attendedCount = apps.filter((a) => a.interviewAttended).length;
  const pendingCount = totalCount - attendedCount;

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Cards (Apple-inspired glassmorphism with glowing borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="relative overflow-hidden bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Scheduled</span>
            <p className="text-4xl font-black mt-2 text-white">{totalCount}</p>
          </div>
          <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-white/5 text-white/60">
            <Calendar className="size-5" />
          </div>
        </motion.div>

        {/* Attended Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="relative overflow-hidden bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-black text-[#34A853] uppercase tracking-widest">Present / Checked-in</span>
            <p className="text-4xl font-black mt-2 text-[#34A853]">{attendedCount}</p>
          </div>
          <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
            <CheckCircle2 className="size-5" />
          </div>
        </motion.div>

        {/* Pending Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="relative overflow-hidden bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-black text-[#FBBC05] uppercase tracking-widest">Pending / Absent</span>
            <p className="text-4xl font-black mt-2 text-[#FBBC05]">{pendingCount}</p>
          </div>
          <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-[#FBBC05]/10 border border-[#FBBC05]/20 text-[#FBBC05]">
            <XCircle className="size-5" />
          </div>
        </motion.div>

      </div>

      {/* Interactive Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/[0.01] border border-white/5 rounded-3xl p-5 backdrop-blur-lg">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input
            placeholder="Search by candidate name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-white/5 border-white/10 rounded-2xl h-11 text-sm focus:border-[#4285F4] transition-all text-white placeholder:text-white/30"
          />
        </div>

        {/* Domain Selection */}
        {!panelDomain && (
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-full md:w-56 bg-white/5 border-white/10 rounded-2xl h-11 text-sm focus:border-[#4285F4] text-white">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-2xl">
              <SelectItem value="all" className="rounded-xl">All Domains</SelectItem>
              {Object.entries(domainLabels).map(([id, label]) => (
                <SelectItem key={id} value={id} className="rounded-xl">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Attendance Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 rounded-2xl h-11 text-sm focus:border-[#4285F4] text-white">
            <SelectValue placeholder="Attendance: All" />
          </SelectTrigger>
          <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-2xl">
            <SelectItem value="all" className="rounded-xl">Attendance: All</SelectItem>
            <SelectItem value="attended" className="rounded-xl">Present Only</SelectItem>
            <SelectItem value="pending" className="rounded-xl">Absent Only</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Candidate Grid */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Candidate Rosters ({filteredApps.length})</span>
        </div>

        <div className="divide-y divide-white/5">
          <AnimatePresence mode="popLayout">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => {
                const isCheckingIn = updatingId === app.firestoreId;
                return (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors"
                  >
                    
                    {/* Candidate Identity Card details */}
                    <div className="flex items-center gap-4">
                      <div className="flex aspect-square size-11 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/60 font-bold shrink-0">
                        {app.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{app.name}</h4>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="font-mono text-[10px] text-white/40">{app.rollNo}</span>
                          <span className="text-white/20 text-xs">•</span>
                          <Badge variant="secondary" className="text-[9px] font-bold tracking-wider uppercase px-2 py-0">
                            {domainLabels[app.technicalDomain] || app.technicalDomain}
                          </Badge>
                          {app.nonTechnicalDomain && (
                            <Badge variant="outline" className="text-[9px] font-bold tracking-wider uppercase px-2 py-0 border-white/10 text-white/50">
                              {domainLabels[app.nonTechnicalDomain] || app.nonTechnicalDomain}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Checkbox triggers & action shortcuts */}
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      
                      {/* Short action buttons */}
                      <div className="flex gap-2">
                        <a 
                          href={`mailto:${app.email}`} 
                          className="flex aspect-square size-9 items-center justify-center rounded-xl bg-white/5 hover:bg-[#4285F4]/10 hover:text-[#4285F4] text-white/40 transition-all border border-white/5"
                          title="Email candidate"
                        >
                          <Mail className="size-4" />
                        </a>
                        <a 
                          href={`tel:${app.phone}`} 
                          className="flex aspect-square size-9 items-center justify-center rounded-xl bg-white/5 hover:bg-[#4285F4]/10 hover:text-[#4285F4] text-white/40 transition-all border border-white/5"
                          title="Call candidate"
                        >
                          <Phone className="size-4" />
                        </a>
                      </div>

                      {/* Attendance Toggle Pill */}
                      <button
                        onClick={() => handleToggleAttendance(app.firestoreId, app.interviewAttended, app.name)}
                        disabled={isCheckingIn}
                        className={cn(
                          "relative inline-flex h-9 items-center justify-center rounded-full px-5 text-xs font-black uppercase tracking-wider transition-all border shrink-0",
                          app.interviewAttended 
                            ? "bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853] shadow-[0_0_12px_rgba(52,168,83,0.1)]" 
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        )}
                      >
                        {isCheckingIn ? (
                          <RefreshCw className="size-3.5 animate-spin mr-2" />
                        ) : app.interviewAttended ? (
                          <CheckCircle2 className="size-3.5 mr-1.5" />
                        ) : null}
                        {isCheckingIn ? "Updating" : app.interviewAttended ? "Present" : "Mark Present"}
                      </button>

                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-16 text-center text-white/30 text-xs font-medium">
                No candidates found matching filters.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
