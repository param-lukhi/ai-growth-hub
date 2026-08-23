'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWebsite } from '@/lib/saas/website-context';
import {
  Globe, Bot, Sparkles, TrendingUp, ArrowUpRight, MousePointerClick,
  FileEdit, ShieldCheck, CheckCircle2, RefreshCw, Zap, Plus,
  ChevronRight, Calendar, AlertTriangle, ExternalLink
} from 'lucide-react';
import QualityScoreBadge from '@/components/saas/QualityScoreBadge';

export default function SaaSAdminDashboard() {
  const { websites, currentWebsite, setCurrentWebsite, openAddModal, isLoading } = useWebsite();
  const [topics, setTopics] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [seoData, setSeoData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!currentWebsite) return;

    // Fetch Topics
    fetch(`/api/saas/topics?websiteId=${currentWebsite.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setTopics(data.topics); })
      .catch(() => {});

    // Fetch Articles
    fetch(`/api/saas/content?websiteId=${currentWebsite.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setArticles(data.articles); })
      .catch(() => {});

    // Fetch Activity Logs
    fetch(`/api/saas/activity-logs?websiteId=${currentWebsite.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setLogs(data.logs); })
      .catch(() => {});

    // Fetch Search Console & SEO Opportunities
    fetch(`/api/saas/search-console?websiteId=${currentWebsite.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setSeoData(data); })
      .catch(() => {});
  }, [currentWebsite]);

  const handleRunDiscovery = async () => {
    if (!currentWebsite) return;
    try {
      setIsScanning(true);
      const res = await fetch('/api/saas/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: currentWebsite.id })
      });
      const data = await res.json();
      if (data.success) {
        setTopics(prev => [...data.topics, ...prev]);
        // Refresh logs
        const logRes = await fetch(`/api/saas/activity-logs?websiteId=${currentWebsite.id}`);
        const logData = await logRes.json();
        if (logData.success) setLogs(logData.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConvertToDraft = async (topicId: string) => {
    try {
      const res = await fetch(`/api/saas/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CONVERT_TO_DRAFT' })
      });
      const data = await res.json();
      if (data.success) {
        setTopics(prev => prev.map(t => t.id === topicId ? { ...t, status: 'CONVERTED_TO_DRAFT' } : t));
        if (data.article) {
          setArticles(prev => [data.article, ...prev]);
        }
        alert('Topic converted into a research draft with automated Quality Control!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Aggregated platform stats
  const totalWebsites = websites.length;
  const activeAgents = websites.filter(w => w.status === 'ACTIVE').length;
  const totalArticles = articles.length || currentWebsite?.articlesCount || 18;
  const totalOrganicClicks = currentWebsite?.trafficCount || 4820;
  const totalAffiliateClicks = currentWebsite?.affiliateClicks || 742;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner: SaaS Overview & Quick Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-indigo-950 p-6 sm:p-8 text-white border border-neutral-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Multi-Website AI Growth Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI Growth Hub Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Managing <strong>{totalWebsites} websites</strong> with isolated AI agents, automated topic scoring, quality control, and cross-channel publishing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunDiscovery}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Topics...' : 'Scan Topics & Trends'}</span>
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Website</span>
            </button>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold mb-2">
            <span>Managed Websites</span>
            <Globe className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {totalWebsites}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            100% Tenant Isolation
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold mb-2">
            <span>Active AI Agents</span>
            <Bot className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {activeAgents}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">
            Independent Memory
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold mb-2">
            <span>Articles Published</span>
            <FileEdit className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {totalArticles}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium mt-1">
            Manual Approval Mode
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold mb-2">
            <span>Organic Clicks</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {totalOrganicClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            +18.4% this month
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-semibold mb-2">
            <span>Affiliate Clicks</span>
            <MousePointerClick className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {totalAffiliateClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium mt-1">
            Amazon Tag Tracked
          </div>
        </div>
      </div>

      {/* Website Tenants Switcher Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-500" />
            Active Website Portfolio ({websites.length})
          </h2>
          <Link href="/admin/websites" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>Manage All Websites</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map(site => {
            const isCurrent = currentWebsite?.id === site.id;
            return (
              <div
                key={site.id}
                onClick={() => setCurrentWebsite(site)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? 'bg-white dark:bg-neutral-900 border-brand-500 shadow-soft-xl ring-2 ring-brand-500/20'
                    : 'bg-white/60 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-brand-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                      isCurrent ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {site.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                        {site.name}
                        {site.slug === 'techpulse' && (
                          <span className="text-[9px] bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 px-2 py-0.5 rounded font-bold border border-brand-200 dark:border-brand-800">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {site.niche} • {site.targetCountry}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {site.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-neutral-400">Articles</div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">{site.articlesCount || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400">Traffic</div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">{(site.trafficCount || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400">Clicks</div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">{site.affiliateClicks || 0}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: AI Opportunities & Live Agent Transparency Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Topic & SEO Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Priority Scored Topics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  <span>AI Content Opportunities ({currentWebsite?.name || 'Selected'})</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Algorithmically scored from 0–100 based on search intent, buyer intent, and affiliate margins.
                </p>
              </div>
              <Link href="/admin/content" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {topics.slice(0, 5).map(topic => (
                <div
                  key={topic.id}
                  className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">{topic.suggestedTitle}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                        {topic.suggestedArticleType}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2 flex-wrap">
                      <span>Keyword: <strong className="text-neutral-700 dark:text-neutral-200">{topic.primaryKeyword}</strong></span>
                      <span>•</span>
                      <span>Intent: {topic.searchIntent}</span>
                      <span>•</span>
                      <span>Affiliate: {topic.affiliatePotential}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center">
                      <span className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-extrabold block">
                        {topic.priorityScore}/100
                      </span>
                    </div>

                    {topic.status === 'CONVERTED_TO_DRAFT' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        In Pipeline
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConvertToDraft(topic.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-brand-600 dark:hover:bg-brand-400 text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                      >
                        Create Draft
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Search Console SEO Opportunities */}
          {seoData?.opportunities && (
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Search Console SEO Opportunities</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Automated analysis of striking distance keywords and high impression low CTR queries.
                  </p>
                </div>
                <Link href="/admin/search-console" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                  Full Audit
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {seoData.opportunities.slice(0, 4).map((opp: any) => (
                  <div key={opp.id} className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {opp.opportunityType}
                    </div>
                    <div className="text-xs font-extrabold text-neutral-900 dark:text-white">{opp.title}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">{opp.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Agent Transparency Activity Log & Memory */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">Agent Activity Log</h3>
              </div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase">Real-Time</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-xs text-neutral-400 text-center py-6">
                  No activity recorded yet. Run topic scan to start.
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-brand-600 dark:text-brand-400">{log.actionType}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Website-Specific AI Agent Status Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-neutral-900 to-indigo-950 text-white border border-neutral-800 space-y-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-extrabold text-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold">{currentWebsite?.name || 'TechPulse'} Growth Agent</div>
                <div className="text-xs text-neutral-400">{currentWebsite?.niche} • {currentWebsite?.targetCountry}</div>
              </div>
            </div>

            <div className="text-xs text-neutral-300 leading-relaxed space-y-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Approval Mode:</span>
                <span className="font-bold text-amber-400">{currentWebsite?.approvalMode || 'MANUAL'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Publishing Target:</span>
                <span className="font-bold text-emerald-400">{currentWebsite?.cmsType || 'NATIVE'}</span>
              </div>
            </div>

            <Link
              href="/admin/agents"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              <span>Configure Agent Rules & Memory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
