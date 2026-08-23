import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Providers from '@/components/Providers';
import LayoutShell from '@/components/LayoutShell';

const siteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: {
    default: 'TechPulse - Research-Based Product Reviews & Buying Guides',
    template: '%s | TechPulse Reviews',
  },
  description: 'In-depth research-based product reviews, specifications, side-by-side comparisons, and buying guides to help you make smarter purchasing decisions.',
  keywords: ['tech reviews', 'product buying guides', 'smartphone comparisons', 'laptop guides', 'audio reviews', 'gadget deals'],
  authors: [{ name: 'TechPulse Editorial Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://blogweb904.vercel.app'),
  verification: siteVerification
    ? {
        google: siteVerification,
      }
    : undefined,
  openGraph: {
    title: 'TechPulse - Research-Based Product Reviews & Buying Guides',
    description: 'In-depth research-based product reviews, specifications, and buying guides.',
    type: 'website',
    siteName: 'TechPulse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPulse - Research-Based Product Reviews & Buying Guides',
    description: 'In-depth research-based product reviews, specifications, and buying guides.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6177323495001169"
          crossOrigin="anonymous"
        />
        {siteVerification && (
          <meta name="google-site-verification" content={siteVerification} />
        )}
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
