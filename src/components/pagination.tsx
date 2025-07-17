
'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

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
      // For going to a previous page, we don't need lastVisibleId
      // and for the first page, it should be cleared.
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
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ChevronLeft className="mr-2 h-4 w-4" />
        )}
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
         {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Next"
        )}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
