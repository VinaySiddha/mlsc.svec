import React from 'react';
import { MLSCPayClient } from './mlsc-pay-client';

export const metadata = {
  title: 'MLSC Pay - Custom Payment Gateway | MLSC SVEC',
  description: 'A secure, custom payment gateway integration built with Next.js for the Microsoft Learn Student Club SVEC.',
};

export default function MLSCPayPage() {
  return <MLSCPayClient />;
}
