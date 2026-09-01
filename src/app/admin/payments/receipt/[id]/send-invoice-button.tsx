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
      className={`inline-flex items-center gap-2 px-4 h-10 border-2 border-black text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000] cursor-pointer no-print ${
        status === 'success'
          ? 'bg-[#00FF66] text-black'
          : status === 'error'
          ? 'bg-[#FF0055] text-white'
          : 'bg-[#FFE600] text-black hover:bg-[#FFE600]/90'
      }`}
      title={`Send tax invoice email to ${recipientEmail}`}
    >
      {status === 'sending' ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-black" />
          Sending...
        </>
      ) : status === 'success' ? (
        <>
          <Check className="h-4 w-4 text-black stroke-[3]" />
          Invoice Sent!
        </>
      ) : status === 'error' ? (
        <>
          <span>{errorMsg || 'Failed'}</span>
        </>
      ) : (
        <>
          <Mail className="h-4 w-4 stroke-[2.5]" />
          Email Receipt
        </>
      )}
    </button>
  );
}
