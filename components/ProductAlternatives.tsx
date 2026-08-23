import React from 'react';
import Link from 'next/link';
import AmazonButton from './AmazonButton';
import RegionalPrice from './RegionalPrice';
import { safeJsonParse } from '@/lib/utils';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface AlternativeProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  images: string;
  amazonUrl: string;
  affiliateUrl?: string | null;
  marketplaces?: string | null;
  features?: string;
}

interface ProductAlternativesProps {
  currentProductId?: string;
  currentProductName: string;
  alternatives: AlternativeProduct[];
}

export default function ProductAlternatives({
  currentProductId,
  currentProductName,
  alternatives,
}: ProductAlternativesProps) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <section className="my-10 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Smart Buyer Alternatives
        </span>
        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
          Top Alternatives to {currentProductName}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Considering other options? Here are similar alternatives within this category:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alternatives.slice(0, 4).map((alt) => {
          const images = safeJsonParse<string[]>(alt.images, ['/placeholder.jpg']);
          const firstImage = images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80';
          const feats = safeJsonParse<string[]>(alt.features, []);

          return (
            <div
              key={alt.id}
              className="bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all"
            >
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-xl p-2 shrink-0 flex items-center justify-center border border-neutral-200/60 dark:border-neutral-700/60">
                  <img
                    src={firstImage}
                    alt={alt.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    {alt.brand}
                  </span>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-2 leading-snug">
                    <Link href={`/product/${alt.slug}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                      {alt.name}
                    </Link>
                  </h4>
                  <div className="pt-0.5">
                    <RegionalPrice
                      basePrice={alt.price}
                      amazonUrl={alt.amazonUrl}
                      affiliateUrl={alt.affiliateUrl || undefined}
                      marketplaces={alt.marketplaces}
                      className="font-extrabold text-sm text-neutral-900 dark:text-white"
                      showFlag={true}
                    />
                  </div>
                </div>
              </div>

              {feats.length > 0 && (
                <p className="text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5 line-clamp-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feats[0]}</span>
                </p>
              )}

              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between gap-2">
                <Link
                  href={`/product/${alt.slug}`}
                  className="text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <AmazonButton
                  url={alt.affiliateUrl || alt.amazonUrl}
                  price={alt.price}
                  productId={alt.id}
                  marketplaces={alt.marketplaces}
                  size="sm"
                  text="Check Price"
                  showPriceInButton={false}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
