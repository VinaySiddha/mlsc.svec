
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from 'date-fns';
import { Award, Star } from "lucide-react";
import { useTransition } from "react";
import { ApplicationsTableSkeleton } from "./applications-table-skeleton";
import { Checkbox } from "./ui/checkbox";
import { updateAttendance } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


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
        // No need to refresh the whole page, the local state change is enough for visual feedback
        // until the next full page load.
      }
    });
  };

  if (isPending && applications.length === 0) {
    return <ApplicationsTableSkeleton />;
  }

  const canEditAttendance = userRole === 'admin' || userRole === 'panel';

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Technical Domain</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Attended</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? (
            applications.map((app: any) => {
              const status = app.status || 'Received';
              return (
                <TableRow key={app.id} className={isPending ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       {app.isRecommended && <Award className="h-4 w-4 text-primary" />}
                      <Link href={`/admin/application/${app.id}`} className="hover:underline">
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
                  <TableCell className="hidden sm:table-cell">{domainLabels[app.technicalDomain] || app.technicalDomain}</TableCell>
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
    </div>
  );
}
