'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import {
  Link2, ShoppingBag, ShieldCheck, ExternalLink, CheckCircle2,
  DollarSign, Sparkles, AlertCircle, Save, Copy, Plus, Trash2,
  RefreshCw, Check, ArrowRight, Play, Eye, Layers, Lock, Globe
} from 'lucide-react';
import { AffiliatePlatformType } from '@/lib/affiliate/types';

interface PlatformItem {
  id?: string;
  websiteId: string;
  platformName: string;
  platformType: AffiliatePlatformType;
  country: string;
  trackingId: string;
  deepLinkTemplate?: string | null;
  priority: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  status: 'CONNECTED' | 'REQUIRES_CREDENTIALS' | 'MANUAL_ONLY' | 'DISABLED';
  credentialsSummary?: {
    hasApiKey?: boolean;
    hasApiSecret?: boolean;
    subId?: string;
    partnerId?: string;
  };
}

export default function MultiAffiliateHubPage() {
  const { currentWebsite } = useWebsite();
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add platform modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalPlatformName, setModalPlatformName] = useState('Amazon Associates');
  const [modalPlatformType, setModalPlatformType] = useState<AffiliatePlatformType>('AMAZON');
  const [modalCountry, setModalCountry] = useState('India');
  const [modalTrackingId, setModalTrackingId] = useState('');
  const [modalApiKey, setModalApiKey] = useState('');
  const [modalApiSecret, setModalApiSecret] = useState('');
  const [modalSubId, setModalSubId] = useState('');
  const [modalDeepLinkTemplate, setModalDeepLinkTemplate] = useState('');
  const [modalPriority, setModalPriority] = useState<'PRIMARY' | 'SECONDARY' | 'TERTIARY'>('PRIMARY');
  const [isSavingPlatform, setIsSavingPlatform] = useState(false);

  // Live Link Tester
  const [testUrl, setTestUrl] = useState('https://www.amazon.in/dp/B0CHX6QG73');
  const [testSelectedPlatformId, setTestSelectedPlatformId] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingLink, setIsTestingLink] = useState(false);

  // Disclosure
  const [disclosureText, setDisclosureText] = useState(
    'This article may contain affiliate links. If you purchase through our links, we may earn a commission at no additional cost to you.'
  );
  const [copiedDisclosure, setCopiedDisclosure] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchPlatforms = async () => {
    if (!currentWebsite) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/saas/affiliate-platforms?websiteId=${currentWebsite.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.platforms)) {
        setPlatforms(data.platforms);
        if (data.platforms.length > 0) {
          setTestSelectedPlatformId(data.platforms[0].id || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, [currentWebsite]);

  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWebsite) return;

    try {
      setIsSavingPlatform(true);
      const credentials: any = {};
      if (modalApiKey) credentials.apiKey = modalApiKey;
      if (modalApiSecret) credentials.apiSecret = modalApiSecret;
      if (modalSubId) credentials.subId = modalSubId;

      const payload = {
        websiteId: currentWebsite.id,
        platformName: modalPlatformName,
        platformType: modalPlatformType,
        country: modalCountry,
        trackingId: modalTrackingId,
        credentials: Object.keys(credentials).length > 0 ? credentials : null,
        deepLinkTemplate: modalDeepLinkTemplate || null,
        priority: modalPriority,
        status: 'CONNECTED'
      };

      const res = await fetch('/api/saas/affiliate-platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setToastMsg(`Platform "${modalPlatformName}" connected successfully!`);
        setTimeout(() => setToastMsg(null), 4000);
        fetchPlatforms();
      } else {
        alert(data.error || 'Failed to save platform.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving affiliate platform');
    } finally {
      setIsSavingPlatform(false);
    }
  };

  const handleDeletePlatform = async (id: string) => {
    if (!confirm('Are you sure you want to remove this affiliate platform?')) return;
    try {
      const res = await fetch(`/api/saas/affiliate-platforms?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPlatforms(prev => prev.filter(p => p.id !== id));
        setToastMsg('Affiliate platform removed.');
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestLink = async () => {
    const selected = platforms.find(p => p.id === testSelectedPlatformId) || platforms[0];
    if (!selected) return;

    try {
      setIsTestingLink(true);
      const res = await fetch('/api/saas/affiliate-platforms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawUrl: testUrl,
          platformConfig: selected
        })
      });
      const data = await res.json();
      setTestResult(data.link || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingLink(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            <span>Multi-Affiliate Platform Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Connect and prioritize multiple affiliate networks (Amazon, Flipkart, Cuelinks, vCommission, Impact) for <strong>{currentWebsite?.name || 'Selected Property'}</strong>.
          </p>
        </div>

        <button
          onClick={() => {
            setModalPlatformName('Amazon India');
            setModalPlatformType('AMAZON');
            setModalCountry(currentWebsite?.targetCountry || 'India');
            setModalTrackingId(currentWebsite?.slug === 'techpulse' ? 'techpulse-20' : `${currentWebsite?.slug || 'site'}-20`);
            setModalPriority('PRIMARY');
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Affiliate Platform</span>
        </button>
      </div>

      {/* Grid: Connected Platforms & Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Connected Platforms Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-500" />
                <span>Connected Affiliate Platforms ({platforms.length})</span>
              </h2>
              <span className="text-xs text-neutral-400 font-bold">
                Isolated to: {currentWebsite?.name}
              </span>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs font-bold text-neutral-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
                Loading Affiliate Platforms...
              </div>
            ) : platforms.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  No affiliate platforms configured yet for this property.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-extrabold text-xs"
                >
                  + Add First Platform
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platforms.map((plat) => (
                  <div
                    key={plat.id}
                    className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-xs text-neutral-900 dark:text-white">
                              {plat.platformName}
                            </h3>
                            {plat.priority === 'PRIMARY' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                PRIMARY
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                                {plat.priority}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            Type: <strong>{plat.platformType}</strong> • {plat.country}
                          </div>
                        </div>

                        <button
                          onClick={() => plat.id && handleDeletePlatform(plat.id)}
                          className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove Platform"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs space-y-1">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase">Tracking ID / Tag</div>
                        <div className="font-mono font-bold text-neutral-900 dark:text-white truncate">
                          {plat.trackingId}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </span>
                      <span>{plat.credentialsSummary?.hasApiKey ? '🔒 API Keys Set' : '✓ Deep-Link Tag'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Affiliate Link Transformer & Tester */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>Live Multi-Affiliate Link Transformer & Tester</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Input any raw merchant product URL to test instant affiliate link transformation and verification.
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Product URL</label>
                  <input
                    type="url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[11px] outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Affiliate Platform</label>
                  <select
                    value={testSelectedPlatformId}
                    onChange={(e) => setTestSelectedPlatformId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                  >
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.platformName} ({p.priority})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleTestLink}
                disabled={isTestingLink || platforms.length === 0}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestingLink ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Generate Verified Affiliate Link</span>
              </button>

              {testResult && (
                <div className="mt-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{testResult.verificationStatus}: {testResult.platformName}</span>
                    </span>
                    <a
                      href={testResult.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="font-mono text-[11px] break-all p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                    {testResult.affiliateUrl}
                  </div>

                  <div className="text-[11px] text-neutral-500">
                    CTA Button Preview: <strong className="text-neutral-900 dark:text-white px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800">{testResult.ctaText}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: FTC Compliance & Security Rules */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Mandatory FTC Disclosure</span>
              </h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(disclosureText);
                  setCopiedDisclosure(true);
                  setTimeout(() => setCopiedDisclosure(false), 2000);
                }}
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedDisclosure ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Every generated article automatically attaches this compliant disclosure notice to satisfy Google Search and affiliate network policies.
            </p>

            <textarea
              rows={4}
              value={disclosureText}
              onChange={(e) => setDisclosureText(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-3 text-xs">
            <h3 className="font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-500" />
              <span>Affiliate Security Directives</span>
            </h3>
            <ul className="space-y-2.5 text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>API Secrets are stored encrypted in the server-side database.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>No plain credentials or keys are exposed in client-side code.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>All outgoing affiliate hyperlinks receive compliant <code>rel="sponsored nofollow"</code> attributes.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Add Platform Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-4 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">Connect Affiliate Platform</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlatform} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Platform Type</label>
                  <select
                    value={modalPlatformType}
                    onChange={(e) => {
                      const t = e.target.value as AffiliatePlatformType;
                      setModalPlatformType(t);
                      if (t === 'AMAZON') setModalPlatformName('Amazon Associates');
                      else if (t === 'FLIPKART') setModalPlatformName('Flipkart Affiliate');
                      else if (t === 'CUELINKS') setModalPlatformName('Cuelinks');
                      else if (t === 'VCOMMISSION') setModalPlatformName('vCommission');
                      else if (t === 'IMPACT') setModalPlatformName('impact.com');
                      else setModalPlatformName('Custom Affiliate');
                    }}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                  >
                    <option value="AMAZON">Amazon Associates</option>
                    <option value="FLIPKART">Flipkart Affiliate</option>
                    <option value="CUELINKS">Cuelinks</option>
                    <option value="VCOMMISSION">vCommission</option>
                    <option value="IMPACT">impact.com</option>
                    <option value="CUSTOM">Custom Network</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Platform Label</label>
                  <input
                    type="text"
                    required
                    value={modalPlatformName}
                    onChange={(e) => setModalPlatformName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Country</label>
                  <input
                    type="text"
                    required
                    value={modalCountry}
                    onChange={(e) => setModalCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Priority</label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                  >
                    <option value="PRIMARY">PRIMARY (Main Buy Button)</option>
                    <option value="SECONDARY">SECONDARY (Multi-Store Option)</option>
                    <option value="TERTIARY">TERTIARY (Backup)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tracking ID / Associate Tag / Publisher ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. techpulse-20 or campaign_id"
                  value={modalTrackingId}
                  onChange={(e) => setModalTrackingId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono outline-none font-bold"
                />
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2.5">
                <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-500" />
                  <span>Optional API Credentials (Encrypted Server-Side)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    placeholder="API Key / Access Key"
                    value={modalApiKey}
                    onChange={(e) => setModalApiKey(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="API Secret Key"
                    value={modalApiSecret}
                    onChange={(e) => setModalApiSecret(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlatform}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingPlatform ? 'Saving...' : 'Save Platform'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
