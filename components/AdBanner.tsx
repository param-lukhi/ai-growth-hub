'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  responsive?: boolean;
  className?: string;
  label?: string;
}

export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Advertisement',
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-6177323495001169';

  useEffect(() => {
    if (clientId && typeof window !== 'undefined') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, [clientId]);

  // If no AdSense ID is configured, do not render intrusive blank frames
  if (!clientId) {
    return null;
  }

  return (
    <div className={`my-8 text-center overflow-hidden ${className}`}>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">
        {label}
      </span>
      <div className="bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-2 min-h-[90px] flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slot || '1234567890'}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}
