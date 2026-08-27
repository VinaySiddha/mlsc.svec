import type { Metadata } from 'next';
import './globals.css';

import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@/lib/utils';
import Script from 'next/script';

import { CelebrationPopup } from '@/components/celebration-popup';
import { Providers } from '@/components/providers';
import { HeaderWrapper } from '@/components/header-wrapper';
import { FooterWrapper } from '@/components/footer-wrapper';
import { KiriBot } from '@/components/kiri-bot';
import { TicketFloatingButton } from '@/components/ticket-floating-button';
import { NavigationLoader } from '@/components/navigation-loader';
import { Suspense } from 'react';

/* =========================================================
   FONTS
========================================================= */

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const googleSans = localFont({
  src: [
    {
      path: '../../public/fonts/GoogleSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSans-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/GoogleSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSans-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/GoogleSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSans-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-google-sans',
  display: 'swap',
});

const googleSansText = localFont({
  src: [
    {
      path: '../../public/fonts/GoogleSansText-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSansText-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/GoogleSansText-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSansText-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/GoogleSansText-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GoogleSansText-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-google-sans-text',
  display: 'swap',
});

/* =========================================================
   SEO / METADATA
========================================================= */

export const metadata: Metadata = {
  metadataBase: new URL('https://mlscsvec.com'),

  title: {
    default: 'MLSC X SVEC — Where Curiosity Becomes Capability',
    template: '%s | MLSC X SVEC',
  },

  description:
    'MLSC X SVEC is a student-led technology community where curious minds learn, build, collaborate, and create solutions for the world beyond the classroom.',

  applicationName: 'MLSC X SVEC',

  authors: [
    {
      name: 'Microsoft Learn Student Club SVEC',
    },
  ],

  creator: 'MLSC X SVEC',
  publisher: 'MLSC X SVEC',

  keywords: [
    'MLSC SVEC',
    'MLSC X SVEC',
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
    // 'Microsoft Learn Student Club',
    'Microsoft Learn Student Club SVEC',
    'student technology community',
    'student developers',
    'student innovators',
    'student builders',
    'technology community SVEC',
    'hackathons SVEC',
    'technical events SVEC',
    'student projects',
    'Microsoft student community',
    'Sri Vasavi Engineering College',
    'SVEC',
    'student opportunities',
    'technology events',
    'coding community',
    'AI community',
    'developer community',
  ],

  alternates: {
    canonical: 'https://mlscsvec.com',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  openGraph: {
    title: 'MLSC X SVEC — Where Curiosity Becomes Capability',

    description:
      'A student-led technology community turning curiosity into skills, ideas into projects, and students into builders.',

    url: 'https://mlscsvec.com',

    siteName: 'MLSC X SVEC',

    images: [
      {
        url: 'https://mlscsvec.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'MLSC X SVEC — Where Curiosity Becomes Capability',
      },
    ],

    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'MLSC X SVEC — Where Curiosity Becomes Capability',
    description:
      'Learn. Build. Collaborate. Create what comes next with MLSC X SVEC.',
    images: ['https://mlscsvec.com/logo.png'],
  },

  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },

  other: {
    'google-adsense-account': 'ca-pub-4523569844866132',
  },
};

/* =========================================================
   ROOT LAYOUT
========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={cn(
          'antialiased',
          inter.variable,
          googleSans.variable,
          googleSansText.variable
        )}
      >
        {/* =====================================================
            STRUCTURED DATA
        ===================================================== */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',

              '@type': 'Organization',

              name: 'MLSC X SVEC',

              alternateName:
                'Microsoft Learn Student Club - Sri Vasavi Engineering College',

              url: 'https://mlscsvec.com',

              description:
                'A student-led technology community where curious minds learn, build, collaborate, and create solutions for the world beyond the classroom.',

              slogan: 'Where Curiosity Becomes Capability.',

              brand: {
                '@type': 'Brand',
                name: 'MLSC X SVEC',
              },

              department: [
                {
                  '@type': 'WebPage',
                  name: 'Home',
                  description:
                    'Discover MLSC X SVEC and the student technology community.',
                  url: 'https://mlscsvec.com/',
                },

                {
                  '@type': 'WebPage',
                  name: 'About',
                  description:
                    'Learn about the vision, community, and mission of MLSC X SVEC.',
                  url: 'https://mlscsvec.com/about',
                },

                {
                  '@type': 'WebPage',
                  name: 'Team',
                  description:
                    'Meet the students building and leading MLSC X SVEC.',
                  url: 'https://mlscsvec.com/team',
                },

                {
                  '@type': 'WebPage',
                  name: 'Events',
                  description:
                    'Explore workshops, hackathons, technical sessions, and community events.',
                  url: 'https://mlscsvec.com/events',
                },

                {
                  '@type': 'WebPage',
                  name: 'Blog',
                  description:
                    'Stories, insights, technical knowledge, and experiences from the community.',
                  url: 'https://mlscsvec.com/blog',
                },

                {
                  '@type': 'WebPage',
                  name: 'Projects',
                  description:
                    'Explore projects and ideas built by MLSC X SVEC members.',
                  url: 'https://mlscsvec.com/projects',
                },
              ],
            }),
          }}
        />

        {/* =====================================================
            APPLICATION
        ===================================================== */}

        <Providers>
          <div className="w-full min-h-screen flex flex-col relative">
            
            {/* Navigation */}
            <HeaderWrapper />

            {/* Announcements / Celebrations */}
            <CelebrationPopup />

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="flex-1 bg-black">
              {children}
            </main>

            {/* =================================================
                FOOTER
            ================================================= */}

            <FooterWrapper />

            {/* =================================================
                FLOATING COMPONENTS
            ================================================= */}

            <KiriBot />

            <TicketFloatingButton />

            {/* Global Route Transition iOS Loader */}
            <Suspense fallback={null}>
              <NavigationLoader />
            </Suspense>
          </div>
        </Providers>

        {/* Toast Notifications */}
        <Toaster />

        {/* =====================================================
            GOOGLE ADSENSE
        ===================================================== */}

        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4523569844866132"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* =====================================================
            GOOGLE ANALYTICS
        ===================================================== */}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N2QXBXX4J4"
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              dataLayer.push(arguments);
            }

            gtag('js', new Date());

            gtag('config', 'G-N2QXBXX4J4');
          `}
        </Script>
      </body>
    </html>
  );
}