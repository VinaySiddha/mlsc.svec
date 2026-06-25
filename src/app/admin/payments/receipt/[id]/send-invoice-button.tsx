"use client";

import React, { useState } from 'react';
import { Mail, Loader2, Check } from 'lucide-react';
import { resendDonationInvoiceAction } from '@/app/actions/cashfree-actions';

interface SendInvoiceButtonProps {
  donationId: string;
  recipientEmail: string;
}

export function SendInvoiceButton({ donationId, recipientEmail }: SendInvoiceButtonProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSend = async () => {
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await resendDonationInvoiceAction(donationId);
      if (res.success) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3500);
      } else {
        setStatus('error');
        setErrorMsg(res.error || 'Failed to send');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <button 
      onClick={handleSend}
      disabled={status === 'sending'}
      className={`inline-flex items-center gap-2 px-4 h-10 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm no-print ${
        status === 'success'
          ? 'bg-[#34A853]/10 border-[#34A853]/35 text-[#34A853]'
          : status === 'error'
          ? 'bg-red-500/10 border-red-500/30 text-red-500'
          : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
      }`}
      title={`Send tax invoice email to ${recipientEmail}`}
    >
      {status === 'sending' ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-[#34A853]" />
          Sending...
        </>
      ) : status === 'success' ? (
        <>
          <Check className="h-4 w-4 text-[#34A853]" />
          Invoice Sent!
        </>
      ) : status === 'error' ? (
        <>
          <Mail className="h-4 w-4 text-red-500" />
          {errorMsg || 'Error'}
        </>
      ) : (
        <>
          <Mail className="h-4 w-4 text-[#34A853]" />
          Send Invoice Email
        </>
      )}
    </button>
  );
}
