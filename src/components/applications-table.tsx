
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from 'date-fns';

const getStatusVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'under review':
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
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Technical Domain</TableHead>
            <TableHead>Non-Technical Domain</TableHead>
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
                    <Link href={`/admin/application/${app.id}`} className="hover:underline">
                      {app.name}
                    </Link>
                  </TableCell>
                   <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(app.submittedAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(status)}>{status}</Badge>
                  </TableCell>
                  <TableCell>{domainLabels[app.technicalDomain] || app.technicalDomain}</TableCell>
                  <TableCell>{domainLabels[app.nonTechnicalDomain] || app.nonTechnicalDomain}</TableCell>
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
