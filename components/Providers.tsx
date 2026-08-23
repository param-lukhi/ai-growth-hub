'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { WishlistProvider } from '@/lib/context/WishlistContext';
import { NotificationProvider } from '@/lib/context/NotificationContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WishlistProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </WishlistProvider>
    </ThemeProvider>
  );
}
