'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ContentCalendarPage() {
  const { currentWebsite } = useWebsite();
  const [articles, setArticles] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'MONTH' | 'WEEK' | 'LIST'>('MONTH');

  useEffect(() => {
    if (!currentWebsite) return;
    fetch(`/api/saas/content?websiteId=${currentWebsite.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setArticles(data.articles); })
      .catch(console.error);
  }, [currentWebsite]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Content Publishing Calendar</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Scheduled publishing cadence for <strong>{currentWebsite?.name || 'Selected Website'}</strong> ({currentWebsite?.publishingFrequency || 'WEEKLY'}).
          </p>
        </div>

        <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold self-start sm:self-auto">
          {(['MONTH', 'WEEK', 'LIST'] as const).map(view => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentView === view ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-neutral-500'
              }`}
            >
              {view.charAt(0) + view.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid View */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">August 2026 Schedule</h2>
          <div className="text-xs font-bold text-neutral-400">
            {articles.length} Planned & Published Articles
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-neutral-400 uppercase tracking-wider py-2">
          <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: 31 }).map((_, i) => {
            const day = i + 1;
            const matchedArticles = articles.filter((_, idx) => (idx % 7) === (day % 7));
            return (
              <div
                key={day}
                className="min-h-[100px] p-2.5 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col justify-between hover:border-brand-300 transition-all"
              >
                <span className="text-xs font-extrabold text-neutral-600 dark:text-neutral-400">{day}</span>
                <div className="space-y-1 mt-1">
                  {matchedArticles.slice(0, 1).map((a, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-[10px] font-bold text-brand-700 dark:text-brand-300 truncate"
                      title={a.title}
                    >
                      {a.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
