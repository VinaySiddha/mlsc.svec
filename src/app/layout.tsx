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
  title: 'MLSC 3.0 Hiring Program X SVEC',
  description: 'Apply for MLSC 3.0 at SVEC and kickstart your journey in tech. Join Microsoft Learn Student Club for technical and non-technical roles.',
  keywords: [
    'MLSC 3.0',
    'MLSC SVEC',
    'MLSC 3.0 Hiring Program',
    'Microsoft Learn Student Club',
    'MLSC Hiring 2025',
    'student club hiring',
    'tech roles SVEC',
    'non-tech roles SVEC',
    'SVEC student opportunities',
    'Sri Vasavi Engineering College',
   
  ],
  openGraph: {
    title: 'MLSC 3.0 Hiring Program X SVEC',
    description: 'We are hiring passionate students for technical and non-technical roles at MLSC SVEC. Apply now!',
    url: 'https://mlscsvec.in',
    siteName: 'MLSC SVEC',
    images: [
      {
        url: 'https://mlscsvec.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'MLSC SVEC Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
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
        <meta property="og:title" content="MLSC 3.0 Hiring Program X SVEC" />
        <meta property="og:site_name" content="MLSC SVEC" />
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
