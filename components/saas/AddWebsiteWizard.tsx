'use client';

import React, { useState } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Layers,
  DollarSign,
  Calendar,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

const NICHES = [
  { id: 'Technology', label: 'Technology & Gadgets', desc: 'Consumer electronics, smartphones, laptops, audio' },
  { id: 'Automotive', label: 'Automotive & Detailing', desc: 'Car accessories, maintenance, dash cams, DIY care' },
  { id: 'Finance', label: 'Finance & Investing', desc: 'Credit cards, fintech apps, budgeting, insurance' },
  { id: 'Gaming', label: 'Gaming & Esports', desc: 'PC builds, peripherals, console accessories, gaming gear' },
  { id: 'Fashion', label: 'Fashion & Apparel', desc: 'Clothing trends, footwear, accessories, luxury' },
  { id: 'Health', label: 'Health & Fitness', desc: 'Supplements, gym equipment, wellness trackers, nutrition' },
  { id: 'Education', label: 'Education & Office', desc: 'Workplace productivity, study tools, stationery, desks' },
  { id: 'Custom', label: 'Custom Niche', desc: 'Define your own specialized industry and topic cluster' }
];

const MONETIZATION_OPTIONS = [
  { id: 'AMAZON_AFFILIATE', label: 'Amazon Affiliate', desc: 'Amazon Associates affiliate links and product showcases' },
  { id: 'ADSENSE', label: 'Google AdSense / Display Ads', desc: 'Automated banner and native display ads' },
  { id: 'OTHER_AFFILIATE', label: 'Other Affiliate Networks', desc: 'CJ, ShareASale, Impact, or direct brand partnerships' },
  { id: 'DIGITAL_PRODUCTS', label: 'Digital Products', desc: 'E-books, downloadable templates, or software courses' },
  { id: 'SERVICES', label: 'Consulting / Services', desc: 'Client inquiries, agency booking, or lead generation' },
  { id: 'SPONSORED', label: 'Sponsored Content', desc: 'Paid sponsored product reviews and brand features' }
];

