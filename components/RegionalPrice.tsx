'use client';

import React, { useState, useEffect } from 'react';
import { resolveRegionalProduct, detectBrowserCountry, getMarketplaceByCode } from '@/lib/location';

interface RegionalPriceProps {
  basePrice: string;
  amazonUrl: string;
  affiliateUrl?: string | null;
  marketplaces?: string | null;
  className?: string;
  showFlag?: boolean;
  showFallbackBadge?: boolean;
}

export default function RegionalPrice({
  basePrice,
  amazonUrl,
  affiliateUrl,
  marketplaces,
  className = 'font-extrabold text-neutral-900',
  showFlag = true,
  showFallbackBadge = false,
}: RegionalPriceProps) {
  const [country, setCountry] = useState<string>('US');

  useEffect(() => {
    // 1. Initial country resolution via saved / browser locale
    const initialCountry = detectBrowserCountry();
    setCountry(initialCountry);

    // 2. Fetch IP country from API in background if not saved explicitly
    if (!localStorage.getItem('user_country')) {
      fetch('/api/location')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.country) {
            setCountry(data.country);
          }
        })
        .catch(() => {});
    }

    // 3. Listen to manual user country changes
    const handleCountryChange = (e: any) => {
      if (e.detail && e.detail.country) {
        setCountry(e.detail.country);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('countryChange', handleCountryChange);
      return () => window.removeEventListener('countryChange', handleCountryChange);
    }
  }, []);

  const regional = resolveRegionalProduct(
    basePrice,
    amazonUrl,
    affiliateUrl,
    marketplaces,
    country
  );

  const market = getMarketplaceByCode(country);

  return (
    <span className="inline-flex items-baseline gap-1.5 flex-wrap">
      <span className={className}>{regional.price || basePrice}</span>
      
      {showFlag && (
        <span
          className="text-xs shrink-0 select-none"
          title={`Marketplace: ${regional.marketplaceName} (${regional.domain})`}
        >
          {regional.flag}
        </span>
      )}

      {showFallbackBadge && regional.isFallback && (
        <span className="text-[10px] bg-neutral-100 text-neutral-500 font-semibold px-1.5 py-0.5 rounded border border-neutral-200">
          Default ({regional.countryCode})
        </span>
      )}
    </span>
  );
}
