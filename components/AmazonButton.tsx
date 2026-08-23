'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { resolveRegionalProduct, detectBrowserCountry, getMarketplaceByCode } from '@/lib/location';

interface AmazonButtonProps {
  url: string;
  price?: string;
  productId?: string;
  blogId?: string;
  marketplaces?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showPriceInButton?: boolean;
}

export default function AmazonButton({
  url,
  price,
  productId,
  blogId,
  marketplaces,
  className = '',
  size = 'md',
  text,
  showPriceInButton = true,
}: AmazonButtonProps) {
  const [country, setCountry] = useState<string>('US');

  useEffect(() => {
    // 1. Detect browser country
    const initialCountry = detectBrowserCountry();
    setCountry(initialCountry);

    // 2. Fetch IP location if not explicitly saved
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

    // 3. Listen to country changes
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

  const regional = resolveRegionalProduct(price || '', url, url, marketplaces, country);
  const currentMarket = getMarketplaceByCode(regional.countryCode || country);

  const handleClick = () => {
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'AFFILIATE_CLICK',
          targetId: productId || blogId || null,
          targetType: productId ? 'PRODUCT' : blogId ? 'BLOG' : 'DIRECT',
          path: typeof window !== 'undefined' ? window.location.pathname : '',
          country: regional.countryCode,
        }),
      });
    } catch (e) {}
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-bold gap-1.5',
    md: 'px-5 py-2.5 text-sm font-extrabold gap-2',
    lg: 'px-8 py-3.5 text-base font-extrabold gap-2.5 shadow-md hover:shadow-lg',
  };

  // Determine button text: "Buy on Amazon [Country Name]" by default if not customized
  const buttonLabel = text || `Buy on Amazon ${regional.marketplaceName}`;

  return (
    <a
      href={regional.affiliateUrl || url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      title={`Open ${regional.marketplaceName} (${regional.domain}) in new tab`}
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-sans shadow-sm hover:shadow-glow-amazon active:scale-[0.98] transition-all duration-200 cursor-pointer select-none border border-amber-500/40 ${sizeClasses[size]} ${className}`}
    >
      <ShoppingCart className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      
      <span className="truncate">{buttonLabel}</span>

      {showPriceInButton && regional.price && (
        <span className="bg-black/10 px-2 py-0.5 rounded-md text-[11px] font-extrabold ml-1 border border-black/5">
          {regional.price} {regional.flag}
        </span>
      )}

      <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0 ml-0.5" />
    </a>
  );
}
