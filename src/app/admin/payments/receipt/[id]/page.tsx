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
  let tierBadgeBg = 'bg-zinc-100 text-black';
  if (amount === 250) {
    tierName = 'Bronze Sponsor';
    tierBadgeBg = 'bg-[#FFE600] text-black';
  } else if (amount === 500) {
    tierName = 'Silver Sponsor';
    tierBadgeBg = 'bg-zinc-200 text-black';
  } else if (amount === 1000) {
    tierName = 'Gold Sponsor';
    tierBadgeBg = 'bg-[#FFE600] text-black';
  } else if (amount === 2500) {
    tierName = 'Platinum Sponsor';
    tierBadgeBg = 'bg-[#4285F4] text-white';
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 font-sans text-black print:bg-white print:py-0">
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
            border: 2px solid black !important;
            box-shadow: none !important;
            background: white !important;
            padding: 24px !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .print-accent {
            color: black !important;
            border-color: black !important;
            background: transparent !important;
          }
        }
      `}} />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation & Controls header (no-print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <Link 
            href="/admin/payments"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black hover:text-[#4285F4] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" /> Back to Ledger
          </Link>

          <div className="flex items-center gap-3">
            <SendInvoiceButton donationId={donation.id} recipientEmail={donation.customerEmail} />
            <PrintButton />
          </div>
        </div>

        {/* Receipt Container */}
        <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[10px_10px_0px_0px_#000000] relative overflow-hidden print-card">
          {/* Receipt Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b-2 border-black pb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  <Coins className="h-6 w-6 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-black font-display">
                    MLSC <span className="text-[#4285F4]">SVEC</span>
                  </h2>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-0.5">
                    Community Funding Program
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-700 font-semibold leading-relaxed">
                Sri Vasavi Engineering College<br />
                Microsoft Mobile Innovation Lab & Open-Source Community
              </p>
            </div>

            <div className="text-left md:text-right space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00FF66] border-2 border-black text-[10px] font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_#000000] print-accent">
                <Receipt className="h-3.5 w-3.5 stroke-[2.5]" /> Official Receipt
              </div>
              <div>
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Receipt ID</h3>
                <p className="text-xs font-mono font-black text-black bg-zinc-100 border-2 border-black px-3 py-1.5 mt-1 inline-block shadow-[2px_2px_0px_0px_#000000] print-accent">
                  {donation.id}
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b-2 border-black">
            {/* Sponsor Profile */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-black uppercase tracking-wider border-b-2 border-black pb-2">
                Sponsor Profile
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] print-accent">
                    <User className="h-4 w-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-600 font-black uppercase">Full Name</p>
                    <p className="text-xs font-black text-black">{donation.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] print-accent">
                    <Mail className="h-4 w-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-600 font-black uppercase">Email Address</p>
                    <p className="text-xs font-mono font-bold text-black">{donation.customerEmail}</p>
                  </div>
                </div>

                {donation.customerPhone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] print-accent">
                      <Phone className="h-4 w-4 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-600 font-black uppercase">Contact Number</p>
                      <p className="text-xs font-mono font-bold text-black">{donation.customerPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Overview */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-black uppercase tracking-wider border-b-2 border-black pb-2">
                Transaction Details
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-zinc-600 uppercase text-[10px] tracking-wider">Payment Status</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border-2 border-black text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] ${
                    donation.status === 'PAID' 
                      ? 'bg-[#00FF66] text-black' 
                      : donation.status === 'PENDING'
                      ? 'bg-[#FFE600] text-black'
                      : 'bg-[#FF0055] text-white'
                  }`}>
                    {donation.status === 'PAID' ? <CheckCircle2 className="h-3 w-3 stroke-[3]" /> : donation.status === 'PENDING' ? <Clock className="h-3 w-3 stroke-[3]" /> : <XCircle className="h-3 w-3 stroke-[3]" />}
                    {donation.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-zinc-600 uppercase text-[10px] tracking-wider">Timestamp</span>
                  <span className="font-bold text-black font-mono">{createdAtStr}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-zinc-600 uppercase text-[10px] tracking-wider">Payment Gateway</span>
                  <span className="font-black text-black">
                    {donation.isMock ? 'Sandbox PG Simulator' : 'Cashfree Production PG'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-zinc-600 uppercase text-[10px] tracking-wider">Sponsorship Rank</span>
                  <span className={`inline-flex px-2.5 py-0.5 border-2 border-black text-[10px] uppercase tracking-wider font-black shadow-[2px_2px_0px_0px_#000000] ${tierBadgeBg} print-accent`}>
                    {tierName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Calculation breakdown */}
          <div className="py-8 border-b-2 border-black">
            <h4 className="text-xs font-black text-black uppercase tracking-wider mb-4">
              Billing Ledger
            </h4>
            
            <div className="overflow-x-auto border-2 border-black">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b-2 border-black bg-[#FFE600] text-[10px] font-black uppercase tracking-wider text-black">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total Cleared</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black text-xs bg-white">
                  <tr className="text-black">
                    <td className="py-4 px-3 font-bold">
                      MLSC Community Sponsorship contribution ({tierName})
                      <p className="text-[10px] text-zinc-600 mt-1 font-semibold">
                        Donation towards organizing technical workshops, hackathons, and open-source events.
                      </p>
                    </td>
                    <td className="py-4 px-3 text-center font-bold">1</td>
                    <td className="py-4 px-3 text-right font-mono font-bold">₹{amount.toLocaleString('en-IN')}.00</td>
                    <td className="py-4 px-3 text-right font-mono font-black">₹{amount.toLocaleString('en-IN')}.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="mt-6 flex justify-end">
              <div className="w-full sm:w-80 p-5 bg-zinc-50 border-2 border-black shadow-[4px_4px_0px_0px_#000000] space-y-3 print-accent">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{amount.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span>Tax / Gateway Fees:</span>
                  <span className="font-mono">₹0.00 (Waived)</span>
                </div>
                <div className="border-t-2 border-black pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-black uppercase text-black">Grand Total:</span>
                  <span className="text-2xl font-black text-black font-display">
                    ₹{amount.toLocaleString('en-IN')}.00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference IDs Section */}
          <div className="py-8 space-y-4 border-b-2 border-black">
            <h4 className="text-xs font-black text-black uppercase tracking-wider border-b-2 border-black pb-2">
              Payment Gateway Reference Auditing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-wider">Gateway Order ID</p>
                <p className="font-black text-black mt-1 bg-zinc-100 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000] truncate print-accent">
                  {donation.orderId || donation.id}
                </p>
              </div>
              {donation.cfOrderId && (
                <div>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-wider">Cashfree Reference ID</p>
                  <p className="font-black text-black mt-1 bg-zinc-100 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000] truncate print-accent">
                    {donation.cfOrderId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security note & Footnote */}
          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-[#00AA44] stroke-[2.5] shrink-0" />
              <div className="text-[10px] font-semibold text-zinc-700 leading-relaxed">
                <span className="font-black uppercase text-black">100% Secured Payment Gateway Audit</span><br />
                Cleared securely via Cashfree SSL/TLS encryption. All funds directly contribute to student hackathons.
              </div>
            </div>
            <div className="text-right text-[9px] text-zinc-600 font-black uppercase tracking-wider">
              Issued By: MLSC SVEC Admin Team<br />
              Tirupati, AP, India
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
