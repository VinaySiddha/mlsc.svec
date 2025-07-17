
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from 'date-fns';
import { Award, Star } from "lucide-react";
import { useTransition } from "react";
import { ApplicationsTableSkeleton } from "./applications-table-skeleton";


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
}

export function ApplicationsTable({ applications, domainLabels }: ApplicationsTableProps) {
  const [isPending] = useTransition();

  if (isPending) {
    return <ApplicationsTableSkeleton />;
  }
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Technical Domain</TableHead>
            <TableHead>Performance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? (
            applications.map((app: any) => {
              const status = app.status || 'Received';
              return (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-xs">
                     <Link href={`/admin/application/${app.id}`} className="hover:underline">
                        {app.id}
                      </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       {app.isRecommended && <Award className="h-4 w-4 text-primary" />}
                      <Link href={`/admin/application/${app.id}`} className="hover:underline">
                        {app.name}
                      </Link>
                    </div>
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
