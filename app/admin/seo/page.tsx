'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import { ShieldCheck, Search, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function SEOCenterPage() {
  const { currentWebsite } = useWebsite();
  const [seoData, setSeoData] = useState<any | null>(null);

  useEffect(() => {
    if (!currentWebsite) return;
    fetch(`/api/saas/search-console?websiteId=${currentWebsite.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setSeoData(data); })
      .catch(console.error);
  }, [currentWebsite]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>SEO Center & Optimization Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Topical clusters, internal link suggestions, and structured data schemas for <strong>{currentWebsite?.name || 'Selected Website'}</strong>.
          </p>
        </div>
      </div>

      {/* SEO Opportunities Overview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>Prioritized Growth Opportunities</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Identified from Google Search Console queries and on-page technical audits.
            </p>
          </div>
          <Link href="/admin/search-console" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View Console Data
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seoData?.opportunities?.map((opp: any) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                  {opp.opportunityType}
                </span>
                <h3 className="text-xs font-extrabold text-neutral-900 dark:text-white">{opp.title}</h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{opp.metricSummary}</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-700/70 text-[11px] text-neutral-700 dark:text-neutral-300">
                <strong>Action:</strong> {opp.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Data & Schema Directives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-2">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Article & ItemList JSON-LD
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Auto-injected structured data validating publisher identity, author credentials, and datePublished.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-2">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            FAQPage Schema
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Eligible for rich search snippets with interactive accordion dropdowns in Google Search results.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-2">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Canonical & OpenGraph Meta
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Self-referencing canonical tags preventing duplicate content penalties across cross-platform distributions.
          </p>
        </div>
      </div>
    </div>
  );
}
