'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWebsite } from '@/lib/saas/website-context';
import {
  Bot, Sparkles, Play, Pause, Copy, Trash2, Edit3, ShieldCheck,
  Plus, Search, Filter, LayoutGrid, Table, ArrowUpRight, CheckCircle2,
  AlertCircle, RefreshCw, Layers, ExternalLink, Zap, Eye, ShoppingBag,
  TrendingUp, BarChart3, Clock, Check, X, FileText, Share2, PlaySquare,
  Instagram, BookOpen, Sliders, BarChart2
} from 'lucide-react';
import AgentTestModal from '@/components/saas/AgentTestModal';
import { AGENT_TYPES_REGISTRY, AgentTypeKey } from '@/lib/saas/agent-types-registry';

interface AgentListItem {
  id: string;
  websiteId: string;
  name: string;
  agentName?: string;
  description?: string;
  role?: string;
  agentType: AgentTypeKey;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  active?: boolean;
  instructions?: string;
  goals?: string;
  targetCountry: string;
  targetLanguage: string;
  targetAudience?: string;
  categories?: any;
  keywords?: any;
  tone: string;
  contentRules?: any;
  seoRules?: any;
  affiliateRules?: any;
  publishingRules?: any;
  schedule?: string;
  aiModel: string;
  tools?: any;
  memoryState?: any;
  createdAt: string;
  updatedAt: string;
  website: {
    id: string;
    name: string;
    slug: string;
    domainUrl: string;
    niche: string;
    subNiche?: string | null;
    targetCountry: string;
    targetLanguage: string;
    approvalMode: string;
    status: string;
    trafficCount: number;
    affiliateClicks: number;
    lastAgentRun?: string | null;
  };
  stats?: {
    articlesGenerated: number;
    articlesPublished: number;
    articlesRejected: number;
    trafficCount: number;
    affiliateClicks: number;
    averageQualityScore: number;
    lastRun?: string | null;
  };
}

const TYPE_ICONS: Record<string, any> = {
  SEO_TRAFFIC: Search,
  BLOG_WRITER: FileText,
  PRODUCT_REVIEW: ShoppingBag,
  PRODUCT_COMPARISON: Layers,
  AFFILIATE_CONTENT: Zap,
  SEARCH_CONSOLE: BarChart2,
  PINTEREST: Share2,
  YOUTUBE_SHORTS: PlaySquare,
  INSTAGRAM_REELS: Instagram,
  MEDIUM: BookOpen,
  CUSTOM: Sliders
};

