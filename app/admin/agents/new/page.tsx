'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot, ArrowLeft, ArrowRight, CheckCircle2, Globe, Sparkles,
  Layers, ShoppingBag, ShieldCheck, Zap, RefreshCw, Check,
  Search, FileText, BarChart2, Share2, PlaySquare, Instagram,
  BookOpen, Sliders, DollarSign, Clock, Cpu, Eye
} from 'lucide-react';
import {
  AGENT_TYPES_REGISTRY,
  AgentTypeKey,
  AVAILABLE_AGENT_TOOLS
} from '@/lib/saas/agent-types-registry';

const ICON_COMPONENTS: Record<string, any> = {
  Search,
  FileText,
  ShoppingBag,
  Layers,
  Zap,
  BarChart2,
  Share2,
  PlaySquare,
  Instagram,
  BookOpen,
  Sliders
};

export default function CreateAgentWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingWebsites, setExistingWebsites] = useState<any[]>([]);

  // Step 1: Website Selection
  const [websiteMode, setWebsiteMode] = useState<'existing' | 'new'>('existing');
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteNiche, setNewSiteNiche] = useState('Technology');

  // Step 2: Select Agent Type
  const [selectedAgentType, setSelectedAgentType] = useState<AgentTypeKey>('BLOG_WRITER');

  // Step 3: Agent Configuration
  const [agentName, setAgentName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [goals, setGoals] = useState('');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');

  // Step 4: Audience & Localization
  const [targetCountry, setTargetCountry] = useState('India');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [targetAudience, setTargetAudience] = useState('');
  const [categoriesStr, setCategoriesStr] = useState('');
  const [keywordsStr, setKeywordsStr] = useState('');
  const [tone, setTone] = useState('Clear, helpful, practical, trustworthy');

  // Step 5: Tools & Integrations
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Step 6: Affiliate Configuration
  const [primaryAffiliatePlatform, setPrimaryAffiliatePlatform] = useState('AMAZON');
  const [affiliateTag, setAffiliateTag] = useState('');
  const [secondaryPlatforms, setSecondaryPlatforms] = useState<string[]>(['CUELINKS']);
  const [requireVerifiedLinks, setRequireVerifiedLinks] = useState(true);
  const [requireDisclosure, setRequireDisclosure] = useState(true);

  // Step 7: Automation & Schedule
  const [schedule, setSchedule] = useState('3_PER_WEEK');
  const [approvalMode, setApprovalMode] = useState<'MANUAL' | 'SEMI_AUTOMATIC' | 'AUTOMATIC'>('MANUAL');

  // Load existing websites
  useEffect(() => {
    fetch('/api/saas/websites')
      .then(async res => {
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          console.warn('Expected JSON for websites list but received:', await res.text());
          return { success: false, websites: [] };
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.websites)) {
          setExistingWebsites(data.websites);
          if (data.websites.length > 0) {
            setSelectedWebsiteId(data.websites[0].id);
            setTargetCountry(data.websites[0].targetCountry || 'India');
            setTargetLanguage(data.websites[0].targetLanguage || 'English');
            setCategoriesStr(data.websites[0].niche || 'Technology');
            setAffiliateTag(data.websites[0].slug === 'techpulse' ? 'techpulse-20' : `${data.websites[0].slug}-20`);
          }
        }
      })
      .catch(console.error);
  }, []);

  // When Agent Type changes, populate defaults
  const handleSelectAgentType = (typeKey: AgentTypeKey) => {
    setSelectedAgentType(typeKey);
    const def = AGENT_TYPES_REGISTRY[typeKey];
    if (def) {
      const selectedWeb = existingWebsites.find(w => w.id === selectedWebsiteId);
      const webName = websiteMode === 'new' ? (newSiteName || 'Website') : (selectedWeb?.name || 'Website');
      setAgentName(`${webName} ${def.shortName} Agent`);
      setDescription(def.description);
      setInstructions(def.defaultSystemPrompt);
      setGoals(def.defaultGoals);
      setTone(def.defaultTone);
      setSelectedTools(def.recommendedTools);
      setSchedule(def.defaultSchedule);
    }
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
    );
  };

  const toggleSecondaryPlatform = (plat: string) => {
    setSecondaryPlatforms(prev =>
      prev.includes(plat) ? prev.filter(p => p !== plat) : [...prev, plat]
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const parsedCategories = categoriesStr.split(',').map(s => s.trim()).filter(Boolean);
      const parsedKeywords = keywordsStr.split(',').map(s => s.trim()).filter(Boolean);

      const payload: any = {
        name: agentName,
        description,
        agentType: selectedAgentType,
        status: 'ACTIVE',
        instructions,
        goals,
        targetCountry,
        targetLanguage,
        targetAudience,
        categories: parsedCategories,
        keywords: parsedKeywords,
        tone,
        contentRules: { minLength: 800, maxLength: 2500 },
        seoRules: { autoTitle: true, autoMeta: true, autoSchema: true },
        affiliateRules: {
          primaryPlatform: primaryAffiliatePlatform,
          secondaryPlatforms,
          affiliateTag,
          requireVerifiedLinks,
          requireDisclosure
        },
        publishingRules: { approvalMode },
        schedule,
        aiModel,
        tools: selectedTools,
        memoryState: {
          brandVoice: tone,
          coveredTopics: [],
          targetAudience,
          preferredCategories: parsedCategories
        }
      };

      if (websiteMode === 'existing' && selectedWebsiteId) {
        payload.websiteId = selectedWebsiteId;
      } else {
        payload.newWebsite = {
          name: newSiteName || agentName,
          domainUrl: newSiteUrl || 'https://example.com',
          niche: newSiteNiche || 'Technology',
          targetCountry,
          targetLanguage,
          targetAudience,
          publishingFrequency: schedule,
          approvalMode
        };
      }

      const res = await fetch('/api/saas/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawText = await res.text();
        console.error('API returned non-JSON response:', rawText);
        alert('Server returned an invalid response. Please try again.');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/agents');
      } else {
        alert(data.error || 'Failed to create agent.');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error creating agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/agents"
            className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              <span>Create New AI Growth Agent</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Step {currentStep} of 8 — Multi-Agent Multi-Website Configuration Wizard
            </p>
          </div>
        </div>

        <div className="text-xs font-extrabold text-neutral-400">
          Step {currentStep} / 8 ({Math.round((currentStep / 8) * 100)}%)
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-teal-500 transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / 8) * 100}%` }}
        />
      </div>

      {/* STEP CONTAINER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-6">

        {/* STEP 1: Select Website */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-500" />
                <span>Step 1: Select Connected Website</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Choose the website property this Agent will manage. Agents maintain strictly isolated memory and data per website.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <button
                type="button"
                onClick={() => setWebsiteMode('existing')}
                disabled={existingWebsites.length === 0}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  websiteMode === 'existing'
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 font-extrabold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="text-sm font-black">Select Existing Website</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Assign agent to a connected property</div>
              </button>

              <button
                type="button"
                onClick={() => setWebsiteMode('new')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  websiteMode === 'new'
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 font-extrabold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="text-sm font-black">+ Connect New Website</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Register a brand-new website property</div>
              </button>
            </div>

            {websiteMode === 'existing' ? (
              <div className="space-y-3 text-xs pt-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300">Choose Website</label>
                <select
                  value={selectedWebsiteId}
                  onChange={(e) => {
                    setSelectedWebsiteId(e.target.value);
                    const selected = existingWebsites.find(w => w.id === e.target.value);
                    if (selected) {
                      setTargetCountry(selected.targetCountry || 'India');
                      setTargetLanguage(selected.targetLanguage || 'English');
                      setCategoriesStr(selected.niche || 'Technology');
                    }
                  }}
                  className="w-full p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  {existingWebsites.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.domainUrl}) — {w.niche} ({w.targetCountry})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3 text-xs pt-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Website Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. SmartLivingHub"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Domain URL *</label>
                  <input
                    type="url"
                    placeholder="https://smartlivinghub.com"
                    value={newSiteUrl}
                    onChange={(e) => setNewSiteUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Niche Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Home Appliances & Smart Tech"
                    value={newSiteNiche}
                    onChange={(e) => setNewSiteNiche(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Agent Type */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Step 2: Select Agent Type</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Choose the specialized intelligence model and workflow for this agent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs pt-1">
              {(Object.keys(AGENT_TYPES_REGISTRY) as AgentTypeKey[]).map(typeKey => {
                const def = AGENT_TYPES_REGISTRY[typeKey];
                const IconComponent = ICON_COMPONENTS[def.iconName] || Bot;
                const isSelected = selectedAgentType === typeKey;

                return (
                  <div
                    key={typeKey}
                    onClick={() => handleSelectAgentType(typeKey)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/50 shadow-md ring-2 ring-brand-500/20'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs text-neutral-900 dark:text-white">{def.name}</h3>
                          <span className="text-[10px] text-neutral-400 font-medium">{def.defaultSchedule} Schedule</span>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {def.description}
                    </p>

                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400">
                      <strong>Key Capability:</strong> {def.responsibilities[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Agent Configuration */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <span>Step 3: Agent Configuration & Persona</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Customize instructions, goals, and AI model parameters for <strong>{AGENT_TYPES_REGISTRY[selectedAgentType]?.name}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Agent Name *</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">AI Model Engine</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Research Optimized)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Technical Reasoning)</option>
                  <option value="gpt-4o">GPT-4o (OpenAI High-Precision)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Editorial Excellence)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Role / Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Instructions / System Prompt *</label>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[11px] outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Agent Primary Goals</label>
                <input
                  type="text"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Audience */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                <span>Step 4: Target Audience & Geo Localization</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Configure regional market context, target currency, keywords, and tone.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Country</label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Language</label>
                <input
                  type="text"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Audience Profile</label>
                <input
                  type="text"
                  placeholder="e.g. Value-conscious tech shoppers in Tier 1 & Tier 2 Indian cities"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Categories (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Earbuds, Smartwatches, Laptops"
                  value={categoriesStr}
                  onChange={(e) => setCategoriesStr(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Priority Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. best under 2000, review, vs comparison"
                  value={keywordsStr}
                  onChange={(e) => setKeywordsStr(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Tone & Voice</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Tools & Integrations */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-teal-500" />
                <span>Step 5: Agent Tools & Capabilities</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Select which specific tools this Agent is authorized to invoke.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
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

        {/* STEP 6: Affiliate Configuration */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span>Step 6: Multi-Affiliate Configuration</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Connect multi-affiliate platforms without hardcoding. Supported: Amazon, Flipkart, Cuelinks, vCommission, and Impact.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Primary Affiliate Network</label>
                <select
                  value={primaryAffiliatePlatform}
                  onChange={(e) => setPrimaryAffiliatePlatform(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="AMAZON">Amazon Associates (Primary)</option>
                  <option value="FLIPKART">Flipkart Affiliate (Primary)</option>
                  <option value="CUELINKS">Cuelinks Automated Redirects</option>
                  <option value="VCOMMISSION">vCommission Direct Campaigns</option>
                  <option value="IMPACT">impact.com Partnership Platform</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Primary Tracking ID / Tag</label>
                <input
                  type="text"
                  placeholder="e.g. techpulse-20 or affiliate_id"
                  value={affiliateTag}
                  onChange={(e) => setAffiliateTag(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300">Secondary Affiliate Platforms (Multi-Store Price Buttons)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['FLIPKART', 'CUELINKS', 'VCOMMISSION', 'IMPACT'].map(plat => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => toggleSecondaryPlatform(plat)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        secondaryPlatforms.includes(plat)
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 shadow-2xs'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireVerifiedLinks}
                    onChange={(e) => setRequireVerifiedLinks(e.target.checked)}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">Enforce Verified Affiliate Links Only</div>
                    <div className="text-neutral-400">Never invent fake affiliate links. If unverified, mark "Affiliate Link Required".</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireDisclosure}
                    onChange={(e) => setRequireDisclosure(e.target.checked)}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">Mandatory FTC & Amazon Affiliate Disclosure</div>
                    <div className="text-neutral-400">Automatically attach compliant disclosure notice on every generated article.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Automation */}
        {currentStep === 7 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span>Step 7: Automation & Human Review</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Configure execution frequency and approval policy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Execution Schedule</label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="MANUAL">Manual Run Only</option>
                  <option value="DAILY">Daily (7 times / week)</option>
                  <option value="3_PER_WEEK">3 Times per Week</option>
                  <option value="WEEKLY">Weekly (1 time / week)</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Human Approval Mode</label>
                <select
                  value={approvalMode}
                  onChange={(e) => setApprovalMode(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="MANUAL">Manual Approval (Default & Recommended)</option>
                  <option value="SEMI_AUTOMATIC">Semi-Automatic (Auto-approve if Quality &gt; 90)</option>
                  <option value="AUTOMATIC">Fully Automatic</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Review & Create */}
        {currentStep === 8 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Step 8: Review & Launch Agent</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Review all configuration parameters before initializing this autonomous Agent.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400 font-bold">Agent Name:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{agentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400 font-bold">Agent Type:</span>
                <span className="font-extrabold text-brand-600 dark:text-brand-400">{AGENT_TYPES_REGISTRY[selectedAgentType]?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400 font-bold">Connected Property:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{websiteMode === 'new' ? newSiteName : 'Selected Website'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400 font-bold">Target Market:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{targetCountry} ({targetLanguage})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400 font-bold">AI Engine:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{aiModel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400 font-bold">Enabled Tools ({selectedTools.length}):</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{selectedTools.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400 font-bold">Primary Affiliate:</span>
                <span className="font-extrabold text-emerald-600">{primaryAffiliatePlatform} ({affiliateTag || 'Tag configured'})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400 font-bold">Approval Governance:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{approvalMode} Approval • {schedule}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-extrabold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : <div />}

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{isSubmitting ? 'Initializing Agent...' : 'Launch Agent'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
