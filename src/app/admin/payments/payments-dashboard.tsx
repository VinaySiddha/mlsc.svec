"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  Trash2,
  Settings,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  CreditCard,
  QrCode,
  RefreshCcw
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
  DialogFooter
} from "@/components/ui/dialog";
import { resendDonationInvoiceAction } from '@/app/actions/cashfree-actions';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  getGatewaySettingsAction, 
  updateGatewaySettingsAction, 
  approveMLSCPaymentAction, 
  rejectMLSCPaymentAction,
  getMLSCPaymentsAction 
} from '@/app/actions/mlsc-pay-actions';

interface PaymentsDashboardProps {
  initialDonations: any[];
  view?: 'overview' | 'ledger' | 'custom-links' | 'settings' | 'approvals';
}

export function PaymentsDashboard({ initialDonations, view = 'overview' }: PaymentsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const dateParam = searchParams ? searchParams.get('date') : null;

  // State
  const [donations, setDonations] = useState<any[]>(initialDonations);
  const [mlscPayments, setMlscPayments] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState<boolean>(true);
  
  // Gateway Settings State
  const [settings, setSettings] = useState<any>({
    cashfree: { enabled: true, message: 'Secure Online Payments' },
    mlscPay: { enabled: true, message: 'Manual UPI / QR Transfer' }
  });
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Rejection Dialog State
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false);
  const [rejecting, setRejecting] = useState<boolean>(false);

  // Action Loading States
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Custom Payment Links states
  const [customPayments, setCustomPayments] = useState<any[]>([]);
  const [newPurpose, setNewPurpose] = useState<string>('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isCreatingCustom, setIsCreatingCustom] = useState<boolean>(false);

  // Fetch MLSC payments, pending approvals, and gateway settings
  const fetchGatewayData = async () => {
    try {
      setApprovalsLoading(true);
      // 1. Fetch unified gateway payments from Firestore
      const paymentsRes = await getMLSCPaymentsAction();
      if (paymentsRes.success && paymentsRes.payments) {
        setMlscPayments(paymentsRes.payments);
        
        // Filter pending approvals
        const pending = paymentsRes.payments.filter((p: any) => p.status === 'PENDING_APPROVAL');
        setPendingApprovals(pending);
      }
    } catch (err) {
      console.error('Error fetching gateway payments:', err);
    } finally {
      setApprovalsLoading(false);
    }
  };

  useEffect(() => {
    fetchGatewayData();
    
    // Fetch Gateway Settings
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const res = await getGatewaySettingsAction();
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

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

  // 1. Save Gateway Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await updateGatewaySettingsAction(settings);
      if (res.success) {
        toast({
          title: 'Settings Saved',
          description: 'Payment gateway configurations have been successfully updated!',
        });
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message || 'Failed to update gateway configurations.',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // 2. Approve Manual Payment
  const handleApprovePayment = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      // Approve manual payment via server action
      const res = await approveMLSCPaymentAction(orderId);
      if (res.success) {
        toast({
          title: 'Payment Approved',
          description: `Transaction ${orderId} approved. Receipt and ticket emails dispatched.`,
        });
        fetchGatewayData(); // refresh list
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Approval Failed',
        description: err.message || 'Failed to approve payment.',
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  // 3. Reject Manual Payment
  const handleRejectPayment = async () => {
    if (!rejectOrderId) return;
    setRejecting(true);
    try {
      const res = await rejectMLSCPaymentAction(rejectOrderId, rejectionReason);
      if (res.success) {
        toast({
          title: 'Payment Rejected',
          description: `Transaction ${rejectOrderId} rejected. Rejection notification email dispatched.`,
        });
        setIsRejectDialogOpen(false);
        setRejectOrderId(null);
        setRejectionReason('');
        fetchGatewayData(); // refresh list
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Rejection Failed',
        description: err.message || 'Failed to reject payment.',
      });
    } finally {
      setRejecting(false);
    }
  };

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
    
    if (!date && dateParam) {
      router.replace('/admin/payments/ledger');
    }
  };

  // 1. Unified Donations + MLSC Payments List
  const unifiedTransactions = useMemo(() => {
    // Map donations
    const formattedDonations = donations.map(d => ({
      ...d,
      gateway: 'Cashfree PG',
      sourceCollection: 'donations'
    }));

    // Map new mlsc payments
    const formattedMlsc = mlscPayments.map(p => ({
      id: p.orderId,
      amount: p.amount,
      customerName: p.customerName || 'Anonymous Sponsor',
      customerEmail: p.customerEmail || '',
      customerPhone: p.customerPhone || '',
      status: p.status,
      createdAt: p.createdAt,
      gateway: p.paymentMethod === 'mlsc_pay' ? 'MLSC Pay' : 'Cashfree PG',
      sourceCollection: 'mlsc_payments',
      utr: p.utr || null
    }));

    // Combine and sort by date descending
    return [...formattedDonations, ...formattedMlsc].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [donations, mlscPayments]);

  // 2. Calculate General Stats from Unified Transactions
  const stats = useMemo(() => {
    const paidTransactions = unifiedTransactions.filter(d => d.status === 'PAID');
    const totalRevenue = paidTransactions.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    const totalClearedCount = paidTransactions.length;
    
    const totalPendingCount = unifiedTransactions.filter(
      d => d.status === 'PENDING' || d.status === 'PENDING_APPROVAL'
    ).length;
    const totalFailedCount = unifiedTransactions.filter(d => d.status === 'FAILED').length;
    const totalAttempts = unifiedTransactions.length;
    
    const successPercentage = totalAttempts > 0 ? (totalClearedCount / totalAttempts) * 100 : 0;
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
  }, [unifiedTransactions]);

  // 3. Compute Daily Reports
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    const attempts: Record<string, number> = {};

    unifiedTransactions.forEach(don => {
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
  }, [unifiedTransactions]);

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

  // 4. Search, Filter, and Sort Ledger list
  const filteredTransactions = useMemo(() => {
    return unifiedTransactions
      .filter(don => {
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch = 
          !query ||
          don.id.toLowerCase().includes(query) ||
          (don.customerName || "").toLowerCase().includes(query) ||
          (don.customerEmail || "").toLowerCase().includes(query) ||
          (don.customerPhone || "").toLowerCase().includes(query) ||
          (don.utr && don.utr.toLowerCase().includes(query));
          
        const matchesStatus = 
          statusFilter === "ALL" || 
          don.status === statusFilter;

        const matchesDate = 
          !selectedDateFilter || 
          (don.createdAt && don.createdAt.startsWith(selectedDateFilter));

        return matchesSearch && matchesStatus && matchesDate;
      });
  }, [unifiedTransactions, searchTerm, statusFilter, selectedDateFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, startIndex, pageSize]);

  const handleOpenDetails = (donation: any) => {
    if (donation.sourceCollection === 'donations') {
      router.push(`/admin/payments/receipt/${donation.id}`);
    } else {
      // For new unified payments, redirect to our new receipt status page
      router.push(`/mlsc-pay/status?order_id=${donation.id}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic flex items-center gap-3">
            <Coins className="h-8 w-8 text-[#34A853]" /> Payments <span className="text-[#34A853]">Portal</span>
          </h1>
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            {view === 'overview' && 'Cashfree PG Transactions Overview, Growth Rates, and Daily Revenue Reports'}
            {view === 'ledger' && 'Complete Searchable, Filterable, and Paginated Transaction Ledger Database'}
            {view === 'custom-links' && 'Manage Public Custom Donation Preset Buttons'}
            {view === 'approvals' && 'Manual UPI / QR Payments Awaiting Admin verification'}
            {view === 'settings' && 'Toggle active payment gateways, pause during downtime, set custom status messages'}
          </p>
        </div>
      </div>

      {/* ── Horizontal Navigation Tabs ── */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 dark:border-zinc-800/60 pb-px">
        <Link 
          href="/admin/payments" 
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-all relative ${
            view === 'overview' 
              ? 'text-[#34A853] dark:text-white border-b-2 border-[#34A853]' 
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          Overview
        </Link>
        <Link 
          href="/admin/payments/ledger" 
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-all relative ${
            view === 'ledger' 
              ? 'text-[#34A853] dark:text-white border-b-2 border-[#34A853]' 
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          Audit Ledger
        </Link>
        <Link 
          href="/admin/payments/custom" 
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-all relative ${
            view === 'custom-links' 
              ? 'text-[#34A853] dark:text-white border-b-2 border-[#34A853]' 
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          Payment Presets
        </Link>
        <Link 
          href="/admin/payments/approvals" 
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-all relative flex items-center gap-1.5 ${
            view === 'approvals' 
              ? 'text-[#34A853] dark:text-white border-b-2 border-[#34A853]' 
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          Manual Approvals
          {pendingApprovals.length > 0 && (
            <span className="h-4.5 min-w-4.5 px-1 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center animate-pulse">
              {pendingApprovals.length}
            </span>
          )}
        </Link>
        <Link 
          href="/admin/payments/settings" 
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-all relative flex items-center gap-1 ${
            view === 'settings' 
              ? 'text-[#34A853] dark:text-white border-b-2 border-[#34A853]' 
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          Gateway Settings
        </Link>
      </div>

      {/* ── VIEW: OVERVIEW ── */}
      {view === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coins className="h-16 w-16 text-[#34A853]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Total Net Revenue</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 tracking-tight">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-[#34A853] mt-2 font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> {stats.totalClearedCount} Cleared Invoices
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Percent className="h-16 w-16 text-[#4285F4]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Aggregate Success Rate</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 tracking-tight">
                {stats.successPercentage.toFixed(1)}%
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 font-medium">
                Total pipeline checkouts: {stats.totalAttempts} attempts
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="h-16 w-16 text-[#FBBC05]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Average Transaction Size</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 tracking-tight">
                ₹{Math.round(stats.averageDonation).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 font-medium">
                Average billing ticket per sponsor
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="h-16 w-16 text-[#EA4335]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Pipeline Pipeline</p>
              <h3 className="text-xl font-black text-slate-950 dark:text-white mt-3 tracking-tight flex items-center gap-3">
                <span className="text-yellow-500">{stats.totalPendingCount} Pending</span>
                <span className="text-white/20">/</span>
                <span className="text-red-500">{stats.totalFailedCount} Failed</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2.5 font-medium">
                Unfinished or rejected submissions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW: AUDIT LEDGER ── */}
      {view === 'ledger' && (
        <div className="w-full">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Transactions Audit Ledger</h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 font-medium">
                  Unified database covering donations, presets, and manual event payments. Click on any row to audit receipt states.
                </p>
              </div>
            </div>

            {/* Active Date Filter Banner */}
            {selectedDateFilter && (
              <div className="mb-6 p-4 rounded-2xl bg-[#34A853]/5 border border-[#34A853]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  className="h-8 px-3 rounded-xl border-[#34A853]/25 hover:bg-[#34A853]/10 hover:text-[#34A853] text-[#34A853] text-[9px] font-black uppercase tracking-wider bg-transparent"
                >
                  Clear Date Filter
                </Button>
              </div>
            )}

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, UTR reference or order ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-955/20 text-xs font-semibold focus:outline-none focus:border-[#34A853] dark:focus:border-[#34A853] text-slate-800 dark:text-white transition-all placeholder-slate-400 dark:placeholder-zinc-650"
                />
              </div>
              
              <div className="relative min-w-[150px]">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-955/20 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-[#34A853] cursor-pointer appearance-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">Cleared (PAID)</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="PENDING">Pending Checkout</option>
                  <option value="FAILED">Failed / Rejected</option>
                </select>
              </div>
            </div>

            {filteredTransactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800/80">
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Order / Txn ID</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Sponsor Details</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center">Status</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center">Gateway Source</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {paginatedTransactions.map((don) => {
                        const initials = don.customerName ? don.customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'SP';
                        
                        let statusColor = 'bg-red-500/10 border-red-500/20 text-red-500';
                        if (don.status === 'PAID') {
                          statusColor = 'bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853]';
                        } else if (don.status === 'PENDING_APPROVAL') {
                          statusColor = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400';
                        } else if (don.status === 'PENDING') {
                          statusColor = 'bg-slate-500/10 border-slate-500/20 text-slate-500';
                        }

                        return (
                          <tr key={don.id} onClick={() => handleOpenDetails(don)} className="hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-all duration-200 cursor-pointer group">
                            <td className="py-4 px-4">
                              <p className="text-[11px] font-mono font-bold text-slate-850 dark:text-zinc-300 group-hover:text-[#34A853] transition-colors">{don.id.substring(0, 18)}...</p>
                              {don.utr && <p className="text-[8px] text-white/40 mt-0.5 font-mono">UTR: {don.utr}</p>}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-[10px] text-slate-700 dark:text-zinc-300 shrink-0">{initials}</div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{don.customerName}</p>
                                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">{don.customerEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge className={`rounded-xl border font-black uppercase tracking-wider text-[9px] px-2.5 py-0.5 ${statusColor}`}>
                                {don.status === 'PENDING_APPROVAL' ? 'PENDING APPROVAL' : don.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-center text-[10px] font-bold uppercase tracking-wider">
                              <span className="flex items-center justify-center gap-1">
                                {don.gateway === 'MLSC Pay' ? (
                                  <><QrCode className="h-3 w-3 text-emerald-400" /> MLSC Pay</>
                                ) : (
                                  <><CreditCard className="h-3 w-3 text-indigo-400" /> Cashfree PG</>
                                )}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-xs text-slate-950 dark:text-white">₹{(Number(don.amount) || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-550 dark:text-zinc-400 font-semibold">
                    Showing <span className="font-bold text-slate-800 dark:text-white">{Math.min(startIndex + 1, filteredTransactions.length)}</span> to <span className="font-bold text-slate-800 dark:text-white">{Math.min(startIndex + pageSize, filteredTransactions.length)}</span> of <span className="font-bold text-slate-800 dark:text-white">{filteredTransactions.length}</span>
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

      {/* ── VIEW: MANUAL APPROVALS ── */}
      {view === 'approvals' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/60 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-indigo-500" /> Manual Payment Approvals
              </h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                Verify deposits in your bank statement or UPI ledger, then approve or reject submissions here.
              </p>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
              {pendingApprovals.length} Pending
            </span>
          </div>

          {approvalsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <RefreshCcw className="h-7 w-7 text-indigo-500 animate-spin" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Loading Submissions Ledger...</span>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <CheckCircle2 className="h-10 w-10 mx-auto text-[#34A853] opacity-60" />
              <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white">All Submissions Verified</h4>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">
                There are no pending offline UPI or bank transfer approvals in the queue. Everything is up to date!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800/60 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">UTR Ref Number</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-center">Amount</th>
                    <th className="py-3 px-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/40 text-xs font-semibold text-slate-800 dark:text-zinc-300">
                  {pendingApprovals.map((pay) => (
                    <tr key={pay.orderId} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/10">
                      <td className="py-4 px-4 font-mono font-bold text-[10px] text-indigo-400">
                        {pay.orderId.substring(0, 16)}...
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="text-slate-950 dark:text-white font-bold">{pay.customerName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{pay.customerEmail}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/95 uppercase text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          {pay.purpose}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-black text-yellow-600 dark:text-yellow-400 text-[10px]">
                        {pay.utr}
                      </td>
                      <td className="py-4 px-4 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                        {pay.createdAt ? format(new Date(pay.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-950 dark:text-white">
                        ₹{pay.amount}.00
                      </td>
                      <td className="py-4 px-4 text-right pr-6 space-x-2 shrink-0">
                        <Button
                          disabled={processingOrderId !== null}
                          onClick={() => handleApprovePayment(pay.orderId)}
                          className="h-8 bg-[#34A853] hover:bg-[#2e9649] text-white font-black text-[9px] uppercase tracking-wider rounded-xl shadow-sm px-3.5"
                        >
                          {processingOrderId === pay.orderId ? (
                            <RefreshCcw className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Approve</span>
                          )}
                        </Button>
                        <Button
                          disabled={processingOrderId !== null}
                          onClick={() => {
                            setRejectOrderId(pay.orderId);
                            setIsRejectDialogOpen(true);
                          }}
                          variant="destructive"
                          className="h-8 font-black text-[9px] uppercase tracking-wider rounded-xl px-3.5"
                        >
                          <span className="flex items-center gap-1"><X className="h-3.5 w-3.5" /> Reject</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW: GATEWAY CONFIGURATION SETTINGS ── */}
      {view === 'settings' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/60 pb-4 mb-6">
              <div className="p-2 rounded-xl bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  Gateway Settings
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                  Configure payment gateways. Temporarily pause online checkout during API downtime.
                </p>
              </div>
            </div>

            {settingsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <RefreshCcw className="h-7 w-7 text-indigo-500 animate-spin" />
                <span className="text-[10px] text-white/45 uppercase tracking-wider font-bold">Synchronizing Config Files...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* 1. Cashfree PG Configuration */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-indigo-400" /> Cashfree PG (Online)
                      </h3>
                      <p className="text-[9.5px] text-slate-400 dark:text-zinc-500">Automated card, UPI collect, and netbanking gateway</p>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        cashfree: { ...settings.cashfree, enabled: !settings.cashfree.enabled }
                      })}
                      className={`h-7 px-4 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                        settings.cashfree.enabled 
                          ? 'bg-[#34A853]/10 border-[#34A853]/20 text-[#34A853] hover:bg-[#34A853]/15' 
                          : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/15'
                      }`}
                    >
                      {settings.cashfree.enabled ? 'Enabled' : 'Paused (Downtime)'}
                    </button>
                  </div>

                  {/* Downtime Custom message */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-200/40 dark:border-zinc-800/40">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Downtime Display Message</label>
                    <input
                      type="text"
                      value={settings.cashfree.message}
                      onChange={(e) => setSettings({
                        ...settings,
                        cashfree: { ...settings.cashfree, message: e.target.value }
                      })}
                      placeholder="e.g. Suspended due to gateway downtime"
                      className="w-full h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#34A853]"
                    />
                  </div>
                </div>

                {/* 2. MLSC Pay Configuration */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-emerald-400" /> MLSC Pay (Offline)
                      </h3>
                      <p className="text-[9.5px] text-slate-400 dark:text-zinc-500">Manual UPI QR scanning and UTR confirmation queue</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        mlscPay: { ...settings.mlscPay, enabled: !settings.mlscPay.enabled }
                      })}
                      className={`h-7 px-4 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                        settings.mlscPay.enabled 
                          ? 'bg-[#34A853]/10 border-[#34A853]/20 text-[#34A853] hover:bg-[#34A853]/15' 
                          : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/15'
                      }`}
                    >
                      {settings.mlscPay.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1.5 border-t border-slate-200/40 dark:border-zinc-800/40">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Display Label</label>
                    <input
                      type="text"
                      value={settings.mlscPay.message}
                      onChange={(e) => setSettings({
                        ...settings,
                        mlscPay: { ...settings.mlscPay, message: e.target.value }
                      })}
                      placeholder="e.g. Manual UPI / QR Transfer"
                      className="w-full h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#34A853]"
                    />
                  </div>
                </div>

                {/* Warning Alert if both are disabled */}
                {!settings.cashfree.enabled && !settings.mlscPay.enabled && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-500 items-start text-xs font-semibold">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                    <p className="leading-relaxed">
                      Warning: Disabling both payment methods will lock the checkout portal completely. 
                      Users will not be able to perform any payment transactions (donations or paid events). 
                      Ensure at least one gateway is active.
                    </p>
                  </div>
                )}

                {/* Save settings Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={savingSettings}
                    className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl px-6"
                  >
                    {savingSettings ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Save Configurations'
                    )}
                  </Button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW: CUSTOM PRESENTS (LEGACY COMPATIBILITY) ── */}
      {view === 'custom-links' && (
        <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-8">
          <h2 className="text-xl font-black mb-6 tracking-tight text-slate-900 dark:text-white uppercase">Manage Custom Payment Buttons</h2>
          <p className="text-sm text-slate-550 dark:text-zinc-400 mb-6">
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
                <div key={link.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-955 hover:border-slate-200 dark:hover:border-zinc-800 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-tight">{link.purpose}</span>
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        ₹{link.amount}
                      </span>
                    </div>
                    {link.description && (
                      <p className="text-xs text-slate-550 dark:text-zinc-400">{link.description}</p>
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

      {/* ── DIALOG: REJECT MANUAL TRANSACTION REASON ── */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 uppercase font-black italic tracking-tight">Reject Manual Payment</DialogTitle>
            <DialogDescription className="text-xs">
              Provide a clear reason explaining why this payment was rejected. An automated notification email will be dispatched to the customer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rejection Reason *</label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Transaction UTR reference number could not be matched with any credit on our bank statement statement. Please check and re-submit."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-transparent text-xs font-semibold focus:outline-none focus:border-red-500 text-slate-800 dark:text-white placeholder-slate-400"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectOrderId(null);
                setRejectionReason('');
              }}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              disabled={rejecting || !rejectionReason}
              onClick={handleRejectPayment}
              variant="destructive"
              className="rounded-xl text-xs font-black uppercase tracking-wider"
            >
              {rejecting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
