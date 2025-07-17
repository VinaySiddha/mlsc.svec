
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect, useTransition } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Search, X, TrendingUp, Award } from 'lucide-react';

interface AdminFiltersProps {
  userRole: string | null;
  filterData: {
    statuses: string[];
    years: string[];
    branches: string[];
    domains: string[];
  };
  currentFilters: {
    search?: string;
    status?: string;
    year?: string;
    branch?: string;
    domain?: string;
    sortByPerformance?: string;
    sortByRecommended?: string;
    page?: string;
  };
}

export function AdminFilters({ userRole, filterData, currentFilters }: AdminFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentFilters.search || '');

  const createQueryString = useCallback(
    (updates: { name: string; value: string }[]) => {
      const params = new URLSearchParams(searchParams.toString());
      updates.forEach(({ name, value }) => {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      });
      // Reset page to 1 on any filter change except for pagination itself
      if (!updates.some(u => u.name === 'page')) {
        params.set('page', '1');
      }
      return params.toString();
    },
    [searchParams]
  );
  
  useEffect(() => {
    const handler = setTimeout(() => {
        if (search !== (currentFilters.search || '')) {
            startTransition(() => {
                router.push(pathname + '?' + createQueryString([{ name: 'search', value: search }]));
            });
        }
    }, 500); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [search, pathname, createQueryString, router, currentFilters.search]);

  const handleFilterChange = (name: string, value: string) => {
    const updatedValue = value === 'all' ? '' : value;
    startTransition(() => {
      router.push(pathname + '?' + createQueryString([{ name, value: updatedValue }]));
    });
  };
  
  const handleSortToggle = (sortKey: 'sortByPerformance' | 'sortByRecommended') => {
    const isSorting = currentFilters[sortKey] === 'true';
    startTransition(() => {
      router.push(pathname + '?' + createQueryString([{ name: sortKey, value: isSorting ? '' : 'true' }]));
    });
  };

  const resetFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push(pathname);
    });
  };
  
  const hasActiveFilters = Object.values(currentFilters).some(val => val && val !== '1') || search;


  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row gap-2 items-center">
        <div className="relative w-full xl:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            disabled={isPending}
          />
        </div>
        <Select onValueChange={(value) => handleFilterChange('status', value)} value={currentFilters.status || 'all'} disabled={isPending}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {filterData.statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('year', value)} value={currentFilters.year || 'all'} disabled={isPending}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {filterData.years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('branch', value)} value={currentFilters.branch || 'all'} disabled={isPending}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {filterData.branches.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {userRole === 'admin' && (
          <Select onValueChange={(value) => handleFilterChange('domain', value)} value={currentFilters.domain || 'all'} disabled={isPending}>
              <SelectTrigger className="w-full">
                  <SelectValue placeholder="Technical Domain" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Tech Domains</SelectItem>
                  {filterData.domains.map((d) => (
                      <SelectItem key={d} value={d}>{domainLabels[d] || d}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex items-center gap-2">
         {userRole === 'admin' && (
          <>
            <Button variant={currentFilters.sortByPerformance === 'true' ? 'secondary' : 'outline'} onClick={() => handleSortToggle('sortByPerformance')} disabled={isPending}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Sort by Performance
            </Button>
            <Button variant={currentFilters.sortByRecommended === 'true' ? 'secondary' : 'outline'} onClick={() => handleSortToggle('sortByRecommended')} disabled={isPending}>
                <Award className="mr-2 h-4 w-4" />
                Sort by Recommended
            </Button>
          </>
        )}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={resetFilters} disabled={isPending}>
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
