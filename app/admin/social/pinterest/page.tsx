'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import { Sparkles, Copy, Check, ExternalLink, Image as ImageIcon, Send } from 'lucide-react';

export default function PinterestAgentPage() {
  const { currentWebsite } = useWebsite();
  const [packages, setPackages] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentWebsite) return;
    fetch(`/api/saas/social?websiteId=${currentWebsite.id}&platform=PINTEREST`)
      .then(res => res.json())
      .then(data => { if (data.success) setPackages(data.packages); })
      .catch(console.error);
  }, [currentWebsite]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-rose-500" />
            <span>Pinterest AI Growth Agent</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            High-converting Pinterest Pins, SEO descriptions, and destination boards for <strong>{currentWebsite?.name || 'Selected Website'}</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
            No Pinterest Pins generated yet. Publish an article from the Content Pipeline to automatically generate viral pins.
          </div>
        ) : (
          packages.map(pkg => (
            <div key={pkg.id} className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    Pinterest Pin
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold">{pkg.status}</span>
                </div>
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white leading-snug">{pkg.title}</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                  {pkg.bodyContent}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(pkg.id, `${pkg.title}\n\n${pkg.bodyContent}`)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === pkg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                  <span>{copiedId === pkg.id ? 'Copied!' : 'Copy Pin'}</span>
                </button>

                <span className="text-[10px] text-neutral-400 italic">
                  Requires OAuth for 1-click publishing
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
