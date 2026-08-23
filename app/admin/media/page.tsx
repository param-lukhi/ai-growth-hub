'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Upload, Search, Grid, List, Trash2,
  Folder, Sparkles, Check, Copy, ExternalLink, Info, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  altText?: string;
  folder?: string;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState('ALL');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = () => {
    setLoading(true);
    setError(null);
    fetch('/api/media')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load media library');
        return res.json();
      })
      .then((data) => {
        setMediaList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchMedia();
      }
    } catch (err) {
      alert('Failed to save media asset');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
    if (selectedMedia?.id === id) setSelectedMedia(null);
    fetchMedia();
  };

  const filteredList = mediaList.filter((m) => {
    const matchesFolder = activeFolder === 'ALL' || m.folder === activeFolder;
    const matchesSearch = m.filename.toLowerCase().includes(search.toLowerCase()) || (m.altText && m.altText.toLowerCase().includes(search.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Media Manager
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Drag & drop upload, automated WebP compression, alt-text editor, and folder organization.
          </p>
        </div>

        <label className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Compressing to WebP...' : 'Upload Image'}</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Folders & Search bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
          {['ALL', 'Products', 'Blogs', 'Uploads'].map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                activeFolder === folder ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{folder}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search filename or alt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs outline-none focus:border-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">Unable to load data.</h3>
          <button
            onClick={fetchMedia}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      )}

      {/* Media Grid / Empty State */}
      {!loading && !error && (
        filteredList.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className={`group relative bg-white dark:bg-neutral-900 rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedMedia?.id === item.id ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-neutral-200/80 dark:border-neutral-800'
                  }`}
                >
                  <div className="aspect-square bg-neutral-50 dark:bg-neutral-800 p-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-2.5 text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="truncate">{item.filename}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase shrink-0">
                      WebP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="p-4">Preview</th>
                    <th className="p-4">Filename</th>
                    <th className="p-4">Size</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="p-3 w-16">
                        <img src={item.url} alt="" className="w-10 h-10 object-cover rounded-xl bg-neutral-100" />
                      </td>
                      <td className="p-4 font-bold text-neutral-900 dark:text-white max-w-xs truncate">{item.filename}</td>
                      <td className="p-4 text-neutral-600 font-mono">{(item.size / 1024).toFixed(1)} KB</td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteMedia(item.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* PROFESSIONAL EMPTY STATE */
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
            <ImageIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No media uploaded.</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Upload product images or article assets to see them in your media library.
            </p>
            <label className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>+ Upload Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )
      )}
    </div>
  );
}
