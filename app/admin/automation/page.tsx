'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import {
  Cpu, Play, CheckCircle2, AlertCircle, Clock, RefreshCw,
  Sparkles, ShieldCheck, Zap
} from 'lucide-react';

export default function AutomationPage() {
  const { currentWebsite } = useWebsite();
  const [rules, setRules] = useState<any[]>([]);
  const [runningRuleId, setRunningRuleId] = useState<string | null>(null);

  const fetchRules = async () => {
    if (!currentWebsite) return;
    try {
      const res = await fetch(`/api/saas/automation?websiteId=${currentWebsite.id}`);
      const data = await res.json();
      if (data.success) setRules(data.rules);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [currentWebsite]);

  const handleToggle = async (rule: any) => {
    try {
      const res = await fetch('/api/saas/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: currentWebsite?.id,
          ruleId: rule.id,
          action: 'TOGGLE',
          isEnabled: !rule.isEnabled
        })
      });
      const data = await res.json();
      if (data.success) {
        setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isEnabled: !r.isEnabled } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunNow = async (rule: any) => {
    try {
      setRunningRuleId(rule.id);
      const res = await fetch('/api/saas/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: currentWebsite?.id,
          ruleId: rule.id,
          action: 'RUN_NOW'
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchRules();
        alert(`Rule "${rule.ruleName}" executed successfully!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningRuleId(null);
    }
  };

  const defaultRuleTemplates = [
    { name: 'DAILY_TOPIC_DISCOVERY', label: 'Daily Market & Trend Topic Scan', desc: 'Agent scans Search Console and search trends daily to find emerging keyword opportunities.' },
    { name: 'WEEKLY_CONTENT_PLAN', label: 'Weekly 30-Day Content Matrix', desc: 'Synthesizes topical authority clusters and builds weekly content schedules.' },
    { name: 'POST_PUBLISH_SOCIAL', label: 'Post-Publish Social Content Generation', desc: 'Automatically creates Pinterest Pins, YouTube Shorts scripts, and Instagram Reels after every published post.' },
    { name: 'WEEKLY_GSC_AUDIT', label: 'Weekly Search Console Striking Distance Audit', desc: 'Detects queries ranking on Page 2 (Positions 5-20) and recommends internal links.' },
    { name: 'MONTHLY_DECAY_AUDIT', label: 'Monthly Content Decay & Price Refresh', desc: 'Flags articles losing traffic over 30 days and checks for updated product models.' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Website Automation & Cron Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Automated recurring growth routines calibrated for <strong>{currentWebsite?.name || 'Selected Website'}</strong>.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {defaultRuleTemplates.map((template, idx) => {
          const matchedRule = rules.find(r => r.ruleName === template.name);
          const isEnabled = matchedRule ? matchedRule.isEnabled : false;
          const isRunning = matchedRule ? runningRuleId === matchedRule.id : false;

          return (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">{template.label}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    isEnabled
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                  }`}>
                    {isEnabled ? 'Enabled' : 'Disabled (Default)'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                  {template.desc}
                </p>
                {matchedRule?.lastRunAt && (
                  <div className="text-[11px] text-neutral-400 pt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Last executed: {new Date(matchedRule.lastRunAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => matchedRule && handleRunNow(matchedRule)}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running...' : 'Run Now'}</span>
                </button>

                <button
                  onClick={() => matchedRule && handleToggle(matchedRule)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isEnabled
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                  }`}
                >
                  {isEnabled ? 'Disable Rule' : 'Enable Rule'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
