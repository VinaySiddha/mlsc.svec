
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect, useTransition } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Search, X, TrendingUp, Award, Loader2, ClipboardCheck, FileDown, FileText, Users } from 'lucide-react';
import { bulkUpdateStatus, exportHiredToCsv, getApplications } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


interface AdminFiltersProps {
  userRole: string | null;
  panelDomain?: string;
  filterData: {
    statuses: string[];
    years: string[];
    branches: string[];
    domains: string[];
  };
  currentFilters: {
    search?: string;
    searchBy?: string;
    status?: string;
    year?: string;
    branch?: string;
    domain?: string;
    sortByPerformance?: string;
    sortByRecommended?: string;
  };
}

export function AdminFilters({ userRole, panelDomain, filterData, currentFilters }: AdminFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingRegisteredPdf, setIsDownloadingRegisteredPdf] = useState(false);
  const [bulkUpdateTargetStatus, setBulkUpdateTargetStatus] = useState('');
  const { toast } = useToast();

  const [search, setSearch] = useState(currentFilters.search || '');
  const [searchBy, setSearchBy] = useState(currentFilters.searchBy || 'rollNo');

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
      // Reset pagination on any filter change
      if (!updates.some(u => u.name === 'page')) {
        params.delete('page');
        params.delete('lastVisibleId');
      }
      return params.toString();
    },
    [searchParams]
  );
  
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
        const newQuery = createQueryString([
            { name: 'search', value: search },
            { name: 'searchBy', value: searchBy }
        ]);
        router.push(pathname + '?' + newQuery);
    });
  };
  
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

  const handleBulkUpdate = async () => {
    if (!bulkUpdateTargetStatus) {
        toast({
            variant: "destructive",
            title: "No Status Selected",
            description: "Please select a status to apply to the filtered applications.",
        });
        return;
    }

    setIsBulkUpdating(true);
    const filtersToPass = { ...currentFilters, attendedOnly: false, panelDomain };
    
    try {
        const result = await bulkUpdateStatus(filtersToPass, bulkUpdateTargetStatus);
        if (result.error) {
            throw new Error(result.error);
        }
        toast({
            title: "Bulk Update Successful",
            description: `${result.updatedCount} applications have been updated to '${bulkUpdateTargetStatus}'. Emails will be sent in the background.`,
        });
        startTransition(() => {
            router.refresh();
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({
            variant: "destructive",
            title: "Bulk Update Failed",
            description: errorMessage,
        });
    } finally {
        setIsBulkUpdating(false);
    }
  };

  const handleExport = async () => {
      setIsExporting(true);
      try {
          const result = await exportHiredToCsv();
          if (result.error) {
              throw new Error(result.error);
          }
          if (result.csvData) {
              const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              const url = URL.createObjectURL(blob);
              link.setAttribute('href', url);
              link.setAttribute('download', `hired_candidates_${new Date().toISOString().split('T')[0]}.csv`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast({ title: 'Export Successful', description: 'Hired candidates data has been downloaded.' });
          }
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          toast({
              variant: "destructive",
              title: "Export Failed",
              description: errorMessage,
          });
      } finally {
          setIsExporting(false);
      }
  };

  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };
  
  const getDomainForPdf = () => {
    return panelDomain || currentFilters.domain;
  };

  const handleDownloadPdf = async (attendedOnly: boolean) => {
    const setLoading = attendedOnly ? setIsDownloadingPdf : setIsDownloadingRegisteredPdf;
    setLoading(true);
    
    const domain = getDomainForPdf();

    try {
        const params: any = { 
            panelDomain: panelDomain,
            domain: currentFilters.domain,
            fetchAll: true, 
            attendedOnly 
        };
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        const result = await getApplications(params);
        if (!result || !result.applications) {
            throw new Error("Failed to fetch applications for PDF generation.");
        }
        const { applications } = result;

        if (applications.length === 0) {
            toast({
                variant: "destructive",
                title: "No Candidates Found",
                description: `There are no ${attendedOnly ? 'attended' : 'registered'} candidates matching the current filters.`,
            });
            setLoading(false);
            return;
        }

        const doc = new jsPDF();
        let finalY = 15;
        
        const fileType = attendedOnly ? 'Attendance' : 'Registered_Students';
        const docTitle = attendedOnly ? 'Attendance Sheet' : 'Registered Students';

        let title = `MLSC Hiring - ${docTitle}`;
        if (domain) {
          title = `${docTitle} - ${domainLabels[domain] || domain} Domain`;
        }

        doc.setFontSize(18);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, finalY, { align: "center" });
        finalY += 10;
        
        const tableColumn = attendedOnly
          ? ["Roll No", "Name"]
          : ["Roll No", "Name", "Year", "Branch"];
        
        const tableRows = applications.map(app => attendedOnly
            ? [app.rollNo, app.name]
            : [app.rollNo, app.name, app.yearOfStudy, app.branch]
        );

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: finalY,
            headStyles: { fillColor: [41, 128, 185] },
        });
        
        const pdfFileName = domain
            ? `${fileType}_${domain}_${new Date().toISOString().split("T")[0]}.pdf`
            : `${fileType}_all_${new Date().toISOString().split("T")[0]}.pdf`;

        doc.save(pdfFileName);

        toast({
            title: "PDF Generated",
            description: `Your ${fileType.toLowerCase().replace('_', ' ')} list has been downloaded.`,
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        toast({
            variant: "destructive",
            title: "PDF Generation Failed",
            description: errorMessage,
        });
    } finally {
        setLoading(false);
    }
  };


  const resetFilters = () => {
    setSearch('');
    setSearchBy('rollNo');
    startTransition(() => {
      router.push(pathname);
    });
  };
  
  const hasActiveFilters = Object.values(currentFilters).some(val => !!val) || search;

  
  const bulkUpdateStatuses = ['Interviewing', 'Hired', 'Rejected', 'Under Processing', 'Recommended'];

  const showDomainSpecificButtons = userRole === 'panel' || (userRole === 'admin' && !!currentFilters.domain);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row gap-2 items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full xl:max-w-md">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search by ${searchBy === 'name' ? 'name' : 'roll no'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              disabled={isPending || isBulkUpdating}
            />
          </div>
           {userRole === 'admin' && (
              <Select value={searchBy} onValueChange={setSearchBy} disabled={isPending || isBulkUpdating}>
                <SelectTrigger className="w-[140px] shrink-0">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rollNo">Roll Number</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button type="submit" variant="outline" disabled={isPending || isBulkUpdating}>Search</Button>
        </form>
        <Select onValueChange={(value) => handleFilterChange('status', value)} value={currentFilters.status || 'all'} disabled={isPending || isBulkUpdating}>
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
        <Select onValueChange={(value) => handleFilterChange('year', value)} value={currentFilters.year || 'all'} disabled={isPending || isBulkUpdating}>
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
        <Select onValueChange={(value) => handleFilterChange('branch', value)} value={currentFilters.branch || 'all'} disabled={isPending || isBulkUpdating}>
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
          <Select onValueChange={(value) => handleFilterChange('domain', value)} value={currentFilters.domain || 'all'} disabled={isPending || isBulkUpdating}>
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
      <div className="flex flex-wrap items-center gap-2">
         {userRole === 'admin' && (
          <>
            <Button variant={currentFilters.sortByPerformance === 'true' ? 'secondary' : 'outline'} onClick={() => handleSortToggle('sortByPerformance')} disabled={isPending || isBulkUpdating}>
                {(isPending && searchParams.get('sortByPerformance') === 'true') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                Sort by Performance
            </Button>
            <Button variant={currentFilters.sortByRecommended === 'true' ? 'secondary' : 'outline'} onClick={() => handleSortToggle('sortByRecommended')} disabled={isPending || isBulkUpdating}>
                {(isPending && searchParams.get('sortByRecommended') === 'true') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
                Sort by Recommended
            </Button>
            <div className="flex items-center gap-2">
                <Select onValueChange={setBulkUpdateTargetStatus} value={bulkUpdateTargetStatus} disabled={isPending || isBulkUpdating}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {bulkUpdateStatuses.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Button variant="outline" onClick={handleBulkUpdate} disabled={isPending || isBulkUpdating || !bulkUpdateTargetStatus}>
                    {isBulkUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
                    Bulk Update
                </Button>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Export Hired
            </Button>
          </>
        )}
        {showDomainSpecificButtons && (
          <>
             <Button variant="outline" onClick={() => handleDownloadPdf(true)} disabled={isDownloadingPdf}>
                {isDownloadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Download Attendance PDF
            </Button>
             <Button variant="outline" onClick={() => handleDownloadPdf(false)} disabled={isDownloadingRegisteredPdf}>
                {isDownloadingRegisteredPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                Download Registered PDF
            </Button>
          </>
        )}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={resetFilters} disabled={isPending || isBulkUpdating}>
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
