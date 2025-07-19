import type {Metadata} from 'next';
import './globals.css';
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'MLSC 3.0 Hiring Program',
  description: 'Apply for the MLSC 3.0 Hiring Program. Join the Microsoft Learn Student Club and start your journey in tech. We are looking for passionate students for various technical and non-technical roles.',
  keywords: ['MLSC 3.0', 'MLSC 3.0 Hiring Program','MLSC Hiring', 'Microsoft Learn Student Club', 'student club hiring', 'tech roles', 'SVEC'],
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head />
      <body className={cn('font-body antialiased', inter.variable)}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
