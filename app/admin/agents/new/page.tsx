'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot, ArrowLeft, ArrowRight, CheckCircle2, Globe, Sparkles,
  Layers, ShoppingBag, ShieldCheck, Zap, RefreshCw, Check
} from 'lucide-react';

const NICHES = [
  'Technology', 'Automotive', 'Gaming', 'Finance', 'Fashion',
  'Education', 'Home & Kitchen', 'Health & Fitness', 'Travel', 'Custom'
];

const CONTENT_TYPES = [
  'Product Reviews', 'Comparisons', 'Buying Guides', 'How-To & Tutorials',
  'Explainers', 'News & Updates', 'Trending Topics', 'Listicles & Round-ups'
];

const MONETIZATION_OPTIONS = [
  { id: 'AMAZON_AFFILIATE', label: 'Amazon Affiliate Associates', desc: 'Auto tags, product spec boxes & disclaimer' },
  { id: 'ADSENSE', label: 'Google AdSense / Display Ads', desc: 'In-article ad spaces & sticky header banners' },
  { id: 'OTHER_AFFILIATE', label: 'Custom Affiliate Networks', desc: 'Direct affiliate links with cloaking' },
  { id: 'DIGITAL_PRODUCTS', label: 'Digital Products & E-books', desc: 'Lead magnets and direct digital checkout' },
  { id: 'SERVICES', label: 'Services & Consultations', desc: 'Lead generation and discovery call links' },
  { id: 'SPONSORED_CONTENT', label: 'Sponsored Brand Partnerships', desc: 'Dedicated review badges & brand tags' }
];

