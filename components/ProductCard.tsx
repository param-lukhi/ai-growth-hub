'use client';

import React from 'react';
import Link from 'next/link';
import AmazonButton from './AmazonButton';
import RegionalPrice from './RegionalPrice';
import { Sparkles, CheckCircle2, Heart } from 'lucide-react';
import { safeJsonParse } from '@/lib/utils';
import { useWishlist } from '@/lib/context/WishlistContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: string;
    images: string;
    amazonUrl: string;
    affiliateUrl?: string;
    marketplaces?: string | null;
    category?: { name: string; slug: string };
    features?: string;
    isDeal?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const images = safeJsonParse<string[]>(product.images, ['/placeholder.jpg']);
  const firstImage = images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
  const features = safeJsonParse<string[]>(product.features, []);

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-soft hover:shadow-soft-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-neutral-50 dark:bg-neutral-800/40 overflow-hidden flex items-center justify-center p-4">
        {product.isDeal && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-md shadow-amber-500/20">
            <Sparkles className="w-3 h-3" /> Deal
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist({
              id: product.id,
              title: product.name,
              slug: product.slug,
              price: product.price,
              image: firstImage,
              category: product.category?.name,
              type: 'PRODUCT',
            });
          }}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xs hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-transform hover:scale-110 shadow-xs"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <img
          src={firstImage}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-medium">
            <span>{product.brand}</span>
            {product.category && (
              <Link
                href={`/category/${product.category.slug}`}
                className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {product.category.name}
              </Link>
            )}
          </div>

          <h3 className="font-bold text-neutral-900 dark:text-white text-base line-clamp-2 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {features.length > 0 && (
            <ul className="space-y-1 my-3 text-xs text-neutral-600 dark:text-neutral-300">
              {features.slice(0, 2).map((feat, idx) => (
                <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer / Regional Price & Buy Button */}
        <div className="pt-4 mt-auto border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline min-w-0">
            <RegionalPrice
              basePrice={product.price}
              amazonUrl={product.amazonUrl}
              affiliateUrl={product.affiliateUrl}
              marketplaces={product.marketplaces}
              className="font-extrabold text-neutral-900 dark:text-white text-lg"
              showFlag={true}
            />
          </div>

          <AmazonButton
            url={product.affiliateUrl || product.amazonUrl}
            price={product.price}
            productId={product.id}
            marketplaces={product.marketplaces}
            size="sm"
            showPriceInButton={false}
          />
        </div>
      </div>
    </div>
  );
}
