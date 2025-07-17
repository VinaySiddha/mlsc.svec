
'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationComponentProps {
  totalPages: number;
  currentPage: number;
  applications: any[];
}

export function PaginationComponent({ totalPages, currentPage, applications }: PaginationComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());

    if (newPage > currentPage && applications.length > 0) {
      const lastVisibleId = applications[applications.length - 1].firestoreId;
      params.set('lastVisibleId', lastVisibleId);
    } else {
      // For going to previous page, we don't need lastVisibleId as Firestore's startAfter isn't used.
      // We rely on re-querying from the start with correct offsets managed by page number logic if implemented.
      // Simple page based navigation will refetch from start.
      // For more complex scenarios, keeping track of previous page cursors would be needed.
      params.delete('lastVisibleId');
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };
  
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between pt-4">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
      >
        Next
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