export default function CreateAgentWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingWebsites, setExistingWebsites] = useState<any[]>([]);

  // Step 1: Basic Info
  const [agentName, setAgentName] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('Content & Growth Agent');
  const [tone, setTone] = useState('Clear, helpful, practical, trustworthy');

  // Step 2: Website Selection
  const [websiteMode, setWebsiteMode] = useState<'existing' | 'new'>('new');
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');

  // Step 3: Niche
  const [niche, setNiche] = useState('Technology');
  const [customNiche, setCustomNiche] = useState('');
  const [subNiche, setSubNiche] = useState('');

  // Step 4: Audience
  const [targetCountry, setTargetCountry] = useState('India');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [targetAudience, setTargetAudience] = useState('');
  const [buyerType, setBuyerType] = useState('Value-focused tech shoppers & comparison researchers');

  // Step 5: Content Strategy
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([
    'Product Reviews', 'Comparisons', 'Buying Guides'
  ]);
  const [primaryTopics, setPrimaryTopics] = useState('');
  const [topicsToAvoid, setTopicsToAvoid] = useState('');

  // Step 6: Monetization
  const [selectedMonetization, setSelectedMonetization] = useState<string[]>([
    'AMAZON_AFFILIATE', 'ADSENSE'
  ]);

  // Step 7: Publishing Strategy
  const [approvalMode, setApprovalMode] = useState<'MANUAL' | 'SEMI_AUTOMATIC' | 'AUTOMATIC'>('MANUAL');
  const [publishingFrequency, setPublishingFrequency] = useState('WEEKLY');

  useEffect(() => {
    fetch('/api/saas/websites')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.websites)) {
          setExistingWebsites(data.websites);
          if (data.websites.length > 0) {
            setSelectedWebsiteId(data.websites[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  const toggleContentType = (type: string) => {
    setSelectedContentTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleMonetization = (id: string) => {
    setSelectedMonetization(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const effectiveNiche = niche === 'Custom' ? customNiche : niche;

      const payload: any = {
        agentName: agentName || `${websiteMode === 'new' ? newSiteName : 'Growth'} Agent`,
        role,
        tone,
        systemPrompt: `You are the dedicated AI Growth Agent for ${websiteMode === 'new' ? newSiteName : 'your assigned property'}. Research high-ranking search topics in the ${effectiveNiche} niche for ${targetCountry}. Never hallucinate specifications, fake comments, or fake lab test results. Generate clean structured reviews, buying guides, and comparison tables with FTC-compliant affiliate disclosures.`
      };

      if (websiteMode === 'existing' && selectedWebsiteId) {
        payload.websiteId = selectedWebsiteId;
      } else {
        payload.newWebsite = {
          name: newSiteName || agentName,
          domainUrl: newSiteUrl || 'https://example.com',
          niche: effectiveNiche,
          subNiche: subNiche || null,
          targetCountry,
          targetLanguage,
          targetAudience: targetAudience || buyerType,
          brandVoice: tone,
          contentStyle: selectedContentTypes.join(', '),
          primaryTopics: primaryTopics ? primaryTopics.split(',').map(s => s.trim()) : [],
          topicsToAvoid: topicsToAvoid ? topicsToAvoid.split(',').map(s => s.trim()) : [],
          monetization: selectedMonetization,
          publishingFrequency,
          approvalMode
        };
      }

      const res = await fetch('/api/saas/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/agents');
      } else {
        alert(data.error || 'Failed to create agent.');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/agents"
            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              <span>Create New AI Growth Agent</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Step {currentStep} of 8 — Multi-Tenant Agent Setup Wizard
            </p>
          </div>
        </div>

        <div className="text-xs font-extrabold text-neutral-400">
          {Math.round((currentStep / 8) * 100)}% Complete
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / 8) * 100}%` }}
        />
      </div>

      {/* STEP CONTAINER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-6">
        
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Step 1: Agent Identification & Brand Voice
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Name your agent and define its primary role and tone of voice.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Agent Name *</label>
                <input
                  type="text"
                  placeholder="e.g. CarCareMakers Growth Agent / TechPulse Reviewer"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Agent Role & Mission</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Brand Voice & Writing Tone</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional internal notes regarding this agent..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Website Selection */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Step 2: Connect Dedicated Website
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Each website has its own strictly isolated agent, topics, and memory.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setWebsiteMode('new')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  websiteMode === 'new'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 font-extrabold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="text-sm font-black">+ Add New Website</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Register a new property for this agent</div>
              </button>

              <button
                type="button"
                onClick={() => setWebsiteMode('existing')}
                disabled={existingWebsites.length === 0}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  websiteMode === 'existing'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 font-extrabold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 disabled:opacity-50'
                }`}
              >
                <div className="text-sm font-black">Select Existing Website</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Connect to an existing unassigned website</div>
              </button>
            </div>

            {websiteMode === 'new' ? (
              <div className="space-y-3 text-xs pt-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Website / Brand Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. CarCareMakers"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-brand-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Website Domain URL *</label>
                  <input
                    type="url"
                    placeholder="https://carcaremakers.com"
                    value={newSiteUrl}
                    onChange={(e) => setNewSiteUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs pt-2">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Select Property</label>
                <select
                  value={selectedWebsiteId}
                  onChange={(e) => setSelectedWebsiteId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  {existingWebsites.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.domainUrl}) - {w.niche}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Niche & Category */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Step 3: Target Niche & Category Models
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                The agent will load specific technical specification schemas for this category.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {NICHES.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNiche(n)}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    niche === n
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {niche === 'Custom' && (
              <div className="pt-2 text-xs">
                <label className="block font-bold text-neutral-700 mb-1">Custom Niche Name</label>
                <input
                  type="text"
                  placeholder="e.g. Drone Photography & Videography"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            )}

            <div className="pt-2 text-xs">
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Sub-Niche or Product Focus</label>
              <input
                type="text"
                placeholder="e.g. Car Cleaning, Tyre Inflators, Dash Cams, Ceramic Coatings"
                value={subNiche}
                onChange={(e) => setSubNiche(e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Audience & Demographics */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Step 4: Target Audience & Geo Localization
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Calibrate regional currency, search terminology, and buyer profile.
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
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Primary Buyer Profile</label>
                <input
                  type="text"
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Content Strategy */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Step 5: Content Formats & Strategy
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Select which content frameworks this agent is permitted to generate.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {CONTENT_TYPES.map(type => {
                const isSelected = selectedContentTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleContentType(type)}
                    className={`p-3 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Primary Topics to Prioritize</label>
                <input
                  type="text"
                  placeholder="e.g. Dash Cams, Ceramic Sprays, Vacuum Cleaners"
                  value={primaryTopics}
                  onChange={(e) => setPrimaryTopics(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Topics / Keywords to Avoid</label>
                <input
                  type="text"
                  placeholder="e.g. Unverified rumors, low-margin products"
                  value={topicsToAvoid}
                  onChange={(e) => setTopicsToAvoid(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Monetization */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Step 6: Monetization Channels
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Configure monetization hooks and required compliance notices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {MONETIZATION_OPTIONS.map(opt => {
                const isSelected = selectedMonetization.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleMonetization(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-black text-xs">
                      <span>{opt.label}</span>
                      {isSelected ? <CheckCircle2 className="w-4 h-4 text-brand-600" /> : <div className="w-4 h-4 rounded-full border border-neutral-300" />}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: Publishing & Governance */}
        {currentStep === 7 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Step 7: Publishing Governance & Frequency
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Default: Manual Approval is active for human review before live deployment.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Approval Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setApprovalMode('MANUAL')}
                    className={`p-3 rounded-xl border text-center font-extrabold ${approvalMode === 'MANUAL' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'border-neutral-200 hover:bg-neutral-50'}`}
                  >
                    <div>Manual Approval</div>
                    <div className="text-[10px] font-normal text-neutral-400">(Recommended)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalMode('SEMI_AUTOMATIC')}
                    className={`p-3 rounded-xl border text-center font-extrabold ${approvalMode === 'SEMI_AUTOMATIC' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'border-neutral-200 hover:bg-neutral-50'}`}
                  >
                    <div>Semi-Automatic</div>
                    <div className="text-[10px] font-normal text-neutral-400">(Quality score &gt; 90)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalMode('AUTOMATIC')}
                    className={`p-3 rounded-xl border text-center font-extrabold ${approvalMode === 'AUTOMATIC' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'border-neutral-200 hover:bg-neutral-50'}`}
                  >
                    <div>Automatic</div>
                    <div className="text-[10px] font-normal text-neutral-400">(Direct Auto-Publish)</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Publishing Cadence</label>
                <select
                  value={publishingFrequency}
                  onChange={(e) => setPublishingFrequency(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                >
                  <option value="DAILY">Daily (7 articles / week)</option>
                  <option value="3_PER_WEEK">3 articles per week</option>
                  <option value="WEEKLY">Weekly (1 high-depth pillar / week)</option>
                  <option value="CUSTOM">Custom on-demand manual trigger</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Summary & Initialization */}
        {currentStep === 8 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Step 8: Review & Calibrate AI Agent
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Verify configuration parameters before launching the isolated agent.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400">Agent Name:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{agentName || 'Growth Agent'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400">Website Property:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{websiteMode === 'new' ? newSiteName : 'Connected Property'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400">Niche / Geo:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{niche} • {targetCountry} ({targetLanguage})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400">Content Types:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{selectedContentTypes.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-400">Monetization:</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">{selectedMonetization.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Approval Policy:</span>
                <span className="font-extrabold text-emerald-600">{approvalMode} Approval</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200 font-extrabold text-xs flex items-center gap-1.5 transition-colors"
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
              <span>{isSubmitting ? 'Calibrating Agent...' : 'Launch & Calibrate Agent'}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
