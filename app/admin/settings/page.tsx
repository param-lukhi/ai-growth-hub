'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Globe, Zap, DollarSign } from 'lucide-react';
import { MARKETPLACE_LIST } from '@/lib/location';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: 'TechPulse Reviews',
    site_tagline: 'Research-Based Product Reviews & Unbiased Buying Guides',
    hero_title: 'Research-Based Product Reviews & Buying Guides',
    hero_subtitle: 'We research product specifications, pricing, user feedback, features, and available product information to help you make smarter buying decisions.',
    hero_button_text: 'Browse Latest Reviews',
    default_currency: 'USD',
    enable_auto_currency: 'true',
    enable_multi_country: 'true',
    default_marketplace: 'amazon.com',
    affiliate_tag: 'techpulse-20',
    ga_id: '',
    google_site_verification: '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert('Failed to update settings.');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Website & Multi-Currency Settings</h1>
          <p className="text-xs text-neutral-500 mt-1">Configure global branding, regional Amazon marketplaces, auto currency detection, and SEO.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All site settings and Multi-Currency configurations updated successfully!</span>
        </div>
      )}

      {/* 1. Multi-Currency & Marketplace Admin Controls */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200/80 p-6 rounded-2xl space-y-4">
        <h2 className="font-extrabold text-blue-950 text-sm flex items-center gap-2 border-b border-blue-200 pb-2">
          <DollarSign className="w-4 h-4 text-brand-600" />
          <span>Multi-Currency & Regional Marketplace Controls</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div>
            <label className="block text-blue-950 mb-1">Default Fallback Currency</label>
            <select
              value={settings.default_currency || 'USD'}
              onChange={(e) => handleChange('default_currency', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 outline-none focus:border-brand-500 bg-white"
            >
              {MARKETPLACE_LIST.map((m) => (
                <option key={m.code} value={m.currency}>
                  {m.symbol} {m.currency} ({m.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-blue-950 mb-1">Default Amazon Marketplace</label>
            <select
              value={settings.default_marketplace || 'Amazon.in'}
              onChange={(e) => handleChange('default_marketplace', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 outline-none focus:border-brand-500 bg-white"
            >
              {MARKETPLACE_LIST.map((m) => (
                <option key={m.code} value={m.domain}>
                  {m.flag} {m.name} ({m.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-blue-950 mb-1">Auto Currency & Location Detection</label>
            <select
              value={settings.enable_auto_currency || 'true'}
              onChange={(e) => handleChange('enable_auto_currency', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 outline-none focus:border-brand-500 bg-white"
            >
              <option value="true">Enabled (Auto Detect IP / Browser)</option>
              <option value="false">Disabled (Force Default Currency)</option>
            </select>
          </div>

          <div>
            <label className="block text-blue-950 mb-1">Multi-Country Amazon Routing</label>
            <select
              value={settings.enable_multi_country || 'true'}
              onChange={(e) => handleChange('enable_multi_country', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 outline-none focus:border-brand-500 bg-white"
            >
              <option value="true">Enabled (Route visitors to local Amazon stores)</option>
              <option value="false">Disabled (Single Store Only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. General Branding */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
        <h2 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2 border-b border-neutral-100 pb-2">
          <Globe className="w-4 h-4 text-brand-600" />
          <span>General Website Branding</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div>
            <label className="block text-neutral-700 mb-1">Website Name</label>
            <input
              type="text"
              value={settings.site_name || ''}
              onChange={(e) => handleChange('site_name', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-neutral-700 mb-1">Tagline</label>
            <input
              type="text"
              value={settings.site_tagline || ''}
              onChange={(e) => handleChange('site_tagline', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Hero Banner Content */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
        <h2 className="font-extrabold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
          Homepage Hero Banner Content
        </h2>

        <div className="space-y-3 text-xs font-bold">
          <div>
            <label className="block text-neutral-700 mb-1">Hero Main Title</label>
            <input
              type="text"
              value={settings.hero_title || ''}
              onChange={(e) => handleChange('hero_title', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-neutral-700 mb-1">Hero Subtitle</label>
            <textarea
              rows={2}
              value={settings.hero_subtitle || ''}
              onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
