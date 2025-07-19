import type {Metadata} from 'next';
import './globals.css';
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-body' 
})

export const metadata: Metadata = {
  title: 'Microsoft Learn Student Club | SVEC',
  description: 'Apply for the MLSC 3.0 Hiring Program at SVEC. Join the Microsoft Learn Student Club and start your journey in tech. We are looking for passionate students for various technical and non-technical roles.',
  keywords: ['MLSC 3.0','MLSC SVEC','mlsc svec', 'MLSC 3.0 Hiring Program','MLSC Hiring', 'Microsoft Learn Student Club', 'student club hiring', 'tech roles', 'non-tech roles', 'SVEC', 'student jobs'],
  openGraph: {
    title: 'MLSC 3.0 Hiring Program | Apply Now!',
    description: 'Join the Microsoft Learn Student Club at SVEC. We are looking for passionate students for technical and non-technical roles.',
    url: 'https://mlscsvec.in',
    siteName: 'MLSC 3.0 Hiring Program',
    images: [
      {
        url: 'https://mlscsvec.in/logo.png',
        width: 800,
        height: 600,
        alt: 'MLSC Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
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
      <head>
        <meta name="google-adsense-account" content="ca-pub-3162461325924366"></meta>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4523569844866132" crossOrigin="anonymous"></script>
        </head>
      <body className={cn('font-body antialiased', inter.variable)}>
        <main>{children}</main>
        <Toaster />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-E51L2CC5ZZ"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', 'G-E51L2CC5ZZ');
          `}
        </Script>
      </body>
    </html>
  );
}