export default function AddWebsiteWizard() {
  const { isAddModalOpen, closeAddModal, refreshWebsites, setCurrentWebsite } = useWebsite();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [growthReport, setGrowthReport] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    domainUrl: '',
    niche: 'Technology',
    customNiche: '',
    subNiche: '',
    targetCountry: 'India',
    targetLanguage: 'English',
    targetAudience: '',
    brandVoice: 'Clear, helpful, practical, trustworthy',
    contentStyle: 'In-depth research-backed buying guides and specification breakdowns',
    monetization: ['AMAZON_AFFILIATE', 'ADSENSE'],
    publishingFrequency: '3_PER_WEEK',
    approvalMode: 'MANUAL', // DEFAULT MUST BE MANUAL APPROVAL
    cmsType: 'NATIVE'
  });

  if (!isAddModalOpen) return null;

  const toggleMonetization = (id: string) => {
    setFormData(prev => {
      const exists = prev.monetization.includes(id);
      return {
        ...prev,
        monetization: exists
          ? prev.monetization.filter(m => m !== id)
          : [...prev.monetization, id]
      };
    });
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.domainUrl)) {
      alert('Please provide Website Name and Website URL.');
      return;
    }
    if (step < 7) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateAgent = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/saas/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          niche: formData.niche === 'Custom' ? (formData.customNiche || 'General') : formData.niche
        })
      });
      const data = await res.json();
      if (data.success && data.website) {
        setGrowthReport(data.growthReport);
        await refreshWebsites();
        setCurrentWebsite(data.website);
        setStep(7); // Show Report View
      } else {
        alert(data.error || 'Failed to initialize agent.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while creating website agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    closeAddModal();
    setStep(1);
    setGrowthReport(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Add New Website & Growth Agent</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Step {step} of 7 • {step === 7 ? 'Initial Growth Report' : 'Configuration Wizard'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAddModal}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5">
          <div
            className="bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 h-full transition-all duration-300 rounded-r-full"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Step 1: Website Information</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Enter the primary brand name and domain for the new website.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Website Name</label>
                  <input
                    type="text"
                    placeholder="e.g. CarCareMakers"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={formData.domainUrl}
                    onChange={e => setFormData({ ...formData, domainUrl: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Niche Selection */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Step 2: Select Industry Niche</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">The AI Agent will use this niche to discover relevant, high-margin opportunities.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NICHES.map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, niche: n.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      formData.niche === n.id
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-100 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-800/40'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                      formData.niche === n.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-400'
                    }`}>
                      {formData.niche === n.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{n.label}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{n.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              {formData.niche === 'Custom' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Custom Niche Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Smart Home Security & Automation"
                    value={formData.customNiche}
                    onChange={e => setFormData({ ...formData, customNiche: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Target Country & Audience */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Step 3: Audience & Target Country</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure geographical parameters and audience persona.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Target Country</label>
                  <input
                    type="text"
                    placeholder="e.g. India, United States, United Kingdom"
                    value={formData.targetCountry}
                    onChange={e => setFormData({ ...formData, targetCountry: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Target Language</label>
                  <input
                    type="text"
                    placeholder="e.g. English, Hindi, Spanish"
                    value={formData.targetLanguage}
                    onChange={e => setFormData({ ...formData, targetLanguage: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Target Audience Persona</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Smart gadget buyers and budget conscious consumers looking for verified product comparisons"
                  value={formData.targetAudience}
                  onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Monetization Models */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Step 4: Monetization Strategy</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Select all revenue models that apply (multi-select supported).</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MONETIZATION_OPTIONS.map(m => {
                  const isChecked = formData.monetization.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMonetization(m.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-800/40'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 ${
                        isChecked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-neutral-400'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{m.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Content Frequency */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Step 5: Publishing Cadence</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">How frequently should the agent produce content proposals?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'DAILY', label: 'Daily (7 Articles / Week)', desc: 'Fast-paced news and frequent seasonal comparisons' },
                  { id: '3_PER_WEEK', label: '3 Per Week (Recommended)', desc: 'Balanced high-depth guides and thorough research reviews' },
                  { id: 'WEEKLY', label: 'Weekly (1-2 In-depth Articles)', desc: 'Comprehensive ultimate buyer pillars and master comparisons' },
                  { id: 'CUSTOM', label: 'Custom Automation Schedule', desc: 'On-demand manual triggers and automated cron triggers' }
                ].map(freq => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, publishingFrequency: freq.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      formData.publishingFrequency === freq.id
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-100'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                      formData.publishingFrequency === freq.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-400'
                    }`}>
                      {formData.publishingFrequency === freq.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{freq.label}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{freq.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Content Approval Mode */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Step 6: Human Approval Mode</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Control human-in-the-loop validation before articles go live.</p>
              </div>
              <div className="space-y-3">
                {[
                  {
                    id: 'MANUAL',
                    label: 'Manual Approval (DEFAULT & RECOMMENDED)',
                    desc: 'Agent creates structured drafts and runs Quality Control. You review, edit, and click Approve before anything is published.'
                  },
                  {
                    id: 'SEMI_AUTOMATIC',
                    label: 'Semi-Automatic Mode',
                    desc: 'Automatically schedules drafts that pass 95+ Quality Score validation with 48h human review window.'
                  },
                  {
                    id: 'AUTOMATIC',
                    label: 'Autonomous Publishing',
                    desc: 'Publishes automatically upon passing full quality control. (Requires explicit enablement).'
                  }
                ].map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, approvalMode: mode.id })}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      formData.approvalMode === mode.id
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                      formData.approvalMode === mode.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-neutral-400'
                    }`}>
                      {formData.approvalMode === mode.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{mode.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: Instant Initial Growth Report */}
          {step === 7 && growthReport && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-3">
                <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100">AI Growth Agent Successfully Initialized!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">{growthReport.summary}</p>
                </div>
              </div>

              {/* Initial Topics Discovered */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-brand-500" />
                  Top Prioritized Content Opportunities (0–100 Scored)
                </h4>
                <div className="space-y-2">
                  {growthReport.topics.map((t: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">{t.suggestedTitle}</div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-2">
                          <span>Keyword: <strong className="text-neutral-700 dark:text-neutral-300">{t.primaryKeyword}</strong></span>
                          <span>•</span>
                          <span>Intent: {t.searchIntent}</span>
                          <span>•</span>
                          <span>Affiliate: {t.affiliatePotential}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-extrabold">
                          {t.priorityScore}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core SEO Growth Vectors */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  SEO Growth Opportunities Detected
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {growthReport.seoOpportunities.map((seo: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80">
                      <div className="text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-1">{seo.type}</div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">{seo.title}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{seo.rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          {step > 1 && step < 7 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : <div />}

          {step < 6 && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 6 && (
            <button
              onClick={handleCreateAgent}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calibrating AI Agent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create AI Growth Agent</span>
                </>
              )}
            </button>
          )}

          {step === 7 && (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-brand-600/20 transition-all cursor-pointer"
            >
              <span>Open Growth Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