export default function AIAgentsControlCenterPage() {
  const router = useRouter();
  const { currentWebsite, setCurrentWebsite, refreshWebsites } = useWebsite();

  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Action states
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Test modal
  const [testModalState, setTestModalState] = useState<{
    isOpen: boolean;
    agentId: string;
    agentName: string;
    websiteName: string;
  }>({
    isOpen: false,
    agentId: '',
    agentName: '',
    websiteName: ''
  });

  // Duplicate modal
  const [duplicateModalAgent, setDuplicateModalAgent] = useState<AgentListItem | null>(null);
  const [duplicateAgentName, setDuplicateAgentName] = useState('');
  const [duplicateWebsiteName, setDuplicateWebsiteName] = useState('');
  const [duplicateDomainUrl, setDuplicateDomainUrl] = useState('');
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Delete modal
  const [deleteModalAgent, setDeleteModalAgent] = useState<AgentListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/saas/agents');
      const data = await res.json();
      if (data.success && Array.isArray(data.agents)) {
        setAgents(data.agents);
      }
    } catch (e) {
      console.error('Failed to load agents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const triggerRunNow = async (agent: AgentListItem) => {
    try {
      setRunningAgentId(agent.id);
      const res = await fetch(`/api/saas/agents/${agent.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RUN_NOW' })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Agent "${agent.name || agent.agentName}" executed successfully! Generated draft / analysis.`);
        setTimeout(() => setActionSuccessMsg(null), 5000);
        fetchAgents();
      } else {
        alert(data.error || 'Failed to run agent.');
      }
    } catch (e) {
      console.error(e);
      alert('Error running agent');
    } finally {
      setRunningAgentId(null);
    }
  };

  const toggleAgentStatus = async (agent: AgentListItem) => {
    try {
      const res = await fetch(`/api/saas/agents/${agent.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_STATUS' })
      });
      const data = await res.json();
      if (data.success) {
        setAgents(prev =>
          prev.map(a =>
            a.id === agent.id
              ? { ...a, status: data.status, active: data.active }
              : a
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateModalAgent) return;

    try {
      setIsDuplicating(true);
      const res = await fetch(`/api/saas/agents/${duplicateModalAgent.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DUPLICATE',
          payload: {
            newAgentName: duplicateAgentName,
            newWebsiteName: duplicateWebsiteName,
            newDomainUrl: duplicateDomainUrl
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setDuplicateModalAgent(null);
        setActionSuccessMsg(`Agent duplicated successfully as "${data.clonedAgent?.name}"!`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchAgents();
        refreshWebsites();
      } else {
        alert(data.error || 'Failed to duplicate agent.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!deleteModalAgent) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/saas/agents/${deleteModalAgent.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setDeleteModalAgent(null);
        setActionSuccessMsg(data.message || 'Agent deleted.');
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchAgents();
      } else {
        alert(data.error || 'Failed to delete agent.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const agentTitle = (agent.name || agent.agentName || '').toLowerCase();
    const websiteTitle = (agent.website?.name || '').toLowerCase();
    const niche = (agent.website?.niche || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = agentTitle.includes(q) || websiteTitle.includes(q) || niche.includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ? true :
      statusFilter === 'ACTIVE' ? (agent.status === 'ACTIVE' || agent.active) :
      (agent.status === 'PAUSED' || !agent.active);

    const matchesType =
      typeFilter === 'ALL' ? true : agent.agentType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'ACTIVE' || a.active).length;
  const totalArticles = agents.reduce((acc, a) => acc + (a.stats?.articlesGenerated || 0), 0);
  const avgQuality = agents.length > 0
    ? Math.round(agents.reduce((acc, a) => acc + (a.stats?.averageQualityScore || 90), 0) / agents.length)
    : 90;

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-100" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-indigo-950 to-brand-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-extrabold backdrop-blur-md">
            <Bot className="w-3.5 h-3.5 text-brand-400" />
            <span>Multi-Agent, Multi-Website Growth Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI Agent Control Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
            Create, configure, and automate 11 specialized Agent Types (SEO, Blog Writer, Product Reviews, Comparisons, Affiliate, Socials, & Custom) with strict multi-tenant isolation.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <Link
            href="/admin/agents/new"
            className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-extrabold text-xs shadow-lg shadow-brand-500/30 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Agent</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-1">
          <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Total Agents</span>
            <Bot className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">{totalAgents}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{activeAgents} Active Running</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-1">
          <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Articles Generated</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">{totalArticles}</div>
          <div className="text-[11px] text-neutral-400">Across all connected properties</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-1">
          <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Avg. Quality Score</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">{avgQuality} <span className="text-xs text-neutral-400">/ 100</span></div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Strict Fact & Spec Checked</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-1">
          <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Multi-Tenant Separation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
          <div className="text-[11px] text-neutral-400">Isolated memory & affiliate tags</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search agents, types, niches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'ALL' ? 'bg-white dark:bg-neutral-700 shadow-2xs text-neutral-900 dark:text-white font-extrabold' : 'hover:text-neutral-900'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'ACTIVE' ? 'bg-white dark:bg-neutral-700 shadow-2xs text-emerald-600 dark:text-emerald-400 font-extrabold' : 'hover:text-neutral-900'}`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('PAUSED')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'PAUSED' ? 'bg-white dark:bg-neutral-700 shadow-2xs text-amber-600 dark:text-amber-400 font-extrabold' : 'hover:text-neutral-900'}`}
              >
                Paused
              </button>
            </div>

            <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-700 pl-3">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-xl border ${viewMode === 'cards' ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-950 dark:border-brand-800 dark:text-brand-400' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl border ${viewMode === 'table' ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-950 dark:border-brand-800 dark:text-brand-400' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                title="Table View"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Agent Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              typeFilter === 'ALL'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            All Types ({agents.length})
          </button>
          {(Object.keys(AGENT_TYPES_REGISTRY) as AgentTypeKey[]).map(typeKey => {
            const def = AGENT_TYPES_REGISTRY[typeKey];
            const isSelected = typeFilter === typeKey;
            const count = agents.filter(a => a.agentType === typeKey).length;
            return (
              <button
                key={typeKey}
                onClick={() => setTypeFilter(typeKey)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {def.shortName} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-neutral-500">Loading AI Growth Agents...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 mx-auto">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">No Growth Agents Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Create your specialized SEO, Review, Comparison, or Custom Agent to start autonomous growth workflows.
            </p>
          </div>
          <Link
            href="/admin/agents/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Growth Agent</span>
          </Link>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map(agent => {
            const typeDef = AGENT_TYPES_REGISTRY[agent.agentType] || AGENT_TYPES_REGISTRY.CUSTOM;
            const IconComponent = TYPE_ICONS[agent.agentType] || Bot;
            const isActive = agent.status === 'ACTIVE' || agent.active;

            return (
              <div
                key={agent.id}
                className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative group"
              >
                {/* Agent Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-brand-500/20">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white group-hover:text-brand-600 transition-colors">
                          {agent.name || agent.agentName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="font-bold text-brand-600 dark:text-brand-400">{typeDef.shortName}</span>
                          <span>•</span>
                          <span>{agent.website?.name}</span>
                        </div>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Paused
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {agent.description || agent.role || typeDef.description}
                  </p>
                </div>

                {/* Stats Grid inside Card */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase">Articles</div>
                    <div className="text-xs font-black text-neutral-900 dark:text-white mt-0.5">
                      {agent.stats?.articlesPublished || 0} / {agent.stats?.articlesGenerated || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase">Traffic</div>
                    <div className="text-xs font-black text-neutral-900 dark:text-white mt-0.5">
                      {(agent.stats?.trafficCount || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase">Quality</div>
                    <div className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {agent.stats?.averageQualityScore || 90}/100
                    </div>
                  </div>
                </div>

                {/* Footer Meta & Actions */}
                <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{agent.schedule || 'Weekly'}</span>
                    </div>
                    <span>{agent.website?.targetCountry || 'India'}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => triggerRunNow(agent)}
                      disabled={runningAgentId === agent.id}
                      className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {runningAgentId === agent.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>{runningAgentId === agent.id ? 'Running...' : 'Run Now'}</span>
                    </button>

                    <Link
                      href={`/admin/agents/${agent.id}/edit`}
                      className="py-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-extrabold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => setTestModalState({
                        isOpen: true,
                        agentId: agent.id,
                        agentName: agent.name || agent.agentName || 'Agent',
                        websiteName: agent.website?.name || 'Website'
                      })}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-neutral-600 dark:text-neutral-300 hover:text-indigo-600"
                      title="Test Agent Diagnostics"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleAgentStatus(agent)}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-950 text-neutral-600 dark:text-neutral-300 hover:text-amber-600"
                      title={isActive ? 'Pause Agent' : 'Resume Agent'}
                    >
                      {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => {
                        setDuplicateModalAgent(agent);
                        setDuplicateAgentName(`${agent.name || agent.agentName} (Copy)`);
                        setDuplicateWebsiteName(`${agent.website?.name || 'Website'} (Copy)`);
                        setDuplicateDomainUrl(`https://${agent.website?.slug || 'site'}-copy.com`);
                      }}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-neutral-600 dark:text-neutral-300 hover:text-blue-600"
                      title="Duplicate Agent"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteModalAgent(agent)}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-neutral-600 dark:text-neutral-300 hover:text-rose-600"
                      title="Delete Agent Safely"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4">Agent Name & Type</th>
                  <th className="px-6 py-4">Website / Target</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Articles (Pub/Gen)</th>
                  <th className="px-6 py-4">Traffic & Clicks</th>
                  <th className="px-6 py-4">Quality</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                {filteredAgents.map(agent => {
                  const typeDef = AGENT_TYPES_REGISTRY[agent.agentType] || AGENT_TYPES_REGISTRY.CUSTOM;
                  const IconComponent = TYPE_ICONS[agent.agentType] || Bot;
                  const isActive = agent.status === 'ACTIVE' || agent.active;

                  return (
                    <tr key={agent.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-neutral-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{agent.name || agent.agentName}</div>
                          <div className="text-[10px] text-brand-600 font-bold">{typeDef.shortName}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-neutral-800 dark:text-neutral-200">{agent.website?.name}</div>
                        <div className="text-[11px] text-neutral-400">{agent.website?.niche} • {agent.targetCountry}</div>
                      </td>

                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border border-amber-200">
                            Paused
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                        {agent.stats?.articlesPublished || 0} / {agent.stats?.articlesGenerated || 0}
                      </td>

                      <td className="px-6 py-4">
                        <div>{(agent.stats?.trafficCount || 0).toLocaleString()} views</div>
                        <div className="text-[11px] text-emerald-600 font-bold">{agent.stats?.affiliateClicks || 0} clicks</div>
                      </td>

                      <td className="px-6 py-4 font-bold text-amber-600 dark:text-amber-400">
                        {agent.stats?.averageQualityScore || 90}/100
                      </td>

                      <td className="px-6 py-4 text-neutral-500">
                        {agent.schedule || 'Weekly'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => triggerRunNow(agent)}
                            disabled={runningAgentId === agent.id}
                            className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100"
                            title="Run Agent"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/admin/agents/${agent.id}/edit`}
                            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200"
                            title="Edit Agent"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setTestModalState({
                              isOpen: true,
                              agentId: agent.id,
                              agentName: agent.name || agent.agentName || 'Agent',
                              websiteName: agent.website?.name || 'Website'
                            })}
                            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-50 text-neutral-600 hover:text-indigo-600"
                            title="Diagnostics"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModalAgent(agent)}
                            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 text-neutral-600 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diagnostics Test Modal */}
      <AgentTestModal
        isOpen={testModalState.isOpen}
        onClose={() => setTestModalState({ ...testModalState, isOpen: false })}
        agentId={testModalState.agentId}
        agentName={testModalState.agentName}
        websiteName={testModalState.websiteName}
      />

      {/* Duplicate Agent Modal */}
      {duplicateModalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">Duplicate Agent Configuration</h3>
              </div>
              <button onClick={() => setDuplicateModalAgent(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Cloning <strong>{duplicateModalAgent.name || duplicateModalAgent.agentName}</strong> will copy prompt instructions and tools while keeping isolated credentials.
            </p>

            <form onSubmit={handleDuplicateAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Cloned Agent Name</label>
                <input
                  type="text"
                  required
                  value={duplicateAgentName}
                  onChange={(e) => setDuplicateAgentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setDuplicateModalAgent(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDuplicating}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isDuplicating ? 'Cloning...' : 'Duplicate Agent'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Delete Agent Modal */}
      {deleteModalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">Delete Growth Agent</h3>
                <p className="text-xs text-neutral-500">Confirm agent removal</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to delete <strong>{deleteModalAgent.name || deleteModalAgent.agentName}</strong>?
              <br /><br />
              <span className="font-bold text-neutral-900 dark:text-white">Safe Retention:</span> Connected articles, website analytics, and affiliate records will remain preserved in the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDeleteModalAgent(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAgent}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Safe Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
