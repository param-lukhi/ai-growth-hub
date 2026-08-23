import React from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';

interface AffiliateDisclosureNoticeProps {
  compact?: boolean;
  className?: string;
}

export default function AffiliateDisclosureNotice({
  compact = false,
  className = '',
}: AffiliateDisclosureNoticeProps) {
  if (compact) {
    return (
      <div className={`flex items-start gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-sans leading-relaxed ${className}`}>
        <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
        <span>
          <strong>Affiliate Disclosure:</strong> When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you.{' '}
          <Link href="/affiliate-disclosure" className="underline hover:text-neutral-700 dark:hover:text-neutral-200">
            Learn more
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans ${className}`}>
      <div className="flex items-start gap-2.5">
        <Info className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-neutral-900 dark:text-white font-semibold">Affiliate & Pricing Disclosure:</strong>{' '}
          TechPulse participates in affiliate programs including Amazon Services LLC Associates. If you purchase through our product links, we may earn an affiliate commission at no extra cost to you. Prices, discounts, and inventory are managed by merchants and may change. Read our full{' '}
          <Link href="/affiliate-disclosure" className="text-brand-600 dark:text-brand-400 font-semibold underline hover:text-brand-700">
            Affiliate Disclosure
          </Link>.
        </div>
      </div>
    </div>
  );
}
