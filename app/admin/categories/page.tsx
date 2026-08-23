'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  FolderPlus,
  CornerDownRight,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  ShoppingBag,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  Compass,
  Tag,
  ArrowUpRight,
} from 'lucide-react';
import { slugify } from '@/lib/utils';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  subcategories?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    _count?: {
      products: number;
      blogs: number;
    };
  }[];
  _count?: {
    products: number;
    blogs: number;
    subcategories: number;
  };
}

const EMOJI_PRESETS = [
  { group: 'Tech', emojis: ['💻', '📱', '🎧', '📺', '⚡', '⌚', '📷', '🎮', '🖥️', '🔊', '🔋', '🔌'] },
  { group: 'Home & Life', emojis: ['🏠', '🍳', '🛋️', '☕', '💡', '🧹', '🪴', '🛏️', '🧴', '👕', '🚲', '🏋️'] },
  { group: 'Badges', emojis: ['⭐', '🔥', '💎', '🚀', '🏷️', '🎯', '✨', '👑', '🎁', '🛒', '📦', '🌟'] },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View & Filter States
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'main' | 'sub'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'products' | 'blogs' | 'subcategories'>('name_asc');
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});

  // Copy Feedback Toast
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modal State for Create & Edit
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [image, setImage] = useState('');
  const [parentId, setParentId] = useState<string>('');

  // Delete Confirmation Modal State
  const [deleteCategory, setDeleteCategory] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    setError(null);
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load categories');
        return res.json();
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load categories data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(text);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Main Categories available for selection as Parent
  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const mainCount = categories.filter((c) => !c.parentId).length;
    const subCount = categories.filter((c) => !!c.parentId).length;
    const totalProducts = categories.reduce((acc, c) => acc + (c._count?.products || 0), 0);
    const totalBlogs = categories.reduce((acc, c) => acc + (c._count?.blogs || 0), 0);
    return { total, mainCount, subCount, totalProducts, totalBlogs };
  }, [categories]);

  // Toggle Collapse on a parent category
  const toggleCollapse = (id: string) => {
    setCollapsedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    mainCategories.forEach((m) => {
      allCollapsed[m.id] = true;
    });
    setCollapsedParents(allCollapsed);
  };

  const expandAll = () => {
    setCollapsedParents({});
  };

  // Open Create Modal (optionally with pre-selected parent)
  const openCreateModal = (preselectedParentId?: string) => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIsCustomSlug(false);
    setDescription('');
    setIcon(preselectedParentId ? '🏷️' : '📁');
    setImage('');
    setParentId(preselectedParentId || '');
    setFormError(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIsCustomSlug(true);
    setDescription(cat.description || '');
    setIcon(cat.icon || (cat.parentId ? '🏷️' : '📁'));
    setImage(cat.image || '');
    setParentId(cat.parentId || '');
    setFormError(null);
    setShowModal(true);
  };

  // Auto-slug generator on Name change when creating
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isCustomSlug && !editingCategory) {
      setSlug(slugify(value));
    }
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setFormError('Category name and URL slug are required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      icon: icon.trim() || null,
      image: image.trim() || null,
      parentId: parentId.trim() ? parentId.trim() : null,
    };

    try {
      let res: Response;
      if (editingCategory) {
        res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Category Execution
  const executeDelete = async () => {
    if (!deleteCategory) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/categories/${deleteCategory.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete category');
      }

      setDeleteCategory(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered & Sorted Categories
  const filteredCategories = useMemo(() => {
    let result = categories.filter((c) => {
      if (activeFilter === 'main' && c.parentId) return false;
      if (activeFilter === 'sub' && !c.parentId) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchSlug = c.slug.toLowerCase().includes(q);
      const matchParent = c.parent?.name.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      return matchName || matchSlug || matchParent || matchDesc;
    });

    result.sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'products') return (b._count?.products || 0) - (a._count?.products || 0);
      if (sortBy === 'blogs') return (b._count?.blogs || 0) - (a._count?.blogs || 0);
      if (sortBy === 'subcategories') return (b._count?.subcategories || 0) - (a._count?.subcategories || 0);
      return 0;
    });

    return result;
  }, [categories, activeFilter, searchQuery, sortBy]);

  // Grouped Main Categories with nested subcategories
  const groupedTree = useMemo(() => {
    if (activeFilter === 'sub') return [];
    const mainList = categories.filter((c) => !c.parentId);

    return mainList
      .map((main) => {
        const subs = categories.filter((c) => c.parentId === main.id);
        const matchesQuery =
          !searchQuery.trim() ||
          main.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          main.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subs.some(
            (s) =>
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.slug.toLowerCase().includes(searchQuery.toLowerCase())
          );

        return { main, subs, isVisible: matchesQuery };
      })
      .filter((item) => item.isVisible);
  }, [categories, activeFilter, searchQuery]);

  return (
    <div className="space-y-8 max-w-7xl pb-24">
      {/* Toast Notification */}
      {copiedSlug && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Copied slug "{copiedSlug}" to clipboard!</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-brand-950 p-8 text-white border border-neutral-800 shadow-soft">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-extrabold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Taxonomy & Content Organization
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Category Architecture</h1>
            <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Design multi-level category trees, manage subcategory taxonomy, and organize reviews & products for
              seamless navigation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openCreateModal()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </button>
            <button
              onClick={() => {
                if (mainCategories.length > 0) openCreateModal(mainCategories[0].id);
                else openCreateModal();
              }}
              className="px-5 py-3 rounded-2xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white font-extrabold text-xs flex items-center gap-2 border border-neutral-700 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>New Subcategory</span>
            </button>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Categories */}
        <div className="group bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Categories</span>
            <div className="p-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:scale-110 transition-transform">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-neutral-400 font-medium">taxonomies</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full w-full" />
          </div>
        </div>

        {/* Main Categories */}
        <div className="group bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Main Categories</span>
            <div className="p-2 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-brand-600 dark:text-brand-400">{stats.mainCount}</span>
            <span className="text-xs text-neutral-400 font-medium">
              {stats.total ? Math.round((stats.mainCount / stats.total) * 100) : 0}% of total
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${stats.total ? (stats.mainCount / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Subcategories */}
        <div className="group bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Subcategories</span>
            <div className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <CornerDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.subCount}</span>
            <span className="text-xs text-neutral-400 font-medium">nested children</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${stats.total ? (stats.subCount / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Linked Content Items */}
        <div className="group bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Catalog Content</span>
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats.totalProducts + stats.totalBlogs}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              ({stats.totalProducts}p / {stats.totalBlogs}b)
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* SEARCH, FILTER & CONTROLS TOOLBAR */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 shadow-soft space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search category by name, slug, parent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/70 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-800 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Filters, Sort & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                All ({categories.length})
              </button>
              <button
                onClick={() => setActiveFilter('main')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeFilter === 'main'
                    ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Main ({stats.mainCount})
              </button>
              <button
                onClick={() => setActiveFilter('sub')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeFilter === 'sub'
                    ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Sub ({stats.subCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 outline-none focus:border-brand-500 cursor-pointer appearance-none pr-8"
              >
                <option value="name_asc">Sort: Name (A-Z)</option>
                <option value="name_desc">Sort: Name (Z-A)</option>
                <option value="products">Sort: Most Products</option>
                <option value="blogs">Sort: Most Reviews</option>
                <option value="subcategories">Sort: Most Subcategories</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>

            {/* View Switcher */}
            <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
              <button
                onClick={() => setViewMode('cards')}
                title="Grouped Cards Hierarchy View"
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Expand / Collapse All (For Cards View) */}
            {viewMode === 'cards' && (
              <div className="hidden sm:flex items-center gap-1 text-xs">
                <button
                  onClick={expandAll}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-neutral-500 hover:text-brand-600"
                >
                  Expand All
                </button>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <button
                  onClick={collapseAll}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-neutral-500 hover:text-brand-600"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOADING SKELETON */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
          ))}
        </div>
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">{error}</h3>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm hover:bg-rose-500"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      )}

      {/* VIEW 1: GROUPED HIERARCHY CARDS */}
      {!loading && !error && viewMode === 'cards' && (
        groupedTree.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groupedTree.map(({ main, subs }) => {
              const isCollapsed = !!collapsedParents[main.id];
              const totalProd = (main._count?.products || 0) + subs.reduce((acc, s) => acc + (s._count?.products || 0), 0);
              const totalBlog = (main._count?.blogs || 0) + subs.reduce((acc, s) => acc + (s._count?.blogs || 0), 0);

              return (
                <div
                  key={main.id}
                  className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group/card"
                >
                  {/* Card Header (Main Category) */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/60 dark:to-brand-900/40 border border-brand-200/60 dark:border-brand-800/60 text-brand-600 dark:text-brand-400 flex items-center justify-center text-2xl font-bold shrink-0 shadow-xs">
                          {main.icon || '📁'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg text-neutral-900 dark:text-white tracking-tight">
                              {main.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60 text-[10px] font-extrabold uppercase tracking-wider">
                              Main
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => copyToClipboard(main.slug)}
                              title="Click to copy slug"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-neutral-700 transition-colors"
                            >
                              <span>/{main.slug}</span>
                              <Copy className="w-3 h-3 opacity-60" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons for Main Category */}
                      <div className="flex items-center gap-1.5 opacity-90 group-hover/card:opacity-100 transition-opacity">
                        <Link
                          href={`/category/${main.slug}`}
                          target="_blank"
                          title="Visit Category Public Hub"
                          className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-all hover:scale-105"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(main)}
                          title="Edit Main Category"
                          className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 transition-all hover:scale-105"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCategory(main)}
                          title="Delete Main Category"
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50 transition-all hover:scale-105"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {main.description && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                        {main.description}
                      </p>
                    )}

                    {/* Stats Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                        <span>{totalProd} Products</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{totalBlog} Articles</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50 font-bold flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>{subs.length} Subcategories</span>
                      </span>
                    </div>
                  </div>

                  {/* Subcategories Branch List */}
                  <div className="border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <button
                        onClick={() => toggleCollapse(main.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                        <span>Nested Subcategories ({subs.length})</span>
                      </button>

                      <button
                        onClick={() => openCreateModal(main.id)}
                        className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Subcategory</span>
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-2">
                        {subs.length > 0 ? (
                          subs.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-3 rounded-2xl bg-white dark:bg-neutral-800/70 border border-neutral-200/70 dark:border-neutral-700/60 shadow-xs flex items-center justify-between gap-3 hover:border-purple-300 dark:hover:border-purple-700/60 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-sm shrink-0">
                                  {sub.icon || '🏷️'}
                                </span>
                                <div className="truncate">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                                      {sub.name}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-neutral-400 font-mono">/{sub.slug}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <Link
                                  href={`/category/${sub.slug}`}
                                  target="_blank"
                                  title="View Subcategory page"
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  onClick={() => openEditModal(sub as any)}
                                  title="Edit Subcategory"
                                  className="p-1.5 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteCategory(sub as any)}
                                  title="Delete Subcategory"
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-1.5">
                            <p className="text-[11px] text-neutral-400">No subcategories under {main.name}.</p>
                            <button
                              onClick={() => openCreateModal(main.id)}
                              className="text-[11px] font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Create first subcategory
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
            <FolderTree className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No categories found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery ? 'No category matched your search criteria.' : 'Create your first category to get started.'}
            </p>
            <button
              onClick={() => openCreateModal()}
              className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Category
            </button>
          </div>
        )
      )}

      {/* VIEW 2: DATA TABLE */}
      {!loading && !error && viewMode === 'table' && (
        filteredCategories.length > 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-5">Category Name</th>
                    <th className="py-4 px-4">Level / Parent</th>
                    <th className="py-4 px-4">URL Slug</th>
                    <th className="py-4 px-4">Catalog Content</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {filteredCategories.map((cat) => {
                    const isSub = !!cat.parentId;
                    return (
                      <tr
                        key={cat.id}
                        className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                          isSub ? 'bg-neutral-50/30 dark:bg-neutral-900/30' : ''
                        }`}
                      >
                        {/* Name & Icon */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-base shrink-0">
                              {cat.icon || (isSub ? '🏷️' : '📁')}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
                                  {cat.name}
                                </span>
                              </div>
                              {cat.description && (
                                <p className="text-[11px] text-neutral-500 line-clamp-1 max-w-sm mt-0.5">
                                  {cat.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Level */}
                        <td className="py-4 px-4">
                          {isSub ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                              <span>Sub of:</span>
                              <strong>{cat.parent?.name || 'Parent'}</strong>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-semibold text-[11px]">
                              <Layers className="w-3 h-3" />
                              <span>Main Category</span>
                            </span>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => copyToClipboard(cat.slug)}
                            className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg hover:text-brand-600 flex items-center gap-1"
                          >
                            <span>/{cat.slug}</span>
                            <Copy className="w-3 h-3 opacity-50" />
                          </button>
                        </td>

                        {/* Counts */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                            <span className="flex items-center gap-1" title="Products">
                              <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                              <strong className="font-bold text-neutral-800 dark:text-neutral-200">
                                {cat._count?.products || 0}
                              </strong>
                            </span>
                            <span className="flex items-center gap-1" title="Articles">
                              <FileText className="w-3.5 h-3.5 text-emerald-500" />
                              <strong className="font-bold text-neutral-800 dark:text-neutral-200">
                                {cat._count?.blogs || 0}
                              </strong>
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isSub && (
                              <button
                                onClick={() => openCreateModal(cat.id)}
                                title="Add Subcategory"
                                className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-600 dark:text-purple-400 transition-colors"
                              >
                                <FolderPlus className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <Link
                              href={`/category/${cat.slug}`}
                              target="_blank"
                              title="Visit Page"
                              className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => openEditModal(cat)}
                              title="Edit"
                              className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteCategory(cat)}
                              title="Delete"
                              className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
            <FolderTree className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No categories found</h3>
          </div>
        )
      )}

      {/* CREATE & EDIT MODAL WITH LIVE PREVIEW */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/60">
                  {editingCategory ? <Edit3 className="w-5 h-5" /> : <FolderPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    {editingCategory
                      ? `Edit Category: ${editingCategory.name}`
                      : parentId
                      ? 'Add New Subcategory'
                      : 'Add New Category'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Configure name, hierarchy level, URL slug, and appearance.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* Live Preview Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-950 text-white border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-brand-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Frontend Preview
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  /category/{slug || 'your-category-slug'}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl backdrop-blur-md">
                  {icon || '📁'}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    {name || 'Category Name'}
                  </h4>
                  <p className="text-[11px] text-neutral-300 line-clamp-1">
                    {description || 'Short summary for category SEO & guide...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Smart Watches or Wireless Earbuds"
                  className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500 font-medium"
                />
              </div>

              {/* Slug & Hierarchy Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Slug */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">URL Slug *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setSlug(slugify(name));
                        setIsCustomSlug(false);
                      }}
                      className="text-[10px] text-brand-600 hover:underline font-bold"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsCustomSlug(true);
                    }}
                    placeholder="e.g. wireless-earbuds"
                    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono outline-none focus:border-brand-500"
                  />
                </div>

                {/* Parent Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Parent Category
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500 font-medium cursor-pointer"
                  >
                    <option value="">None (Top-Level Main Category)</option>
                    {mainCategories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          📂 {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Emoji / Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Category Icon / Emoji
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g. 💻, 📱, 🎧"
                    className="w-24 px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-center text-base text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  />
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {EMOJI_PRESETS.flatMap((p) => p.emojis)
                      .slice(0, 16)
                      .map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setIcon(em)}
                          className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center transition-all ${
                            icon === em
                              ? 'bg-brand-500 text-white scale-110 shadow-xs'
                              : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Helpful summary for readers, SEO meta tags, and category buying guides..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500 resize-none font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold shadow-md shadow-brand-600/30 flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">Delete Category</h3>
                <p className="text-xs text-neutral-500">Permanent action</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to delete <strong className="font-bold text-neutral-900 dark:text-white">"{deleteCategory.name}"</strong>?
            </p>

            {(deleteCategory.subcategories?.length || 0) > 0 && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-800 dark:text-amber-300 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Warning: Nested Subcategories Will Be Deleted</span>
                </p>
                <p className="text-[11px]">
                  This main category contains {deleteCategory.subcategories?.length} nested subcategories that will also be removed.
                </p>
              </div>
            )}

            {((deleteCategory._count?.products || 0) > 0 || (deleteCategory._count?.blogs || 0) > 0) && (
              <div className="p-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-neutral-700 dark:text-neutral-300 text-xs space-y-1">
                <p className="font-bold">Linked Catalog Content:</p>
                <p className="text-[11px]">
                  • {deleteCategory._count?.products || 0} Products & • {deleteCategory._count?.blogs || 0} Blog Articles
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCategory(null)}
                className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDelete}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
