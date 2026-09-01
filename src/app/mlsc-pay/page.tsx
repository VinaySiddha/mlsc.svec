import React, { Suspense } from 'react';
import { MLSCPayClient } from './mlsc-pay-client';

export const metadata = {
  title: 'MLSC Pay - Official Payment Portal | MLSC SVEC',
  description: 'A secure, brutalist payment gateway for the Microsoft Learn Student Club SVEC.',
};

export default function MLSCPayPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black font-sans">
        <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] max-w-sm w-full text-center space-y-4">
          <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin" />
          <span className="text-xs text-black uppercase tracking-widest font-black">Loading Secure Checkout...</span>
        </div>
      </div>
    }>
      <MLSCPayClient />
    </Suspense>
  );
}
