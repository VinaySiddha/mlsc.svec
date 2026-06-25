import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Building, 
  Coins, 
  Mail, 
  Phone, 
  User, 
  Receipt,
  ExternalLink
} from 'lucide-react';
import { PrintButton } from './print-button';
import { SendInvoiceButton } from './send-invoice-button';

export const dynamic = 'force-dynamic';

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params;

  // 1. Fetch donation details from Firestore
  let donation: any = null;
  try {
    const docRef = doc(db, 'donations', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      donation = { id: docSnap.id, ...docSnap.data() };
    }
  } catch (err) {
    console.error('Error fetching donation for receipt page:', err);
  }

  if (!donation) {
    return notFound();
  }

  const amount = Number(donation.amount) || 0;
  const createdAtStr = donation.createdAt
    ? new Date(donation.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : 'Pending Processing';

  // Determine Tier
  let tierName = 'Custom Sponsor';
  let tierColor = 'text-slate-600 border-slate-200 bg-slate-50 dark:text-slate-300 dark:bg-zinc-900/40 dark:border-zinc-800';
  if (amount === 250) {
    tierName = 'Bronze Sponsor';
    tierColor = 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30';
  } else if (amount === 500) {
    tierName = 'Silver Sponsor';
    tierColor = 'text-slate-600 border-slate-300 bg-slate-100 dark:text-zinc-300 dark:bg-zinc-800/30 dark:border-zinc-700/40';
  } else if (amount === 1000) {
    tierName = 'Gold Sponsor';
    tierColor = 'text-yellow-700 border-yellow-200 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-900/30';
  } else if (amount === 2500) {
    tierName = 'Platinum Sponsor';
    tierColor = 'text-purple-700 border-purple-200 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-900/30';
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080808] py-12 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:py-0">
      {/* Print-specific style override */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .print-accent {
            color: black !important;
            border-color: #e2e8f0 !important;
            background: transparent !important;
          }
        }
      `}} />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation & Controls header (no-print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <Link 
            href="/admin/payments"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Ledger
          </Link>

          <div className="flex items-center gap-3">
            <SendInvoiceButton donationId={donation.id} recipientEmail={donation.customerEmail} />
            <PrintButton />
          </div>
        </div>

        {/* Receipt Container */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden print-card">
          {/* Subtle branding watermarks */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#34A853]/5 dark:bg-[#34A853]/2 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#4285F4]/5 dark:bg-[#4285F4]/2 rounded-full blur-3xl pointer-events-none" />

          {/* Receipt Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 dark:border-zinc-800/80 pb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#34A853]/10 dark:bg-[#34A853]/5">
                  <Coins className="h-6 w-6 text-[#34A853]" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                    MLSC <span className="text-[#34A853]">SVEC</span>
                  </h2>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest mt-0.5">
                    Community Funding Program
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                Sri Vasavi Engineering College<br />
                Microsoft Mobile Innovation Lab & Open-Source Community
              </p>
            </div>

            <div className="text-left md:text-right space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/80 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 print-accent">
                <Receipt className="h-3.5 w-3.5" /> Official Receipt
              </div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pt-2">Receipt ID</h3>
              <p className="text-xs font-mono font-black text-slate-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/50 px-3 py-1.5 rounded-xl inline-block print-accent">
                {donation.id}
              </p>
            </div>
          </div>

          {/* Receipt Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-slate-100 dark:border-zinc-800/80">
            {/* Sponsor Profile */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                Sponsor Profile
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-zinc-800/60 print-accent">
                    <User className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Full Name</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">{donation.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-zinc-800/60 print-accent">
                    <Mail className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Email Address</p>
                    <p className="text-xs font-mono font-semibold text-slate-850 dark:text-zinc-300">{donation.customerEmail}</p>
                  </div>
                </div>

                {donation.customerPhone && (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-slate-100 dark:bg-zinc-800/60 print-accent">
                      <Phone className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Contact Number</p>
                      <p className="text-xs font-mono font-semibold text-slate-850 dark:text-zinc-300">{donation.customerPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Overview */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                Transaction Details
              </h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-450 dark:text-zinc-500 uppercase text-[9px] tracking-wider">Payment Status</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    donation.status === 'PAID' 
                      ? 'bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853]' 
                      : donation.status === 'PENDING'
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                      : 'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}>
                    {donation.status === 'PAID' ? <CheckCircle2 className="h-3 w-3" /> : donation.status === 'PENDING' ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {donation.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-450 dark:text-zinc-500 uppercase text-[9px] tracking-wider">Timestamp</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{createdAtStr}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-450 dark:text-zinc-500 uppercase text-[9px] tracking-wider">Payment Gateway</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-300">
                    {donation.isMock ? 'Sandbox PG Simulator' : 'Cashfree Production PG'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-450 dark:text-zinc-500 uppercase text-[9px] tracking-wider">Sponsorship Rank</span>
                  <span className={`inline-flex px-2 py-0.5 border text-[9px] uppercase tracking-widest font-black rounded-lg ${tierColor} print-accent`}>
                    {tierName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Calculation breakdown */}
          <div className="py-8 border-b border-slate-100 dark:border-zinc-800/80">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
              Billing Ledger
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800/55 text-[9px] font-black uppercase tracking-widest text-slate-450 dark:text-zinc-500">
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Unit Price</th>
                    <th className="pb-3 text-right">Total Cleared</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/40 text-xs">
                  <tr className="text-slate-800 dark:text-zinc-200">
                    <td className="py-4 font-bold">
                      MLSC Community Sponsorship contribution ({tierName})
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium font-sans">
                        Donation towards organizing technical workshops, hackathons, and open-source events.
                      </p>
                    </td>
                    <td className="py-4 text-center font-semibold text-slate-600 dark:text-zinc-400">1</td>
                    <td className="py-4 text-right font-semibold text-slate-700 dark:text-zinc-300">₹{amount.toLocaleString('en-IN')}.00</td>
                    <td className="py-4 text-right font-black text-slate-950 dark:text-white">₹{amount.toLocaleString('en-IN')}.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="mt-6 flex justify-end">
              <div className="w-full sm:w-80 p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/80 space-y-3.5 print-accent">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  <span>Subtotal:</span>
                  <span>₹{amount.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  <span>Tax / Gateway Fees:</span>
                  <span>₹0.00 (Waived)</span>
                </div>
                <div className="border-t border-slate-200 dark:border-zinc-800/80 pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-black uppercase text-slate-900 dark:text-white">Grand Total:</span>
                  <span className="text-xl font-black text-yellow-500 italic">
                    ₹{amount.toLocaleString('en-IN')}.00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference IDs Section */}
          <div className="py-8 space-y-4 border-b border-slate-100 dark:border-zinc-800/80">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-800/50 pb-2">
              Payment Gateway Reference Auditing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-[8px] text-slate-450 dark:text-zinc-500 font-bold uppercase tracking-wider">Gateway Order ID</p>
                <p className="font-bold text-slate-750 dark:text-zinc-350 mt-1 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/40 px-3 py-1.5 rounded-xl truncate print-accent">
                  {donation.orderId || donation.id}
                </p>
              </div>
              {donation.cfOrderId && (
                <div>
                  <p className="text-[8px] text-slate-450 dark:text-zinc-500 font-bold uppercase tracking-wider">Cashfree Reference ID</p>
                  <p className="font-bold text-slate-750 dark:text-zinc-350 mt-1 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/40 px-3 py-1.5 rounded-xl truncate print-accent">
                    {donation.cfOrderId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security note & Footnote */}
          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-slate-450 dark:text-zinc-500">
              <ShieldCheck className="h-8 w-8 text-[#34A853] shrink-0" />
              <div className="text-[10px] font-semibold leading-relaxed">
                <span className="font-black uppercase text-slate-700 dark:text-zinc-300">100% Secured Payment Gateway Audit</span><br />
                Cleared securely via Cashfree SSL/TLS encryption. All funds directly contribute to student hackathons.
              </div>
            </div>
            <div className="text-right text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
              Issued By: MLSC SVEC Admin Team<br />
              Tirupati, AP, India
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
