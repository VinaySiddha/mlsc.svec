
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import Script from 'next/script';
import { ContentProtection } from '@/components/content-protection';
import { EntryWarningPopup } from '@/components/entry-warning-popup';
import Link from 'next/link';
import { FirebaseClientProvider } from '@/firebase';
import AuthButton from '@/components/auth-button';

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
    <html lang="en" suppressHydrationWarning>
    <head>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4523569844866132"
     crossOrigin="anonymous"></script>
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

      <body className={cn('font-sans antialiased')}>
        <FirebaseClientProvider>
          <ContentProtection />
          <EntryWarningPopup />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-background/60 backdrop-blur-sm border-t border-border/50 py-6">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
                <div className="flex justify-center gap-4 mb-2">
                   <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                   <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link>
                </div>
                <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
            </div>
        </footer>
          <Toaster />
        </FirebaseClientProvider>
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
