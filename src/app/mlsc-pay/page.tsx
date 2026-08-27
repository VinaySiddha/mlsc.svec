import React, { Suspense } from 'react';
import { MLSCPayClient } from './mlsc-pay-client';

export const metadata = {
  title: 'MLSC Pay - Custom Payment Gateway | MLSC SVEC',
  description: 'A secure, custom payment gateway integration built with Next.js for the Microsoft Learn Student Club SVEC.',
};

export default function MLSCPayPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4f6f8] text-slate-850 font-sans">
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-4">Loading Secure Checkout...</span>
        </div>
      </div>
    }>
      <MLSCPayClient />
    </Suspense>
  );
}
