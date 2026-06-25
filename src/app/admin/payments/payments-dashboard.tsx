"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronLeft,
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  Activity, 
  ArrowUpRight, 
  Percent, 
  BarChart3,
  Award,
  Zap,
  Search,
  Filter,
  Receipt,
  User,
  Mail,
  Phone,
  Info,
  Globe,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { resendDonationInvoiceAction } from '@/app/actions/cashfree-actions';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface PaymentsDashboardProps {
  initialDonations: any[];
  view?: 'overview' | 'ledger' | 'custom-links';
}

export function PaymentsDashboard({ initialDonations, view = 'overview' }: PaymentsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const dateParam = searchParams ? searchParams.get('date') : null;

  const [donations, setDonations] = useState<any[]>(initialDonations);

  // Custom Payment Links states
  const [customPayments, setCustomPayments] = useState<any[]>([]);
  const [newPurpose, setNewPurpose] = useState<string>('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isCreatingCustom, setIsCreatingCustom] = useState<boolean>(false);

  // Fetch custom payment links
  React.useEffect(() => {
    const fetchCustomPayments = async () => {
      try {
        const q = query(collection(db, 'customPayments'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setCustomPayments(list);
      } catch (err) {
        console.error('Error fetching custom payments:', err);
      }
    };
    fetchCustomPayments();
  }, []);

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurpose || !newAmount) return;

    setIsCreatingCustom(true);
    try {
      const payload = {
        purpose: newPurpose,
        amount: Number(newAmount),
        description: newDescription || `Contribution for ${newPurpose}`,
        active: true,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'customPayments'), payload);
      setCustomPayments(prev => [{ id: docRef.id, ...payload }, ...prev]);
      
      setNewPurpose('');
      setNewAmount('');
      setNewDescription('');
      
      toast({
        title: 'Custom Button Created',
        description: `Custom button for ₹${newAmount} created and published successfully!`,
      });
    } catch (err: any) {
      console.error('Error creating custom payment:', err);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: err.message || 'Failed to publish custom payment button.',
      });
    } finally {
      setIsCreatingCustom(false);
    }
  };

  const handleDeleteCustom = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customPayments', id));
      setCustomPayments(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Button Removed',
        description: 'Custom payment button deleted and unpublished successfully.',
      });
    } catch (err: any) {
      console.error('Error deleting custom payment:', err);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: err.message || 'Failed to delete custom payment button.',
      });
    }
  };

  // Search, Filter, and Pagination state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [daysRange, setDaysRange] = useState<number>(7);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(dateParam);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sync date parameter from URL to selectedDateFilter state
  React.useEffect(() => {
    if (dateParam) {
      setSelectedDateFilter(dateParam);
    }
  }, [dateParam]);

  // Helper handlers to reset pagination when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (date: string | null) => {
    setSelectedDateFilter(date);
    setCurrentPage(1);
    
    // Clean up query param from URL when cleared
    if (!date && dateParam) {
      router.replace('/admin/payments/ledger');
    }
  };

  const handleDaysRangeChange = (range: number) => {
    setDaysRange(range);
    setSelectedDateFilter(null); // Reset date filter since range changed
    setCurrentPage(1);
  };

  const handleDailyReportRowClick = (date: string) => {
    if (view === 'overview') {
      router.push(`/admin/payments/ledger?date=${date}`);
    } else {
      handleDateFilterChange(selectedDateFilter === date ? null : date);
    }
  };

  // 1. Calculate General Stats
  const stats = useMemo(() => {
    const paidDonations = donations.filter(d => d.status === 'PAID');
    const totalRevenue = paidDonations.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    const totalClearedCount = paidDonations.length;
    const totalPendingCount = donations.filter(d => d.status === 'PENDING').length;
    const totalFailedCount = donations.filter(d => d.status === 'FAILED').length;
    const totalAttempts = donations.length;
    
    // Success Percentage of Payments
    const successPercentage = totalAttempts > 0 ? (totalClearedCount / totalAttempts) * 100 : 0;
    
    // Average Donation Value
    const averageDonation = totalClearedCount > 0 ? totalRevenue / totalClearedCount : 0;

    return {
      totalRevenue,
      totalClearedCount,
      totalPendingCount,
      totalFailedCount,
      totalAttempts,
      successPercentage,
      averageDonation
    };
  }, [donations]);

  // 2. Compute Daily Reports & Growth Rates
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    const attempts: Record<string, number> = {};

    donations.forEach(don => {
      const dateStr = don.createdAt ? don.createdAt.split('T')[0] : '';
      if (dateStr) {
        attempts[dateStr] = (attempts[dateStr] || 0) + 1;
        if (don.status === 'PAID') {
          totals[dateStr] = (totals[dateStr] || 0) + (Number(don.amount) || 0);
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        }
      }
    });

    return { totals, counts, attempts };
  }, [donations]);

  // Daily Reports based on daysRange
  const dailyReports = useMemo(() => {
    return Array.from({ length: daysRange }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const amount = dailyTotals.totals[dateStr] || 0;
      const count = dailyTotals.counts[dateStr] || 0;
      const totalAttempts = dailyTotals.attempts[dateStr] || 0;
      
      const successRate = totalAttempts > 0 ? (count / totalAttempts) * 100 : 0;

      return {
        date: dateStr,
        displayDate: format(date, 'dd MMM yyyy'),
        amount,
        count,
        totalAttempts,
        successRate
      };
    });
  }, [dailyTotals, daysRange]);

  // Daily Payments Growth Rate (Today vs Yesterday)
  const growthRate = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const todayAmount = dailyTotals.totals[todayStr] || 0;
    const yesterdayAmount = dailyTotals.totals[yesterdayStr] || 0;

    let dailyIncreaseRate = 0;
    let isIncrease = true;
    let rateDisplay = '0%';

    if (yesterdayAmount > 0) {
      dailyIncreaseRate = ((todayAmount - yesterdayAmount) / yesterdayAmount) * 100;
      isIncrease = dailyIncreaseRate >= 0;
      rateDisplay = `${isIncrease ? '+' : ''}${dailyIncreaseRate.toFixed(1)}%`;
    } else if (todayAmount > 0) {
      dailyIncreaseRate = 100;
      isIncrease = true;
      rateDisplay = `+₹${todayAmount} Growth`;
    } else {
      rateDisplay = 'Stable (₹0)';
    }

    return {
      rateDisplay,
      isIncrease,
      dailyIncreaseRate,
      todayAmount,
      yesterdayAmount
    };
  }, [dailyTotals]);

  // 3. Analyze Tier Distribution
  const tierCounts = useMemo(() => {
    const counts = {
      bronze: 0,   // ₹250
      silver: 0,   // ₹500
      gold: 0,     // ₹1000
      platinum: 0, // ₹2500
      custom: 0    // Other amounts
    };

    donations.forEach(don => {
      if (don.status === 'PAID') {
        const amt = Number(don.amount) || 0;
        if (amt === 250) counts.bronze++;
        else if (amt === 500) counts.silver++;
        else if (amt === 1000) counts.gold++;
        else if (amt === 2500) counts.platinum++;
        else counts.custom++;
      }
    });

    return counts;
  }, [donations]);

  // 4. Search, Filter, and Sort Ledger list
  const filteredDonations = useMemo(() => {
    return donations
      .filter(don => {
        // Search filter
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch = 
          !query ||
          don.id.toLowerCase().includes(query) ||
          (don.customerName || "").toLowerCase().includes(query) ||
          (don.customerEmail || "").toLowerCase().includes(query) ||
          (don.customerPhone || "").toLowerCase().includes(query);
          
        // Status filter
        const matchesStatus = 
          statusFilter === "ALL" || 
          don.status === statusFilter;

        // Date filter
        const matchesDate = 
          !selectedDateFilter || 
          (don.createdAt && don.createdAt.startsWith(selectedDateFilter));

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [donations, searchTerm, statusFilter, selectedDateFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredDonations.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDonations = useMemo(() => {
    return filteredDonations.slice(startIndex, startIndex + pageSize);
  }, [filteredDonations, startIndex, pageSize]);

  const handleOpenDetails = (donation: any) => {
    router.push(`/admin/payments/receipt/${donation.id}`);
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic flex items-center gap-3">
            <Coins className="h-8 w-8 text-[#34A853]" /> Payments <span className="text-[#34A853]">{view === 'overview' ? '& Overview' : '& Ledger'}</span>
          </h1>
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            {view === 'overview' 
              ? 'Cashfree PG Transactions Overview, Growth Rates, and Daily Revenue Reports'
              : 'Complete Searchable, Filterable, and Paginated Transaction Ledger Database'}
          </p>
        </div>
      </div>

      {/* ── Horizontal Navigation Tabs ── */}
      <div className="flex items-center gap-1 border-b border-slate-200/60 dark:border-zinc-800/60 pb-px">
        <Link 
          href="/admin/payments" 
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all relative ${
            view === 'overview' 
              ? 'text-[#34A853] dark:text-white border-b-2 border-[#34A853]' 
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 border-b-2 border-transparent'
          }`}
        >
          Overview & Reports
        </Link>
        <Link 
          href="/admin/payments/ledger" 
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all relative ${
            view === 'ledger' 
              ? 'text-[#34A853] dark:text-white border-b-2 border-[#34A853]' 
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 border-b-2 border-transparent'
          }`}
        >
          Donation Ledger
        </Link>
        <Link 
          href="/admin/payments/custom" 
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all relative ${
            view === 'custom-links' 
              ? 'text-[#34A853] dark:text-white border-b-2 border-[#34A853]' 
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 border-b-2 border-transparent'
          }`}
        >
          Custom Payment Buttons
        </Link>
      </div>

      {view === 'overview' && (
        <>
          {/* ── Financial Stats Grid (Overview) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Coins className="h-16 w-16 text-[#34A853]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Total Revenue</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 tracking-tight">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-[#34A853] mt-2 font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> {stats.totalClearedCount} Cleared Payments
              </p>
            </div>

            {/* Success Percentage of Payments */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Percent className="h-16 w-16 text-[#4285F4]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Gateway Success Rate</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 tracking-tight flex items-center gap-2">
                {stats.successPercentage.toFixed(1)}%
                <span className="text-[10px] bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/15 px-2 py-0.5 rounded uppercase font-black tracking-wider shrink-0">Rate</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 font-medium flex items-center gap-1">
                Growth rate: <span className={growthRate.isIncrease && growthRate.dailyIncreaseRate > 0 ? 'text-[#34A853] font-bold' : 'text-slate-500'}>{growthRate.rateDisplay}</span>
              </p>
            </div>

            {/* Average Donation Value */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="h-16 w-16 text-[#FBBC05]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Average ticket size</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 tracking-tight">
                ₹{Math.round(stats.averageDonation).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 font-medium">
                Average funding amount per cleared receipt
              </p>
            </div>

            {/* Transaction Pipeline Status */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="h-16 w-16 text-[#EA4335]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Pipeline Status</p>
              <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-3 tracking-tight flex items-center gap-3">
                <span className="text-yellow-500">{stats.totalPendingCount} Pending</span>
                <span className="text-white/20">/</span>
                <span className="text-red-500">{stats.totalFailedCount} Failed</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2.5 font-medium">
                Incomplete or abandoned checkouts
              </p>
            </div>
          </div>
        </>
      )}

      {view === 'ledger' && (
        <div className="w-full">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Donations Ledger</h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 font-medium">
                  Click on any row to open the full payment receipt drawer, or click the external icon to view the separate receipt page.
                </p>
              </div>
            </div>

            {/* Active Date Filter Banner */}
            {selectedDateFilter && (
              <div className="mb-6 p-4 rounded-2xl bg-[#34A853]/5 border border-[#34A853]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-zinc-250 font-semibold">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34A853]"></span>
                  </span>
                  <span>
                    Filtering ledger for date:{' '}
                    <span className="font-black text-slate-950 dark:text-white underline decoration-[#34A853] decoration-2 underline-offset-4 font-mono">
                      {format(new Date(selectedDateFilter + "T00:00:00"), 'dd MMM yyyy')}
                    </span>
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateFilterChange(null)}
                  className="h-8 px-3 rounded-xl border-[#34A853]/25 hover:bg-[#34A853]/10 hover:text-[#34A853] text-[#34A853] text-[9px] font-black uppercase tracking-wider transition-all shrink-0 bg-transparent"
                >
                  Clear Date Filter
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by sponsor name, email, phone or receipt ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-955/20 text-xs font-semibold focus:outline-none focus:border-[#34A853] dark:focus:border-[#34A853] text-slate-800 dark:text-white transition-all placeholder-slate-400 dark:placeholder-zinc-650"
                />
              </div>
              
              <div className="relative min-w-[140px]">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-955/20 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-[#34A853] cursor-pointer appearance-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">Cleared (PAID)</option>
                  <option value="PENDING">Pending (PENDING)</option>
                  <option value="FAILED">Failed (FAILED)</option>
                </select>
              </div>
            </div>

            {filteredDonations.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800/80">
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Receipt ID</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Sponsor Details</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center">Status</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center">Gateway</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {paginatedDonations.map((don) => {
                        const initials = don.customerName ? don.customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'SP';
                        return (
                          <tr key={don.id} onClick={() => handleOpenDetails(don)} className="hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-all duration-200 cursor-pointer group">
                            <td className="py-4 px-4">
                              <p className="text-[11px] font-mono font-bold text-slate-850 dark:text-zinc-300 group-hover:text-[#34A853] transition-colors">{don.id.substring(0, 18)}...</p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-[10px] text-slate-700 dark:text-zinc-300 shrink-0">{initials}</div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{don.customerName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center"><Badge className={`rounded-xl border font-black uppercase tracking-wider text-[9px] px-2.5 py-0.5 ${don.status === 'PAID' ? 'bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853]' : 'bg-red-500/10'}`}>{don.status}</Badge></td>
                            <td className="py-4 px-4 text-center text-[10px] font-bold">Cashfree PG</td>
                            <td className="py-4 px-4 text-right font-bold text-xs text-slate-950 dark:text-white">₹{(Number(don.amount) || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-550 dark:text-zinc-400 font-semibold">
                    Showing <span className="font-bold text-slate-800 dark:text-white">{Math.min(startIndex + 1, filteredDonations.length)}</span> to <span className="font-bold text-slate-800 dark:text-white">{Math.min(startIndex + pageSize, filteredDonations.length)}</span> of <span className="font-bold text-slate-800 dark:text-white">{filteredDonations.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-8 px-2 rounded-xl text-[10px] font-bold"><ChevronsLeft className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="h-8 px-3 rounded-xl text-[10px] font-bold"><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev</Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        return <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)} className={`h-8 w-8 rounded-xl text-xs font-bold ${currentPage === pageNum ? 'bg-[#34A853]' : ''}`}>{pageNum}</Button>
                      })}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="h-8 px-3 rounded-xl text-[10px] font-bold">Next <ChevronRight className="h-3.5 w-3.5 ml-1" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="h-8 px-2 rounded-xl text-[10px] font-bold"><ChevronsRight className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-slate-400 dark:text-zinc-500 text-xs py-12 font-semibold uppercase tracking-wider">No matching transactions found.</p>
            )}
          </div>
        </div>
      )}

      {view === 'custom-links' && (
        <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-8">
          <h2 className="text-xl font-black mb-6 tracking-tight text-slate-900 dark:text-white uppercase">Manage Custom Payment Buttons</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
            Create pre-configured payment buttons (e.g., for domain registration, specific club sponsorships, or merchandise) that will automatically appear as selectable cards on the public donation page.
          </p>

          <form onSubmit={handleCreateCustom} className="space-y-4 mb-8 p-6 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Create New Payment Button</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Purpose / Label *</label>
                <input 
                  placeholder="e.g. Domain Registration" 
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  value={newPurpose} 
                  onChange={(e) => setNewPurpose(e.target.value)} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Amount (₹) *</label>
                <input 
                  placeholder="e.g. 50" 
                  type="number" 
                  min="1"
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  value={newAmount} 
                  onChange={(e) => setNewAmount(e.target.value)} 
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Short Description (Optional)</label>
                <input 
                  placeholder="e.g. Domain setup and hosting renewal contribution" 
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isCreatingCustom} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl">
                {isCreatingCustom ? 'Creating...' : (
                  <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Create Button</span>
                )}
              </Button>
            </div>
          </form>

          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-4">Active Custom Buttons</h3>
          
          <div className="space-y-3">
            {customPayments.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500 italic py-6 text-center border border-dashed rounded-xl dark:border-zinc-800">
                No custom payment buttons created yet. Use the form above to add one.
              </p>
            ) : (
              customPayments.map((link: any) => (
                <div key={link.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 hover:border-slate-200 dark:hover:border-zinc-800 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-tight">{link.purpose}</span>
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        ₹{link.amount}
                      </span>
                    </div>
                    {link.description && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{link.description}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteCustom(link.id)} 
                    className="hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
