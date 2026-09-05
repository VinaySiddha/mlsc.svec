'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition, useEffect } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { 
  Search, 
  X, 
  TrendingUp, 
  Sparkles, 
  Loader2, 
  ClipboardCheck, 
  FileDown, 
  FileText, 
  FileSpreadsheet,
  Users, 
  CheckCircle2, 
  Star, 
  Bot, 
  SlidersHorizontal,
  RotateCcw,
  Zap,
  Layers
} from 'lucide-react';
import { bulkUpdateStatus, exportHiredToCsv, exportRegisteredExcelToCsv, getApplications, syncReviewedApplicationsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface FilterCounts {
  total: number;
  attended: number;
  manualSelected: number;
  aiRecommended: number;
  statuses: Record<string, number>;
  years: Record<string, number>;
  branches: Record<string, number>;
  domains: Record<string, number>;
}

interface AdminFiltersProps {
  userRole: string | null;
  panelDomain?: string;
  filterData: {
    statuses: string[];
    years: string[];
    branches: string[];
    domains: string[];
  };
  filterCounts?: FilterCounts;
  totalApplications?: number;
  currentFilters: {
    search?: string;
    searchBy?: string;
    searchMode?: string;
    selectionFilter?: string;
    status?: string;
    year?: string;
    branch?: string;
    domain?: string;
    sortByPerformance?: string;
    sortByRecommended?: string;
    attendedOnly?: string;
  };
}

export function AdminFilters({ 
  userRole, 
  panelDomain, 
  filterData, 
  filterCounts,
  totalApplications,
  currentFilters 
}: AdminFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingRegisteredPdf, setIsDownloadingRegisteredPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isSyncingReviewed, setIsSyncingReviewed] = useState(false);
  const [bulkUpdateTargetStatus, setBulkUpdateTargetStatus] = useState('');
  const { toast } = useToast();

  const [search, setSearch] = useState(currentFilters.search || '');
  const [searchBy, setSearchBy] = useState(currentFilters.searchBy || 'all');
  const [searchMode, setSearchMode] = useState<'semi' | 'full'>((currentFilters.searchMode as any) || 'semi');

  // Keep internal state in sync with URL
  useEffect(() => {
    setSearch(currentFilters.search || '');
    setSearchBy(currentFilters.searchBy || 'all');
    setSearchMode((currentFilters.searchMode as any) || 'semi');
  }, [currentFilters.search, currentFilters.searchBy, currentFilters.searchMode]);

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

  const executeSearch = (searchTerm: string, mode: string, field: string) => {
    startTransition(() => {
      const newQuery = createQueryString([
        { name: 'search', value: searchTerm },
        { name: 'searchBy', value: field },
        { name: 'searchMode', value: mode }
      ]);
      router.push(pathname + '?' + newQuery);
    });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeSearch(search, searchMode, searchBy);
  };

  const handleSearchModeToggle = (mode: 'semi' | 'full') => {
    setSearchMode(mode);
    executeSearch(search, mode, searchBy);
  };

  const handleFilterChange = (name: string, value: string | boolean) => {
    let stringValue = '';
    if (typeof value === 'boolean') {
      stringValue = value ? 'true' : '';
    } else {
      stringValue = value === 'all' ? '' : value;
    }
    startTransition(() => {
      router.push(pathname + '?' + createQueryString([{ name, value: stringValue }]));
    });
  };

  const handleSelectionFilter = (filterKey: string) => {
    const currentVal = currentFilters.selectionFilter || '';
    const newVal = currentVal === filterKey ? '' : filterKey;
    startTransition(() => {
      router.push(pathname + '?' + createQueryString([{ name: 'selectionFilter', value: newVal }]));
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
    const filtersToPass = { ...currentFilters, attendedOnly: currentFilters.attendedOnly === 'true', panelDomain };
    
    try {
      const result = await bulkUpdateStatus(filtersToPass, bulkUpdateTargetStatus) as any;
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
    event_management: "Event Management",
    public_relations: "Public Relations",
    media_marketing: "Media Marketing",
    creativity: "Creativity",
  };
  
  const getDomainForPdf = () => {
    return panelDomain || currentFilters.domain;
  };

  const handleDownloadRegisteredExcel = async () => {
    setIsExportingExcel(true);
    try {
      const params: any = { 
        panelDomain: panelDomain,
        domain: currentFilters.domain,
        status: currentFilters.status,
        year: currentFilters.year,
        branch: currentFilters.branch,
        selectionFilter: currentFilters.selectionFilter,
        search: search,
        searchBy: searchBy,
        searchMode: searchMode,
        fetchAll: true, 
      };

      if ((userRole === 'admin' || userRole === 'super_admin' || userRole === 'common_panel' || userRole === 'view_only') && currentFilters.domain === 'all') {
        delete params.domain;
      }
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const result = await exportRegisteredExcelToCsv(params);
      if (result.error) {
        throw new Error(result.error);
      }
      if (!result.csvData) {
        toast({
          variant: "destructive",
          title: "No Candidates Found",
          description: "There are no registered candidates matching the current filters to export.",
        });
        return;
      }

      const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileType = 'Registered_Students';
      const domain = getDomainForPdf();
      const fileName = domain
        ? `${fileType}_${domain}_${new Date().toISOString().split("T")[0]}.csv`
        : `${fileType}_all_${new Date().toISOString().split("T")[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Excel Sheet Downloaded",
        description: `Successfully exported ${result.count || ''} registered candidates (Roll Number, Name, Year, Branch, Section).`,
      });
    } catch (error) {
      console.error("Excel export error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Excel Export Failed",
        description: errorMessage,
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const getLogoBase64 = async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    try {
      const res = await fetch('/logo.png');
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
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
      if (!attendedOnly && (userRole === 'admin' || userRole === 'super_admin' || userRole === 'common_panel' || userRole === 'view_only') && !domain) {
        delete params.domain;
      }

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const result = await getApplications(params) as any;
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

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const fileType = attendedOnly ? 'Attendance' : 'Registered_Students';
      const docTitle = attendedOnly ? 'Attendance Sheet' : 'Registered Candidates';

      // ── 1. TOP 4-COLOR MLSC ACCENT STRIPE (Google/MLSC Theme) ──
      const stripW = pageWidth / 4;
      doc.setFillColor(66, 133, 244); // Blue
      doc.rect(0, 0, stripW, 2.5, 'F');
      doc.setFillColor(234, 67, 53); // Red
      doc.rect(stripW, 0, stripW, 2.5, 'F');
      doc.setFillColor(251, 188, 4); // Yellow
      doc.rect(stripW * 2, 0, stripW, 2.5, 'F');
      doc.setFillColor(52, 168, 83); // Green
      doc.rect(stripW * 3, 0, stripW, 2.5, 'F');

      // ── 2. HEADER BRANDING & LOGO ──
      const logoBase64 = await getLogoBase64();
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', 14, 6, 16, 16);
        } catch {
          // Fallback if image decode fails
        }
      }

      const textLeft = logoBase64 ? 33 : 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text('MICROSOFT LEARN STUDENT CLUB', textLeft, 11.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.text('Sri Venkateswara College of Engineering (SVEC) • Chapter 4.0', textLeft, 16);

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text('Official Recruitment & Candidate Evaluation Roster', textLeft, 20.5);

      // ── 3. RIGHT HEADER BADGE ──
      const badgeW = 62;
      const badgeH = 15;
      const badgeX = pageWidth - 14 - badgeW;
      const badgeY = 6.5;

      doc.setFillColor(15, 23, 42); // Slate 900 Navy
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(docTitle.toUpperCase(), badgeX + (badgeW / 2), badgeY + 6, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(147, 197, 253); // Light Blue 300
      const displayDomain = domain ? (domainLabels[domain] || domain) : 'All Domains';
      doc.text(displayDomain.toUpperCase(), badgeX + (badgeW / 2), badgeY + 11.5, { align: 'center' });

      // ── 4. THIN DIVIDER LINE ──
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.3);
      doc.line(14, 25, pageWidth - 14, 25);

      // ── 5. SUMMARY STATS RIBBON ──
      const metaY = 27;
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, metaY, pageWidth - 28, 8.5, 1.5, 1.5, 'FD');

      const colW = (pageWidth - 28) / 4;
      const attendedCount = applications.filter((a: any) => !!a.interviewAttended).length;
      const selectedCount = applications.filter((a: any) => !!(a.isManualSelected || a.isRecommended)).length;
      const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      doc.setFontSize(7.5);
      
      // Stat 1: Total
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Total Candidates:', 18, metaY + 5.5);
      doc.setTextColor(37, 99, 235); // Blue 600
      doc.text(`${applications.length}`, 18 + 25, metaY + 5.5);

      // Stat 2: Attended
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Attended:', 14 + colW + 4, metaY + 5.5);
      doc.setTextColor(16, 185, 129); // Emerald 600
      doc.text(`${attendedCount}`, 14 + colW + 18, metaY + 5.5);

      // Stat 3: Selected
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Shortlisted:', 14 + (colW * 2) + 4, metaY + 5.5);
      doc.setTextColor(217, 119, 6); // Amber 600
      doc.text(`${selectedCount}`, 14 + (colW * 2) + 20, metaY + 5.5);

      // Stat 4: Date
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Date:', 14 + (colW * 3) + 4, metaY + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`${currentDate}`, 14 + (colW * 3) + 13, metaY + 5.5);

      // ── 6. AUTOTABLE PREPARATION ──
      const tableHead = attendedOnly
        ? [['#', 'Roll Number', 'Full Name', 'Year / Branch', 'Preferred Domain', 'Attendance', 'Score & Sign']]
        : [['#', 'Roll Number', 'Full Name', 'Year', 'Branch', 'Technical Domain', 'Non-Tech Track', 'Status']];

      const tableBody = applications.map((app: any, index: number) => {
        if (attendedOnly) {
          const domainText = domainLabels[app.technicalDomain] || app.technicalDomain || '-';
          const attendanceText = app.interviewAttended ? '✓ Present' : 'Pending';
          const humanScore = app.manualRatings?.overall 
            ? `${app.manualRatings.overall.toFixed(1)} / 5` 
            : (app.interviewAttended && app.ratings?.overall ? `${app.ratings.overall.toFixed(1)} / 5` : '-');

          return [
            index + 1,
            app.rollNo || '-',
            app.name || '-',
            `${app.yearOfStudy || '-'} • ${app.branch || '-'}`,
            domainText,
            attendanceText,
            humanScore
          ];
        } else {
          const techDomainText = domainLabels[app.technicalDomain] || app.technicalDomain || '-';
          const nonTechDomainText = app.nonTechnicalDomain ? (domainLabels[app.nonTechnicalDomain] || app.nonTechnicalDomain) : '-';

          return [
            index + 1,
            app.rollNo || '-',
            app.name || '-',
            app.yearOfStudy || '-',
            app.branch || '-',
            techDomainText,
            nonTechDomainText,
            app.status || 'Received'
          ];
        }
      });

      autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 38,
        theme: 'grid',
        headStyles: {
          fillColor: [15, 23, 42], // Slate 900
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'left',
          cellPadding: { top: 3, right: 2.5, bottom: 3, left: 2.5 },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Slate 50
        },
        bodyStyles: {
          font: 'helvetica',
          fontSize: 7,
          textColor: [30, 41, 59], // Slate 800
          cellPadding: { top: 2.5, right: 2.5, bottom: 2.5, left: 2.5 },
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
          valign: 'middle',
        },
        columnStyles: attendedOnly ? {
          0: { cellWidth: 9, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 24, fontStyle: 'bold' },
          2: { cellWidth: 42 },
          3: { cellWidth: 26 },
          4: { cellWidth: 38 },
          5: { cellWidth: 22, halign: 'center' },
          6: { cellWidth: 21, halign: 'center' },
        } : {
          0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 23, fontStyle: 'bold' },
          2: { cellWidth: 38 },
          3: { cellWidth: 14, halign: 'center' },
          4: { cellWidth: 16, halign: 'center' },
          5: { cellWidth: 34 },
          6: { cellWidth: 26 },
          7: { cellWidth: 23, halign: 'center' },
        },
        didDrawPage: (data) => {
          // Footer on every page
          const footerY = pageHeight - 8;
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.2);
          doc.line(14, footerY - 2.5, pageWidth - 14, footerY - 2.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(148, 163, 184); // Slate 400
          doc.text('MLSC SVEC Hiring Portal • Chapter 4.0 • Confidential & Internal Use Only', 14, footerY + 1);

          const pageStr = `Page ${data.pageNumber}`;
          doc.text(pageStr, pageWidth - 14, footerY + 1, { align: 'right' });
        },
        margin: { top: 38, right: 14, bottom: 14, left: 14 },
      });
      
      const pdfFileName = domain
        ? `${fileType}_${domain}_${new Date().toISOString().split("T")[0]}.pdf`
        : `${fileType}_all_${new Date().toISOString().split("T")[0]}.pdf`;

      doc.save(pdfFileName);

      toast({
        title: "PDF Generated Successfully",
        description: `Your ${fileType.toLowerCase().replace('_', ' ')} list has been saved with official MLSC SVEC styling.`,
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

  const handleSyncReviewed = async () => {
    setIsSyncingReviewed(true);
    try {
      const res = await syncReviewedApplicationsAction();
      if ('error' in res && res.error) {
        toast({
          variant: 'destructive',
          title: 'Sync Failed',
          description: String(res.error),
        });
      } else if ('updatedCount' in res) {
        const emailMsg = res.emailCount ? ` Dispatched ${res.emailCount} notification emails.` : '';
        toast({
          title: '✓ Reviewed Applications Synced',
          description: `Synchronized ${res.updatedCount || 0} applications.${emailMsg}`,
        });
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: err.message || 'An error occurred during sync.',
      });
    } finally {
      setIsSyncingReviewed(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSearchBy('all');
    setSearchMode('semi');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };
  
  const activeFiltersCount = [
    currentFilters.status,
    currentFilters.year,
    currentFilters.branch,
    currentFilters.domain,
    currentFilters.selectionFilter,
    currentFilters.sortByPerformance === 'true' ? 'perf' : null,
    currentFilters.sortByRecommended === 'true' ? 'rec' : null,
    currentFilters.attendedOnly === 'true' ? 'att' : null,
    search ? 'search' : null,
  ].filter(Boolean).length;

  const isSuperAdmin = userRole === 'super_admin';
  const bulkUpdateStatuses = ['Interviewed', 'Interviewing', 'Hired', 'Rejected', 'Under Processing', 'Recommended'];
  const showPdfButtonsForAdmin = userRole === 'admin' || userRole === 'super_admin';
  const showPdfButtonsForPanel = userRole === 'panel' || userRole === 'common_panel' || userRole === 'view_only';

  const safeCounts: FilterCounts = filterCounts || {
    total: totalApplications || 0,
    attended: 0,
    manualSelected: 0,
    aiRecommended: 0,
    statuses: {},
    years: {},
    branches: {},
    domains: {},
  };

  return (
    <div className="space-y-4">
      {/* ── TOP METRICS & STATS COUNTER STRIP ── */}
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-2.5", isSuperAdmin ? "lg:grid-cols-6" : "lg:grid-cols-5")}>
        {/* Total Applications */}
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setSearchBy('all');
            setSearchMode('semi');
            startTransition(() => {
              router.push(pathname, { scroll: false });
            });
          }}
          className={cn(
            "flex flex-col p-3 rounded-2xl border transition-all text-left group cursor-pointer backdrop-blur-md",
            !currentFilters.status && !currentFilters.selectionFilter && currentFilters.attendedOnly !== 'true' && !currentFilters.domain && !currentFilters.year && !currentFilters.branch && !search
              ? "bg-[#4285F4]/15 border-[#4285F4]/40 shadow-lg shadow-[#4285F4]/10 ring-1 ring-[#4285F4]/30"
              : "bg-black/30 border-white/10 hover:bg-white/[0.06] hover:border-white/20"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/50 group-hover:text-white/80">Total</span>
            <Users className="size-3.5 text-[#4285F4]" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {safeCounts.total}
          </div>
        </button>

        {/* Attended */}
        <button
          type="button"
          onClick={() => handleFilterChange('attendedOnly', currentFilters.attendedOnly !== 'true')}
          className={cn(
            "flex flex-col p-3 rounded-2xl border transition-all text-left group cursor-pointer backdrop-blur-md",
            currentFilters.attendedOnly === 'true'
              ? "bg-emerald-500/20 border-emerald-400/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/40"
              : "bg-black/30 border-white/10 hover:bg-white/[0.06] hover:border-emerald-500/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/80 group-hover:text-emerald-300">Attended</span>
            <CheckCircle2 className="size-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1">
            {safeCounts.attended}
          </div>
        </button>

        {/* AI Recommended - Only visible to Super Admin */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => handleSelectionFilter('ai')}
            className={cn(
              "flex flex-col p-3 rounded-2xl border transition-all text-left group cursor-pointer backdrop-blur-md",
              currentFilters.selectionFilter === 'ai'
                ? "bg-purple-600/25 border-purple-400/50 shadow-lg shadow-purple-600/15 ring-1 ring-purple-400/30"
                : "bg-black/30 border-white/10 hover:bg-white/[0.06] hover:border-purple-500/30"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400/80 group-hover:text-purple-300">AI Rec</span>
              <Bot className="size-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300 mt-1">
              {safeCounts.aiRecommended}
            </div>
          </button>
        )}

        {/* Manual Selected */}
        <button
          type="button"
          onClick={() => handleSelectionFilter('manual')}
          className={cn(
            "flex flex-col p-3 rounded-2xl border transition-all text-left group cursor-pointer backdrop-blur-md",
            currentFilters.selectionFilter === 'manual'
              ? "bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-yellow-400/60 shadow-lg shadow-yellow-500/15 ring-1 ring-yellow-400/40"
              : "bg-black/30 border-white/10 hover:bg-white/[0.06] hover:border-yellow-500/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400/80 group-hover:text-yellow-300">★ Selected</span>
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-yellow-300 mt-1">
            {safeCounts.manualSelected}
          </div>
        </button>

        {/* Received */}
        <button
          type="button"
          onClick={() => handleFilterChange('status', currentFilters.status === 'Received' ? 'all' : 'Received')}
          className={cn(
            "flex flex-col p-3 rounded-2xl border transition-all text-left group cursor-pointer backdrop-blur-md",
            currentFilters.status === 'Received'
              ? "bg-cyan-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/30"
              : "bg-black/30 border-white/10 hover:bg-white/[0.06] hover:border-cyan-500/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400/80 group-hover:text-cyan-300">Received</span>
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-1">
            {safeCounts.statuses['Received'] || 0}
          </div>
        </button>

        {/* Hired */}
        <button
          type="button"
          onClick={() => handleFilterChange('status', currentFilters.status === 'Hired' ? 'all' : 'Hired')}
          className={cn(
            "flex flex-col p-3 rounded-2xl border transition-all text-left group cursor-pointer backdrop-blur-md",
            currentFilters.status === 'Hired'
              ? "bg-emerald-600/25 border-emerald-400/50 shadow-lg shadow-emerald-600/10 ring-1 ring-emerald-400/30"
              : "bg-black/30 border-white/10 hover:bg-white/[0.06] hover:border-emerald-500/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/80 group-hover:text-emerald-300">Hired</span>
            <span className="text-xs">🏆</span>
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1">
            {safeCounts.statuses['Hired'] || 0}
          </div>
        </button>
      </div>

      {/* ── TOP SEARCH & CONTROLS TOOLBAR ── */}
      <div className="bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-2xl space-y-4">
        
        {/* Row 1: Modern Search Input + Mode Pill + Scope + Search Button */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Left: Search Bar with Mode Toggle */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex flex-col sm:flex-row gap-2 items-stretch">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40 group-focus-within:text-[#4285F4] transition-colors" />
              <Input
                placeholder={
                  searchMode === 'semi'
                    ? "⚡ Quick Search (e.g., '22B9', 'Vinay', 'CSE')..."
                    : "🔍 Full Profile Search (Name, email, phone, skills, essays, remarks)..."
                }
                value={search}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearch(val);
                }}
                className="pl-10 pr-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-xl focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]/30 text-xs transition-all"
                disabled={isPending || isBulkUpdating}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    executeSearch('', searchMode, searchBy);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Scope Selector */}
            <Select 
              value={searchBy} 
              onValueChange={(val) => {
                setSearchBy(val);
                executeSearch(search, searchMode, val);
              }}
              disabled={isPending || isBulkUpdating}
            >
              <SelectTrigger className="h-10 w-full sm:w-[150px] shrink-0 bg-white/5 border-white/10 text-xs font-semibold rounded-xl text-white">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white text-xs">
                <SelectItem value="all">🌐 All Fields</SelectItem>
                <SelectItem value="rollNo">🆔 Roll Number</SelectItem>
                <SelectItem value="name">👤 Full Name</SelectItem>
                <SelectItem value="email">✉️ Email Address</SelectItem>
                <SelectItem value="phone">📞 Phone Number</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Button */}
            <Button 
              type="submit" 
              className="h-10 px-5 rounded-xl text-xs font-bold bg-[#4285F4] hover:bg-[#3367D6] text-white transition-all shadow-lg shadow-[#4285F4]/20 flex items-center gap-1.5"
              disabled={isPending || isBulkUpdating}
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
              Search
            </Button>
          </form>

          {/* Right: Search Mode Pill Toggle */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => handleSearchModeToggle('semi')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                searchMode === 'semi'
                  ? "bg-[#4285F4] text-white shadow-md"
                  : "text-white/50 hover:text-white"
              )}
            >
              <Zap className="size-3" />
              <span>Quick Match</span>
            </button>
            <button
              type="button"
              onClick={() => handleSearchModeToggle('full')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                searchMode === 'full'
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-white/50 hover:text-white"
              )}
            >
              <Layers className="size-3" />
              <span>Full Search</span>
            </button>
          </div>

        </div>

        {/* Row 2: Clean Dropdown Filters WITH COUNTS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-white/5">
          {/* Status Dropdown */}
          <Select 
            onValueChange={(value) => handleFilterChange('status', value)} 
            value={currentFilters.status || 'all'} 
            disabled={isPending || isBulkUpdating}
          >
            <SelectTrigger className="h-9 bg-white/5 border-white/10 text-xs rounded-xl text-white font-medium">
              <SelectValue placeholder={`Status (${safeCounts.total})`} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white text-xs">
              <SelectItem value="all">
                All Statuses ({safeCounts.total})
              </SelectItem>
              {filterData.statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s} ({safeCounts.statuses[s] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Domain Dropdown */}
          {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'common_panel' || userRole === 'view_only') ? (
            <Select 
              onValueChange={(value) => handleFilterChange('domain', value)} 
              value={currentFilters.domain || 'all'} 
              disabled={isPending || isBulkUpdating}
            >
              <SelectTrigger className="h-9 bg-white/5 border-white/10 text-xs rounded-xl text-white font-medium">
                <SelectValue placeholder={`Domain (${safeCounts.total})`} />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white text-xs">
                <SelectItem value="all">
                  All Domains ({safeCounts.total})
                </SelectItem>
                {filterData.domains.map((d) => (
                  <SelectItem key={d} value={d}>
                    {domainLabels[d] || d} ({safeCounts.domains[d] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-9 px-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-medium text-white/70">
              <span>Track: {domainLabels[panelDomain || ''] || panelDomain || 'Assigned'}</span>
              <span className="font-mono text-white/40">({safeCounts.total})</span>
            </div>
          )}

          {/* Year Dropdown */}
          <Select 
            onValueChange={(value) => handleFilterChange('year', value)} 
            value={currentFilters.year || 'all'} 
            disabled={isPending || isBulkUpdating}
          >
            <SelectTrigger className="h-9 bg-white/5 border-white/10 text-xs rounded-xl text-white font-medium">
              <SelectValue placeholder={`Year (${safeCounts.total})`} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white text-xs">
              <SelectItem value="all">
                All Years ({safeCounts.total})
              </SelectItem>
              {filterData.years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y} Year ({safeCounts.years[y] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Branch Dropdown */}
          <Select 
            onValueChange={(value) => handleFilterChange('branch', value)} 
            value={currentFilters.branch || 'all'} 
            disabled={isPending || isBulkUpdating}
          >
            <SelectTrigger className="h-9 bg-white/5 border-white/10 text-xs rounded-xl text-white font-medium">
              <SelectValue placeholder={`Branch (${safeCounts.total})`} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white text-xs">
              <SelectItem value="all">
                All Branches ({safeCounts.total})
              </SelectItem>
              {filterData.branches.map((b) => (
                <SelectItem key={b} value={b}>
                  {b} ({safeCounts.branches[b] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 3: Preset Filter Chips WITH COUNTS & Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          
          {/* Quick Segment Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectionFilter('')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5",
                !currentFilters.selectionFilter && currentFilters.attendedOnly !== 'true'
                  ? "bg-white/15 border-white/30 text-white shadow-sm"
                  : "bg-white/5 border-white/5 text-white/50 hover:text-white"
              )}
            >
              <span>All Candidates</span>
              <span className="text-[10px] font-mono opacity-60">({safeCounts.total})</span>
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange('attendedOnly', currentFilters.attendedOnly !== 'true')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 shadow-sm active:scale-95",
                currentFilters.attendedOnly === 'true'
                  ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] ring-1 ring-emerald-400/40"
                  : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/15 hover:border-emerald-500/40"
              )}
            >
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>Attended Only</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold ml-0.5">
                {safeCounts.attended}
              </span>
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => handleSelectionFilter('ai')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 active:scale-95",
                  currentFilters.selectionFilter === 'ai'
                    ? "bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "bg-purple-500/5 border-purple-500/20 text-purple-300/80 hover:text-purple-200 hover:bg-purple-500/15"
                )}
              >
                <Bot className="size-3 text-purple-400" />
                <span>🤖 AI Selected</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold ml-0.5">
                  {safeCounts.aiRecommended}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSelectionFilter('manual')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 shadow-sm active:scale-95",
                currentFilters.selectionFilter === 'manual'
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.4)]"
                  : "bg-yellow-500/10 border-2 border-yellow-500/40 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-400"
              )}
            >
              <Star className={cn("size-3.5", currentFilters.selectionFilter === 'manual' ? "fill-black text-black" : "fill-yellow-400 text-yellow-400")} />
              <span>★ Manual Selected</span>
              <span className={cn(
                "text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-0.5",
                currentFilters.selectionFilter === 'manual'
                  ? "bg-black/20 text-black"
                  : "bg-yellow-500/20 border border-yellow-500/40 text-yellow-300"
              )}>
                {safeCounts.manualSelected}
              </span>
            </button>
          </div>

          {/* Action Buttons: Sort, Bulk Update, CSV, PDF, Reset */}
          <div className="flex flex-wrap items-center gap-2">
            {(userRole === 'admin' || userRole === 'super_admin') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSortToggle('sortByPerformance')}
                  disabled={isPending || isBulkUpdating}
                  className={cn(
                    "h-8 rounded-xl text-xs font-bold border transition-all",
                    currentFilters.sortByPerformance === 'true'
                      ? "bg-[#4285F4]/20 border-[#4285F4]/40 text-[#4285F4]"
                      : "bg-white/5 border-white/10 text-white/70 hover:text-white"
                  )}
                >
                  {isPending && searchParams.get('sortByPerformance') === 'true' ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <TrendingUp className="mr-1.5 size-3.5" />
                  )}
                  Performance Sort
                </Button>

                {/* Bulk Status Update */}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-0.5">
                  <Select onValueChange={setBulkUpdateTargetStatus} value={bulkUpdateTargetStatus} disabled={isPending || isBulkUpdating}>
                    <SelectTrigger className="h-7 w-[130px] border-none bg-transparent text-[11px] text-white">
                      <SelectValue placeholder="Bulk Action" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white text-xs">
                      {bulkUpdateStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={handleBulkUpdate} 
                    disabled={isPending || isBulkUpdating || !bulkUpdateTargetStatus}
                    className="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-[#34A853] hover:bg-[#2d9249] text-white"
                  >
                    {isBulkUpdating ? <Loader2 className="size-3 animate-spin" /> : <ClipboardCheck className="size-3" />}
                    Apply
                  </Button>
                </div>

                {/* Export Hired CSV */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExport} 
                  disabled={isExporting}
                  className="h-8 rounded-xl text-xs font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                >
                  {isExporting ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <FileDown className="mr-1.5 size-3.5" />}
                  Export Hired
                </Button>

                {/* Sync Reviewed Applications */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSyncReviewed} 
                  disabled={isSyncingReviewed || isPending}
                  title="Synchronize all reviewed candidates to Attended and Interviewed status"
                  className="h-8 rounded-xl text-xs font-bold border-white/10 bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all"
                >
                  {isSyncingReviewed ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <RotateCcw className="mr-1.5 size-3.5" />}
                  Sync Interviewed
                </Button>
              </>
            )}

            {/* Attendance & Registered PDFs */}
            {(showPdfButtonsForAdmin || showPdfButtonsForPanel) && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownloadPdf(true)} 
                  disabled={isDownloadingPdf}
                  className="h-8 rounded-xl text-xs font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                >
                  {isDownloadingPdf ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <FileText className="mr-1.5 size-3.5" />}
                  Attendance PDF
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownloadPdf(false)} 
                  disabled={isDownloadingRegisteredPdf}
                  className="h-8 rounded-xl text-xs font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                >
                  {isDownloadingRegisteredPdf ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Users className="mr-1.5 size-3.5" />}
                  Registered PDF
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadRegisteredExcel} 
                  disabled={isExportingExcel}
                  className="h-8 rounded-xl text-xs font-bold border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 transition-all shadow-sm flex items-center gap-1"
                >
                  {isExportingExcel ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <FileSpreadsheet className="mr-1.5 size-3.5 text-emerald-400" />}
                  Registered Excel
                </Button>
              </>
            )}

            {/* Reset Filters button */}
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters} 
                disabled={isPending || isBulkUpdating}
                className="h-8 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="size-3" />
                Reset ({activeFiltersCount})
              </Button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
