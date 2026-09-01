'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from 'date-fns';
import { Award, Bot, CheckCircle2, Circle, Loader2, Sparkles, Star, Trash2, UserCheck, Zap } from "lucide-react";
import { useState, useTransition } from "react";
import { ApplicationsTableSkeleton } from "./applications-table-skeleton";
import { updateAttendance, toggleRecommendation, deleteApplicationAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { cn } from "@/lib/utils";

const getStatusVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'hired':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'under processing':
    case 'interviewing':
    case 'interview done':
    case 'recommended':
      return 'secondary';
    default:
      return 'outline';
  }
};

interface ApplicationsTableProps {
  applications: any[];
  domainLabels: Record<string, string>;
  userRole: string | null;
}

export function ApplicationsTable({ applications, domainLabels, userRole }: ApplicationsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [appToDelete, setAppToDelete] = useState<{ id: string; name: string; rollNo?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingAttendanceId, setUpdatingAttendanceId] = useState<string | null>(null);
  const [togglingRecId, setTogglingRecId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleAttendanceChange = (firestoreId: string, attended: boolean) => {
    setUpdatingAttendanceId(firestoreId);
    startTransition(async () => {
      try {
        const result = await updateAttendance(firestoreId, attended);
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: result.error,
          });
        } else {
          toast({
            title: attended ? '✓ Marked as Attended' : 'Marked as Absent',
            description: attended ? 'Candidate interview attendance recorded.' : 'Attendance status cleared.',
          });
          router.refresh();
        }
      } finally {
        setUpdatingAttendanceId(null);
      }
    });
  };

  const handleToggleRec = (id: string, currentStatus: boolean) => {
    setTogglingRecId(id);
    startTransition(async () => {
      try {
        const result = await toggleRecommendation(id, !currentStatus);
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: result.error,
          });
        } else {
          toast({
            title: !currentStatus ? '★ Candidate Manually Selected' : 'Manual Selection Removed',
            description: !currentStatus ? 'Candidate has been selected for hiring round.' : 'Selection flag removed.',
          });
          router.refresh();
        }
      } finally {
        setTogglingRecId(null);
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    const result = await deleteApplicationAction(appToDelete.id);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: result.error,
      });
    } else {
      toast({
        title: 'Application Deleted',
        description: `Application for ${appToDelete.name} has been removed.`,
      });
      setAppToDelete(null);
      router.refresh();
    }
    setIsDeleting(false);
  };

  if (isPending && applications.length === 0) {
    return <ApplicationsTableSkeleton />;
  }

  const canEditAttendance = userRole === 'admin' || userRole === 'super_admin' || userRole === 'panel';
  const canRecommend = userRole === 'admin' || userRole === 'super_admin' || userRole === 'panel' || userRole === 'common_panel';
  const canDelete = userRole === 'admin' || userRole === 'super_admin';

  return (
    <div className="border border-white/10 rounded-2xl overflow-x-auto bg-black/40 backdrop-blur-xl shadow-2xl">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10 bg-white/[0.03] hover:bg-white/[0.03]">
            <TableHead className="min-w-[200px] text-xs font-black uppercase tracking-wider text-white/70">Candidate</TableHead>
            <TableHead className="hidden md:table-cell min-w-[110px] text-xs font-black uppercase tracking-wider text-white/70">Submitted</TableHead>
            <TableHead className="min-w-[110px] text-xs font-black uppercase tracking-wider text-white/70">Status</TableHead>
            <TableHead className="hidden sm:table-cell min-w-[150px] text-xs font-black uppercase tracking-wider text-white/70">Domain(s)</TableHead>
            <TableHead className="min-w-[130px] text-xs font-black uppercase tracking-wider text-purple-400">AI Screening</TableHead>
            <TableHead className="min-w-[150px] text-xs font-black uppercase tracking-wider text-emerald-400">Manual Interview</TableHead>
            <TableHead className="min-w-[130px] text-center text-xs font-black uppercase tracking-wider text-emerald-300">
              ✓ Attendance
            </TableHead>
            <TableHead className="text-right min-w-[160px] text-xs font-black uppercase tracking-wider text-yellow-400">
              ★ Selection & Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? (
            applications.map((app: any) => {
              const status = app.status || 'Received';
              const isAttended = !!app.interviewAttended;
              const isAttendingLoading = updatingAttendanceId === (app.firestoreId || app.id);
              const isRecLoading = togglingRecId === (app.firestoreId || app.id);

              // AI Rating & Selection resolution
              const aiScore = app.aiRatings?.overall ?? (app.ratings && !app.manualRatings && app.status === 'Received' ? app.ratings.overall : 0);
              const isAiSelected = app.isAiRecommended !== undefined 
                ? app.isAiRecommended 
                : (app.aiRatings ? (app.aiRatings.overall >= 3.5) : (aiScore >= 3.5));

              // Human / Manual Rating & Selection resolution (strictly after human gives rating)
              const rawManualScore = app.manualRatings?.overall ?? ((app.ratings && app.aiRatings && app.ratings.overall !== app.aiRatings.overall) ? app.ratings.overall : (app.interviewAttended && app.status !== 'Received' ? (app.ratings?.overall ?? 0) : 0));
              const hasHumanRated = rawManualScore > 0 && (app.interviewAttended || app.status !== 'Received');
              const humanScore = hasHumanRated ? rawManualScore : 0;
              const isManualSelected = app.isManualSelected ?? (hasHumanRated ? (app.isRecommended ?? false) : false);

              return (
                <TableRow 
                  key={app.id} 
                  className={cn(
                    "border-b border-white/5 transition-colors hover:bg-white/[0.02]",
                    isManualSelected && "bg-yellow-500/[0.04]",
                    isAttended && !isManualSelected && "bg-emerald-500/[0.02]"
                  )}
                >
                  {/* Candidate Name & Info */}
                  <TableCell className="font-medium py-3.5">
                    <div className="flex items-center gap-2">
                      {isManualSelected && (
                        <span title="Manually Selected for Final Hiring">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 shrink-0 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
                        </span>
                      )}
                      {isAiSelected && !isManualSelected && (
                        <span title="AI Recommended">
                          <Bot className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                        </span>
                      )}
                      <Link 
                        href={`/admin/application/${app.id}`} 
                        target="_blank" 
                        className="hover:underline font-bold text-white text-sm hover:text-[#4285F4] transition-colors"
                      >
                        {app.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-semibold text-white/60">{app.rollNo}</span>
                      <span className="text-[10px] text-white/40">• {app.branch}</span>
                    </div>
                  </TableCell>

                  {/* Submission Date */}
                  <TableCell className="text-white/40 whitespace-nowrap hidden md:table-cell text-xs">
                    {app.submittedAt ? format(new Date(app.submittedAt), "MMM d, yyyy") : '—'}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge variant={getStatusVariant(status)} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                      {status}
                    </Badge>
                  </TableCell>

                  {/* Domain Preferences */}
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-xs text-white/90">
                        {domainLabels[app.technicalDomain] || app.technicalDomain}
                      </span>
                      {app.nonTechnicalDomain && (
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                          Non-Tech: {domainLabels[app.nonTechnicalDomain] || app.nonTechnicalDomain}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* AI Screening (Rating + AI Selected status) */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300">
                          <Bot className="size-3 text-purple-400" />
                          {aiScore > 0 ? `${aiScore.toFixed(1)} / 5` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        {isAiSelected ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            🤖 AI Selected
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/30 font-medium">
                            Not Rec
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Manual Interview (Clean display: 'Received' when not reviewed, or score when interviewed) */}
                  <TableCell>
                    {hasHumanRated ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border bg-[#34A853]/15 border-[#34A853]/30 text-emerald-400 font-extrabold">
                            <UserCheck className="size-3" />
                            {`${humanScore.toFixed(1)} / 5`}
                          </span>
                        </div>
                        {isManualSelected && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.2)]">
                              ★ Selected
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-white/[0.03] border border-white/10 text-white/40">
                        Received
                      </span>
                    )}
                  </TableCell>

                  {/* ── HIGH VISIBILITY ATTENDANCE TOGGLE ── */}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => handleAttendanceChange(app.firestoreId || app.id, !isAttended)}
                      disabled={isAttendingLoading || !canEditAttendance}
                      className={cn(
                        "w-full max-w-[120px] mx-auto py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm border",
                        isAttended
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          : "bg-white/5 border-white/15 text-white/50 hover:border-emerald-500/40 hover:text-white hover:bg-emerald-500/10",
                        isAttendingLoading && "opacity-60 cursor-wait"
                      )}
                      title={isAttended ? "Mark as absent" : "Mark as attended"}
                    >
                      {isAttendingLoading ? (
                        <Loader2 className="size-3.5 animate-spin text-white/60" />
                      ) : isAttended ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                          <span>Attended</span>
                        </>
                      ) : (
                        <>
                          <Circle className="size-3.5 text-white/30 shrink-0" />
                          <span>Mark Attended</span>
                        </>
                      )}
                    </button>
                  </TableCell>

                  {/* ── HIGH VISIBILITY MANUAL SELECTION TOGGLE & ACTION ── */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canRecommend && (
                        <button
                          type="button"
                          onClick={() => handleToggleRec(app.firestoreId || app.id, isManualSelected)}
                          disabled={isRecLoading}
                          className={cn(
                            "py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition-all flex items-center gap-1.5 shadow-sm active:scale-95",
                            isManualSelected 
                              ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)] hover:brightness-110" 
                              : "bg-yellow-500/10 border-2 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400",
                            isRecLoading && "opacity-60 cursor-wait"
                          )}
                          title={isManualSelected ? "Click to unselect" : "Click to select candidate for hiring"}
                        >
                          {isRecLoading ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Star className={cn("size-3.5", isManualSelected ? "fill-black text-black" : "text-yellow-400")} />
                          )}
                          <span>{isManualSelected ? "★ Selected" : "☆ Select"}</span>
                        </button>
                      )}
                      
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAppToDelete({ id: app.firestoreId || app.id, name: app.name, rollNo: app.rollNo })}
                          disabled={isPending}
                          className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                          title="Delete Application"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-28 text-white/40 text-sm">
                No applications match your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Dedicated Delete Applicant Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!appToDelete}
        onOpenChange={(open) => !open && setAppToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Candidate Application"
        itemName={appToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}
