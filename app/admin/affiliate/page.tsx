'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import {
  Link2, ShoppingBag, ShieldCheck, ExternalLink, CheckCircle2,
  DollarSign, Sparkles, AlertCircle, Save, Copy
} from 'lucide-react';

export default function AffiliateHubPage() {
  const { currentWebsite } = useWebsite();
  const [affiliateTag, setAffiliateTag] = useState('');
  const [marketplace, setMarketplace] = useState('amazon.in');
  const [disclosureText, setDisclosureText] = useState(
    'This article may contain affiliate links. If you purchase through our links, we may earn a commission at no additional cost to you.'
  );
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentWebsite) {
      setAffiliateTag(currentWebsite.slug === 'techpulse' ? 'techpulse-20' : `${currentWebsite.slug}-20`);
      setMarketplace(currentWebsite.targetCountry === 'India' ? 'amazon.in' : 'amazon.com');
    }
  }, [currentWebsite]);

  const handleCopyDisclosure = () => {
    navigator.clipboard.writeText(disclosureText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Link2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Affiliate & Monetization Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Configure website-specific affiliate credentials, product CTA rules, and compliance disclaimers for <strong>{currentWebsite?.name || 'Selected Website'}</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Affiliate Tags & Marketplace Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-500" />
              <span>Amazon Associates Configuration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Primary Affiliate Tag / Store ID</label>
                <input
                  type="text"
                  value={affiliateTag}
                  onChange={e => setAffiliateTag(e.target.value)}
                  placeholder="e.g. techpulse-20"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Default Amazon Regional Marketplace</label>
                <select
                  value={marketplace}
                  onChange={e => setMarketplace(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 outline-none focus:border-brand-500"
                >
                  <option value="amazon.in">Amazon India (amazon.in)</option>
                  <option value="amazon.com">Amazon USA (amazon.com)</option>
                  <option value="amazon.co.uk">Amazon UK (amazon.co.uk)</option>
                  <option value="amazon.ca">Amazon Canada (amazon.ca)</option>
                  <option value="amazon.de">Amazon Germany (amazon.de)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Approved Call-To-Action (CTA) Formats</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {['Check Latest Price', 'View on Amazon', 'See Current Deal', 'Compare Price'].map((cta, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 font-bold text-neutral-700 dark:text-neutral-300">
                    {cta}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaved ? 'Settings Saved!' : 'Save Affiliate Settings'}</span>
              </button>
            </div>
          </div>

          {/* FTC Disclosure Notice Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Mandatory FTC & Amazon Affiliate Disclosure</span>
              </h2>
              <button
                onClick={handleCopyDisclosure}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              The Quality Control engine automatically requires this disclosure in every published article to ensure 100% compliance with search engine guidelines and FTC regulations.
            </p>

            <textarea
              rows={3}
              value={disclosureText}
              onChange={e => setDisclosureText(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-xs outline-none"
            />
          </div>
        </div>

        {/* Right 1 Col: Quality Rules */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">Anti-Hallucination Pricing Directives</h3>
            <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                <strong className="text-emerald-900 dark:text-emerald-300 block mb-1">Dynamic Live Checks</strong>
                Never invent hardcoded prices without active API sync. Use "Check Latest Price" badges to redirect users to live Amazon store prices.
              </div>
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                <strong className="text-blue-900 dark:text-blue-300 block mb-1">Rel="sponsored nofollow"</strong>
                All outgoing affiliate URLs are automatically tagged with compliant link attributes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
