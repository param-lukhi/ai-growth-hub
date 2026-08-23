'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import { Youtube, Copy, Check, Video, Clapperboard, Sparkles } from 'lucide-react';

export default function YouTubeShortsAgentPage() {
  const { currentWebsite } = useWebsite();
  const [packages, setPackages] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentWebsite) return;
    fetch(`/api/saas/social?websiteId=${currentWebsite.id}&platform=YOUTUBE_SHORTS`)
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
            <Youtube className="w-6 h-6 text-rose-600" />
            <span>YouTube Shorts AI Video Agent</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Converts long-form articles into high-retention 30–60 second video scripts with scene breakdowns and audio cues for <strong>{currentWebsite?.name || 'Selected Website'}</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
            No YouTube Shorts scripts generated yet. Publish an article from the Content Pipeline to create viral short-form video packages.
          </div>
        ) : (
          packages.map(pkg => {
            const scenes = typeof pkg.sceneList === 'string' ? JSON.parse(pkg.sceneList || '[]') : (pkg.sceneList || []);
            return (
              <div key={pkg.id} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                    <Clapperboard className="w-3 h-3" />
                    30–60s Shorts Script
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold">{pkg.status}</span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">{pkg.title}</h3>
                  {pkg.hook && (
                    <div className="mt-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs">
                      <strong className="text-brand-600 dark:text-brand-400 block text-[10px] uppercase font-bold mb-0.5">3-Second Hook</strong>
                      {pkg.hook}
                    </div>
                  )}
                </div>

                {/* Scene-by-Scene Breakdown */}
                {scenes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Scene Breakdown & Voiceover</h4>
                    <div className="space-y-2">
                      {scenes.map((s: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 text-xs space-y-1">
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                            <span>Scene {s.sceneNumber}: {s.onScreenText}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            <strong>Visual:</strong> {s.visual}
                          </div>
                          <div className="text-[11px] text-neutral-700 dark:text-neutral-300">
                            <strong>Audio VO:</strong> &quot;{s.audio}&quot;
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(pkg.id, `${pkg.title}\n\nHook: ${pkg.hook}\n\n${pkg.bodyContent}`)}
                    className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedId === pkg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === pkg.id ? 'Copied Full Script!' : 'Copy Script Package'}</span>
                  </button>

                  <span className="text-[10px] text-neutral-400 italic">Ready-to-record package</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
