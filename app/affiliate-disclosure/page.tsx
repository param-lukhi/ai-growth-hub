import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Affiliate & Amazon Associates Disclosure - TechPulse Reviews',
  description: 'Learn how TechPulse earns revenue through affiliate partnerships and how we maintain complete editorial independence.',
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600 dark:text-brand-400">
          Transparency & Compliance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Affiliate & Amazon Associates Disclosure
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Last Updated: August 2026
        </p>
      </div>

      <div className="bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/60 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-base">
          <ShieldCheck className="w-5 h-5" />
          <span>Official Amazon Associates Program Statement</span>
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
          TechPulse (<strong>techpulsereviews.com</strong>) is a participant in the <strong>Amazon Services LLC Associates Program</strong> and regional Amazon affiliate programs worldwide, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com, Amazon.in, Amazon.co.uk, and related regional storefronts.
        </p>
      </div>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
            What Are Affiliate Links?
          </h2>
          <p>
            When you click on certain product links or &ldquo;Check Price on Amazon&rdquo; buttons on our website and subsequently make a purchase, we may receive a small referral commission directly from the merchant at <strong>no additional cost to you</strong>.
          </p>
          <p>
            The price you pay for any product remains exactly the same whether you use our links or navigate directly to the merchant.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
            Editorial Independence & Integrity
          </h2>
          <p>
            Our reviews, buying guides, and comparison scores are formulated independently by our editorial team. We never accept compensation from manufacturers or third parties in exchange for favorable ratings, positive product placement, or predetermined buying conclusions.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>We recommend products based on specifications, value, and authentic user feedback.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Affiliate relationships never influence which products we critique or endorse.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>We clearly highlight both Pros and Cons for every reviewed item.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
            Product Pricing, Availability & Deals
          </h2>
          <p>
            Prices and availability for products featured on TechPulse are accurate according to catalog records and merchant listings at the time of publication and are subject to change by merchants at any time.
          </p>
          <p>
            Any price, discount, shipping, or availability information displayed on Amazon or the respective retailer&apos;s site at the moment of checkout will apply to your final purchase.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
            Questions or Feedback?
          </h2>
          <p>
            If you have any questions regarding our affiliate partnerships or editorial methodology, please feel free to reach out through our{' '}
            <Link href="/contact" className="text-brand-600 dark:text-brand-400 font-bold underline hover:text-brand-700">
              Contact Page
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
