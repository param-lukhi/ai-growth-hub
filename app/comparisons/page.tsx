'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RegionalPrice from '@/components/RegionalPrice';
import AmazonButton from '@/components/AmazonButton';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import { ArrowRight, Check, X, Sparkles, Scale, Trophy, Zap, ShieldCheck } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  images: string;
  amazonUrl: string;
  affiliateUrl?: string;
  marketplaces?: string;
  specifications: string;
  pros: string;
  cons: string;
}

export default function ComparisonsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [p1Id, setP1Id] = useState<string>('');
  const [p2Id, setP2Id] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setP1Id(data[0].id);
          if (data.length > 1) setP2Id(data[1].id);
          else setP2Id(data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const p1 = products.find((p) => p.id === p1Id);
  const p2 = products.find((p) => p.id === p2Id);

  const parseJson = (str: string | undefined, fallback: any = []) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  };

  const cleanSpecs = (rawSpecs: Record<string, any>) => {
    const result: Record<string, any> = {};
    if (!rawSpecs || typeof rawSpecs !== 'object') return result;
    for (const [k, v] of Object.entries(rawSpecs)) {
      if (!k.startsWith('_')) {
        result[k] = v;
      }
    }
    return result;
  };

  const formatSpecValue = (val: any): string => {
    if (val === null || val === undefined || val === '') return 'N/A';
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          return formatSpecValue(parsed);
        } catch {
          return val;
        }
      }
      return val;
    }
    if (Array.isArray(val)) {
      return val.map((v) => formatSpecValue(v)).join(', ');
    }
    if (typeof val === 'object') {
      return Object.entries(val)
        .map(([k, v]) => `${k}: ${formatSpecValue(v)}`)
        .join(' | ');
    }
    return String(val);
  };

  const rawP1Specs = parseJson(p1?.specifications, {});
  const rawP2Specs = parseJson(p2?.specifications, {});

  const p1Specs = cleanSpecs(rawP1Specs);
  const p2Specs = cleanSpecs(rawP2Specs);

  const p1PriceHistory = rawP1Specs._priceHistory
    ? parseJson(rawP1Specs._priceHistory, null) || rawP1Specs._priceHistory
    : null;
  const p2PriceHistory = rawP2Specs._priceHistory
    ? parseJson(rawP2Specs._priceHistory, null) || rawP2Specs._priceHistory
    : null;

  const p1Pros = parseJson(p1?.pros, []);
  const p2Pros = parseJson(p2?.pros, []);
  const p1Cons = parseJson(p1?.cons, []);
  const p2Cons = parseJson(p2?.cons, []);

  const allSpecKeys = Array.from(
    new Set([...Object.keys(p1Specs), ...Object.keys(p2Specs)])
  );

  const p1Image = parseJson(p1?.images, [''])[0] || '/placeholder.png';
  const p2Image = parseJson(p2?.images, [''])[0] || '/placeholder.png';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 sm:py-12 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 px-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-extrabold uppercase tracking-wide">
            <Scale className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Head-to-Head Comparisons
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Compare Tech Products Side-by-Side
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Compare specs, prices, pros, cons, and performance scores to find the absolute best device for your budget.
          </p>
        </div>

        {/* Product Selectors */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
          <div>
            <label className="block text-xs font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Select Device 1
            </label>
            <select
              value={p1Id}
              onChange={(e) => setP1Id(e.target.value)}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold text-xs sm:text-sm outline-none border border-neutral-200 dark:border-neutral-700 focus:border-brand-500 transition-colors"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Select Device 2
            </label>
            <select
              value={p2Id}
              onChange={(e) => setP2Id(e.target.value)}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold text-xs sm:text-sm outline-none border border-neutral-200 dark:border-neutral-700 focus:border-brand-500 transition-colors"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Content */}
        {p1 && p2 ? (
          <>
            {/* ========================================================= */}
            {/* MOBILE RESPONSIVE COMPARISON VIEW (< md / < 768px)         */}
            {/* ========================================================= */}
            <div className="block md:hidden space-y-6">
              {/* 1. Stacked Product Comparison Cards */}
              <div className="space-y-4">
                {/* Device 1 Card */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-extrabold text-[11px] uppercase tracking-wide">
                      Device 1
                    </span>
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      {p1.brand}
                    </span>
                  </div>

                  <div className="h-32 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-2">
                    <img
                      src={p1Image}
                      alt={p1.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-extrabold text-sm text-neutral-900 dark:text-white leading-snug break-words">
                      {p1.name}
                    </h2>
                    <div className="pt-1">
                      <RegionalPrice
                        basePrice={p1.price}
                        amazonUrl={p1.amazonUrl}
                        affiliateUrl={p1.affiliateUrl}
                        marketplaces={p1.marketplaces}
                        className="font-extrabold text-base"
                        showFlag={true}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <AmazonButton
                      url={p1.affiliateUrl || p1.amazonUrl}
                      price={p1.price}
                      productId={p1.id}
                      marketplaces={p1.marketplaces}
                      size="sm"
                      text={`Check ${p1.brand || 'Device 1'} Price`}
                      className="w-full justify-center py-2.5 text-xs font-extrabold"
                    />
                  </div>
                </div>

                {/* VS Badge Divider */}
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px bg-neutral-200 dark:border-neutral-800 flex-1" />
                  <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                    VS
                  </span>
                  <div className="h-px bg-neutral-200 dark:border-neutral-800 flex-1" />
                </div>

                {/* Device 2 Card */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-extrabold text-[11px] uppercase tracking-wide">
                      Device 2
                    </span>
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      {p2.brand}
                    </span>
                  </div>

                  <div className="h-32 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-2">
                    <img
                      src={p2Image}
                      alt={p2.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-extrabold text-sm text-neutral-900 dark:text-white leading-snug break-words">
                      {p2.name}
                    </h2>
                    <div className="pt-1">
                      <RegionalPrice
                        basePrice={p2.price}
                        amazonUrl={p2.amazonUrl}
                        affiliateUrl={p2.affiliateUrl}
                        marketplaces={p2.marketplaces}
                        className="font-extrabold text-base"
                        showFlag={true}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <AmazonButton
                      url={p2.affiliateUrl || p2.amazonUrl}
                      price={p2.price}
                      productId={p2.id}
                      marketplaces={p2.marketplaces}
                      size="sm"
                      text={`Check ${p2.brand || 'Device 2'} Price`}
                      className="w-full justify-center py-2.5 text-xs font-extrabold"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Key Advantages / Pros Breakdown */}
              {(p1Pros.length > 0 || p2Pros.length > 0) && (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
                    Key Advantages
                  </h3>

                  <div className="space-y-3">
                    {/* Device 1 Pros */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-brand-600 dark:text-brand-400 truncate">
                        {p1.name}:
                      </div>
                      {p1Pros.length > 0 ? (
                        <div className="space-y-1">
                          {p1Pros.map((pro: string, i: number) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="break-words">{pro}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">Standard features</span>
                      )}
                    </div>

                    <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

                    {/* Device 2 Pros */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400 truncate">
                        {p2.name}:
                      </div>
                      {p2Pros.map((pro: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="break-words">{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Mobile Specifications Breakdown */}
              {allSpecKeys.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
                    Specifications Comparison
                  </h3>

                  <div className="space-y-2.5">
                    {allSpecKeys.map((key) => {
                      const val1 = formatSpecValue(p1Specs[key]);
                      const val2 = formatSpecValue(p2Specs[key]);

                      return (
                        <div
                          key={key}
                          className="bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 space-y-2"
                        >
                          <div className="font-extrabold text-xs text-neutral-700 dark:text-neutral-300">
                            {key}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-neutral-200/60 dark:border-neutral-700/40">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-neutral-400 block truncate">
                                {p1.brand || 'Device 1'}
                              </span>
                              <span className="font-semibold text-neutral-900 dark:text-white break-words">
                                {val1}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-neutral-400 block truncate">
                                {p2.brand || 'Device 2'}
                              </span>
                              <span className="font-semibold text-neutral-900 dark:text-white break-words">
                                {val2}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Price History Section (Mobile) */}
              {(p1PriceHistory || p2PriceHistory) && (
                <div className="space-y-4">
                  {p1PriceHistory && (
                    <div>
                      <div className="text-xs font-bold text-neutral-500 mb-1 truncate">
                        {p1.name} Price Trend
                      </div>
                      <PriceHistoryChart currentPrice={p1.price} historyData={p1PriceHistory} />
                    </div>
                  )}
                  {p2PriceHistory && (
                    <div>
                      <div className="text-xs font-bold text-neutral-500 mb-1 truncate">
                        {p2.name} Price Trend
                      </div>
                      <PriceHistoryChart currentPrice={p2.price} historyData={p2PriceHistory} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* DESKTOP & TABLET COMPARISON VIEW (>= md / >= 768px)       */}
            {/* ========================================================= */}
            <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                
                {/* Header row with images */}
                <div className="grid grid-cols-3 p-6 bg-neutral-50/50 dark:bg-neutral-800/30 items-center text-center">
                  <div className="text-left font-extrabold text-xs sm:text-sm text-neutral-400 uppercase">
                    Product Details
                  </div>
                  <div className="space-y-3 px-3">
                    <div className="h-32 flex items-center justify-center">
                      <img
                        src={p1Image}
                        alt={p1.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-neutral-900 dark:text-white line-clamp-2">
                      {p1.name}
                    </h3>
                    <RegionalPrice
                      basePrice={p1.price}
                      amazonUrl={p1.amazonUrl}
                      affiliateUrl={p1.affiliateUrl}
                      marketplaces={p1.marketplaces}
                      className="font-extrabold text-sm sm:text-base"
                    />
                    <AmazonButton
                      url={p1.affiliateUrl || p1.amazonUrl}
                      price={p1.price}
                      productId={p1.id}
                      marketplaces={p1.marketplaces}
                      size="sm"
                      text={`Check ${p1.brand || 'Device 1'} Price`}
                    />
                  </div>
                  <div className="space-y-3 px-3">
                    <div className="h-32 flex items-center justify-center">
                      <img
                        src={p2Image}
                        alt={p2.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-neutral-900 dark:text-white line-clamp-2">
                      {p2.name}
                    </h3>
                    <RegionalPrice
                      basePrice={p2.price}
                      amazonUrl={p2.amazonUrl}
                      affiliateUrl={p2.affiliateUrl}
                      marketplaces={p2.marketplaces}
                      className="font-extrabold text-sm sm:text-base"
                    />
                    <AmazonButton
                      url={p2.affiliateUrl || p2.amazonUrl}
                      price={p2.price}
                      productId={p2.id}
                      marketplaces={p2.marketplaces}
                      size="sm"
                      text={`Check ${p2.brand || 'Device 2'} Price`}
                    />
                  </div>
                </div>

                {/* Pros */}
                {(p1Pros.length > 0 || p2Pros.length > 0) && (
                  <div className="grid grid-cols-3 p-6 items-start gap-4">
                    <div className="font-bold text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      Key Advantages
                    </div>
                    <div className="space-y-1.5 text-xs px-2">
                      {p1Pros.map((pro: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="w-4 h-4 shrink-0 mt-0.5" /> <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5 text-xs px-2">
                      {p2Pros.map((pro: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="w-4 h-4 shrink-0 mt-0.5" /> <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specifications breakdown */}
                {allSpecKeys.map((key) => {
                  const val1 = formatSpecValue(p1Specs[key]);
                  const val2 = formatSpecValue(p2Specs[key]);

                  return (
                    <div key={key} className="grid grid-cols-3 p-4 items-center text-xs gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                      <div className="font-bold text-neutral-500 dark:text-neutral-400 break-words">{key}</div>
                      <div className="font-semibold text-neutral-900 dark:text-white break-words px-2">{val1}</div>
                      <div className="font-semibold text-neutral-900 dark:text-white break-words px-2">{val2}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Price History Charts (if available) */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6">
              {p1PriceHistory && (
                <div>
                  <div className="text-sm font-bold text-neutral-600 dark:text-neutral-400 mb-2 truncate">
                    {p1.name}
                  </div>
                  <PriceHistoryChart currentPrice={p1.price} historyData={p1PriceHistory} />
                </div>
              )}
              {p2PriceHistory && (
                <div>
                  <div className="text-sm font-bold text-neutral-600 dark:text-neutral-400 mb-2 truncate">
                    {p2.name}
                  </div>
                  <PriceHistoryChart currentPrice={p2.price} historyData={p2PriceHistory} />
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

