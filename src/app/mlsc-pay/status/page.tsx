import React from 'react';
import { StatusClient } from './status-client';

export const metadata = {
  title: 'Payment Status - MLSC Pay | MLSC SVEC',
  description: 'Verify your custom payment gateway transaction status.',
};

interface PageProps {
  searchParams: Promise<{ order_id?: string }> | { order_id?: string };
}

export default async function MLSCPayStatusPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15+ to maintain forward compatibility, supporting sync object fallback
  const resolvedParams = await searchParams;
  const orderId = resolvedParams?.order_id;
  
  return <StatusClient orderId={orderId} />;
}
