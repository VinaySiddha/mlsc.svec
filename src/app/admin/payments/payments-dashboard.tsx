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
    <div className="space-y-8 font-sans text-black">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00FF66] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
              <Coins className="h-7 w-7 text-black stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
                Payments <span className="text-[#34A853]">Portal</span>
              </h1>
              <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">
                {view === 'overview' && 'Cashfree PG Transactions Overview, Growth Rates, and Daily Revenue Reports'}
                {view === 'ledger' && 'Complete Searchable, Filterable, and Paginated Transaction Ledger Database'}
                {view === 'custom-links' && 'Manage Public Custom Donation Preset Buttons'}
                {view === 'approvals' && 'Manual UPI / QR Payments Awaiting Admin verification'}
                {view === 'settings' && 'Toggle active payment gateways, pause during downtime, set custom status messages'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Horizontal Navigation Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-black pb-3">
        <Link 
          href="/admin/payments" 
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
            view === 'overview' 
              ? 'bg-black text-white shadow-[2px_2px_0px_0px_#00FF66]' 
              : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]'
          }`}
        >
          Overview
        </Link>
        <Link 
          href="/admin/payments/ledger" 
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
            view === 'ledger' 
              ? 'bg-black text-white shadow-[2px_2px_0px_0px_#00FF66]' 
              : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]'
          }`}
        >
          Audit Ledger
        </Link>
        <Link 
          href="/admin/payments/custom" 
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
            view === 'custom-links' 
              ? 'bg-black text-white shadow-[2px_2px_0px_0px_#00FF66]' 
              : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]'
          }`}
        >
          Payment Presets
        </Link>
        <Link 
          href="/admin/payments/approvals" 
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-2 border-black flex items-center gap-1.5 ${
            view === 'approvals' 
              ? 'bg-black text-white shadow-[2px_2px_0px_0px_#00FF66]' 
              : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]'
          }`}
        >
          Manual Approvals
          {pendingApprovals.length > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#FF0055] text-white text-[9px] font-black flex items-center justify-center border border-black animate-pulse">
              {pendingApprovals.length}
            </span>
          )}
        </Link>
        <Link 
          href="/admin/payments/settings" 
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-2 border-black flex items-center gap-1 ${
            view === 'settings' 
              ? 'bg-black text-white shadow-[2px_2px_0px_0px_#00FF66]' 
              : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]'
          }`}
        >
          Gateway Settings
        </Link>
      </div>

      {/* ── VIEW: OVERVIEW ── */}
      {view === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#00FF66] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coins className="h-16 w-16 text-black" />
              </div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total Net Revenue</p>
              <h3 className="text-3xl font-black text-black mt-2 tracking-tight font-display">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-[#34A853] mt-2 font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" /> {stats.totalClearedCount} Cleared Invoices
              </p>
            </div>

            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#4285F4] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Percent className="h-16 w-16 text-black" />
              </div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Aggregate Success Rate</p>
              <h3 className="text-3xl font-black text-black mt-2 tracking-tight font-display">
                {stats.successPercentage.toFixed(1)}%
              </h3>
              <p className="text-xs text-zinc-600 mt-2 font-bold">
                Total pipeline checkouts: {stats.totalAttempts} attempts
              </p>
            </div>

            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#FFE600] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="h-16 w-16 text-black" />
              </div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Average Transaction Size</p>
              <h3 className="text-3xl font-black text-black mt-2 tracking-tight font-display">
                ₹{Math.round(stats.averageDonation).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-zinc-600 mt-2 font-bold">
                Average billing ticket per sponsor
              </p>
            </div>

            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#FF0055] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="h-16 w-16 text-black" />
              </div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Pipeline Status</p>
              <h3 className="text-xl font-black text-black mt-3 tracking-tight flex items-center gap-2 font-display">
                <span className="text-amber-600">{stats.totalPendingCount} Pending</span>
                <span className="text-zinc-300">/</span>
                <span className="text-[#FF0055]">{stats.totalFailedCount} Failed</span>
              </h3>
              <p className="text-xs text-zinc-600 mt-2.5 font-bold">
                Unfinished or rejected submissions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW: AUDIT LEDGER ── */}
      {view === 'ledger' && (
        <div className="w-full">
          <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-black uppercase tracking-tight font-display">Transactions Audit Ledger</h2>
                <p className="text-xs text-zinc-600 mt-1 font-bold">
                  Unified database covering donations, presets, and manual event payments. Click on any row to audit receipt states.
                </p>
              </div>
            </div>

            {/* Active Date Filter Banner */}
            {selectedDateFilter && (
              <div className="mb-6 p-4 bg-[#FAFAFA] border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-black font-bold">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34A853]"></span>
                  </span>
                  <span>
                    Filtering ledger for date:{' '}
                    <span className="font-black text-black underline decoration-[#34A853] decoration-2 underline-offset-4 font-mono">
                      {format(new Date(selectedDateFilter + "T00:00:00"), 'dd MMM yyyy')}
                    </span>
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateFilterChange(null)}
                  className="h-8 px-3 border-2 border-black hover:bg-zinc-100 text-black text-[9px] font-black uppercase tracking-wider bg-white shadow-[2px_2px_0px_0px_#000000]"
                >
                  Clear Date Filter
                </Button>
              </div>
            )}

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 stroke-[2.5]" />
                <input
                  type="text"
                  placeholder="Search by name, email, UTR reference or order ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 border-2 border-black bg-white text-xs font-bold focus:outline-none placeholder:text-zinc-400 shadow-[2px_2px_0px_0px_#000000]"
                />
              </div>
              
              <div className="relative min-w-[170px]">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none stroke-[2.5]" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 border-2 border-black bg-white text-xs font-black uppercase tracking-wider text-black focus:outline-none cursor-pointer appearance-none shadow-[2px_2px_0px_0px_#000000]"
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
                <div className="overflow-x-auto border-2 border-black">
                  <table className="w-full text-left border-collapse font-sans min-w-[750px]">
                    <thead className="bg-zinc-100 border-b-2 border-black">
                      <tr>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-black">Order / Txn ID</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-black">Sponsor Details</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-black text-center">Status</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-black text-center">Gateway Source</th>
                        <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-black text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-t border-zinc-200">
                      {paginatedTransactions.map((don) => {
                        const initials = don.customerName ? don.customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'SP';
                        
                        let statusColor = 'bg-[#FF0055]/10 border-2 border-black text-[#FF0055]';
                        if (don.status === 'PAID') {
                          statusColor = 'bg-[#00FF66] border-2 border-black text-black';
                        } else if (don.status === 'PENDING_APPROVAL') {
                          statusColor = 'bg-[#FFE600] border-2 border-black text-black';
                        } else if (don.status === 'PENDING') {
                          statusColor = 'bg-zinc-100 border-2 border-black text-zinc-600';
                        }

                        return (
                          <tr key={don.id} onClick={() => handleOpenDetails(don)} className="hover:bg-zinc-50 transition-all duration-200 cursor-pointer group">
                            <td className="py-4 px-4">
                              <p className="text-[11px] font-mono font-bold text-black group-hover:text-[#34A853] transition-colors">{don.id.substring(0, 18)}...</p>
                              {don.utr && <p className="text-[9px] text-zinc-500 mt-0.5 font-mono font-bold">UTR: {don.utr}</p>}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="hidden sm:flex h-8 w-8 items-center justify-center border-2 border-black bg-[#FFE600] font-black text-[10px] text-black shrink-0 shadow-[1px_1px_0px_0px_#000000]">{initials}</div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-black truncate">{don.customerName}</p>
                                  <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">{don.customerEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge className={`font-black uppercase tracking-wider text-[9px] px-2.5 py-0.5 shadow-[1px_1px_0px_0px_#000000] rounded-none ${statusColor}`}>
                                {don.status === 'PENDING_APPROVAL' ? 'PENDING APPROVAL' : don.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-center text-[10px] font-black uppercase tracking-wider">
                              <span className="flex items-center justify-center gap-1 text-black">
                                {don.gateway === 'MLSC Pay' ? (
                                  <><QrCode className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" /> MLSC Pay</>
                                ) : (
                                  <><CreditCard className="h-3.5 w-3.5 text-[#4285F4] stroke-[2.5]" /> Cashfree PG</>
                                )}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right font-black text-xs text-black font-display">₹{(Number(don.amount) || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="mt-6 pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-zinc-700 font-bold">
                    Showing <span className="font-black text-black">{Math.min(startIndex + 1, filteredTransactions.length)}</span> to <span className="font-black text-black">{Math.min(startIndex + pageSize, filteredTransactions.length)}</span> of <span className="font-black text-black">{filteredTransactions.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-8 px-2 border-2 border-black text-[10px] font-black shadow-[2px_2px_0px_0px_#000000]"><ChevronsLeft className="h-3.5 w-3.5 stroke-[2.5]" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="h-8 px-3 border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000000]"><ChevronLeft className="h-3.5 w-3.5 mr-1 stroke-[2.5]" /> Prev</Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        return <Button key={pageNum} variant="outline" size="sm" onClick={() => setCurrentPage(pageNum)} className={`h-8 w-8 border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000000] ${currentPage === pageNum ? 'bg-[#00FF66] text-black' : 'bg-white text-black'}`}>{pageNum}</Button>
                      })}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="h-8 px-3 border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000000]">Next <ChevronRight className="h-3.5 w-3.5 ml-1 stroke-[2.5]" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="h-8 px-2 border-2 border-black text-[10px] font-black shadow-[2px_2px_0px_0px_#000000]"><ChevronsRight className="h-3.5 w-3.5 stroke-[2.5]" /></Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-zinc-500 text-xs py-12 font-black uppercase tracking-wider">No matching transactions found.</p>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW: MANUAL APPROVALS ── */}
      {view === 'approvals' && (
        <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_#000000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2 font-display">
                <ShieldCheck className="h-6 w-6 text-[#4285F4] stroke-[2.5]" /> Manual Payment Approvals
              </h2>
              <p className="text-xs text-zinc-600 mt-1 font-bold">
                Verify deposits in your bank statement or UPI ledger, then approve or reject submissions here.
              </p>
            </div>
            <span className="text-[10px] bg-[#FFE600] text-black border-2 border-black px-3 py-1 uppercase tracking-wider font-black shadow-[2px_2px_0px_0px_#000000]">
              {pendingApprovals.length} Pending
            </span>
          </div>

          {approvalsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <RefreshCcw className="h-7 w-7 text-black animate-spin" />
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-black">Loading Submissions Ledger...</span>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <CheckCircle2 className="h-10 w-10 mx-auto text-[#00FF66] stroke-[2.5]" />
              <h4 className="text-sm font-black uppercase text-black font-display">All Submissions Verified</h4>
              <p className="text-xs text-zinc-600 max-w-xs mx-auto font-bold leading-relaxed">
                There are no pending offline UPI or bank transfer approvals in the queue. Everything is up to date!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black">
              <table className="w-full text-left border-collapse font-sans min-w-[750px]">
                <thead className="bg-zinc-100 border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-black">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">UTR Ref Number</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-center">Amount</th>
                    <th className="py-3 px-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-xs font-semibold text-black">
                  {pendingApprovals.map((pay) => (
                    <tr key={pay.orderId} className="hover:bg-zinc-50">
                      <td className="py-4 px-4 font-mono font-bold text-[10px] text-[#4285F4]">
                        {pay.orderId.substring(0, 16)}...
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="text-black font-bold">{pay.customerName}</div>
                        <div className="text-[10px] text-zinc-500 font-semibold">{pay.customerEmail}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-black uppercase text-[10px] bg-zinc-100 border-2 border-black px-2 py-0.5 font-bold">
                          {pay.purpose}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-black text-amber-700 text-[10px]">
                        {pay.utr}
                      </td>
                      <td className="py-4 px-4 text-[10px] text-zinc-600 font-bold">
                        {pay.createdAt ? format(new Date(pay.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-center font-black text-black font-display">
                        ₹{pay.amount}.00
                      </td>
                      <td className="py-4 px-4 text-right pr-6 space-x-2 shrink-0">
                        <Button
                          disabled={processingOrderId !== null}
                          onClick={() => handleApprovePayment(pay.orderId)}
                          className="h-8 bg-[#00FF66] hover:bg-[#00FF66]/90 text-black border-2 border-black font-black text-[9px] uppercase tracking-wider rounded-none shadow-[2px_2px_0px_0px_#000000] px-3.5"
                        >
                          {processingOrderId === pay.orderId ? (
                            <RefreshCcw className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 stroke-[3]" /> Approve</span>
                          )}
                        </Button>
                        <Button
                          disabled={processingOrderId !== null}
                          onClick={() => {
                            setRejectOrderId(pay.orderId);
                            setIsRejectDialogOpen(true);
                          }}
                          className="h-8 bg-[#FF0055] hover:bg-[#FF0055]/90 text-white border-2 border-black font-black text-[9px] uppercase tracking-wider rounded-none shadow-[2px_2px_0px_0px_#000000] px-3.5"
                        >
                          <span className="flex items-center gap-1"><X className="h-3.5 w-3.5 stroke-[3]" /> Reject</span>
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
          <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex items-center gap-3 border-b-2 border-black pb-4 mb-6">
              <div className="p-2 bg-[#00FF66] border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-black">
                <Settings className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-black uppercase tracking-tight font-display">
                  Gateway Settings
                </h2>
                <p className="text-xs text-zinc-600 font-bold mt-0.5">
                  Configure payment gateways. Temporarily pause online checkout during API downtime.
                </p>
              </div>
            </div>

            {settingsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <RefreshCcw className="h-7 w-7 text-black animate-spin" />
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-black">Synchronizing Config Files...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* 1. Cashfree PG Configuration */}
                <div className="p-5 bg-[#FAFAFA] border-2 border-black shadow-[3px_3px_0px_0px_#000000] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black uppercase text-black flex items-center gap-2 font-display">
                        <CreditCard className="h-4 w-4 text-[#4285F4] stroke-[2.5]" /> Cashfree PG (Online)
                      </h3>
                      <p className="text-[10px] text-zinc-600 font-bold">Automated card, UPI collect, and netbanking gateway</p>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        cashfree: { ...settings.cashfree, enabled: !settings.cashfree.enabled }
                      })}
                      className={`h-8 px-4 text-[9px] font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition-all ${
                        settings.cashfree.enabled 
                          ? 'bg-[#00FF66] text-black' 
                          : 'bg-[#FF0055] text-white'
                      }`}
                    >
                      {settings.cashfree.enabled ? 'Enabled' : 'Paused (Downtime)'}
                    </button>
                  </div>

                  {/* Downtime Custom message */}
                  <div className="space-y-1.5 pt-2 border-t-2 border-black">
                    <label className="text-[9px] font-black uppercase tracking-wider text-black">Downtime Display Message</label>
                    <input
                      type="text"
                      value={settings.cashfree.message}
                      onChange={(e) => setSettings({
                        ...settings,
                        cashfree: { ...settings.cashfree, message: e.target.value }
                      })}
                      placeholder="e.g. Suspended due to gateway downtime"
                      className="w-full h-10 px-4 border-2 border-black bg-white text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    />
                  </div>
                </div>

                {/* 2. MLSC Pay Configuration */}
                <div className="p-5 bg-[#FAFAFA] border-2 border-black shadow-[3px_3px_0px_0px_#000000] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black uppercase text-black flex items-center gap-2 font-display">
                        <QrCode className="h-4 w-4 text-emerald-600 stroke-[2.5]" /> MLSC Pay (Offline)
                      </h3>
                      <p className="text-[10px] text-zinc-600 font-bold">Manual UPI QR scanning and UTR confirmation queue</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        mlscPay: { ...settings.mlscPay, enabled: !settings.mlscPay.enabled }
                      })}
                      className={`h-8 px-4 text-[9px] font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition-all ${
                        settings.mlscPay.enabled 
                          ? 'bg-[#00FF66] text-black' 
                          : 'bg-[#FF0055] text-white'
                      }`}
                    >
                      {settings.mlscPay.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t-2 border-black">
                    <label className="text-[9px] font-black uppercase tracking-wider text-black">Display Label</label>
                    <input
                      type="text"
                      value={settings.mlscPay.message}
                      onChange={(e) => setSettings({
                        ...settings,
                        mlscPay: { ...settings.mlscPay, message: e.target.value }
                      })}
                      placeholder="e.g. Manual UPI / QR Transfer"
                      className="w-full h-10 px-4 border-2 border-black bg-white text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                    />
                  </div>
                </div>

                {/* Warning Alert if both are disabled */}
                {!settings.cashfree.enabled && !settings.mlscPay.enabled && (
                  <div className="p-4 bg-[#FF0055]/10 border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex gap-3 text-black items-start text-xs font-bold">
                    <AlertTriangle className="h-4.5 w-4.5 text-[#FF0055] shrink-0 stroke-[2.5]" />
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
                    className="h-11 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#FFE600] px-6"
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
        <div className="w-full bg-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_#000000]">
          <h2 className="text-xl font-black mb-2 tracking-tight text-black uppercase font-display">Manage Custom Payment Buttons</h2>
          <p className="text-xs text-zinc-600 font-bold mb-6">
            Create pre-configured payment buttons (e.g., for domain registration, specific club sponsorships, or merchandise) that will automatically appear as selectable cards on the public donation page.
          </p>

          <form onSubmit={handleCreateCustom} className="space-y-4 mb-8 p-6 bg-[#FAFAFA] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
            <h3 className="text-xs font-black uppercase tracking-wider text-black font-display">Create New Payment Button</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase">Purpose / Label *</label>
                <input 
                  placeholder="e.g. Domain Registration" 
                  className="h-10 px-4 border-2 border-black bg-white text-xs font-bold text-black w-full focus:outline-none shadow-[2px_2px_0px_0px_#000000]" 
                  value={newPurpose} 
                  onChange={(e) => setNewPurpose(e.target.value)} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase">Amount (₹) *</label>
                <input 
                  placeholder="e.g. 50" 
                  type="number" 
                  min="1"
                  className="h-10 px-4 border-2 border-black bg-white text-xs font-bold text-black w-full focus:outline-none shadow-[2px_2px_0px_0px_#000000]" 
                  value={newAmount} 
                  onChange={(e) => setNewAmount(e.target.value)} 
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase">Short Description (Optional)</label>
                <input 
                  placeholder="e.g. Domain setup and hosting renewal contribution" 
                  className="h-10 px-4 border-2 border-black bg-white text-xs font-bold text-black w-full focus:outline-none shadow-[2px_2px_0px_0px_#000000]" 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isCreatingCustom} className="bg-[#00FF66] hover:bg-[#00FF66]/90 text-black border-2 border-black font-black text-xs uppercase px-6 py-2 shadow-[2px_2px_0px_0px_#000000]">
                {isCreatingCustom ? 'Creating...' : (
                  <span className="flex items-center gap-2"><Plus className="h-4 w-4 stroke-[3]" /> Create Button</span>
                )}
              </Button>
            </div>
          </form>

          <h3 className="text-xs font-black uppercase tracking-wider text-black font-display mb-4">Active Custom Buttons</h3>
          
          <div className="space-y-3">
            {customPayments.length === 0 ? (
              <p className="text-xs text-zinc-500 font-bold italic py-6 text-center border-2 border-dashed border-black bg-[#FAFAFA]">
                No custom payment buttons created yet. Use the form above to add one.
              </p>
            ) : (
              customPayments.map((link: any) => (
                <div key={link.id} className="flex items-center justify-between p-4 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-black uppercase font-display">{link.purpose}</span>
                      <span className="text-xs bg-[#00FF66] text-black border-2 border-black font-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
                        ₹{link.amount}
                      </span>
                    </div>
                    {link.description && (
                      <p className="text-xs text-zinc-600 font-bold">{link.description}</p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteCustom(link.id)} 
                    className="border-2 border-black bg-white hover:bg-[#FF0055] hover:text-white text-black shadow-[2px_2px_0px_0px_#000000]"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── DIALOG: REJECT MANUAL TRANSACTION REASON ── */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black border-4 border-black p-6 shadow-[10px_10px_0px_0px_#000000] font-sans">
          <DialogHeader className="border-b-2 border-black pb-4">
            <DialogTitle className="text-[#FF0055] uppercase font-black text-lg font-display flex items-center gap-2">
              <X className="h-5 w-5 stroke-[3]" /> Reject Manual Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-600 font-bold mt-1">
              Provide a clear reason explaining why this payment was rejected. An automated notification email will be dispatched to the customer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <label className="text-[10px] font-black uppercase tracking-wider text-black block">Rejection Reason *</label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Transaction UTR reference number could not be matched with any credit on our bank statement. Please check and re-submit."
              className="w-full p-3 border-2 border-black bg-white text-xs font-bold focus:outline-none placeholder:text-zinc-400 text-black shadow-[3px_3px_0px_0px_#000000]"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t-2 border-black pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectOrderId(null);
                setRejectionReason('');
              }}
              className="border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000]"
            >
              Cancel
            </Button>
            <Button
              disabled={rejecting || !rejectionReason}
              onClick={handleRejectPayment}
              className="bg-[#FF0055] hover:bg-[#FF0055]/90 text-white border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] px-6"
            >
              {rejecting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
