'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Edit3, Trash2, Globe, ExternalLink, Sparkles, Check, RefreshCw, AlertCircle, Upload, Image as ImageIcon, Star, Layers, CheckCircle, XCircle, TrendingDown } from 'lucide-react';
import { MARKETPLACE_LIST, generateRegionalAffiliateUrls, MarketplaceEntry } from '@/lib/location';
import { safeJsonParse } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  images: string;
  amazonUrl: string;
  affiliateUrl: string;
  specifications?: string;
  features?: string;
  pros?: string;
  cons?: string;
  marketplaces?: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  isDeal: boolean;
  status: string;
  categoryId: string;
  category?: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; parentId?: string | null; parent?: { name: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State - Core
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isDeal, setIsDeal] = useState(false);

  // Images State
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // A to Z Product Details State
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([
    { key: 'Warranty', value: '1 Year Official Brand Warranty' },
    { key: 'Connectivity', value: 'Bluetooth 5.3 / USB-C' },
  ]);
  const [featuresList, setFeaturesList] = useState<string[]>([
    'Premium flagship build quality and finish',
    'Long-lasting battery life with fast charging support',
  ]);
  const [prosList, setProsList] = useState<string[]>([
    'Exceptional performance and durability',
    'Best-in-class features for the price',
  ]);
  const [consList, setConsList] = useState<string[]>([
    'Slightly premium price tag',
  ]);

  // Review Scores State (0 to 10 ratings)
  const [ratingsState, setRatingsState] = useState<{ label: string; score: string }[]>([
    { label: 'Performance Score', score: '9.6' },
    { label: 'Display Score', score: '9.4' },
    { label: 'Camera / Audio', score: '9.8' },
    { label: 'Battery Score', score: '9.1' },
    { label: 'Gaming Performance', score: '9.5' },
    { label: 'AI & Value Rating', score: '9.2' },
  ]);

  const [priceHistoryState, setPriceHistoryState] = useState<{ date: string; price: string }[]>([
    { date: 'May 2026', price: '$1,299' },
    { date: 'Jun 2026', price: '$1,249' },
    { date: 'Jul 2026', price: '$1,199' },
  ]);

  // Active Modal Tab (General, Images, Ratings, Specs & Features, 20-Country Stores)
  const [modalTab, setModalTab] = useState<'general' | 'images' | 'ratings' | 'details' | 'marketplaces'>('general');

  const loadRatingPreset = (preset: 'laptop' | 'phone' | 'audio' | 'tv' | 'reset') => {
    if (preset === 'laptop' || preset === 'reset') {
      setRatingsState([
        { label: 'Performance Score', score: '9.6' },
        { label: 'Display Score', score: '9.4' },
        { label: 'Camera / Audio', score: '9.8' },
        { label: 'Battery Score', score: '9.1' },
        { label: 'Gaming Performance', score: '9.5' },
        { label: 'AI & Value Rating', score: '9.2' },
      ]);
    } else if (preset === 'phone') {
      setRatingsState([
        { label: 'Camera Quality', score: '9.7' },
        { label: 'Display & Touch', score: '9.5' },
        { label: 'Battery & Charging', score: '9.2' },
        { label: 'Processing Power', score: '9.6' },
        { label: 'Build & Ergonomics', score: '9.4' },
        { label: 'Price & Value', score: '9.1' },
      ]);
    } else if (preset === 'audio') {
      setRatingsState([
        { label: 'Sound Quality & Bass', score: '9.8' },
        { label: 'Noise Cancellation (ANC)', score: '9.6' },
        { label: 'Comfort & Fit', score: '9.4' },
        { label: 'Battery Life', score: '9.5' },
        { label: 'Build Quality', score: '9.3' },
        { label: 'Value for Money', score: '9.2' },
      ]);
    } else if (preset === 'tv') {
      setRatingsState([
        { label: 'Picture Quality & Contrast', score: '9.6' },
        { label: 'HDR & Brightness', score: '9.5' },
        { label: 'Sound System', score: '8.8' },
        { label: 'Gaming & Refresh Rate', score: '9.4' },
        { label: 'Smart TV OS', score: '9.0' },
        { label: 'Price & Value', score: '9.2' },
      ]);
    }
  };

  // Marketplace Prices & Links State
  const [marketplacesData, setMarketplacesData] = useState<Record<string, MarketplaceEntry>>({});
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<string>('IN');

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    fetch('/api/products?status=ALL')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load products from database');
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setCategoryId(data[0].id);
        }
      });
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setPrice('$999.00');
    setAmazonUrl('');
    setStatus('PUBLISHED');
    setIsFeatured(false);
    setIsTrending(false);
    setIsDeal(false);

    setImagesList(['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80']);
    setImageUrlInput('');
    setSpecsList([
      { key: 'Warranty', value: '1 Year Brand Warranty' },
      { key: 'Battery Life', value: 'Up to 30 Hours' },
    ]);
    setFeaturesList([
      'Active Noise Cancellation with Custom Sound Profiles',
      'Ultra-lightweight ergonomic design for long use',
    ]);
    setProsList(['Superior audio clarity', 'Ergonomic light design']);
    setConsList(['Premium pricing']);
    setRatingsState([
      { label: 'Performance Score', score: '9.6' },
      { label: 'Display Score', score: '9.4' },
      { label: 'Camera / Audio', score: '9.8' },
      { label: 'Battery Score', score: '9.1' },
      { label: 'Gaming Performance', score: '9.5' },
      { label: 'AI & Value Rating', score: '9.2' },
    ]);
    setPriceHistoryState([
      { date: 'May 2026', price: '$1,299' },
      { date: 'Jun 2026', price: '$1,249' },
      { date: 'Jul 2026', price: '$1,199' },
    ]);

    const initial: Record<string, MarketplaceEntry> = {};
    MARKETPLACE_LIST.forEach((m) => {
      initial[m.code] = { price: '', url: '', available: true };
    });
    setMarketplacesData(initial);
    setModalTab('general');
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setBrand(product.brand);
    setPrice(product.price);
    setAmazonUrl(product.amazonUrl);
    setCategoryId(product.categoryId);
    setStatus(product.status || 'PUBLISHED');
    setIsFeatured(product.isFeatured);
    setIsTrending(product.isTrending);
    setIsDeal(product.isDeal);

    // Parse Images
    const parsedImages = safeJsonParse<string[]>(product.images, []);
    setImagesList(parsedImages.length > 0 ? parsedImages : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80']);
    setImageUrlInput('');

    // Parse Specs & Rating Scores
    const parsedSpecsObj = safeJsonParse<Record<string, any>>(product.specifications, {});
    
    if (parsedSpecsObj._ratingScores) {
      const rObj = typeof parsedSpecsObj._ratingScores === 'string'
        ? safeJsonParse<Record<string, number | string>>(parsedSpecsObj._ratingScores, {})
        : parsedSpecsObj._ratingScores;
      const rArr = Object.entries(rObj).map(([label, val]) => ({ label, score: String(val) }));
      if (rArr.length > 0) setRatingsState(rArr);
    } else {
      setRatingsState([
        { label: 'Performance Score', score: '9.6' },
        { label: 'Display Score', score: '9.4' },
        { label: 'Camera / Audio', score: '9.8' },
        { label: 'Battery Score', score: '9.1' },
        { label: 'Gaming Performance', score: '9.5' },
        { label: 'AI & Value Rating', score: '9.2' },
      ]);
    }

    if (parsedSpecsObj._priceHistory) {
      const pArr = typeof parsedSpecsObj._priceHistory === 'string'
        ? safeJsonParse<{ date: string; price: string }[]>(parsedSpecsObj._priceHistory, [])
        : parsedSpecsObj._priceHistory;
      if (Array.isArray(pArr) && pArr.length > 0) setPriceHistoryState(pArr);
    } else {
      setPriceHistoryState([
        { date: 'May 2026', price: '$1,299' },
        { date: 'Jun 2026', price: '$1,249' },
        { date: 'Jul 2026', price: '$1,199' },
      ]);
    }

    const cleanSpecsArr = Object.entries(parsedSpecsObj)
      .filter(([k]) => k !== '_ratingScores' && k !== '_priceHistory')
      .map(([k, v]) => ({ key: k, value: String(v) }));
    setSpecsList(cleanSpecsArr.length > 0 ? cleanSpecsArr : [{ key: 'Warranty', value: '1 Year Warranty' }]);

    // Parse Features
    const parsedFeat = safeJsonParse<string[]>(product.features, []);
    setFeaturesList(parsedFeat.length > 0 ? parsedFeat : ['Flagship performance and build quality']);

    // Parse Pros & Cons
    const parsedPros = safeJsonParse<string[]>(product.pros, []);
    setProsList(parsedPros);

    const parsedCons = safeJsonParse<string[]>(product.cons, []);
    setConsList(parsedCons);

    // Parse Marketplaces
    let parsedMkt: Record<string, MarketplaceEntry> = {};
    if (product.marketplaces) {
      try {
        parsedMkt = JSON.parse(product.marketplaces);
      } catch (e) {}
    }

    const mergedMkt: Record<string, MarketplaceEntry> = {};
    MARKETPLACE_LIST.forEach((m) => {
      mergedMkt[m.code] = parsedMkt[m.code] || { price: '', url: '', available: true };
    });
    setMarketplacesData(mergedMkt);
    setModalTab('general');
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImagesList((prev) => [...prev, data.url]);
      } else {
        alert('Image upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to upload image file');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImagesList((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImagesList((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleAutoGenerateMarketplaces = () => {
    if (!amazonUrl) {
      alert('Please enter an Amazon Product URL first');
      return;
    }
    const generated = generateRegionalAffiliateUrls(amazonUrl);
    setMarketplacesData((prev) => {
      const next = { ...prev };
      Object.keys(generated).forEach((code) => {
        next[code] = {
          ...next[code],
          url: generated[code].url,
          price: next[code]?.price || (code === 'US' ? price : ''),
        };
      });
      return next;
    });
  };

  const handleMarketplaceChange = (code: string, field: keyof MarketplaceEntry, value: any) => {
    setMarketplacesData((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: value,
      },
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const cleanedMarketplaces: Record<string, MarketplaceEntry> = {};
    Object.keys(marketplacesData).forEach((code) => {
      const entry = marketplacesData[code];
      if (entry && (entry.price || entry.url)) {
        cleanedMarketplaces[code] = entry;
      }
    });

    const specObj: Record<string, any> = {};
    specsList.forEach((s) => {
      if (s.key.trim() && !s.key.startsWith('_')) specObj[s.key.trim()] = s.value.trim();
    });

    const ratingScoresObj: Record<string, number> = {};
    ratingsState.forEach((r) => {
      if (r.label.trim()) {
        ratingScoresObj[r.label.trim()] = parseFloat(r.score) || 9.0;
      }
    });
    specObj._ratingScores = JSON.stringify(ratingScoresObj);

    const priceHistoryArr = priceHistoryState.filter((p) => p.date.trim() && p.price.trim());
    if (priceHistoryArr.length > 0) {
      specObj._priceHistory = JSON.stringify(priceHistoryArr);
    }

    const finalImages = imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'];

    const payload = {
      name,
      slug,
      brand,
      price,
      amazonUrl,
      affiliateUrl: amazonUrl.includes('tag=') ? amazonUrl : `${amazonUrl}?tag=techpulse-20`,
      marketplaces: JSON.stringify(cleanedMarketplaces),
      categoryId,
      images: JSON.stringify(finalImages),
      specifications: JSON.stringify(specObj),
      features: JSON.stringify(featuresList.filter(Boolean)),
      pros: JSON.stringify(prosList.filter(Boolean)),
      cons: JSON.stringify(consList.filter(Boolean)),
      isFeatured,
      isTrending,
      isDeal,
      status: status || 'PUBLISHED',
    };

    let res;
    if (editingProduct) {
      res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (res.ok) {
      setShowModal(false);
      fetchProducts();
    } else {
      alert('Failed to save product data.');
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Delete product "${productName}"?`)) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchProducts();
  };

  const getMarketplacesCount = (product: Product) => {
    if (!product.marketplaces) return 0;
    try {
      const parsed = JSON.parse(product.marketplaces);
      return Object.keys(parsed).filter((k) => parsed[k]?.price || parsed[k]?.url).length;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Product Management (A to Z Details & Media)</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Upload product images, configure key specifications, pros & cons, bullet features, and 20 Amazon regional stores.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-4xl w-full my-8 space-y-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product (A to Z Details)'}
                </h2>
                <p className="text-xs text-neutral-500">Configure complete specifications, image media, and global prices.</p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg font-bold p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 text-xs font-extrabold overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setModalTab('general')}
                className={`px-4 py-2 rounded-t-xl transition-colors shrink-0 ${
                  modalTab === 'general'
                    ? 'bg-brand-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                1. Basic Info & Badges
              </button>

              <button
                type="button"
                onClick={() => setModalTab('images')}
                className={`px-4 py-2 rounded-t-xl transition-colors shrink-0 flex items-center gap-1.5 ${
                  modalTab === 'images'
                    ? 'bg-brand-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>2. Images Media ({imagesList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('ratings')}
                className={`px-4 py-2 rounded-t-xl transition-colors shrink-0 flex items-center gap-1.5 ${
                  modalTab === 'ratings'
                    ? 'bg-amber-500 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>3. ⭐ Ratings & Scores ({ratingsState.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('details')}
                className={`px-4 py-2 rounded-t-xl transition-colors shrink-0 flex items-center gap-1.5 ${
                  modalTab === 'details'
                    ? 'bg-brand-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>4. Specs & Pros/Cons</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('marketplaces')}
                className={`px-4 py-2 rounded-t-xl transition-colors shrink-0 flex items-center gap-1.5 ${
                  modalTab === 'marketplaces'
                    ? 'bg-brand-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>5. 20-Country Stores</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs font-bold">
              {/* TAB 1: GENERAL INFO */}
              {modalTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Brand Name *</label>
                      <input
                        type="text"
                        required
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g. Sony"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Default Base Price *</label>
                      <input
                        type="text"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. $348.00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Category *</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500 bg-white dark:text-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.parent ? `↳ ${c.name} (${c.parent.name})` : `📁 ${c.name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-neutral-700 dark:text-neutral-300">Primary Amazon URL *</label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateMarketplaces}
                        className="text-[11px] text-brand-600 dark:text-brand-400 font-extrabold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Auto-generate 20 Amazon Store Links</span>
                      </button>
                    </div>
                    <input
                      type="url"
                      required
                      value={amazonUrl}
                      onChange={(e) => setAmazonUrl(e.target.value)}
                      placeholder="https://www.amazon.com/dp/B08N5WRWNW"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Publication Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500 bg-white dark:text-white"
                      >
                        <option value="PUBLISHED">Published (Visible on site)</option>
                        <option value="DRAFT">Draft</option>
                        <option value="HIDDEN">Hidden</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="rounded text-brand-600"
                        />
                        <span>Featured Badge</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isTrending}
                          onChange={(e) => setIsTrending(e.target.checked)}
                          className="rounded text-brand-600"
                        />
                        <span>Trending Badge</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDeal}
                          onChange={(e) => setIsDeal(e.target.checked)}
                          className="rounded text-brand-600"
                        />
                        <span>Hot Deal</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGES MEDIA */}
              {modalTab === 'images' && (
                <div className="space-y-6">
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
                    <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">Upload Product Images</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* File Upload Box */}
                      <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-4 text-center space-y-2 hover:border-brand-500 transition-colors">
                        <Upload className="w-6 h-6 text-brand-600 mx-auto" />
                        <span className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          {uploadingImage ? 'Uploading Image...' : 'Upload Image File from Device'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploadingImage}
                          className="hidden"
                          id="product-file-input"
                        />
                        <label
                          htmlFor="product-file-input"
                          className="inline-block px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Browse Computer
                        </label>
                      </div>

                      {/* URL Upload Box */}
                      <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-4 space-y-2">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Or Add Image from Web URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-xs shrink-0"
                          >
                            Add URL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Gallery Thumbnails */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Product Images Gallery ({imagesList.length} items) - First image is Primary
                    </label>

                    {imagesList.length === 0 ? (
                      <p className="text-xs text-neutral-400">No images added yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {imagesList.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 aspect-square"
                          >
                            <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                            
                            {idx === 0 && (
                              <span className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                                PRIMARY
                              </span>
                            )}

                            <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="p-1.5 bg-brand-600 text-white rounded-md text-[10px] font-bold"
                                  title="Set as Primary Image"
                                >
                                  Make Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1.5 bg-rose-600 text-white rounded-md"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: BENCHMARK RATINGS & EDITOR SCORES */}
              {modalTab === 'ratings' && (
                <div className="space-y-6">
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/80 dark:border-amber-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                          <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">
                            Performance Breakdown & Benchmark Ratings
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Edit ratings from 0.0 to 10.0. These scores build the visual benchmark ratings card on the product page.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-800 shadow-xs shrink-0">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <div>
                          <div className="text-base font-black text-amber-600 dark:text-amber-400 leading-none">
                            {(
                              ratingsState.reduce((acc, r) => acc + (parseFloat(r.score) || 0), 0) / (ratingsState.length || 1)
                            ).toFixed(1)} <span className="text-[10px] text-neutral-400">/ 10</span>
                          </div>
                          <div className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">
                            Overall Score
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => loadRatingPreset('laptop')}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 text-[11px] font-bold transition-colors"
                      >
                        💻 Laptop/PC
                      </button>
                      <button
                        type="button"
                        onClick={() => loadRatingPreset('phone')}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 text-[11px] font-bold transition-colors"
                      >
                        📱 Smartphone
                      </button>
                      <button
                        type="button"
                        onClick={() => loadRatingPreset('audio')}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 text-[11px] font-bold transition-colors"
                      >
                        🎧 Audio/Headphones
                      </button>
                      <button
                        type="button"
                        onClick={() => loadRatingPreset('tv')}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 text-[11px] font-bold transition-colors"
                      >
                        📺 TV/Display
                      </button>
                      <button
                        type="button"
                        onClick={() => loadRatingPreset('reset')}
                        className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 text-[11px] font-bold transition-colors"
                      >
                        🔄 Default Preset
                      </button>
                    </div>

                    {/* Ratings List */}
                    <div className="space-y-3 pt-2">
                      {ratingsState.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white dark:bg-neutral-900 p-3 rounded-xl border border-amber-200/80 dark:border-amber-800/80 shadow-xs"
                        >
                          <input
                            type="text"
                            placeholder="Category Label (e.g. Performance Score)"
                            value={r.label}
                            onChange={(e) => {
                              const copy = [...ratingsState];
                              copy[idx].label = e.target.value;
                              setRatingsState(copy);
                            }}
                            className="w-full sm:w-1/2 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs font-bold"
                          />
                          <div className="flex items-center gap-3 w-full sm:w-1/2">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.1"
                              value={r.score || '9.0'}
                              onChange={(e) => {
                                const copy = [...ratingsState];
                                copy[idx].score = e.target.value;
                                setRatingsState(copy);
                              }}
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              placeholder="9.5"
                              value={r.score}
                              onChange={(e) => {
                                const copy = [...ratingsState];
                                copy[idx].score = e.target.value;
                                setRatingsState(copy);
                              }}
                              className="w-16 px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs font-extrabold text-amber-600 text-center shrink-0"
                            />
                            <button
                              type="button"
                              onClick={() => setRatingsState(ratingsState.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 p-1 shrink-0"
                              title="Delete Rating"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setRatingsState([...ratingsState, { label: '', score: '9.0' }])}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold hover:bg-amber-100/50 dark:hover:bg-amber-950/40 text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Rating Category</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: SPECS, FEATURES & PROS/CONS */}
              {modalTab === 'details' && (
                <div className="space-y-6">
                  {/* Specifications key-value editor */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">
                        Key Specifications & Technical Specs
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSpecsList([...specsList, { key: '', value: '' }])}
                        className="text-brand-600 font-bold flex items-center gap-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Spec
                      </button>
                    </div>

                    {specsList.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Spec Name (e.g. Battery)"
                          value={spec.key}
                          onChange={(e) => {
                            const copy = [...specsList];
                            copy[idx].key = e.target.value;
                            setSpecsList(copy);
                          }}
                          className="w-1/2 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 5000 mAh)"
                          value={spec.value}
                          onChange={(e) => {
                            const copy = [...specsList];
                            copy[idx].value = e.target.value;
                            setSpecsList(copy);
                          }}
                          className="w-1/2 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setSpecsList(specsList.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Benchmark & Editor Review Scores Editor (0 to 10 Ratings) */}
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">
                          Performance Breakdown & Benchmark Ratings (0 to 10 Scores)
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRatingsState([...ratingsState, { label: '', score: '9.0' }])}
                        className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 text-xs"
                      >
                        + Add Rating Category
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ratingsState.map((r, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-white dark:bg-neutral-900 p-2 rounded-xl border border-amber-200/70 dark:border-amber-800/70">
                          <input
                            type="text"
                            placeholder="Score Label (e.g. Performance Score)"
                            value={r.label}
                            onChange={(e) => {
                              const copy = [...ratingsState];
                              copy[idx].label = e.target.value;
                              setRatingsState(copy);
                            }}
                            className="w-2/3 px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs font-bold"
                          />
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="9.5"
                            value={r.score}
                            onChange={(e) => {
                              const copy = [...ratingsState];
                              copy[idx].score = e.target.value;
                              setRatingsState(copy);
                            }}
                            className="w-1/3 px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs font-extrabold text-brand-600"
                          />
                          <button
                            type="button"
                            onClick={() => setRatingsState(ratingsState.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amazon Price History Tracker Editor */}
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">
                          Amazon Historical Price Trend (Price History Points)
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPriceHistoryState([...priceHistoryState, { date: '', price: '' }])}
                        className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 text-xs"
                      >
                        + Add Price Point
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {priceHistoryState.map((ph, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-white dark:bg-neutral-900 p-2 rounded-xl border border-emerald-200/70 dark:border-emerald-800/70">
                          <input
                            type="text"
                            placeholder="Date (e.g. May 2026)"
                            value={ph.date}
                            onChange={(e) => {
                              const copy = [...priceHistoryState];
                              copy[idx].date = e.target.value;
                              setPriceHistoryState(copy);
                            }}
                            className="w-1/2 px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Price (e.g. $1,299 / ₹76,990)"
                            value={ph.price}
                            onChange={(e) => {
                              const copy = [...priceHistoryState];
                              copy[idx].price = e.target.value;
                              setPriceHistoryState(copy);
                            }}
                            className="w-1/2 px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs font-extrabold text-emerald-600 dark:text-emerald-400"
                          />
                          <button
                            type="button"
                            onClick={() => setPriceHistoryState(priceHistoryState.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bullet Features */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">
                        Top Bullet Features & Highlights
                      </h3>
                      <button
                        type="button"
                        onClick={() => setFeaturesList([...featuresList, ''])}
                        className="text-brand-600 font-bold flex items-center gap-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Feature
                      </button>
                    </div>

                    {featuresList.map((feat, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Feature description..."
                          value={feat}
                          onChange={(e) => {
                            const copy = [...featuresList];
                            copy[idx] = e.target.value;
                            setFeaturesList(copy);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setFeaturesList(featuresList.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Pros List</h4>
                        <button
                          type="button"
                          onClick={() => setProsList([...prosList, ''])}
                          className="text-emerald-700 font-bold text-xs"
                        >
                          + Add Pro
                        </button>
                      </div>
                      {prosList.map((p, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={p}
                            onChange={(e) => {
                              const copy = [...prosList];
                              copy[idx] = e.target.value;
                              setProsList(copy);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 dark:bg-neutral-900 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setProsList(prosList.filter((_, i) => i !== idx))}
                            className="text-rose-500"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">Cons List</h4>
                        <button
                          type="button"
                          onClick={() => setConsList([...consList, ''])}
                          className="text-rose-700 font-bold text-xs"
                        >
                          + Add Con
                        </button>
                      </div>
                      {consList.map((c, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={c}
                            onChange={(e) => {
                              const copy = [...consList];
                              copy[idx] = e.target.value;
                              setConsList(copy);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 dark:bg-neutral-900 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setConsList(consList.filter((_, i) => i !== idx))}
                            className="text-rose-500"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: 20-COUNTRY STORES */}
              {modalTab === 'marketplaces' && (
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-700 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
                        Marketplace Pricing & Affiliate Links (All 20 Countries)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
                    {MARKETPLACE_LIST.map((m) => {
                      const hasData = Boolean(marketplacesData[m.code]?.price || marketplacesData[m.code]?.url);
                      const isActive = activeMarketplaceTab === m.code;
                      return (
                        <button
                          key={m.code}
                          type="button"
                          onClick={() => setActiveMarketplaceTab(m.code)}
                          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all ${
                            isActive
                              ? 'bg-brand-600 text-white font-extrabold shadow-xs'
                              : hasData
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-300'
                              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                          }`}
                        >
                          <span>{m.flag}</span>
                          <span>{m.code}</span>
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const m = MARKETPLACE_LIST.find((x) => x.code === activeMarketplaceTab) || MARKETPLACE_LIST[0];
                    const currentData = marketplacesData[m.code] || { price: '', url: '', available: true };
                    return (
                      <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700 space-y-3">
                        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{m.flag}</span>
                            <div>
                              <div className="font-extrabold text-neutral-900 dark:text-white text-xs">
                                {m.name} ({m.domain})
                              </div>
                            </div>
                          </div>

                          <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer text-emerald-600">
                            <input
                              type="checkbox"
                              checked={currentData.available !== false}
                              onChange={(e) => handleMarketplaceChange(m.code, 'available', e.target.checked)}
                              className="rounded"
                            />
                            <span>Available in Store</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-neutral-700 dark:text-neutral-300 mb-1">
                              Exact Store Price ({m.currency} {m.symbol})
                            </label>
                            <input
                              type="text"
                              value={currentData.price || ''}
                              onChange={(e) => handleMarketplaceChange(m.code, 'price', e.target.value)}
                              placeholder={`e.g. ${m.symbol}999.00`}
                              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 outline-none focus:border-brand-500 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-neutral-700 dark:text-neutral-300 mb-1">
                              Affiliate URL for {m.domain}
                            </label>
                            <input
                              type="url"
                              value={currentData.url || ''}
                              onChange={(e) => handleMarketplaceChange(m.code, 'url', e.target.value)}
                              placeholder={`https://www.${m.domain}/dp/...`}
                              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 outline-none focus:border-brand-500 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Submit Buttons Bar */}
              <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex gap-2">
                  {modalTab !== 'general' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalTab === 'images') setModalTab('general');
                        if (modalTab === 'details') setModalTab('images');
                        if (modalTab === 'marketplaces') setModalTab('details');
                      }}
                      className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold"
                    >
                      ← Back
                    </button>
                  )}
                  {modalTab !== 'marketplaces' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalTab === 'general') setModalTab('images');
                        if (modalTab === 'images') setModalTab('details');
                        if (modalTab === 'details') setModalTab('marketplaces');
                      }}
                      className="px-4 py-2 rounded-xl bg-neutral-800 text-white font-bold"
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-sm"
                  >
                    {editingProduct ? 'Save Product Changes' : 'Create Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 space-y-4 animate-pulse">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-48" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-full" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-full" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">Unable to load data.</h3>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      )}

      {/* Products Table / Empty State */}
      {!loading && !error && (
        products.length > 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="p-4">Product</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Default Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Active Marketplaces</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {products.map((p) => {
                    const activeCount = getMarketplacesCount(p);
                    const parsedImgs = safeJsonParse<string[]>(p.images, []);
                    const thumb = parsedImgs[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="p-4 font-bold text-neutral-900 dark:text-white max-w-xs">
                          <div className="flex items-center gap-3">
                            <img src={thumb} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0 border" />
                            <a href={`/product/${p.slug}`} target="_blank" className="hover:text-brand-600 truncate">
                              {p.name}
                            </a>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-600 dark:text-neutral-400 font-medium">{p.brand}</td>
                        <td className="p-4 text-neutral-600 dark:text-neutral-400">{p.category?.name}</td>
                        <td className="p-4 font-extrabold text-neutral-900 dark:text-white">{p.price}</td>
                        <td className="p-4">
                          <select
                            value={p.status || 'PUBLISHED'}
                            onChange={(e) => handleToggleStatus(p.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border outline-none ${
                              p.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                : p.status === 'DRAFT'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="HIDDEN">Hidden</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            activeCount > 0 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                          }`}>
                            <Globe className="w-3 h-3 text-emerald-600" />
                            <span>{activeCount} / 20 Stores</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 hover:bg-brand-100 flex items-center gap-1 font-bold px-2.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
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
          /* PROFESSIONAL EMPTY STATE */
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
            <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No products found.</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              You haven't added any products to the database yet. Click below to add your first product.
            </p>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Product</span>
            </button>
          </div>
        )
      )}
    </div>
  );
}

