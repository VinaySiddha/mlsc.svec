
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@/lib/utils';
import Script from 'next/script';

// Inter — the industry-standard clean modern font. Used by Vercel, Linear, Notion, GitHub.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

// Google Sans — Premium Google brand typography
const googleSans = localFont({
  src: [
    {
      path: '../../public/fonts/GoogleSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSans-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/GoogleSans-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSans-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/GoogleSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSans-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-google-sans',
  display: 'swap',
});

// Google Sans Text — Optimized for reading and UI text
const googleSansText = localFont({
  src: [
    {
      path: '../../public/fonts/GoogleSansText-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSansText-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/GoogleSansText-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSansText-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/GoogleSansText-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSansText-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-google-sans-text',
  display: 'swap',
});


import { CelebrationPopup } from '@/components/celebration-popup';
import { Providers } from '@/components/providers';
import { HeaderWrapper } from '@/components/header-wrapper';
import { FooterWrapper } from '@/components/footer-wrapper';
import { KiriBot } from '@/components/kiri-bot';
import { TicketFloatingButton } from '@/components/ticket-floating-button';


export const metadata: Metadata = {
  metadataBase: new URL('https://mlscsvec.in'),
  title: 'MLSC X SVEC',
  description: "Welcome to the official site of Microsoft Learn Student Club SVEC — a vibrant community of student innovators, tech enthusiasts, and future leaders from Sri Vasavi Engineering College (SVEC)",
  alternates: {
    canonical: 'https://mlscsvec.in',
  },
  keywords: [
    'MLSC 4.0',
    'MLSC SVEC',
    'MLSC 4.0 Hiring Program',
    'Microsoft Learn Student Club',
    'MLSC Hiring 2026',
    'student club hiring',
    'tech roles SVEC',
    'non-tech roles SVEC',
    'SVEC student opportunities',
    'Sri Vasavi Engineering College',
   
  ],
  openGraph: {
    title: 'MLSC X SVEC',
    description: "Welcome to the official site of Microsoft Learn Student Club SVEC — a vibrant community of student innovators, tech enthusiasts, and future leaders from Sri Vasavi Engineering College (SVEC)",
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
  other: {
    'google-adsense-account': 'ca-pub-4523569844866132',
    'og:title': 'MLSC 3.0 Hiring Program X SVEC',
    'og:site_name': 'MLSC SVEC',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn('antialiased', inter.variable, googleSans.variable, googleSansText.variable)}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "MLSC X SVEC",
              "url": "https://mlscsvec.in",
              "department": [
                {
                  "@type": "WebPage",
                  "name": "Home",
                  "url": "https://mlscsvec.in/"
                },
                {
                  "@type": "WebPage",
                  "name": "About",
                  "url": "https://mlscsvec.in/about"
                },
                {
                  "@type": "WebPage",
                  "name": "Team",
                  "url": "https://mlscsvec.in/team"
                },
                {
                  "@type": "WebPage",
                  "name": "Events",
                  "url": "https://mlscsvec.in/events"
                },
                {
                  "@type": "WebPage",
                  "name": "Blog",
                  "url": "https://mlscsvec.in/blog"
                },
                {
                  "@type": "WebPage",
                  "name": "Projects",
                  "url": "https://mlscsvec.in/projects"
                },
              ]
            })
          }}
        />
        <Providers>
          <div className="w-full min-h-screen flex flex-col relative">
            <HeaderWrapper />
            <CelebrationPopup />
            <main className="flex-1 bg-black">{children}</main>
            <FooterWrapper />
            <KiriBot />
            <TicketFloatingButton />
          </div>
        </Providers>
        <Toaster />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4523569844866132"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-N2QXBXX4J4" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-N2QXBXX4J4');
          `}
        </Script>
      </body>
    </html>
  );
}
