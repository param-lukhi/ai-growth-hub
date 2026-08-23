'use client';

import React, { useState } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import {
  Globe, Plus, Edit2, Play, Pause, Trash2, Bot, ExternalLink,
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function WebsitesManagementPage() {
  const { websites, currentWebsite, setCurrentWebsite, openAddModal, refreshWebsites } = useWebsite();
  const [editingSite, setEditingSite] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleStatus = async (site: any) => {
    const newStatus = site.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/saas/websites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        await refreshWebsites();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (site: any) => {
    if (site.slug === 'techpulse') {
      alert('Cannot delete the primary TechPulse website.');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${site.name}" and all its isolated agent memories?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/saas/websites/${site.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await refreshWebsites();
      } else {
        alert(data.error || 'Failed to delete website.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/saas/websites/${editingSite.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSite)
      });
      const data = await res.json();
      if (data.success) {
        setEditingSite(null);
        await refreshWebsites();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Website Portfolio Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your multi-website network. Every website has isolated AI agents, memory, and SEO settings.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Website (Wizard)</span>
        </button>
      </div>

      {/* Website Cards Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Website Name & URL</th>
                <th className="py-3.5 px-4">Niche & Country</th>
                <th className="py-3.5 px-4">AI Agent Status</th>
                <th className="py-3.5 px-4">Articles</th>
                <th className="py-3.5 px-4">Traffic / Clicks</th>
                <th className="py-3.5 px-4">Approval Mode</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
              {websites.map(site => {
                const isSelected = currentWebsite?.id === site.id;
                return (
                  <tr
                    key={site.id}
                    className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                      isSelected ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                    }`}
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                          {site.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                            <span>{site.name}</span>
                            {site.slug === 'techpulse' && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                Primary TechPulse
                              </span>
                            )}
                          </div>
                          <a
                            href={site.domainUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-neutral-400 hover:text-brand-500 flex items-center gap-1 mt-0.5"
                          >
                            <span>{site.domainUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-neutral-900 dark:text-white">{site.niche}</div>
                      <div className="text-[11px] text-neutral-400">{site.targetCountry} • {site.targetLanguage}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                        site.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${site.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span>{site.status === 'ACTIVE' ? 'Agent Running' : 'Agent Paused'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-extrabold text-neutral-900 dark:text-white">{site.articlesCount || 0}</div>
                      <div className="text-[10px] text-neutral-400">{site.publishingFrequency}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-extrabold text-neutral-900 dark:text-white">{(site.trafficCount || 0).toLocaleString()} Clicks</div>
                      <div className="text-[10px] text-neutral-400">{site.affiliateClicks || 0} Affiliate Clicks</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                        {site.approvalMode}
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setCurrentWebsite(site)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-brand-600 dark:hover:bg-brand-400 font-extrabold text-xs transition-all cursor-pointer"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => setEditingSite(site)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                          title="Edit Website"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(site)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                          title={site.status === 'ACTIVE' ? 'Pause Agent' : 'Resume Agent'}
                        >
                          {site.status === 'ACTIVE' ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
                        </button>
                        {site.slug !== 'techpulse' && (
                          <button
                            onClick={() => handleDelete(site)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-400 hover:text-rose-600 transition-colors"
                            title="Delete Website"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">Edit Website: {editingSite.name}</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Website Name</label>
                <input
                  type="text"
                  value={editingSite.name}
                  onChange={e => setEditingSite({ ...editingSite, name: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Domain URL</label>
                <input
                  type="text"
                  value={editingSite.domainUrl}
                  onChange={e => setEditingSite({ ...editingSite, domainUrl: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Target Country</label>
                  <input
                    type="text"
                    value={editingSite.targetCountry}
                    onChange={e => setEditingSite({ ...editingSite, targetCountry: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Approval Mode</label>
                  <select
                    value={editingSite.approvalMode}
                    onChange={e => setEditingSite({ ...editingSite, approvalMode: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 outline-none focus:border-brand-500"
                  >
                    <option value="MANUAL">Manual Approval</option>
                    <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
                    <option value="AUTOMATIC">Automatic</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
