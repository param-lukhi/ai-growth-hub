'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import { BarChart3, TrendingUp, MousePointerClick, Globe, AlertCircle, Sparkles } from 'lucide-react';

export default function AnalyticsPage() {
  const { currentWebsite } = useWebsite();
  const [stats, setStats] = useState<any | null>(null);

  useEffect(() => {
    if (!currentWebsite) return;
    fetch(`/api/saas/search-console?websiteId=${currentWebsite.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setStats(data.stats); })
      .catch(console.error);
  }, [currentWebsite]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Website Analytics & Performance</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real performance telemetry for <strong>{currentWebsite?.name || 'Selected Website'}</strong>.
          </p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
          <div className="text-xs font-semibold text-neutral-500 mb-1">Organic Search Clicks</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {stats?.clicks?.toLocaleString() || currentWebsite?.trafficCount || 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Verified search visits</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
          <div className="text-xs font-semibold text-neutral-500 mb-1">Affiliate Outbound Clicks</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {currentWebsite?.affiliateClicks || 0}
          </div>
          <div className="text-[11px] text-brand-600 font-bold mt-1">Monetized referrals</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
          <div className="text-xs font-semibold text-neutral-500 mb-1">Articles Published</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {currentWebsite?.articlesCount || 0}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Active content assets</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
          <div className="text-xs font-semibold text-neutral-500 mb-1">Direct Affiliate Revenue</div>
          <div className="text-base font-bold text-neutral-400 dark:text-neutral-500 py-1.5">
            Revenue data unavailable
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5 italic">Requires Amazon Associates Reporting API</div>
        </div>
      </div>

      {/* Countries and Devices Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">Traffic by Country</h3>
            <div className="space-y-2">
              {stats.countries?.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                  <span className="font-bold text-neutral-900 dark:text-white">{c.country}</span>
                  <span className="text-neutral-500 font-semibold">{c.clicks.toLocaleString()} clicks ({c.percentage})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">Traffic by Device</h3>
            <div className="space-y-2">
              {stats.devices?.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                  <span className="font-bold text-neutral-900 dark:text-white">{d.device}</span>
                  <span className="text-neutral-500 font-semibold">{d.clicks.toLocaleString()} clicks ({d.percentage})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
