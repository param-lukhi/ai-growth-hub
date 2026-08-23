'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Plus, Trash2 } from 'lucide-react';

interface DealItem {
  id: string;
  title: string;
  originalPrice: string;
  dealPrice: string;
  discount: string;
  dealUrl: string;
  badge?: string;
  status: string;
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [dealUrl, setDealUrl] = useState('');

  const fetchDeals = () => {
    setLoading(true);
    fetch('/api/deals')
      .then((res) => res.json())
      .then((data) => {
        setDeals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dealPrice || !dealUrl) return;

    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        originalPrice,
        dealPrice,
        discount: discount || 'DEAL',
        dealUrl,
      }),
    });

    if (res.ok) {
      setTitle('');
      setOriginalPrice('');
      setDealPrice('');
      setDiscount('');
      setDealUrl('');
      setShowForm(false);
      fetchDeals();
    } else {
      alert('Failed to add deal.');
    }
  };

  const handleDelete = async (id: string, dealTitle: string) => {
    if (!confirm(`Delete deal "${dealTitle}"?`)) return;
    await fetch(`/api/deals/${id}`, { method: 'DELETE' });
    fetchDeals();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Amazon Price Drops
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Handpicked Deals & Promotions
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Featured discounts displayed on the homepage and /deals page.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Deal Product</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Add New Deal</h2>
          <form onSubmit={handleAddDeal} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MacBook Air M3 Flash Sale"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Original Price</label>
                <input
                  type="text"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="$1,299.00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Deal Price *</label>
                <input
                  type="text"
                  required
                  value={dealPrice}
                  onChange={(e) => setDealPrice(e.target.value)}
                  placeholder="$1,099.00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Discount Tag</label>
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="15% OFF"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Deal Affiliate Link *</label>
                <input
                  type="url"
                  required
                  value={dealUrl}
                  onChange={(e) => setDealUrl(e.target.value)}
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
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-extrabold shadow-sm"
              >
                Save Deal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse h-40" />
      ) : deals.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-x-auto shadow-soft">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                <th className="p-4">Deal Title</th>
                <th className="p-4">Original Price</th>
                <th className="p-4">Deal Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4 font-extrabold text-neutral-900 dark:text-white max-w-xs truncate">{d.title}</td>
                  <td className="p-4 text-neutral-400 line-through">{d.originalPrice || '—'}</td>
                  <td className="p-4 font-black text-amber-600 dark:text-amber-400 text-sm">{d.dealPrice}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[10px] uppercase">
                      {d.discount}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(d.id, d.title)}
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
          <Sparkles className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No active deals.</h3>
        </div>
      )}
    </div>
  );
}
