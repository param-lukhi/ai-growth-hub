'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/context/WishlistContext';
import { Heart } from 'lucide-react';

export default function WishlistButton() {
  const { wishlist } = useWishlist();
  const count = wishlist.length;

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist with ${count} items`}
      className="relative p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
      title="View Wishlist"
    >
      <Heart className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in scale-in duration-200">
          {count}
        </span>
      )}
    </Link>
  );
}
