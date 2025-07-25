
'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

interface PaginationComponentProps {
  hasNextPage: boolean;
  currentPage: number;
  applications: any[];
}

export function PaginationComponent({ hasNextPage, currentPage, applications }: PaginationComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    
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
  
  if (currentPage === 1 && !hasNextPage) {
    return null;
  }

  return (
    <div className="flex items-center justify-between pt-4">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
      >
        {isPending && currentPage > 1 ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ChevronLeft className="mr-2 h-4 w-4" />
        )}
        Previous
      </Button>
      <div className="text-sm text-muted-foreground">
        Page {currentPage}
      </div>
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNextPage || isPending}
      >
         {isPending && hasNextPage ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Next"
        )}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
