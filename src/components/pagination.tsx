
'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PaginationComponentProps {
  totalPages: number;
  currentPage: number;
  applications: any[];
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}

export function PaginationComponent({ totalPages, currentPage, applications, isPending, startTransition }: PaginationComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());

    if (newPage > currentPage && applications.length > 0) {
      const lastVisibleId = applications[applications.length - 1].firestoreId;
      params.set('lastVisibleId', lastVisibleId);
    } else {
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
        Next
        {isPending ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <ChevronRight className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
