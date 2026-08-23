'use client';

import React, { useEffect, useState } from 'react';
import { Link2, Plus, Save, Trash2 } from 'lucide-react';

interface AffiliateLinkItem {
  id: string;
  title: string;
  originalUrl: string;
  cloakedUrl: string;
  category: string;
  clicks: number;
}

export default function AdminAffiliateLinksPage() {
  const [links, setLinks] = useState<AffiliateLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [cloakedUrl, setCloakedUrl] = useState('');
  const [category, setCategory] = useState('Mobiles');

  const fetchLinks = () => {
    setLoading(true);
    fetch('/api/affiliate-links')
      .then((res) => res.json())
      .then((data) => {
        setLinks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !originalUrl.trim() || !cloakedUrl.trim()) return;

    const res = await fetch('/api/affiliate-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        originalUrl,
        cloakedUrl: cloakedUrl.startsWith('/') ? cloakedUrl : `/${cloakedUrl}`,
        category,
      }),
    });

    if (res.ok) {
      setTitle('');
      setOriginalUrl('');
      setCloakedUrl('');
      setShowForm(false);
      fetchLinks();
    } else {
      alert('Failed to save affiliate link.');
    }
  };

  const handleDelete = async (id: string, linkTitle: string) => {
    if (!confirm(`Delete affiliate link "${linkTitle}"?`)) return;
    await fetch(`/api/affiliate-links/${id}`, { method: 'DELETE' });
    fetchLinks();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Link2 className="w-4 h-4" /> Link Manager
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Cloaked Affiliate Links & Redirection
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage custom clean tracking links and Amazon affiliate redirects.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Link</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Add Cloaked Link</h2>
          <form onSubmit={handleAddLink} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Link Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro Max Link"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Cloaked Short Path *</label>
                <input
                  type="text"
                  required
                  value={cloakedUrl}
                  onChange={(e) => setCloakedUrl(e.target.value)}
                  placeholder="/go/iphone15promax"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Original Amazon URL *</label>
                <input
                  type="url"
                  required
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://www.amazon.com/dp/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm"
              >
                Save Link
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse h-40" />
      ) : links.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                <th className="p-4">Title</th>
                <th className="p-4">Cloaked URL</th>
                <th className="p-4">Original URL</th>
                <th className="p-4">Click Count</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {links.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4 font-extrabold text-neutral-900 dark:text-white">{l.title}</td>
                  <td className="p-4 font-mono text-brand-600 dark:text-brand-400 font-bold">{l.cloakedUrl}</td>
                  <td className="p-4 text-neutral-500 truncate max-w-xs">{l.originalUrl}</td>
                  <td className="p-4 font-extrabold text-neutral-900 dark:text-white">{l.clicks} Clicks</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(l.id, l.title)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
          <Link2 className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No cloaked links created.</h3>
        </div>
      )}
    </div>
  );
}
