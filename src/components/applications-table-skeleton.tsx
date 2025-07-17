
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ApplicationsTableSkeleton() {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
            <TableHead className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableHead>
            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
            <TableHead className="hidden sm:table-cell"><Skeleton className="h-5 w-32" /></TableHead>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
              <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-5 w-5" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
