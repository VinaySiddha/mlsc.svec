
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from 'date-fns';
import { Award, Star, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { ApplicationsTableSkeleton } from "./applications-table-skeleton";
import { Checkbox } from "./ui/checkbox";
import { updateAttendance, toggleRecommendation, deleteApplicationAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IosLoader } from "@/components/ui/ios-loader";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";


const getStatusVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'hired':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'under processing':
    case 'interviewing':
      return 'secondary';
    default:
      return 'outline';
  }
}

interface ApplicationsTableProps {
    applications: any[];
    domainLabels: Record<string, string>;
    userRole: string | null;
}

export function ApplicationsTable({ applications, domainLabels, userRole }: ApplicationsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [appToDelete, setAppToDelete] = useState<{ id: string; name: string; rollNo?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const handleAttendanceChange = (firestoreId: string, attended: boolean) => {
    startTransition(async () => {
      const result = await updateAttendance(firestoreId, attended);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: result.error,
        });
      } else {
        toast({
          title: 'Attendance Updated',
        });
        router.refresh();
      }
    });
  };

  const handleToggleRec = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleRecommendation(id, !currentStatus);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: result.error,
        });
      } else {
        toast({
          title: !currentStatus ? 'Candidate Recommended' : 'Recommendation Removed',
        });
        router.refresh();
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

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Domain(s)</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Attended</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? (
            applications.map((app: any) => {
              const status = app.status || 'Received';
              const canRecommend = userRole === 'admin' || userRole === 'super_admin' || userRole === 'panel' || userRole === 'common_panel';
              const canDelete = userRole === 'admin' || userRole === 'super_admin';

              return (
                <TableRow key={app.id} className={isPending ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       {app.isRecommended && <Award className="h-4 w-4 text-yellow-500" />}
                      <Link href={`/admin/application/${app.id}`} target="_blank" className="hover:underline">
                        {app.name}
                      </Link>
                    </div>
                     <div className="font-mono text-xs text-muted-foreground">{app.rollNo}</div>
                     <div className="font-mono text-xs text-muted-foreground">{app.id}</div>
                  </TableCell>
                   <TableCell className="text-muted-foreground whitespace-nowrap hidden md:table-cell">
                      {format(new Date(app.submittedAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(status)}>{status}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-xs sm:text-sm text-slate-800 dark:text-zinc-200">
                        {domainLabels[app.technicalDomain] || app.technicalDomain}
                      </span>
                      {app.nonTechnicalDomain && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          Non-Tech: {domainLabels[app.nonTechnicalDomain] || app.nonTechnicalDomain}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${app.ratings?.overall > 0 ? 'text-primary fill-primary' : 'text-muted-foreground'}`}/>
                      <span className="text-sm font-medium">{app.ratings?.overall || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                      <Checkbox
                        id={`attended-${app.firestoreId}`}
                        checked={app.interviewAttended}
                        onCheckedChange={(checked) => {
                          handleAttendanceChange(app.firestoreId, !!checked);
                        }}
                        aria-label={`Mark ${app.name} as attended`}
                        disabled={isPending || !canEditAttendance}
                      />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {canRecommend && (
                        <button
                          onClick={() => handleToggleRec(app.id, app.isRecommended || false)}
                          disabled={isPending}
                          className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${app.isRecommended ? 'text-red-500 border-red-500/20 hover:bg-red-500/10' : 'text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10'} transition-colors`}
                        >
                          {app.isRecommended ? 'Un-Recommend' : '★ Recommend'}
                        </button>
                      )}
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAppToDelete({ id: app.firestoreId || app.id, name: app.name, rollNo: app.rollNo })}
                          disabled={isPending}
                          className="h-7 w-7 p-0 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                          title="Delete Application"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
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
        description="This will permanently delete this applicant's submission, resume data, and live interview ratings."
        itemName={appToDelete?.name}
        itemDetails={appToDelete?.rollNo ? `Roll No: ${appToDelete.rollNo}` : undefined}
        isLoading={isDeleting}
      />
    </div>
  );
}
