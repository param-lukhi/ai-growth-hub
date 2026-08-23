'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, Edit3, Trash2, ExternalLink, Eye, TrendingUp, Award, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Blog {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  createdAt: string;
  category: { name: string };
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'views'>('views');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = () => {
    setLoading(true);
    setError(null);
    const query = new URLSearchParams();
    query.append('status', statusFilter);
    if (search) query.append('q', search);

    fetch(`/api/blogs?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load blog posts');
        return res.json();
      })
      .then((data) => {
        const blogList = Array.isArray(data) ? data : [];
        setBlogs(blogList);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load data.');
        setLoading(false);
      });
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchBlogs();
  };

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
    fetchBlogs();
  };

  const totalViews = blogs.reduce((acc, b) => acc + (b.views || 0), 0);
  const sortedBlogs = [...blogs].sort((a, b) => {
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const topBlog = blogs.length > 0 ? [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0))[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Blog Analytics & Management</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Track view counts, manage drafts, publish reviews, and monitor reader engagement.
          </p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Blog</span>
        </Link>
      </div>

      {/* Analytics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Blog Views</span>
            <Eye className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">{totalViews.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Live page views recorded
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Articles</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">{blogs.length}</div>
          <div className="text-[11px] text-neutral-500 font-medium">Published & Draft articles</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Most Popular Blog</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
            {topBlog ? topBlog.title : 'N/A'}
          </div>
          <div className="text-[11px] text-amber-600 font-extrabold">
            {topBlog ? `${topBlog.views.toLocaleString()} Total Views` : 'No data'}
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl w-full sm:w-auto text-xs font-bold">
          {['ALL', 'PUBLISHED', 'DRAFT', 'SCHEDULED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === st ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Sort & Search Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'views')}
            className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 outline-none"
          >
            <option value="views">🔥 Sort by Most Views</option>
            <option value="newest">📅 Sort by Newest Date</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search blog title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBlogs()}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs outline-none focus:border-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 space-y-4 animate-pulse">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-48" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-full" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">Unable to load data.</h3>
          <button
            onClick={fetchBlogs}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      )}

      {/* Blogs Table / Professional Empty State */}
      {!loading && !error && (
        sortedBlogs.length > 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">👁️ Page Views</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {sortedBlogs.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4 font-bold text-neutral-900 dark:text-white max-w-xs truncate">
                        <Link href={`/admin/blogs/${b.id}`} className="hover:text-brand-600">
                          {b.title}
                        </Link>
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-400 font-medium">{b.category?.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                          b.status === 'PUBLISHED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-black text-xs border border-brand-200">
                          <Eye className="w-3.5 h-3.5 text-brand-600" />
                          {b.views.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-500">{formatDate(b.createdAt)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/blog/${b.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/blogs/${b.id}`}
                            className="p-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(b.id, b.title)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* PROFESSIONAL EMPTY STATE */
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
            <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No blog articles found.</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No blog posts match your current filter or database state.
            </p>
            <Link
              href="/admin/blogs/new"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Blog</span>
            </Link>
          </div>
        )
      )}
    </div>
  );
}
