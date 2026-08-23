'use client';

import React, { useEffect, useState } from 'react';
import { GitCompare, Plus, Star, Trash2 } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface ComparisonItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  product1Id: string;
  product2Id: string;
  winnerId?: string;
  product1?: { name: string };
  product2?: { name: string };
  status: string;
}

export default function AdminComparisonsPage() {
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [product1Id, setProduct1Id] = useState('');
  const [product2Id, setProduct2Id] = useState('');

  const fetchComparisons = () => {
    setLoading(true);
    fetch('/api/comparisons')
      .then((res) => res.json())
      .then((data) => {
        setComparisons(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchComparisons();
    fetch('/api/products?status=ALL')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          if (data.length >= 2) {
            setProduct1Id(data[0].id);
            setProduct2Id(data[1].id);
          }
        }
      });
  }, []);

  const handleAddComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !product1Id || !product2Id) return;

    const res = await fetch('/api/comparisons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug: slugify(title),
        product1Id,
        product2Id,
        winnerId: product1Id,
      }),
    });

    if (res.ok) {
      setTitle('');
      setShowForm(false);
      fetchComparisons();
    } else {
      alert('Failed to add comparison.');
    }
  };

  const handleDelete = async (id: string, compTitle: string) => {
    if (!confirm(`Delete comparison "${compTitle}"?`)) return;
    await fetch(`/api/comparisons/${id}`, { method: 'DELETE' });
    fetchComparisons();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <GitCompare className="w-4 h-4" /> Comparison Builder
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Head-to-Head Product Comparisons
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage side-by-side benchmark comparison tables and winner recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Comparison</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Create Product Comparison</h2>
          <form onSubmit={handleAddComparison} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max vs MacBook Air M3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Product 1 *</label>
                <select
                  value={product1Id}
                  onChange={(e) => setProduct1Id(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Product 2 *</label>
                <select
                  value={product2Id}
                  onChange={(e) => setProduct2Id(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
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
                Save Comparison
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse h-40" />
      ) : comparisons.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                <th className="p-4">Comparison Title</th>
                <th className="p-4">Product 1</th>
                <th className="p-4">Product 2</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {comparisons.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4 font-extrabold text-neutral-900 dark:text-white max-w-xs truncate">{c.title}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">{c.product1?.name || '—'}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">{c.product2?.name || '—'}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold text-[10px] uppercase">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.title)}
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
          <GitCompare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No comparisons created yet.</h3>
        </div>
      )}
    </div>
  );
}
