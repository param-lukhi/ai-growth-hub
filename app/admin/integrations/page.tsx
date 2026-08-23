'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import {
  Key, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink,
  Save, Lock, Globe, Sparkles
} from 'lucide-react';

export default function IntegrationsPage() {
  const { currentWebsite } = useWebsite();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<any | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [configInput, setConfigInput] = useState('');

  const fetchIntegrations = async () => {
    if (!currentWebsite) return;
    try {
      const res = await fetch(`/api/saas/integrations?websiteId=${currentWebsite.id}`);
      const data = await res.json();
      if (data.success) setIntegrations(data.integrations);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [currentWebsite]);

  const handleSaveIntegration = async (provider: string, displayName: string) => {
    try {
      const res = await fetch('/api/saas/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: currentWebsite?.id,
          provider,
          displayName,
          credentialsJson: { apiKey: apiKeyInput },
          configJson: { property: configInput },
          status: apiKeyInput.trim() ? 'CONNECTED' : 'REQUIRES_CONNECTION'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveModal(null);
        setApiKeyInput('');
        setConfigInput('');
        await fetchIntegrations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const PROVIDER_LIST = [
    {
      id: 'GOOGLE_SEARCH_CONSOLE',
      name: 'Google Search Console',
      desc: 'OAuth 2.0 or Service Account for automatic ranking, clicks, and impressions sync.',
      type: 'OAuth / Key'
    },
    {
      id: 'AMAZON_ASSOCIATES',
      name: 'Amazon Associates & PA-API',
      desc: 'Affiliate Tag tracking and Product Advertising API credentials for verified pricing.',
      type: 'API Key & Tag'
    },
    {
      id: 'GOOGLE_ANALYTICS',
      name: 'Google Analytics 4',
      desc: 'GA4 Measurement Protocol and Real-time event tracking.',
      type: 'Measurement ID'
    },
    {
      id: 'OPENAI_GEMINI',
      name: 'AI Model Provider (Gemini / OpenAI)',
      desc: 'Bring your own API key for custom fine-tuned model temperatures and prompt tokens.',
      type: 'API Key'
    },
    {
      id: 'WORDPRESS',
      name: 'WordPress REST API',
      desc: 'Publish directly to remote WordPress installations using Application Passwords.',
      type: 'REST Credentials'
    },
    {
      id: 'PINTEREST',
      name: 'Pinterest API',
      desc: 'Automatic pin publishing to specified niche boards.',
      type: 'OAuth 2.0'
    },
    {
      id: 'YOUTUBE',
      name: 'YouTube Data API',
      desc: 'Direct YouTube Shorts upload integration.',
      type: 'OAuth 2.0'
    },
    {
      id: 'INSTAGRAM',
      name: 'Meta / Instagram Graph API',
      desc: 'Reels and Instagram carousel publishing.',
      type: 'Meta App Token'
    },
    {
      id: 'MEDIUM',
      name: 'Medium Integration Token',
      desc: 'Syndicate companion drafts directly to Medium with canonical links.',
      type: 'Integration Token'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Key className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>API Keys & Integrations Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Securely configure credentials for <strong>{currentWebsite?.name || 'Selected Website'}</strong>. All API secrets are encrypted on the server and never exposed in client JavaScript.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROVIDER_LIST.map((provider) => {
          const matched = integrations.find(i => i.provider === provider.id);
          const isConnected = matched?.status === 'CONNECTED';

          return (
            <div
              key={provider.id}
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                  }`}>
                    {isConnected ? 'Connected' : 'Requires Connection'}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">{provider.type}</span>
                </div>

                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">{provider.name}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {provider.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveModal(provider);
                    setApiKeyInput('');
                    setConfigInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-brand-600 dark:hover:bg-brand-400 transition-all cursor-pointer"
                >
                  {isConnected ? 'Edit Credentials' : 'Connect API'}
                </button>
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-neutral-900 dark:text-neutral-100 text-xs">
            <h3 className="text-base font-extrabold">Connect {activeModal.name}</h3>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Enter the credentials or tokens for <strong>{currentWebsite?.name}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-bold mb-1">API Key / Token / Secret</label>
                <input
                  type="password"
                  placeholder="Paste API Key or Token here..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Property ID / Target URL / Store Tag</label>
                <input
                  type="text"
                  placeholder="e.g. techpulse-20 or G-XYZ"
                  value={configInput}
                  onChange={e => setConfigInput(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveIntegration(activeModal.id, activeModal.name)}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold"
              >
                Save Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
