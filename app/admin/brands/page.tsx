'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, AlertCircle } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchBrands = () => {
    setLoading(true);
    setError(null);
    fetch('/api/brands')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load brands');
        return res.json();
      })
      .then((data) => {
        setBrands(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        slug: slugify(name),
        description: description.trim(),
      }),
    });

    if (res.ok) {
      setName('');
      setDescription('');
      setShowAddForm(false);
      fetchBrands();
    } else {
      alert('Failed to add brand.');
    }
  };

  const handleDelete = async (id: string, brandName: string) => {
    if (!confirm(`Delete brand "${brandName}"?`)) return;
    await fetch(`/api/brands/${id}`, { method: 'DELETE' });
    fetchBrands();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4" /> Brand Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Manufacturer Brands
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage tech manufacturer brands and linked product catalogs.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Add New Brand</h2>
          <form onSubmit={handleAddBrand} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Logitech"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Computer peripherals & accessories"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm"
              >
                Save Brand
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse h-40" />
      ) : brands.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                <th className="p-4">Brand Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4 font-extrabold text-neutral-900 dark:text-white">{b.name}</td>
                  <td className="p-4 text-neutral-500 font-mono text-[11px]">{b.slug}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">{b.description || '—'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(b.id, b.name)}
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
          <Tag className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No brands added yet.</h3>
        </div>
      )}
    </div>
  );
}
