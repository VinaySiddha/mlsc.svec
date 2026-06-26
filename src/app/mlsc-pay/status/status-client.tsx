'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCcw, 
  Download, 
  ArrowLeft, 
  Clock,
  Mail,
  Phone,
  User,
  Calendar,
  CreditCard,
  Hash,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { verifyMLSCPaymentAction } from '@/app/actions/mlsc-pay-actions';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StatusClientProps {
  orderId?: string;
}

interface PaymentRecord {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purpose: string;
  status: 'PENDING' | 'PENDING_APPROVAL' | 'PAID' | 'REFUNDED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  transactionId?: string;
  paymentMethod?: string;
  utr?: string;
  rejectionReason?: string;
  type?: 'donation' | 'event';
  eventId?: string;
}

export function StatusClient({ orderId }: StatusClientProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided. Cannot verify payment status.');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await verifyMLSCPaymentAction(orderId);
        if (res.success && res.payment) {
          setPayment(res.payment as PaymentRecord);
        } else {
          setError(res.error || 'Failed to verify payment status.');
        }
      } catch (err: any) {
        console.error('Error verifying payment:', err);
        setError(err.message || 'An unexpected error occurred during verification.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  const copyOrderIdToClipboard = () => {
    if (!payment?.orderId) return;
    navigator.clipboard.writeText(payment.orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  // Generate and download PDF receipt
  const downloadReceipt = (paymentData: PaymentRecord) => {
    try {
      const doc = new jsPDF();
      const primaryColor: [number, number, number] = [34, 97, 219]; // Razorpay blue rgb(34, 97, 219)
      const secondaryColor: [number, number, number] = [15, 23, 42]; // Slate 900 rgb(15, 23, 42)

      // Add receipt banner design
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('MICROSOFT LEARN STUDENT CLUB', 15, 20);
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.text('SVEC Campus - Student Developer Network', 15, 28);

      // Receipt Tag
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(150, 12, 45, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PAYMENT RECEIPT', 153, 19);
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.text(paymentData.status.toUpperCase(), 153, 25);

      // Meta Info
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.text(`Receipt Date: ${new Date().toLocaleDateString('en-IN')}`, 15, 50);
      doc.text(`Order ID: ${paymentData.orderId}`, 15, 56);
      if (paymentData.transactionId) {
        doc.text(`Transaction ID: ${paymentData.transactionId}`, 15, 62);
      } else if (paymentData.utr) {
        doc.text(`UTR / Reference: ${paymentData.utr}`, 15, 62);
      }

      // Customer Details Section
      doc.setFont('Helvetica', 'bold');
      doc.text('Billed To:', 15, 75);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Name: ${paymentData.customerName}`, 15, 81);
      doc.text(`Email: ${paymentData.customerEmail}`, 15, 87);
      doc.text(`Phone: ${paymentData.customerPhone}`, 15, 93);

      // Table mapping details
      const baseAmount = paymentData.amount;
      autoTable(doc, {
        startY: 105,
        head: [['Billing Item', 'Description', 'Amount (INR)']],
        body: [
          [paymentData.purpose, 'Base charge for MLSC SVEC program / event', `₹${baseAmount.toFixed(2)}`],
          ['Net Amount Paid', 'Successful billing authorization', `INR ${baseAmount.toFixed(2)}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 65 },
          1: { cellWidth: 95 },
          2: { halign: 'right', fontStyle: 'bold', cellWidth: 30 }
        }
      });

      // Authorization details footer
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setDrawColor(220, 220, 220);
      doc.line(15, finalY, 195, finalY);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('This receipt is electronically generated and digitally signed.', 15, finalY + 8);
      doc.text('Authorization: Verified & approved by MLSC Accounts Administration', 15, finalY + 13);
      doc.text('Thank you for supporting the MLSC SVEC community!', 15, finalY + 18);

      doc.save(`MLSC_Receipt_${paymentData.orderId}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  return (
    <div className="w-full bg-[#f4f6f8] min-h-screen py-16 md:py-24 text-slate-800 flex items-center justify-center font-sans antialiased">
      {/* Light aesthetic visual accents */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-[#e2e8f0] to-[#f4f6f8] -z-10" />

      <div className="w-full max-w-lg px-4 md:px-6">
        
        {loading && (
          /* Loading Screen */
          <div className="bg-white rounded-2xl p-8 text-center space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
            <div className="flex justify-center pt-4">
              <RefreshCcw className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <div className="space-y-2 pb-4">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Verifying Payment Status</h3>
              <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                Connecting to secure ledgers and verifying transaction details. Please do not close this page.
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          /* Error Screen */
          <div className="bg-white rounded-2xl p-8 text-center space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <XCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Verification Failed</h2>
              <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                {error}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-center">
              <Link
                href="/mlsc-pay"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-100"
              >
                <ArrowLeft className="h-4 w-4" /> Return to Gateway
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && payment && (
          /* Payment Status Cards */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Razorpay Success / Pending / Failed Card Layout */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              
              {/* Decorative top colored border based on status */}
              {payment.status === 'PAID' && <div className="h-2 w-full bg-emerald-500" />}
              {payment.status === 'PENDING_APPROVAL' && <div className="h-2 w-full bg-amber-500" />}
              {payment.status === 'FAILED' && <div className="h-2 w-full bg-red-500" />}
              {payment.status === 'PENDING' && <div className="h-2 w-full bg-slate-400" />}

              <div className="p-6 md:p-8 space-y-6 text-center">
                
                {/* Status Indicator Icon */}
                {payment.status === 'PAID' && (
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                )}
                {payment.status === 'PENDING_APPROVAL' && (
                  <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Clock className="h-10 w-10 animate-pulse" />
                  </div>
                )}
                {payment.status === 'FAILED' && (
                  <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                    <XCircle className="h-10 w-10" />
                  </div>
                )}
                {payment.status === 'PENDING' && (
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <AlertCircle className="h-10 w-10" />
                  </div>
                )}

                {/* Status Heading */}
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                    ${payment.status === 'PAID' && 'bg-emerald-50 text-emerald-700 border border-emerald-100'}
                    ${payment.status === 'PENDING_APPROVAL' && 'bg-amber-50 text-amber-700 border border-amber-100'}
                    ${payment.status === 'FAILED' && 'bg-red-50 text-red-700 border border-red-100'}
                    ${payment.status === 'PENDING' && 'bg-slate-50 text-slate-600 border border-slate-100'}
                  `}>
                    {payment.status === 'PAID' && 'Payment Successful'}
                    {payment.status === 'PENDING_APPROVAL' && 'Pending Verification'}
                    {payment.status === 'FAILED' && 'Payment Failed'}
                    {payment.status === 'PENDING' && 'Payment Unfinished'}
                  </span>
                  
                  <div className="pt-4">
                    <h2 className="text-3xl font-extrabold text-slate-800">
                      ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-slate-400 text-xs font-medium mt-1">
                      {payment.purpose}
                    </p>
                  </div>
                </div>

                {/* Details list inside card */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-left space-y-3.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 border-b border-slate-200/60 pb-2">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Hash className="h-3.5 w-3.5" /> Order ID
                    </span>
                    <button 
                      onClick={copyOrderIdToClipboard}
                      className="font-mono text-slate-800 font-bold hover:text-blue-600 flex items-center gap-1.5 transition-colors group"
                      title="Click to copy"
                    >
                      {payment.orderId.length > 20 ? `${payment.orderId.substring(0, 18)}...` : payment.orderId}
                      {copiedOrderId ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 animate-scale" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600" />
                      )}
                    </button>
                  </div>

                  {payment.transactionId && (
                    <div className="flex items-center justify-between text-slate-600 border-b border-slate-200/60 pb-2">
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <CreditCard className="h-3.5 w-3.5" /> Transaction ID
                      </span>
                      <span className="font-mono text-slate-800 font-semibold">{payment.transactionId}</span>
                    </div>
                  )}

                  {payment.utr && (
                    <div className="flex items-center justify-between text-slate-600 border-b border-slate-200/60 pb-2">
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <Hash className="h-3.5 w-3.5" /> UTR / Reference
                      </span>
                      <span className="font-mono text-slate-800 font-semibold">{payment.utr}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600 border-b border-slate-200/60 pb-2">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <User className="h-3.5 w-3.5" /> Billed To
                    </span>
                    <span className="text-slate-800 font-semibold">{payment.customerName}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 border-b border-slate-200/60 pb-2">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </span>
                    <span className="text-slate-800 font-semibold truncate max-w-[220px]" title={payment.customerEmail}>
                      {payment.customerEmail}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 border-b border-slate-200/60 pb-2">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </span>
                    <span className="text-slate-800 font-semibold">{payment.customerPhone}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 pb-0">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Calendar className="h-3.5 w-3.5" /> Date & Time
                    </span>
                    <span className="text-slate-800 font-semibold">
                      {new Date(payment.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Pending approval informative banner */}
                {payment.status === 'PENDING_APPROVAL' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-left flex gap-3 text-xs text-amber-800">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold">Awaiting Admin Verification</span>
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        We have successfully logged your offline bank/UPI payment with reference/UTR <strong className="font-mono">{payment.utr}</strong>. 
                        Once our accounts administrator validates this credit on our statements, you will receive a confirmation email with tickets and receipts.
                      </p>
                    </div>
                  </div>
                )}

                {/* Failed reason banner */}
                {payment.status === 'FAILED' && payment.rejectionReason && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-left flex gap-3 text-xs text-red-800">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold">Verification Unsuccessful</span>
                      <p className="text-[11px] text-red-700 leading-relaxed">
                        {payment.rejectionReason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions Grid */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  {payment.status === 'PAID' && (
                    <button 
                      onClick={() => downloadReceipt(payment)}
                      className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-100"
                    >
                      <Download className="h-4 w-4" /> Download PDF Receipt
                    </button>
                  )}
                  
                  {payment.status === 'PENDING_APPROVAL' && (
                    <button 
                      onClick={() => downloadReceipt(payment)}
                      className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
                    >
                      <Download className="h-4 w-4" /> Download Submitted Receipt
                    </button>
                  )}

                  {payment.status === 'FAILED' ? (
                    <Link 
                      href="/mlsc-pay"
                      className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-100"
                    >
                      Try Payment Again
                    </Link>
                  ) : (
                    <Link 
                      href="/"
                      className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
                    >
                      Return to Club Portal
                    </Link>
                  )}
                </div>

              </div>
            </div>

            {/* Countdown Redirection Banner */}
            {!loading && (
              <div className="text-center bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 text-xs text-slate-500 font-semibold shadow-sm">
                Auto-redirecting to club website in <span className="text-blue-600 font-bold">{countdown}s</span>...
              </div>
            )}

            {/* Clean Footer / Support Section */}
            <div className="text-center text-[11px] text-slate-400 font-medium space-y-1">
              <p>Secure payment powered by MLSC Pay Platform.</p>
              <p>For any queries or transaction disputes, please email <a href="mailto:vinaysiddha19@gmail.com" className="text-blue-500 hover:underline">vinaysiddha19@gmail.com</a></p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
