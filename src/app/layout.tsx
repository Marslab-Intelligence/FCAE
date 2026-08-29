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

export const metadata: Metadata = {
  title: 'MotionForge — The Complete Animation Stack for the Modern Web',
  description: 'Build stunning web animations visually. No code required. Scroll animations, page transitions, stagger effects, SVG drawing, split text — all in one powerful visual editor.',
  keywords: ['web animation', 'scroll animations', 'page transitions', 'visual editor', 'no-code animation', 'GSAP', 'Framer Motion', 'web design'],
  authors: [{ name: 'MotionForge' }],
  creator: 'MotionForge',
  publisher: 'MotionForge',
  robots: 'index, follow',
  metadataBase: new URL('https://motionforge.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://motionforge.dev',
    title: 'MotionForge — The Complete Animation Stack for the Modern Web',
    description: 'Build stunning web animations visually. No code required.',
    siteName: 'MotionForge',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MotionForge - The Complete Animation Stack',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MotionForge — The Complete Animation Stack',
    description: 'Build stunning web animations visually. No code required.',
    images: ['/og-image.png'],
    creator: '@motionforge',
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
