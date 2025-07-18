
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect, useTransition } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Search, X, TrendingUp, Award, Loader2, ClipboardCheck, FileDown, FileText } from 'lucide-react';
import { bulkUpdateStatus, exportHiredToCsv, getApplications } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


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
  };
}

export function AdminFilters({ userRole, filterData, currentFilters }: AdminFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [bulkUpdateTargetStatus, setBulkUpdateTargetStatus] = useState('');
  const { toast } = useToast();

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
      if (!updates.some(u => u.name === 'page')) {
        params.set('page', '1');
        params.delete('lastVisibleId');
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
    }, 500);

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
    const filtersToPass = { ...currentFilters, attendedOnly: false };

    try {
        const result = await bulkUpdateStatus(filtersToPass, bulkUpdateTargetStatus);
        if (result.error) {
            throw new Error(result.error);
        }
        toast({
            title: "Bulk Update Successful",
            description: `${result.updatedCount} applications have been updated to '${bulkUpdateTargetStatus}'.`,
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

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const { applications } = await getApplications({
        ...currentFilters,
        fetchAll: true,
        attendedOnly: true,
      });

      if (!applications || applications.length === 0) {
        toast({
          variant: "destructive",
          title: "No Attended Candidates",
          description:
            "There are no attended candidates matching the current filters.",
        });
        return;
      }

      // Group applications by year, then by branch
      const groupedByYear = applications.reduce((acc, app) => {
        const year = app.yearOfStudy || "Unknown Year";
        if (!acc[year]) {
          acc[year] = {};
        }
        const branch = app.branch || "Unknown Branch";
        if (!acc[year][branch]) {
          acc[year][branch] = [];
        }
        acc[year][branch].push(app);
        return acc;
      }, {});
      
      const doc = new jsPDF();
      let isFirstPage = true;
      let yPos = 15;

      doc.setFontSize(18);
      doc.text(
        "MLSC Hiring Team - Attendance Sheet",
        doc.internal.pageSize.getWidth() / 2,
        yPos,
        { align: "center" }
      );
      yPos += 10;
      
      const tableColumn = ["Roll No", "Name", "Signature"];

      for (const year in groupedByYear) {
        for (const branch in groupedByYear[year]) {
          const groupApps = groupedByYear[year][branch];
          const tableRows = groupApps.map(app => [app.rollNo, app.name, '']);
          
          const heading = `${year} Year - ${branch}`;
          
          const autoTable = (doc as any).autoTable;
          
          // Check if there is enough space for the table, otherwise add a new page
          const tableHeight = (tableRows.length + 1) * 10 + 15; // Approximate height
          if (yPos + tableHeight > doc.internal.pageSize.getHeight() - 10) {
            doc.addPage();
            yPos = 15;
          }
          
          autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: yPos + 7,
            didDrawPage: (data: any) => {
               // Only add header on the first page draw if it's the very first page
               if(isFirstPage) {
                   doc.setFontSize(18);
                   doc.text("MLSC Hiring Team - Attendance Sheet", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
                   isFirstPage = false; // Prevent header from being redrawn on subsequent pages for the same table
               }
            },
            headStyles: { fillColor: [41, 128, 185] }, // Example color
          });
          
          const finalY = (autoTable as any).previous.finalY;

          // Add the heading just above the table
          doc.setFontSize(14);
          doc.text(heading, 14, yPos);
          
          yPos = finalY + 15; // Position for the next table
        }
      }

      doc.save(`attendance_${new Date().toISOString().split("T")[0]}.pdf`);
      toast({
        title: "PDF Generated",
        description: "Your attendance sheet has been downloaded.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: errorMessage,
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };


  const resetFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push(pathname);
    });
  };
  
  const hasActiveFilters = Object.values(currentFilters).some(val => !!val) || search;

  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };
  
  const bulkUpdateStatuses = ['Interviewing', 'Hired', 'Rejected', 'Under Processing'];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row gap-2 items-center">
        <div className="relative w-full xl:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            disabled={isPending || isBulkUpdating}
          />
        </div>
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
                {(isPending && searchParams.get('sortByPerformance') !== 'true') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                Sort by Performance
            </Button>
            <Button variant={currentFilters.sortByRecommended === 'true' ? 'secondary' : 'outline'} onClick={() => handleSortToggle('sortByRecommended')} disabled={isPending || isBulkUpdating}>
                {(isPending && searchParams.get('sortByRecommended') !== 'true') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
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
             <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                {isDownloadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Download Attendance PDF
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
