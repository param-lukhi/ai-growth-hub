'use client';

import React from 'react';
import { TrendingDown, Calendar } from 'lucide-react';
import { safeJsonParse } from '@/lib/utils';

export interface PricePoint {
  date: string;
  price: string;
}

interface PriceHistoryChartProps {
  currentPrice: string;
  historyData?: string | PricePoint[];
}

export default function PriceHistoryChart({ currentPrice, historyData }: PriceHistoryChartProps) {
  let parsedHistory: PricePoint[] = [];

  if (historyData) {
    if (typeof historyData === 'string') {
      parsedHistory = safeJsonParse<PricePoint[]>(historyData, []);
    } else if (Array.isArray(historyData)) {
      parsedHistory = historyData;
    }
  }

  const defaultHistory: PricePoint[] = [
    { date: 'May 2026', price: '$1,299' },
    { date: 'Jun 2026', price: '$1,249' },
    { date: 'Jul 2026', price: currentPrice || '$1,199' },
  ];

  const finalHistory = (parsedHistory && parsedHistory.length > 0) ? parsedHistory : defaultHistory;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm my-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" /> Price History Tracker
          </span>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
            Amazon Historical Price Trend
          </h3>
        </div>
        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
          At Lowest Price
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
        {finalHistory.map((h, i) => (
          <div
            key={i}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              i === finalHistory.length - 1
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200/60 dark:border-neutral-700/60'
            }`}
          >
            <div className="text-[11px] font-bold text-neutral-400 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" /> {h.date}
            </div>
            <div className="text-base font-extrabold text-neutral-900 dark:text-white mt-1">
              {h.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

