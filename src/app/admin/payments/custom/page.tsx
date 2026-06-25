import React, { Suspense } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PaymentsDashboard } from '../payments-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminCustomPaymentsPage() {
  // Fetch all donations from Firestore to keep data context intact
  let donations: any[] = [];
  try {
    const donationsSnap = await getDocs(collection(db, 'donations'));
    donationsSnap.forEach(doc => {
      donations.push({ id: doc.id, ...doc.data() });
    });
  } catch (err) {
    console.error('Error fetching donations for admin custom payments page:', err);
  }

  // Clean and serialize data for the client component
  const serializedDonations = donations.map(don => {
    return {
      id: don.id,
      amount: don.amount || 0,
      currency: don.currency || 'INR',
      customerName: don.customerName || 'Anonymous Sponsor',
      customerEmail: don.customerEmail || '',
      customerPhone: don.customerPhone || '',
      status: don.status || 'PENDING',
      createdAt: don.createdAt || '',
      isMock: !!don.isMock,
      orderId: don.orderId || '',
      cfOrderId: don.cfOrderId || '',
      cfStatusData: don.cfStatusData || null
    };
  });

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={
        <div className="flex h-[450px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800/80 bg-white/5 backdrop-blur-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 animate-pulse uppercase tracking-wider">
            Loading Custom Payment Configurer...
          </p>
        </div>
      }>
        <PaymentsDashboard initialDonations={serializedDonations} view="custom-links" />
      </Suspense>
    </div>
  );
}
