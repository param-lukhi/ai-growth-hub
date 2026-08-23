'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import { BookOpen, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

export default function MediumAgentPage() {
  const { currentWebsite } = useWebsite();
  const [packages, setPackages] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentWebsite) return;
    fetch(`/api/saas/social?websiteId=${currentWebsite.id}&platform=MEDIUM`)
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
            <BookOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Medium Companion Article Agent</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Generates original, non-duplicate companion articles with canonical backlinks for <strong>{currentWebsite?.name || 'Selected Website'}</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {packages.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
            No Medium companion articles generated yet. Publish an article from the Content Pipeline to create syndication drafts.
          </div>
        ) : (
          packages.map(pkg => (
            <div key={pkg.id} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                  Medium Companion Draft
                </span>
                <span className="text-[10px] text-neutral-400 font-bold">{pkg.status}</span>
              </div>

              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">{pkg.title}</h3>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto">
                {pkg.bodyContent}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(pkg.id, pkg.bodyContent)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === pkg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === pkg.id ? 'Copied Medium Markdown!' : 'Copy Medium Markdown'}</span>
                </button>

                <span className="text-[10px] text-neutral-400 italic">
                  Paste directly into Medium or connect Medium Integration Token
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
