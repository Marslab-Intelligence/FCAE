import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, Fraunces } from 'next/font/google';
import './globals.css';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { GlobalPatternBackground } from '@/components/GlobalPatternBackground';
import { CurrencyProvider } from '@/components/CurrencyProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display-serif',
  display: 'swap',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
});

// No metadataBase / OG url on purpose — no production domain has been
// decided yet (confirmed with the client, do not hardcode a placeholder or
// guessed domain). Without metadataBase, Next.js resolves relative OG/
// Twitter image URLs against the request origin at render time, which is
// correct for any domain this ends up deployed on. Set metadataBase once a
// real domain exists.
//
// public/og-image.png is a corrupt 70-byte file, not a real image — OG/
// Twitter image fields are omitted below rather than pointing at a broken
// file. A real 1200x630 OG image needs to be designed before this matters
// for social sharing.
export const metadata: Metadata = {
  title: 'SID Managed Cloud — Enterprise Cloud Expertise Without Enterprise Hiring',
  description: 'Your on-demand Cloud Architecture & Engineering team for AWS, Microsoft Azure, and Hybrid Cloud — delivered through a predictable monthly subscription.',
  keywords: ['managed cloud services', 'cloud operations', 'AWS', 'Microsoft Azure', 'hybrid cloud', 'FinOps', 'DevOps', 'cloud architecture'],
  authors: [{ name: 'SIDCORPTECH' }],
  creator: 'SIDCORPTECH',
  publisher: 'SIDCORPTECH',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'SID Managed Cloud — Enterprise Cloud Expertise Without Enterprise Hiring',
    description: 'Your on-demand Cloud Architecture & Engineering team for AWS, Microsoft Azure, and Hybrid Cloud.',
    siteName: 'SID Managed Cloud',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SID Managed Cloud — Enterprise Cloud Expertise Without Enterprise Hiring',
    description: 'Your on-demand Cloud Architecture & Engineering team for AWS, Microsoft Azure, and Hybrid Cloud.',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#050816',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${fraunces.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-bg text-text relative min-h-screen">
        {/* Site-wide animated line/pattern backdrop */}
        <GlobalPatternBackground />
        <CurrencyProvider>
          <SmoothScrollProvider>
            {/* Page Content */}
            <div className="relative z-10">
              {children}
            </div>
          </SmoothScrollProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
