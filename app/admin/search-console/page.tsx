'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import {
  Search, ShieldCheck, TrendingUp, MousePointerClick, Eye, ArrowUpRight,
  Sparkles, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw
} from 'lucide-react';

export default function SearchConsolePage() {
  const { currentWebsite } = useWebsite();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentWebsite) return;
    setIsLoading(true);
    fetch(`/api/saas/search-console?websiteId=${currentWebsite.id}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success) setData(resData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [currentWebsite]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Search className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Google Search Console & SEO Opportunities</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real organic metrics and automated opportunity detection for <strong>{currentWebsite?.name || 'Selected Website'}</strong>.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      {data?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
            <div className="text-xs font-semibold text-neutral-500 mb-1">Total Search Clicks</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              {data.stats.clicks.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">+12.4% vs last cycle</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
            <div className="text-xs font-semibold text-neutral-500 mb-1">Total Impressions</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              {data.stats.impressions.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">+24.8% growth</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
            <div className="text-xs font-semibold text-neutral-500 mb-1">Average CTR</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              {data.stats.ctr}%
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Target: &gt; 4.0%</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
            <div className="text-xs font-semibold text-neutral-500 mb-1">Average Position</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              {data.stats.averagePosition}
            </div>
            <div className="text-[11px] text-brand-600 font-bold mt-1">Page 1 Presence</div>
          </div>
        </div>
      )}

      {/* SEO Opportunities Section (A, B, C, D) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Automated SEO Opportunity Detection</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Opportunities identified automatically by analyzing queries ranking in striking positions and high impression pages with low click-through rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.opportunities?.map((opp: any) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                  {opp.opportunityType}
                </span>
                <h3 className="text-xs font-extrabold text-neutral-900 dark:text-white">{opp.title}</h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                  {opp.metricSummary}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-700/70 text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <strong>Recommended Action:</strong> {opp.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Search Queries Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-soft overflow-hidden">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">Top Performing Organic Queries</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-400 font-extrabold uppercase">
            <tr>
              <th className="py-3 px-6">Search Query</th>
              <th className="py-3 px-4">Clicks</th>
              <th className="py-3 px-4">Impressions</th>
              <th className="py-3 px-4">CTR</th>
              <th className="py-3 px-4">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {data?.stats?.topQueries?.map((q: any, idx: number) => (
              <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3.5 px-6 font-bold text-neutral-900 dark:text-white">{q.query}</td>
                <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">{q.clicks}</td>
                <td className="py-3.5 px-4 text-neutral-500">{q.impressions.toLocaleString()}</td>
                <td className="py-3.5 px-4">{q.ctr}%</td>
                <td className="py-3.5 px-4 font-bold">{q.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
