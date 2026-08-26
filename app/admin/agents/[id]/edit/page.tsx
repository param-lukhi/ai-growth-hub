'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot, Save, ArrowLeft, ShieldCheck, Sparkles, Globe, FileText,
  Search, ShoppingBag, Share2, Clock, Cpu, Send, Key, Brain,
  AlertTriangle, CheckCircle2, RefreshCw, X, Play, Copy, ExternalLink,
  Layers, Lock, Database, Info, Check, Sliders, DollarSign, PlaySquare,
  Instagram, BookOpen, BarChart2
} from 'lucide-react';
import AgentTestModal from '@/components/saas/AgentTestModal';
import {
  AGENT_TYPES_REGISTRY,
  AgentTypeKey,
  AVAILABLE_AGENT_TOOLS
} from '@/lib/saas/agent-types-registry';

interface AgentEditProps {
  params: { id: string };
}

export default function EditAgentPage({ params }: AgentEditProps) {
  const router = useRouter();
  const agentId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isDirty, setIsDirty] = useState(false);

  // Agent Core State
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState<AgentTypeKey>('BLOG_WRITER');
  const [role, setRole] = useState('');
  const [tone, setTone] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [goals, setGoals] = useState('');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED' | 'ARCHIVED'>('ACTIVE');
  const [schedule, setSchedule] = useState('3_PER_WEEK');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Website State
  const [websiteId, setWebsiteId] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [domainUrl, setDomainUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [subNiche, setSubNiche] = useState('');
  const [targetCountry, setTargetCountry] = useState('India');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandVoice, setBrandVoice] = useState('Professional');
  const [customVoice, setCustomVoice] = useState('');
  const [contentStyle, setContentStyle] = useState('');
  const [approvalMode, setApprovalMode] = useState('MANUAL');
  const [cmsType, setCmsType] = useState('NATIVE');

  // Content Settings
  const [minLength, setMinLength] = useState(800);
  const [maxLength, setMaxLength] = useState(2500);
  const [primaryTopicsStr, setPrimaryTopicsStr] = useState('');
  const [topicsToAvoidStr, setTopicsToAvoidStr] = useState('');
  const [keywordsStr, setKeywordsStr] = useState('');

  // Affiliate Settings
  const [primaryAffiliatePlatform, setPrimaryAffiliatePlatform] = useState('AMAZON');
  const [affiliateTag, setAffiliateTag] = useState('');
  const [requireVerifiedLinks, setRequireVerifiedLinks] = useState(true);
  const [autoDisclosure, setAutoDisclosure] = useState(true);

  // Memory State
  const [memoryState, setMemoryState] = useState<any>({
    brandVoice: '',
    coveredTopics: [],
    reviewedProducts: [],
    affiliateRules: []
  });

  // Diagnostics Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Load Saved Agent Data
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/saas/agents/${agentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.agent) {
          const a = data.agent;
          const w = a.website;

          setAgentName(a.name || a.agentName || '');
          setAgentType(a.agentType || 'BLOG_WRITER');
          setRole(a.description || a.role || '');
          setTone(a.tone || '');
          setSystemPrompt(a.instructions || a.systemPrompt || '');
          setGoals(a.goals || '');
          setAiModel(a.aiModel || 'gemini-2.5-flash');
          setStatus(a.status || (a.active ? 'ACTIVE' : 'PAUSED'));
          setSchedule(a.schedule || '3_PER_WEEK');

          const tools = typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : (a.tools || []);
          setSelectedTools(tools.length > 0 ? tools : ['ARTICLE_WRITER', 'PRODUCT_RESEARCH', 'SCHEMA_GENERATOR']);

          if (w) {
            setWebsiteId(w.id || '');
            setWebsiteName(w.name || '');
            setDomainUrl(w.domainUrl || '');
            setNiche(w.niche || '');
            setSubNiche(w.subNiche || '');
            setTargetCountry(a.targetCountry || w.targetCountry || 'India');
            setTargetLanguage(a.targetLanguage || w.targetLanguage || 'English');
            setTargetAudience(a.targetAudience || w.targetAudience || '');
            setBrandVoice(w.brandVoice || 'Professional');
            setContentStyle(w.contentStyle || '');
            setApprovalMode(w.approvalMode || 'MANUAL');
            setCmsType(w.cmsType || 'NATIVE');

            const pTopics = typeof w.primaryTopics === 'string' ? JSON.parse(w.primaryTopics || '[]') : (w.primaryTopics || []);
            setPrimaryTopicsStr(Array.isArray(pTopics) ? pTopics.join(', ') : '');

            const aTopics = typeof w.topicsToAvoid === 'string' ? JSON.parse(w.topicsToAvoid || '[]') : (w.topicsToAvoid || []);
            setTopicsToAvoidStr(Array.isArray(aTopics) ? aTopics.join(', ') : '');
          }

          const kw = typeof a.keywords === 'string' ? JSON.parse(a.keywords || '[]') : (a.keywords || []);
          setKeywordsStr(Array.isArray(kw) ? kw.join(', ') : '');

          const mem = typeof a.memoryState === 'string' ? JSON.parse(a.memoryState || '{}') : (a.memoryState || {});
          setMemoryState(mem);

          const affRules = typeof a.affiliateRules === 'string' ? JSON.parse(a.affiliateRules || '{}') : (a.affiliateRules || {});
          if (affRules.primaryPlatform) setPrimaryAffiliatePlatform(affRules.primaryPlatform);
          if (affRules.affiliateTag) setAffiliateTag(affRules.affiliateTag);
          if (affRules.requireVerifiedLinks !== undefined) setRequireVerifiedLinks(affRules.requireVerifiedLinks);
          if (affRules.autoDisclosure !== undefined) setAutoDisclosure(affRules.autoDisclosure);
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
        setIsDirty(false);
      });
  }, [agentId]);

  const handleFieldChange = () => {
    if (!isDirty) setIsDirty(true);
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
    );
    handleFieldChange();
  };

  const handleSaveChanges = async (e?: React.FormEvent, runTestAfter: boolean = false) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const parsedPrimaryTopics = primaryTopicsStr.split(',').map(s => s.trim()).filter(Boolean);
      const parsedTopicsToAvoid = topicsToAvoidStr.split(',').map(s => s.trim()).filter(Boolean);
      const parsedKeywords = keywordsStr.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        name: agentName,
        description: role,
        agentType,
        status,
        active: status === 'ACTIVE',
        instructions: systemPrompt,
        goals,
        targetCountry,
        targetLanguage,
        targetAudience,
        categories: parsedPrimaryTopics,
        keywords: parsedKeywords,
        tone,
        contentRules: { minLength, maxLength },
        seoRules: { autoTitle: true, autoMeta: true, autoSchema: true },
        affiliateRules: {
          primaryPlatform: primaryAffiliatePlatform,
          affiliateTag,
          requireVerifiedLinks,
          autoDisclosure
        },
        publishingRules: { approvalMode },
        schedule,
        aiModel,
        tools: selectedTools,
        memoryState: {
          ...memoryState,
          brandVoice: brandVoice === 'Custom' ? customVoice : brandVoice,
          targetAudience,
          coveredTopics: memoryState.coveredTopics || [],
          reviewedProducts: memoryState.reviewedProducts || [],
          topicsToAvoid: parsedTopicsToAvoid
        },
        website: {
          name: websiteName,
          domainUrl,
          niche,
          subNiche,
          targetCountry,
          targetLanguage,
          targetAudience,
          brandVoice: brandVoice === 'Custom' ? customVoice : brandVoice,
          contentStyle,
          primaryTopics: parsedPrimaryTopics,
          topicsToAvoid: parsedTopicsToAvoid,
          approvalMode,
          cmsType
        }
      };

      const res = await fetch(`/api/saas/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (runTestAfter) {
          setIsTestModalOpen(true);
        }
      } else {
        alert(data.error || 'Failed to save agent configuration.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving agent');
    } finally {
      setIsSaving(false);
    }
  };

  const TABS = [
    { id: 'general', label: '1. General & Type', icon: Bot },
    { id: 'website', label: '2. Website & Geo', icon: Globe },
    { id: 'tools', label: '3. Tools & Skills', icon: Cpu },
    { id: 'content', label: '4. Content & Rules', icon: FileText },
    { id: 'affiliate', label: '5. Multi-Affiliate', icon: ShoppingBag },
    { id: 'automation', label: '6. Automation & Schedule', icon: Clock },
    { id: 'memory', label: '7. Memory & Brand Voice', icon: Brain }
  ];

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-neutral-500">Loading Agent Configuration from Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/agents"
            className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                {agentName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200">
                {AGENT_TYPES_REGISTRY[agentType]?.name || agentType}
              </span>
              {status === 'ACTIVE' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                  Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                  Paused
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Isolated Tenant ID: <span className="font-mono text-neutral-500">{websiteId}</span> • Connected to <strong>{websiteName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unsaved changes</span>
            </span>
          )}

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved successfully!</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => handleSaveChanges(undefined, true)}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Save & Test</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleSaveChanges(e, false)}
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800 scrollbar-none">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
        
        {/* TAB 1: General */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">General Agent Settings & Type</h2>
              <p className="text-xs text-neutral-400">Manage agent type, core mission, instructions, and AI reasoning model.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Agent Type</label>
                <select
                  value={agentType}
                  onChange={(e) => {
                    setAgentType(e.target.value as AgentTypeKey);
                    handleFieldChange();
                  }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  {(Object.keys(AGENT_TYPES_REGISTRY) as AgentTypeKey[]).map(k => (
                    <option key={k} value={k}>{AGENT_TYPES_REGISTRY[k].name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">AI Reasoning Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => { setAiModel(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gpt-4o">GPT-4o (OpenAI)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => { setAgentName(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value as any); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Running Scheduled Jobs)</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Role / Description</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => { setRole(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Instructions / System Prompt</label>
                <textarea
                  rows={5}
                  value={systemPrompt}
                  onChange={(e) => { setSystemPrompt(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[11px] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Primary Strategic Goals</label>
                <input
                  type="text"
                  value={goals}
                  onChange={(e) => { setGoals(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Website & Geo */}
        {activeTab === 'website' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Connected Website & Target Market</h2>
              <p className="text-xs text-neutral-400">Settings and endpoints for the connected tenant property.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Website Name</label>
                <input
                  type="text"
                  value={websiteName}
                  onChange={(e) => { setWebsiteName(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Domain URL</label>
                <input
                  type="url"
                  value={domainUrl}
                  onChange={(e) => { setDomainUrl(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Country</label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={(e) => { setTargetCountry(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Language</label>
                <input
                  type="text"
                  value={targetLanguage}
                  onChange={(e) => { setTargetLanguage(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Audience Profile</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => { setTargetAudience(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Tools */}
        {activeTab === 'tools' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Authorized Tools & Capabilities</h2>
              <p className="text-xs text-neutral-400">Select which capabilities this Agent is permitted to execute.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {AVAILABLE_AGENT_TOOLS.map(tool => {
                const isSelected = selectedTools.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 mt-0.5 accent-brand-600 rounded shrink-0 pointer-events-none"
                    />
                    <div>
                      <div className="font-extrabold text-neutral-900 dark:text-white">{tool.name}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{tool.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Content & Rules */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Content Directives & Governance</h2>
              <p className="text-xs text-neutral-400">Rules governing word counts, topic coverage, and approval flows.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Minimum Word Count</label>
                <input
                  type="number"
                  value={minLength}
                  onChange={(e) => { setMinLength(parseInt(e.target.value) || 800); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Maximum Word Count</label>
                <input
                  type="number"
                  value={maxLength}
                  onChange={(e) => { setMaxLength(parseInt(e.target.value) || 2500); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Priority Keywords (comma separated)</label>
                <input
                  type="text"
                  value={keywordsStr}
                  onChange={(e) => { setKeywordsStr(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Categories (comma separated)</label>
                <input
                  type="text"
                  value={primaryTopicsStr}
                  onChange={(e) => { setPrimaryTopicsStr(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Multi-Affiliate */}
        {activeTab === 'affiliate' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Multi-Affiliate & Product Directives</h2>
              <p className="text-xs text-neutral-400">Settings for affiliate platforms, buy button tags, and verification rules.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Primary Affiliate Platform</label>
                <select
                  value={primaryAffiliatePlatform}
                  onChange={(e) => { setPrimaryAffiliatePlatform(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="AMAZON">Amazon Associates</option>
                  <option value="FLIPKART">Flipkart Affiliate</option>
                  <option value="CUELINKS">Cuelinks</option>
                  <option value="VCOMMISSION">vCommission</option>
                  <option value="IMPACT">impact.com</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Primary Tracking ID / Store Tag</label>
                <input
                  type="text"
                  value={affiliateTag}
                  onChange={(e) => { setAffiliateTag(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireVerifiedLinks}
                    onChange={(e) => { setRequireVerifiedLinks(e.target.checked); handleFieldChange(); }}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">Strict Product-to-Affiliate Verification</div>
                    <div className="text-neutral-400">Never output fake links. If unverified, mark as "Affiliate Link Required".</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDisclosure}
                    onChange={(e) => { setAutoDisclosure(e.target.checked); handleFieldChange(); }}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">Auto Attach FTC Affiliate Notice</div>
                    <div className="text-neutral-400">Ensures compliant disclosure notice on all published content.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Automation & Schedule */}
        {activeTab === 'automation' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Automation Cadence & Approval Policy</h2>
              <p className="text-xs text-neutral-400">Configure scheduled runs and approval safeguards.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Execution Schedule</label>
                <select
                  value={schedule}
                  onChange={(e) => { setSchedule(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="MANUAL">Manual Run Only</option>
                  <option value="DAILY">Daily</option>
                  <option value="3_PER_WEEK">3 Times per Week</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Approval Safeguard</label>
                <select
                  value={approvalMode}
                  onChange={(e) => { setApprovalMode(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="MANUAL">Manual Human Approval (Recommended)</option>
                  <option value="SEMI_AUTOMATIC">Semi-Automatic (Quality Score &gt; 90)</option>
                  <option value="AUTOMATIC">Fully Automatic</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Memory */}
        {activeTab === 'memory' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Agent Isolated Memory State</h2>
              <p className="text-xs text-neutral-400">Context, previous topics, and learnings preserved privately for this Agent.</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs space-y-3">
              <div className="font-mono text-[11px] p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 max-h-60 overflow-y-auto">
                <pre>{JSON.stringify(memoryState, null, 2)}</pre>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Memory is updated automatically on every execution run.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Diagnostics Test Modal */}
      <AgentTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        agentId={agentId}
        agentName={agentName}
        websiteName={websiteName}
      />
    </div>
  );
}
