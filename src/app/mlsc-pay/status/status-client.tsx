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
import { Button } from '@/components/ui/button';

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

  const downloadReceipt = (paymentData: PaymentRecord) => {
    try {
      const doc = new jsPDF();
      const primaryColor: [number, number, number] = [0, 0, 0];

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('MICROSOFT LEARN STUDENT CLUB', 15, 20);
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.text('SVEC Campus - Chapter 4 Payment Receipt', 15, 28);

      doc.setFillColor(255, 230, 0); // #FFE600
      doc.rect(145, 12, 50, 18, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('RECEIPT', 150, 20);
      doc.setFontSize(8);
      doc.text(paymentData.status.toUpperCase(), 150, 26);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(`Receipt Date: ${new Date().toLocaleDateString('en-IN')}`, 15, 50);
      doc.text(`Order ID: ${paymentData.orderId}`, 15, 56);
      if (paymentData.transactionId) {
        doc.text(`Transaction ID: ${paymentData.transactionId}`, 15, 62);
      } else if (paymentData.utr) {
        doc.text(`UTR / Reference: ${paymentData.utr}`, 15, 62);
      }

      doc.setFont('Helvetica', 'bold');
      doc.text('Billed To:', 15, 75);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Name: ${paymentData.customerName}`, 15, 81);
      doc.text(`Email: ${paymentData.customerEmail}`, 15, 87);
      doc.text(`Phone: ${paymentData.customerPhone}`, 15, 93);

      const baseAmount = paymentData.amount;
      autoTable(doc, {
        startY: 105,
        head: [['Billing Item', 'Description', 'Amount (INR)']],
        body: [
          [paymentData.purpose, 'Base charge for MLSC SVEC program / event', `Rs. ${baseAmount.toFixed(2)}`],
          ['Net Amount Paid', 'Successful billing authorization', `INR ${baseAmount.toFixed(2)}`]
        ],
        theme: 'plain',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 65 },
          1: { cellWidth: 95 },
          2: { halign: 'right', fontStyle: 'bold', cellWidth: 30 }
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(15, finalY, 195, finalY);

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('This receipt is electronically generated and digitally signed.', 15, finalY + 8);
      doc.text('Authorization: Verified & approved by MLSC Accounts Administration', 15, finalY + 13);
      doc.text('Thank you for supporting the MLSC SVEC community!', 15, finalY + 18);

      doc.save(`MLSC_Receipt_${paymentData.orderId}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen py-16 md:py-24 text-black font-sans selection:bg-[#FFE600] selection:text-black flex items-center justify-center">
      <div className="w-full max-w-lg px-4 md:px-6 space-y-6">
        
        {/* Top Banner */}
        <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center shadow-[3px_3px_0px_0px_#000000]">
          ⚡ Transaction Telemetry Verification
        </div>

        {loading && (
          <div className="border-2 border-black bg-white p-8 text-center space-y-4 shadow-[8px_8px_0px_0px_#000000]">
            <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-black">Verifying Gateway Ledger</h3>
              <p className="text-xs text-zinc-600 font-bold">
                Querying payment session from payment processor...
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="border-2 border-black bg-white p-8 text-center space-y-6 shadow-[8px_8px_0px_0px_#000000]">
            <div className="p-4 bg-[#EA4335] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000000] inline-block">
              <XCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight text-black">Verification Failed</h2>
              <p className="text-zinc-600 text-xs font-bold leading-relaxed max-w-sm mx-auto">
                {error}
              </p>
            </div>
            <Button asChild className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 px-6 shadow-[3px_3px_0px_0px_#000000]">
              <Link href="/mlsc-pay">
                <ArrowLeft className="h-4 w-4 mr-2" /> Return to Gateway
              </Link>
            </Button>
          </div>
        )}

        {!loading && !error && payment && (
          <div className="border-2 border-black bg-white p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_0px_#000000]">
            
            <div className="text-center space-y-4">
              {payment.status === 'PAID' && (
                <div className="p-4 bg-[#00FF66] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-black inline-block">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              )}
              {payment.status === 'PENDING_APPROVAL' && (
                <div className="p-4 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-black inline-block">
                  <Clock className="h-10 w-10" />
                </div>
              )}
              {payment.status === 'FAILED' && (
                <div className="p-4 bg-[#EA4335] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-white inline-block">
                  <XCircle className="h-10 w-10" />
                </div>
              )}
              {payment.status === 'PENDING' && (
                <div className="p-4 bg-zinc-200 border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-black inline-block">
                  <AlertCircle className="h-10 w-10" />
                </div>
              )}

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 border border-black bg-[#FFE600] text-black text-xs font-black uppercase tracking-wider">
                  {payment.status === 'PAID' && 'Payment Verified & Confirmed'}
                  {payment.status === 'PENDING_APPROVAL' && 'Awaiting Admin Verification'}
                  {payment.status === 'FAILED' && 'Payment Transaction Failed'}
                  {payment.status === 'PENDING' && 'Payment Incomplete'}
                </span>

                <div className="pt-2">
                  <h2 className="text-3xl font-black text-black font-mono">
                    ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h2>
                  <p className="text-zinc-600 text-xs font-bold uppercase mt-1">
                    {payment.purpose}
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt Breakdown Box */}
            <div className="border-2 border-black bg-zinc-50 p-4 space-y-2.5 text-xs font-mono shadow-[2px_2px_0px_0px_#000000]">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <span className="font-sans font-bold text-zinc-600">Order Reference:</span>
                <button 
                  onClick={copyOrderIdToClipboard}
                  className="font-bold text-black hover:text-[#4285F4] flex items-center gap-1.5"
                >
                  {payment.orderId.length > 18 ? `${payment.orderId.substring(0, 16)}...` : payment.orderId}
                  {copiedOrderId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {payment.transactionId && (
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <span className="font-sans font-bold text-zinc-600">Transaction ID:</span>
                  <span className="text-black font-bold">{payment.transactionId}</span>
                </div>
              )}

              {payment.utr && (
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <span className="font-sans font-bold text-zinc-600">UTR Reference:</span>
                  <span className="text-black font-bold">{payment.utr}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-black pb-2">
                <span className="font-sans font-bold text-zinc-600">Billed Name:</span>
                <span className="text-black font-bold">{payment.customerName}</span>
              </div>

              <div className="flex items-center justify-between border-b border-black pb-2">
                <span className="font-sans font-bold text-zinc-600">Email:</span>
                <span className="text-black font-bold truncate max-w-[200px]">{payment.customerEmail}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-zinc-600">Timestamp:</span>
                <span className="text-black font-bold">
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

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {payment.status === 'PAID' && (
                <Button 
                  onClick={() => downloadReceipt(payment)}
                  className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <Download className="h-4 w-4 mr-2" /> Download Official PDF Receipt
                </Button>
              )}

              {payment.status === 'PENDING_APPROVAL' && (
                <Button 
                  onClick={() => downloadReceipt(payment)}
                  className="w-full bg-white hover:bg-zinc-100 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <Download className="h-4 w-4 mr-2" /> Download Submitted Receipt
                </Button>
              )}

              <Button asChild variant="outline" className="w-full bg-white hover:bg-zinc-100 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[2px_2px_0px_0px_#000000]">
                <Link href="/">Return to Dashboard ({countdown}s)</Link>
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
