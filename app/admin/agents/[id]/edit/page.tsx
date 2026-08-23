'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot, Save, ArrowLeft, ShieldCheck, Sparkles, Globe, FileText,
  Search, ShoppingBag, Share2, Clock, Cpu, Send, Key, Brain,
  AlertTriangle, CheckCircle2, RefreshCw, X, Play, Copy, ExternalLink,
  Layers, Lock, Database, Info, Check
} from 'lucide-react';
import AgentTestModal from '@/components/saas/AgentTestModal';

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
  const [role, setRole] = useState('');
  const [tone, setTone] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [active, setActive] = useState(true);

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
  const [publishingFrequency, setPublishingFrequency] = useState('WEEKLY');
  const [approvalMode, setApprovalMode] = useState('MANUAL');
  const [cmsType, setCmsType] = useState('NATIVE');

  // Content Settings
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([
    'Product Reviews', 'Comparisons', 'Buying Guides'
  ]);
  const [minLength, setMinLength] = useState(800);
  const [maxLength, setMaxLength] = useState(2500);
  const [primaryTopics, setPrimaryTopics] = useState<string[]>([]);
  const [primaryTopicsStr, setPrimaryTopicsStr] = useState('');
  const [topicsToAvoid, setTopicsToAvoid] = useState<string[]>([]);
  const [topicsToAvoidStr, setTopicsToAvoidStr] = useState('');
  const [contentApprovalRequired, setContentApprovalRequired] = useState(true);

  // Research Settings
  const [researchDepth, setResearchDepth] = useState('Standard');
  const [requireSources, setRequireSources] = useState(true);
  const [verifyClaims, setVerifyClaims] = useState(true);
  const [preferOfficialSources, setPreferOfficialSources] = useState(true);
  const [firstHandEvidenceOnly, setFirstHandEvidenceOnly] = useState(true);

  // SEO Settings
  const [autoGenerateTitle, setAutoGenerateTitle] = useState(true);
  const [autoMetaDescription, setAutoMetaDescription] = useState(true);
  const [autoSchemaJson, setAutoSchemaJson] = useState(true);
  const [autoInternalLinks, setAutoInternalLinks] = useState(true);
  const [seoScoreThreshold, setSeoScoreThreshold] = useState(85);

  // Products & Affiliate
  const [affiliateNetwork, setAffiliateNetwork] = useState('Amazon Associates');
  const [affiliateTag, setAffiliateTag] = useState('techpulse-20');
  const [requireAffiliateMatch, setRequireAffiliateMatch] = useState(true);
  const [requireVerifiedImages, setRequireVerifiedImages] = useState(true);
  const [autoDisclosure, setAutoDisclosure] = useState(true);

  // Social Settings
  const [pinterestEnabled, setPinterestEnabled] = useState(true);
  const [youtubeShortsEnabled, setYoutubeShortsEnabled] = useState(true);
  const [instagramReelsEnabled, setInstagramReelsEnabled] = useState(true);
  const [mediumEnabled, setMediumEnabled] = useState(true);
  const [autoPublishSocial, setAutoPublishSocial] = useState(false);

  // Automation Schedules
  const [dailyTopicDiscovery, setDailyTopicDiscovery] = useState(true);
  const [weeklyGscAudit, setWeeklyGscAudit] = useState(true);
  const [postPublishSocial, setPostPublishSocial] = useState(true);
  const [contentDecayAudit, setContentDecayAudit] = useState(false);

  // AI & Quality
  const [aiModelProvider, setAiModelProvider] = useState('Gemini 2.5 Flash');
  const [temperature, setTemperature] = useState(0.4);
  const [qualityThreshold, setQualityThreshold] = useState(85);
  const [strictFactChecking, setStrictFactChecking] = useState(true);

  // Memory State
  const [memoryState, setMemoryState] = useState<any>({
    brandVoice: '',
    coveredTopics: [],
    reviewedProducts: [],
    affiliateRules: [],
    topicsToAvoid: [],
    successfulTopics: [],
    preferredSources: []
  });

  // Integrations & Activity Logs
  const [integrationsList, setIntegrationsList] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Diagnostics Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Load Real Saved Agent Data
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/saas/agents/${agentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.agent) {
          const a = data.agent;
          const w = a.website;

          setAgentName(a.agentName || '');
          setRole(a.role || '');
          setTone(a.tone || '');
          setSystemPrompt(a.systemPrompt || '');
          setActive(a.active !== false);

          if (w) {
            setWebsiteId(w.id || '');
            setWebsiteName(w.name || '');
            setDomainUrl(w.domainUrl || '');
            setNiche(w.niche || '');
            setSubNiche(w.subNiche || '');
            setTargetCountry(w.targetCountry || 'India');
            setTargetLanguage(w.targetLanguage || 'English');
            setTargetAudience(w.targetAudience || '');
            setBrandVoice(w.brandVoice || 'Professional');
            setContentStyle(w.contentStyle || '');
            setPublishingFrequency(w.publishingFrequency || 'WEEKLY');
            setApprovalMode(w.approvalMode || 'MANUAL');
            setCmsType(w.cmsType || 'NATIVE');

            const pTopics = typeof w.primaryTopics === 'string' ? JSON.parse(w.primaryTopics || '[]') : (w.primaryTopics || []);
            setPrimaryTopics(pTopics);
            setPrimaryTopicsStr(Array.isArray(pTopics) ? pTopics.join(', ') : '');

            const aTopics = typeof w.topicsToAvoid === 'string' ? JSON.parse(w.topicsToAvoid || '[]') : (w.topicsToAvoid || []);
            setTopicsToAvoid(aTopics);
            setTopicsToAvoidStr(Array.isArray(aTopics) ? aTopics.join(', ') : '');

            if (w.integrations) setIntegrationsList(w.integrations);
            if (w.activityLogs) setActivityLogs(w.activityLogs);
          }

          const mem = typeof a.memoryState === 'string' ? JSON.parse(a.memoryState || '{}') : (a.memoryState || {});
          setMemoryState(mem);

          const custom = typeof a.customRules === 'string' ? JSON.parse(a.customRules || '{}') : (a.customRules || {});
          if (custom.minLength) setMinLength(custom.minLength);
          if (custom.maxLength) setMaxLength(custom.maxLength);
          if (custom.aiModel) setAiModelProvider(custom.aiModel);
          if (custom.temperature) setTemperature(custom.temperature);
          if (custom.qualityThreshold) setQualityThreshold(custom.qualityThreshold);
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

  const handleSaveChanges = async (e?: React.FormEvent, runTestAfter: boolean = false) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const parsedPrimaryTopics = primaryTopicsStr.split(',').map(s => s.trim()).filter(Boolean);
      const parsedTopicsToAvoid = topicsToAvoidStr.split(',').map(s => s.trim()).filter(Boolean);

      const customRules = {
        minLength,
        maxLength,
        researchDepth,
        requireSources,
        verifyClaims,
        preferOfficialSources,
        firstHandEvidenceOnly,
        autoGenerateTitle,
        autoMetaDescription,
        autoSchemaJson,
        autoInternalLinks,
        seoScoreThreshold,
        requireAffiliateMatch,
        requireVerifiedImages,
        autoDisclosure,
        pinterestEnabled,
        youtubeShortsEnabled,
        instagramReelsEnabled,
        mediumEnabled,
        autoPublishSocial,
        aiModel: aiModelProvider,
        temperature,
        qualityThreshold,
        strictFactChecking
      };

      const payload = {
        agentName,
        role,
        tone,
        systemPrompt,
        active,
        memoryState: {
          ...memoryState,
          brandVoice: brandVoice === 'Custom' ? customVoice : brandVoice,
          targetAudience,
          coveredTopics: memoryState.coveredTopics || [],
          reviewedProducts: memoryState.reviewedProducts || [],
          topicsToAvoid: parsedTopicsToAvoid
        },
        customRules,
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
          publishingFrequency,
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
    { id: 'general', label: '1. General', icon: Bot },
    { id: 'website', label: '2. Website', icon: Globe },
    { id: 'content', label: '3. Content', icon: FileText },
    { id: 'research', label: '4. Research', icon: Search },
    { id: 'seo', label: '5. SEO', icon: Sparkles },
    { id: 'affiliate', label: '6. Products & Affiliate', icon: ShoppingBag },
    { id: 'social', label: '7. Social Media', icon: Share2 },
    { id: 'automation', label: '8. Automation', icon: Clock },
    { id: 'ai', label: '9. AI & Quality', icon: Cpu },
    { id: 'publishing', label: '10. Publishing', icon: Send },
    { id: 'integrations', label: '11. Integrations', icon: Key },
    { id: 'memory', label: '12. Memory', icon: Brain },
    { id: 'safety', label: '13. Safety', icon: ShieldCheck },
    { id: 'activity', label: '14. Activity', icon: Layers }
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
      
      {/* Top Fixed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/agents"
            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                {agentName}
              </h1>
              {active ? (
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
            <span>Save & Test Agent</span>
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

      {/* 14 Tabs Navigation Bar */}
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
              <h2 className="text-base font-black text-neutral-900 dark:text-white">General Agent Settings</h2>
              <p className="text-xs text-neutral-400">Core brand persona, role objective, and custom system prompt.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={e => { setAgentName(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Agent Role / Specialization</label>
                <input
                  type="text"
                  value={role}
                  onChange={e => { setRole(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Brand Voice</label>
                <select
                  value={brandVoice}
                  onChange={e => { setBrandVoice(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="Professional">Professional (Objective & Authoritative)</option>
                  <option value="Friendly">Friendly & Approachable</option>
                  <option value="Expert">Expert Technical Reviewer</option>
                  <option value="Simple">Simple & Plain English</option>
                  <option value="Editorial">Editorial & Insightful</option>
                  <option value="Conversational">Conversational & Engaging</option>
                  <option value="Custom">Custom Voice Prompt</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Tone Directives</label>
                <input
                  type="text"
                  value={tone}
                  onChange={e => { setTone(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">System Prompt & Guardrails</label>
              <textarea
                rows={5}
                value={systemPrompt}
                onChange={e => { setSystemPrompt(e.target.value); handleFieldChange(); }}
                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Website */}
        {activeTab === 'website' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-neutral-900 dark:text-white">Connected Website Property</h2>
                <p className="text-xs text-neutral-400">Settings and endpoints for the tenant property.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-xs border border-emerald-200">
                ✓ Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Website Name</label>
                <input
                  type="text"
                  value={websiteName}
                  onChange={e => { setWebsiteName(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Domain URL</label>
                <input
                  type="url"
                  value={domainUrl}
                  onChange={e => { setDomainUrl(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Niche</label>
                <input
                  type="text"
                  value={niche}
                  onChange={e => { setNiche(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Sub-Niche</label>
                <input
                  type="text"
                  value={subNiche}
                  onChange={e => { setSubNiche(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Country</label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={e => { setTargetCountry(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Language</label>
                <input
                  type="text"
                  value={targetLanguage}
                  onChange={e => { setTargetLanguage(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Content */}
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
                  onChange={e => { setMinLength(parseInt(e.target.value) || 600); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Maximum Word Count</label>
                <input
                  type="number"
                  value={maxLength}
                  onChange={e => { setMaxLength(parseInt(e.target.value) || 3000); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Primary Topics to Prioritize (comma separated)</label>
                <input
                  type="text"
                  value={primaryTopicsStr}
                  onChange={e => { setPrimaryTopicsStr(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Topics / Competitors to Avoid (comma separated)</label>
                <input
                  type="text"
                  value={topicsToAvoidStr}
                  onChange={e => { setTopicsToAvoidStr(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Research */}
        {activeTab === 'research' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Research Depth & Source Rules</h2>
              <p className="text-xs text-neutral-400">Strict requirements for claim verification and category research depth.</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireSources}
                  onChange={e => { setRequireSources(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Require Official Sources & Manufacturer Data</div>
                  <div className="text-neutral-400">Only extract specifications from official spec sheets and verified databases.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={firstHandEvidenceOnly}
                  onChange={e => { setFirstHandEvidenceOnly(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Zero Fake Lab Testing Claims Enforcement</div>
                  <div className="text-neutral-400">Prohibit "we tested in our lab" phrases unless verified first-hand evidence exists.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifyClaims}
                  onChange={e => { setVerifyClaims(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Cross-Check Battery & Dimension Claims</div>
                  <div className="text-neutral-400">Flag discrepancies between marketing claims and real user consensus.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">SEO Directives & Structured Data</h2>
              <p className="text-xs text-neutral-400">Automatic title generation, meta tags, schema JSON-LD, and internal linking.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenerateTitle}
                  onChange={e => { setAutoGenerateTitle(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Auto-Generate High-CTR SEO Titles</div>
                  <div className="text-neutral-400">Length calibrated between 40-60 characters.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSchemaJson}
                  onChange={e => { setAutoSchemaJson(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Auto Schema.org JSON-LD</div>
                  <div className="text-neutral-400">Generates Article, Review, and FAQPage schemas.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 6: Products & Affiliate */}
        {activeTab === 'affiliate' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Product Spec & Affiliate Rules</h2>
              <p className="text-xs text-neutral-400">Affiliate tracking tags, URL matching, and image verification requirements.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Amazon Affiliate Tag</label>
                <input
                  type="text"
                  value={affiliateTag}
                  onChange={e => { setAffiliateTag(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Affiliate Network</label>
                <input
                  type="text"
                  value={affiliateNetwork}
                  onChange={e => { setAffiliateNetwork(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireVerifiedImages}
                    onChange={e => { setRequireVerifiedImages(e.target.checked); handleFieldChange(); }}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">Enforce Verified Product Images Only</div>
                    <div className="text-neutral-400">Block publishing and show "IMAGE VERIFICATION REQUIRED" if unverified.</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireAffiliateMatch}
                    onChange={e => { setRequireAffiliateMatch(e.target.checked); handleFieldChange(); }}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">Strict Product URL to Affiliate URL Match</div>
                    <div className="text-neutral-400">Block publishing if product link does not match affiliate product identity.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Social Media */}
        {activeTab === 'social' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Social Media Packaging</h2>
              <p className="text-xs text-neutral-400">Automated generation of Pinterest Pins, YouTube Shorts, Reels, and Medium articles.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={youtubeShortsEnabled}
                  onChange={e => { setYoutubeShortsEnabled(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">YouTube Shorts (Hook, Scenes, Voiceover)</div>
                  <div className="text-neutral-400">Creates 30-60s script with scene breakdowns.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinterestEnabled}
                  onChange={e => { setPinterestEnabled(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Pinterest Pins & Descriptions</div>
                  <div className="text-neutral-400">Creates high-intent saving captions and tags.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={instagramReelsEnabled}
                  onChange={e => { setInstagramReelsEnabled(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Instagram Reels Scripts</div>
                  <div className="text-neutral-400">Generates engaging captions and bio link CTA.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mediumEnabled}
                  onChange={e => { setMediumEnabled(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Medium Supporting Article</div>
                  <div className="text-neutral-400">Creates original companion piece with backlink.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 8: Automation */}
        {activeTab === 'automation' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Autonomous Schedules & Triggers</h2>
              <p className="text-xs text-neutral-400">Configure background tasks and automated discovery triggers.</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dailyTopicDiscovery}
                  onChange={e => { setDailyTopicDiscovery(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Daily Topic Discovery & Scoring</div>
                  <div className="text-neutral-400">Runs daily to discover and rank 0-100 prioritized keyword opportunities.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postPublishSocial}
                  onChange={e => { setPostPublishSocial(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Auto-Generate Social Packages Post-Publish</div>
                  <div className="text-neutral-400">Instantly drafts Shorts, Reels, and Medium articles when article goes live.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weeklyGscAudit}
                  onChange={e => { setWeeklyGscAudit(e.target.checked); handleFieldChange(); }}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Weekly Google Search Console Striking Distance Audit</div>
                  <div className="text-neutral-400">Identifies queries ranking in positions 5-20 ready for optimization.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 9: AI & Quality */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">AI Model Parameters & Quality Threshold</h2>
              <p className="text-xs text-neutral-400">Select model backend, temperature, and quality scoring gates.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">AI Model Engine</label>
                <select
                  value={aiModelProvider}
                  onChange={e => { setAiModelProvider(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="Gemini 2.5 Flash">Gemini 2.5 Flash (Ultra-fast & structured)</option>
                  <option value="Gemini 2.5 Pro">Gemini 2.5 Pro (Deep reasoning)</option>
                  <option value="OpenAI GPT-4o">OpenAI GPT-4o</option>
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Quality Gate Threshold (0-100)</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={qualityThreshold}
                  onChange={e => { setQualityThreshold(parseInt(e.target.value) || 85); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: Publishing */}
        {activeTab === 'publishing' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Publishing Pipeline & CMS Type</h2>
              <p className="text-xs text-neutral-400">Native database publishing or external CMS webhook synchronization.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target CMS</label>
                <select
                  value={cmsType}
                  onChange={e => { setCmsType(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="NATIVE">Native TechPulse Database</option>
                  <option value="WORDPRESS">WordPress REST API</option>
                  <option value="WEBHOOK">Custom HTTPS Webhook</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Approval Requirement</label>
                <select
                  value={approvalMode}
                  onChange={e => { setApprovalMode(e.target.value); handleFieldChange(); }}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="MANUAL">Manual Human Approval Required (Default)</option>
                  <option value="SEMI_AUTOMATIC">Semi-Automatic (Score &gt; 90)</option>
                  <option value="AUTOMATIC">Direct Automatic Publishing</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: Integrations */}
        {activeTab === 'integrations' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Tenant Integration Credentials</h2>
              <p className="text-xs text-neutral-400">Strictly isolated API keys and tokens for this website property.</p>
            </div>

            <div className="space-y-3 text-xs">
              {integrationsList.map((intg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">{intg.displayName || intg.provider}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Provider: {intg.provider}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                    intg.status === 'CONNECTED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {intg.status === 'CONNECTED' ? '✓ Connected' : 'Requires Connection'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 12: Memory */}
        {activeTab === 'memory' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Isolated Agent Memory Store</h2>
              <p className="text-xs text-neutral-400">Context retained strictly for {websiteName}. Never shared with other agents.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1">
                <div className="font-extrabold text-neutral-900 dark:text-white">Covered Topics Index</div>
                <div className="text-neutral-500">
                  {memoryState.coveredTopics?.length ? memoryState.coveredTopics.join(', ') : 'No topics recorded yet in active memory.'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1">
                <div className="font-extrabold text-neutral-900 dark:text-white">Reviewed Products Index</div>
                <div className="text-neutral-500">
                  {memoryState.reviewedProducts?.length ? memoryState.reviewedProducts.join(', ') : 'No reviewed products recorded yet.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: Safety */}
        {activeTab === 'safety' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Anti-Hallucination & Safety Guardrails</h2>
              <p className="text-xs text-neutral-400">Mandatory verification checks that protect brand reputation.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No Fake Testing Claims</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  Enforces research-based truth statements ("TechPulse researched and compared using verified specifications...").
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No Synthetic Reader Comments</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  Synthetic user names like David Miller or Sarah Jenkins are strictly blocked.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Image Enforcement</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  If an authentic image cannot be verified, "IMAGE VERIFICATION REQUIRED" is rendered.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 14: Activity */}
        {activeTab === 'activity' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Agent Activity & Execution Log</h2>
              <p className="text-xs text-neutral-400">Chronological history of research runs, drafts, and validations.</p>
            </div>

            <div className="space-y-2.5 text-xs">
              {activityLogs.length === 0 ? (
                <div className="p-8 text-center text-neutral-400">No activity logs recorded yet for this agent.</div>
              ) : (
                activityLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-extrabold text-neutral-900 dark:text-white">{log.message}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                        {log.actionType} • {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom Actions */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
        <Link
          href="/admin/agents"
          className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200 font-extrabold text-xs transition-colors"
        >
          Cancel & Return
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveChanges(undefined, true)}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Save & Test Agent</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleSaveChanges(e, false)}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
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
