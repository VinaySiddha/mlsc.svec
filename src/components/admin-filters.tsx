
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';

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
  };
}

export function AdminFilters({ userRole, filterData, currentFilters }: AdminFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      return params.toString();
    },
    [searchParams]
  );
  
  useEffect(() => {
    const handler = setTimeout(() => {
        router.push(pathname + '?' + createQueryString([{ name: 'search', value: search }]));
    }, 500); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [search, pathname, createQueryString, router]);

  const handleFilterChange = (name: string, value: string) => {
    const updatedValue = value === 'all' ? '' : value;
    router.push(pathname + '?' + createQueryString([{ name, value: updatedValue }]));
  };

  const resetFilters = () => {
    setSearch('');
    router.push(pathname);
  };
  
  const hasActiveFilters = Object.values(currentFilters).some(Boolean) || search;

  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center p-4 border rounded-lg bg-card-foreground/5">
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name, email, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select onValueChange={(value) => handleFilterChange('status', value)} value={currentFilters.status || 'all'}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {filterData.statuses.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => handleFilterChange('year', value)} value={currentFilters.year || 'all'}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {filterData.years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => handleFilterChange('branch', value)} value={currentFilters.branch || 'all'}>
        <SelectTrigger className="w-full md:w-[180px]">
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
        <Select onValueChange={(value) => handleFilterChange('domain', value)} value={currentFilters.domain || 'all'}>
            <SelectTrigger className="w-full md:w-[220px]">
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
      {hasActiveFilters && (
        <Button variant="ghost" onClick={resetFilters}>
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
