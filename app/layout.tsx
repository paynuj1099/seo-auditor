import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Free Website Audit & SEO Checker | SiteAudit AI',
  description: 'Run a free website audit and discover SEO, performance, accessibility, technical, and mobile issues. No login required.',
  keywords: ['website audit', 'SEO checker', 'performance audit', 'accessibility checker', 'technical SEO'],
  authors: [{ name: 'SiteAudit AI' }],
  openGraph: {
    title: 'Free Website Audit & SEO Checker | SiteAudit AI',
    description: 'Run a free website audit and discover SEO, performance, accessibility, technical, and mobile issues. No login required.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Website Audit & SEO Checker | SiteAudit AI',
    description: 'Run a free website audit and discover SEO, performance, accessibility, technical, and mobile issues. No login required.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
