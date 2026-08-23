'use client';

import React, { useEffect, useState } from 'react';
import { Tv, Plus, Trash2 } from 'lucide-react';

interface AdItem {
  id: string;
  title: string;
  location: string;
  image: string;
  targetUrl: string;
  active: boolean;
}

export default function AdminAdvertisementsPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('HEADER');
  const [image, setImage] = useState('');
  const [targetUrl, setTargetUrl] = useState('');

  const fetchAds = () => {
    setLoading(true);
    fetch('/api/advertisements')
      .then((res) => res.json())
      .then((data) => {
        setAds(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim() || !targetUrl.trim()) return;

    const res = await fetch('/api/advertisements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        location,
        image,
        targetUrl,
        active: true,
      }),
    });

    if (res.ok) {
      setTitle('');
      setImage('');
      setTargetUrl('');
      setShowForm(false);
      fetchAds();
    } else {
      alert('Failed to add banner advertisement.');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/advertisements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    fetchAds();
  };

  const handleDelete = async (id: string, adTitle: string) => {
    if (!confirm(`Delete advertisement "${adTitle}"?`)) return;
    await fetch(`/api/advertisements/${id}`, { method: 'DELETE' });
    fetchAds();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Tv className="w-4 h-4" /> Ad Banners & Monetization
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Ad Placements & Sponsorships
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage header banners, sidebar ads, in-article sponsor blocks, and Google AdSense units.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Ad Placement</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Create Banner Ad</h2>
          <form onSubmit={handleAddAd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Ad Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Prime Day Banner"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Placement Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                >
                  <option value="HEADER">HEADER</option>
                  <option value="SIDEBAR">SIDEBAR</option>
                  <option value="IN_ARTICLE">IN_ARTICLE</option>
                  <option value="FOOTER">FOOTER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Link URL *</label>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://www.amazon.com/..."
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
                Save Advertisement
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse h-40" />
      ) : ads.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                <th className="p-4">Ad Title</th>
                <th className="p-4">Placement</th>
                <th className="p-4">Target URL</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4 font-extrabold text-neutral-900 dark:text-white max-w-xs truncate">{ad.title}</td>
                  <td className="p-4 font-bold text-neutral-600 dark:text-neutral-400">{ad.location}</td>
                  <td className="p-4 text-neutral-500 truncate max-w-xs">{ad.targetUrl}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(ad.id, ad.active)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        ad.active
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {ad.active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(ad.id, ad.title)}
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
          <Tv className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No active ad banners.</h3>
        </div>
      )}
    </div>
  );
}
