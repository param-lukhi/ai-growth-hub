'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/context/WishlistContext';
import { Heart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> My Saved Wishlist
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Your favorite tech products, buying guides, and expert reviews saved for quick access.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold text-xs">
            {wishlist.length} Items
          </span>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800 shadow-sm max-w-lg mx-auto space-y-4 my-12">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Your wishlist is currently empty</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Browse our latest tech reviews, deals, and top recommendations and tap the heart icon to save items here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> Explore Top Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] rounded-xl bg-neutral-50 dark:bg-neutral-800/40 mb-4 overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.category && (
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                  <h3 className="font-bold text-neutral-900 dark:text-white text-base line-clamp-2 mt-1 mb-2">
                    {item.title}
                  </h3>
                  <div className="font-extrabold text-neutral-900 dark:text-white text-lg">
                    {item.price}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <Link
                    href={item.type === 'PRODUCT' ? `/product/${item.slug}` : `/blog/${item.slug}`}
                    className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs text-center flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
