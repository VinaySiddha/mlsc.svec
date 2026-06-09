
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import Script from 'next/script';

// Inter — the industry-standard clean modern font. Used by Vercel, Linear, Notion, GitHub.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});


import { CelebrationPopup } from '@/components/celebration-popup';
import { Providers } from '@/components/providers';
import { HeaderWrapper } from '@/components/header-wrapper';
import { SiteFooter } from '@/components/site-footer';
import { KiriBot } from '@/components/kiri-bot';


export const metadata: Metadata = {
  metadataBase: new URL('https://mlscsvec.in'),
  title: 'MLSC X SVEC',
  description: "Welcome to the official site of Microsoft Learn Student Club SVEC — a vibrant community of student innovators, tech enthusiasts, and future leaders from Sri Vasavi Engineering College (SVEC)",
  alternates: {
    canonical: 'https://mlscsvec.in',
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
    <head>
      <meta property="og:title" content="MLSC 3.0 Hiring Program X SVEC" />
      <meta property="og:site_name" content="MLSC SVEC" />
      <meta name="google-adsense-account" content="ca-pub-4523569844866132"></meta>
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
    </head>

      <body className={cn('antialiased', inter.variable)}>
        <Providers>
        <HeaderWrapper />
        <CelebrationPopup />
        <main className="min-h-screen bg-black">{children}</main>
        <SiteFooter />
        <KiriBot />
        </Providers>
        <Toaster />
        <Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4523569844866132" strategy="lazyOnload" crossOrigin="anonymous" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-E51L2CC5ZZ" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
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
