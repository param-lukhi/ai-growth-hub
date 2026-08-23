'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

const PUBLIC_STOREFRONT_PREFIXES = [
  '/blog',
  '/products',
  '/product',
  '/deals',
  '/comparisons',
  '/category',
  '/about',
  '/contact',
  '/wishlist',
  '/search'
];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current route is a public storefront route
  const isPublicStorefront = pathname
    ? PUBLIC_STOREFRONT_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    : false;

  if (!isPublicStorefront) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
