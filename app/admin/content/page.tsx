'use client';

import React, { useState, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import {
  FileEdit, Plus, CheckCircle2, Clock, Eye, Sparkles, AlertCircle,
  Share2, History, Trash2, Send, Check, X, Calendar, Globe, ExternalLink,
  ChevronRight, ArrowLeft, ShieldCheck, Upload, Image as ImageIcon,
  Layers, Play, Copy, RefreshCw, AlertTriangle, Tag, Link2, Info,
  Filter, Search, LayoutGrid, Table, ShoppingBag
} from 'lucide-react';
import QualityScoreBadge from '@/components/saas/QualityScoreBadge';
import ArticleQualityModal from '@/components/saas/ArticleQualityModal';

const STATUS_COLUMNS = [
  { id: 'IDEA', label: 'Ideas & Topics', color: 'border-neutral-200 dark:border-neutral-800' },
  { id: 'DRAFT', label: 'Drafts in Progress', color: 'border-amber-200 dark:border-amber-900/40' },
  { id: 'REVIEW', label: 'Ready for Review', color: 'border-blue-200 dark:border-blue-900/40' },
  { id: 'APPROVED', label: 'Approved', color: 'border-indigo-200 dark:border-indigo-900/40' },
  { id: 'SCHEDULED', label: 'Scheduled', color: 'border-purple-200 dark:border-purple-900/40' },
  { id: 'PUBLISHED', label: 'Published Live', color: 'border-emerald-200 dark:border-emerald-900/40' },
];

export default function ContentPipelinePage() {
  const { currentWebsite } = useWebsite();
  const [articles, setArticles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [qualityModalArticle, setQualityModalArticle] = useState<any | null>(null);
  const [versionModalArticle, setVersionModalArticle] = useState<any | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // "+ Create Content" Multi-Modal Wizard State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<'TOPIC' | 'PRODUCT' | 'COMPARISON' | 'UPLOAD' | 'URL'>('TOPIC');
  const [inputTopic, setInputTopic] = useState('');
  const [inputProductName, setInputProductName] = useState('');
  const [inputProductB, setInputProductB] = useState('');
  const [inputProductUrl, setInputProductUrl] = useState('');
  const [inputInstructions, setInputInstructions] = useState('');
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Pre-Generation Analysis Preview Modal State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPreview, setAnalysisPreview] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchArticles = async () => {
    if (!currentWebsite) return;
    try {
      const res = await fetch(`/api/saas/content?websiteId=${currentWebsite.id}`);
      const data = await res.json();
      if (data.success) setArticles(data.articles || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [currentWebsite]);

  // Step 1: Analyze Input and Generate Pre-Generation Preview
  const handleAnalyzeInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWebsite) return;

    try {
      setIsAnalyzing(true);
      const productNames: string[] = [];
      if (creationMode === 'PRODUCT' && inputProductName) {
        productNames.push(inputProductName.trim());
      } else if (creationMode === 'COMPARISON') {
        if (inputProductName) productNames.push(inputProductName.trim());
        if (inputProductB) productNames.push(inputProductB.trim());
      }

      const res = await fetch('/api/saas/content/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: currentWebsite.id,
          topic: inputTopic,
          productNames,
          productUrl: inputProductUrl,
          imageUrls: uploadedImageUrls,
          customInstructions: inputInstructions
        })
      });

      const data = await res.json();
      if (data.success) {
        setAnalysisPreview(data);
      } else {
        alert(data.error || 'Failed to analyze input.');
      }
    } catch (e) {
      console.error('Analysis error:', e);
      alert('Error analyzing input parameters.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: Confirm and Generate Deep Article
  const handleConfirmGenerate = async (bypassDuplicate: boolean = false) => {
    if (!currentWebsite || !analysisPreview) return;

    try {
      setIsGenerating(true);
      const res = await fetch('/api/saas/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: currentWebsite.id,
          useAiEngine: true,
          inputParams: {
            topic: inputTopic || analysisPreview.analysis.detectedTopic,
            productNames: analysisPreview.analysis.products.map((p: any) => p.fullName),
            productUrl: inputProductUrl,
            imageUrls: uploadedImageUrls,
            customInstructions: inputInstructions,
            bypassDuplicate
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setAnalysisPreview(null);
        setIsCreateModalOpen(false);
        resetCreateForm();
        await fetchArticles();
        setSelectedArticle(data.article);
        alert(`Deep article "${data.article.title}" generated successfully with Quality Score ${data.article.qualityScore}/100!`);
      } else if (data.duplicateCheck && !bypassDuplicate) {
        alert(`Duplicate Warning: ${data.error}`);
      } else {
        alert(data.error || 'Failed to generate article.');
      }
    } catch (e) {
      console.error('Generation error:', e);
      alert('Error generating article.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setUploadedImageUrls(prev => [...prev, data.url]);
      } else {
        alert('Image upload failed');
      }
    } catch (err) {
      alert('Failed to upload image file');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const resetCreateForm = () => {
    setInputTopic('');
    setInputProductName('');
    setInputProductB('');
    setInputProductUrl('');
    setInputInstructions('');
    setUploadedImageUrls([]);
  };

  const handleAction = async (articleId: string, action: string, payload: any = {}) => {
    try {
      if (action === 'PUBLISH') setIsPublishing(true);
      const res = await fetch(`/api/saas/content/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (data.success) {
        await fetchArticles();
        if (selectedArticle?.id === articleId) {
          setSelectedArticle(data.article || null);
        }
        if (action === 'PUBLISH') {
          alert(`Successfully published article! Live URL: ${data.publishedUrl}`);
        }
      } else {
        alert(data.error || 'Action failed.');
      }
    } catch (e: any) {
      alert(e.message || 'Error occurred.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/saas/content/${selectedArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedArticle)
      });
      const data = await res.json();
      if (data.success) {
        setSelectedArticle(data.article);
        await fetchArticles();
        alert('Article draft and Quality Control scores updated!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-extrabold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Dynamic Multi-Modal AI Content Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Content Pipeline & Publishing Engine
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
            Autonomous research, exact product image binding, duplicate protection, and truthful category generation for <strong>{currentWebsite?.name || 'Selected Property'}</strong>.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <button
            onClick={() => { setIsCreateModalOpen(true); setAnalysisPreview(null); }}
            className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-extrabold text-xs shadow-lg shadow-brand-500/30 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Content</span>
          </button>
        </div>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search articles, categories, status..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold text-neutral-600 dark:text-neutral-300">
            <button
              onClick={() => setActiveTab('KANBAN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'KANBAN' ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-neutral-500'
              }`}
            >
              Kanban Pipeline
            </button>
            <button
              onClick={() => setActiveTab('LIST')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'LIST' ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-neutral-500'
              }`}
            >
              Table List
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {activeTab === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map(col => {
            const colArticles = filteredArticles.filter(a => a.status === col.id);
            return (
              <div
                key={col.id}
                className={`p-3.5 rounded-3xl bg-neutral-50/60 dark:bg-neutral-900/60 border ${col.color} min-w-[260px] flex flex-col space-y-3`}
              >
                <div className="flex items-center justify-between px-1 pb-1">
                  <div className="font-extrabold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span>{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                      {colArticles.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colArticles.map(art => (
                    <div
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className={`p-4 rounded-2xl bg-white dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5 ${
                        selectedArticle?.id === art.id ? 'ring-2 ring-brand-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-[10px] font-extrabold">
                          {art.category}
                        </span>
                        <QualityScoreBadge score={art.qualityScore || 85} />
                      </div>

                      <h4 className="font-extrabold text-xs text-neutral-900 dark:text-white line-clamp-2 leading-snug">
                        {art.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-700">
                        <span>{art.author || 'AI Growth Agent'}</span>
                        <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}

                  {colArticles.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-neutral-400 font-medium">
                      No articles in {col.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE LIST VIEW */}
      {activeTab === 'LIST' && (
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Quality Score</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
              {filteredArticles.map(art => (
                <tr key={art.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                  <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                    <div>{art.title}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">/blog/{art.slug}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-300">{art.category}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {art.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <QualityScoreBadge score={art.qualityScore || 85} />
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{new Date(art.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedArticle(art)}
                      className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold text-xs hover:bg-brand-100"
                    >
                      Open Editor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ARTICLE DRAWER / EDITOR MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white line-clamp-1">{selectedArticle.title}</h3>
                  <p className="text-[11px] text-neutral-400">Category: {selectedArticle.category} • Status: {selectedArticle.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQualityModalArticle(selectedArticle)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Inspect QC ({selectedArticle.qualityScore || 85}/100)</span>
                </button>
                <button onClick={() => setSelectedArticle(null)} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <form onSubmit={handleSaveEditor} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Article Title</label>
                  <input
                    type="text"
                    value={selectedArticle.title || ''}
                    onChange={e => setSelectedArticle({ ...selectedArticle, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={selectedArticle.slug || ''}
                    onChange={e => setSelectedArticle({ ...selectedArticle, slug: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Detailed Content (Markdown)</label>
                <textarea
                  rows={14}
                  value={selectedArticle.content || ''}
                  onChange={e => setSelectedArticle({ ...selectedArticle, content: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none font-mono text-[11px] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={selectedArticle.seoTitle || ''}
                    onChange={e => setSelectedArticle({ ...selectedArticle, seoTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Meta Description</label>
                  <input
                    type="text"
                    value={selectedArticle.metaDescription || ''}
                    onChange={e => setSelectedArticle({ ...selectedArticle, metaDescription: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons in Drawer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  {selectedArticle.status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleAction(selectedArticle.id, 'APPROVE')}
                      className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100"
                    >
                      Approve Draft
                    </button>
                  )}
                  {selectedArticle.status !== 'PUBLISHED' && (
                    <button
                      type="button"
                      onClick={() => handleAction(selectedArticle.id, 'PUBLISH')}
                      disabled={isPublishing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold shadow-md"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MULTI-MODAL "+ CREATE CONTENT" WIZARD MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            
            <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">+ Create Content & Product Engine</h2>
                  <p className="text-xs text-neutral-400">Generate deep, research-backed, category-aware content for <strong>{currentWebsite?.name}</strong></p>
                </div>
              </div>

              <button onClick={() => setIsCreateModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1 px-6 pt-4 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setCreationMode('TOPIC')}
                className={`pb-3 px-3 border-b-2 transition-all ${creationMode === 'TOPIC' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
              >
                Topic Mode
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('PRODUCT')}
                className={`pb-3 px-3 border-b-2 transition-all ${creationMode === 'PRODUCT' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
              >
                Product Review
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('COMPARISON')}
                className={`pb-3 px-3 border-b-2 transition-all ${creationMode === 'COMPARISON' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
              >
                Comparison Mode
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('UPLOAD')}
                className={`pb-3 px-3 border-b-2 transition-all ${creationMode === 'UPLOAD' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
              >
                Upload Media Mode
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('URL')}
                className={`pb-3 px-3 border-b-2 transition-all ${creationMode === 'URL' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
              >
                URL Research
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAnalyzeInput} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {creationMode === 'TOPIC' && (
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Target Topic or Search Query *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Best Wireless Earbuds Under ₹2,000 / Best Dash Cams for Cars"
                    value={inputTopic}
                    onChange={e => setInputTopic(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none focus:border-brand-500"
                  />
                </div>
              )}

              {creationMode === 'PRODUCT' && (
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Exact Brand & Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OnePlus Nord Buds 4 / Sony WH-1000XM5"
                    value={inputProductName}
                    onChange={e => setInputProductName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none focus:border-brand-500"
                  />
                </div>
              )}

              {creationMode === 'COMPARISON' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Product A *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OnePlus Nord Buds 4"
                      value={inputProductName}
                      onChange={e => setInputProductName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Product B *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Realme Buds Air 5"
                      value={inputProductB}
                      onChange={e => setInputProductB(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold outline-none"
                    />
                  </div>
                </div>
              )}

              {creationMode === 'URL' && (
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Product Reference URL / Amazon URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.amazon.in/dp/B0CHX6QG73"
                    value={inputProductUrl}
                    onChange={e => setInputProductUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                  />
                </div>
              )}

              {/* Upload Media Section */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Upload Product Reference Images (Exact Product Photos)
                </label>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-dashed border-neutral-300 dark:border-neutral-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      id="content-image-upload"
                    />
                    <label
                      htmlFor="content-image-upload"
                      className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 font-bold text-xs text-neutral-700 dark:text-neutral-200 cursor-pointer hover:bg-neutral-50 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      User uploaded images are mapped directly to product cards.
                    </span>
                  </div>

                  {uploadedImageUrls.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-2">
                      {uploadedImageUrls.map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl border border-neutral-200 overflow-hidden shrink-0">
                          <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Custom Directives / Tone Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Write a 2000-word review focusing on battery life and student budget in India."
                  value={inputInstructions}
                  onChange={e => setInputInstructions(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold shadow-md flex items-center gap-2"
                >
                  {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isAnalyzing ? 'Analyzing Input...' : 'Analyze & Preview Content'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRE-GENERATION ANALYSIS PREVIEW MODAL */}
      {analysisPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            
            <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">Pre-Generation Analysis Preview</h2>
                  <p className="text-xs text-neutral-400">Entity resolution, category schema, media mapping, and duplicate risk checks.</p>
                </div>
              </div>

              <button onClick={() => setAnalysisPreview(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Duplicate Risk Warning */}
              {analysisPreview.duplicateCheck?.hasDuplicate && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 space-y-1.5">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Duplicate Content Detected ({analysisPreview.duplicateCheck.duplicateScore}/100 Risk)</span>
                  </div>
                  <p className="text-[11px] opacity-90">{analysisPreview.duplicateCheck.reason}</p>
                </div>
              )}

              {/* Detected Parameters Breakdown */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2.5">
                <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-400">Detected Topic:</span>
                  <span className="font-extrabold text-neutral-900 dark:text-white">{analysisPreview.analysis.cleanedTitle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-400">Format Intent:</span>
                  <span className="font-extrabold text-brand-600">{analysisPreview.analysis.articleIntent}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-400">Category Schema:</span>
                  <span className="font-extrabold text-neutral-900 dark:text-white">
                    {analysisPreview.schemaSummary.category} ({analysisPreview.schemaSummary.specFieldsCount} verified spec fields)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-400">Blocked Irrelevant Fields:</span>
                  <span className="text-rose-500 font-mono text-[10px]">
                    {analysisPreview.schemaSummary.irrelevantCriteriaBlocked?.join(', ') || 'None'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Primary Keyword:</span>
                  <span className="font-extrabold text-emerald-600">{analysisPreview.analysis.primaryKeyword}</span>
                </div>
              </div>

              {/* Media Mapping Preview */}
              <div>
                <div className="font-bold text-neutral-700 dark:text-neutral-300 mb-2">Mapped Product Media Assets</div>
                <div className="space-y-2">
                  {analysisPreview.mediaPlan?.gallery?.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img src={m.url} alt="Media" className="w-10 h-10 rounded-lg object-cover border" />
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-white">{m.associatedProductName || 'General Media'}</div>
                          <div className="text-[10px] text-neutral-400">{m.altText}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.statusBadge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setAnalysisPreview(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  Adjust Parameters
                </button>

                <div className="flex items-center gap-2">
                  {analysisPreview.duplicateCheck?.hasDuplicate && (
                    <button
                      type="button"
                      onClick={() => handleConfirmGenerate(true)}
                      disabled={isGenerating}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                    >
                      Bypass & Generate
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleConfirmGenerate(false)}
                    disabled={isGenerating || (analysisPreview.duplicateCheck?.hasDuplicate && analysisPreview.duplicateCheck?.duplicateScore === 100)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isGenerating ? 'Drafting Deep Article...' : 'Generate Deep Article'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QC Modal */}
      {qualityModalArticle && (
        <ArticleQualityModal
          isOpen={!!qualityModalArticle}
          onClose={() => setQualityModalArticle(null)}
          title={qualityModalArticle.title || 'Article'}
          qualityBreakdown={
            typeof qualityModalArticle.qualityBreakdown === 'string'
              ? JSON.parse(qualityModalArticle.qualityBreakdown || '{}')
              : qualityModalArticle.qualityBreakdown
          }
        />
      )}

    </div>
  );
}
