'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import { safeJsonParse, slugify } from '@/lib/utils';
import { Save, ArrowLeft, Plus, Trash, Zap, ExternalLink, ShoppingBag, Sparkles, Upload, TrendingDown, Star, RefreshCw } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  images: string;
  amazonUrl: string;
  affiliateUrl: string;
  categoryId: string;
  specifications?: string;
  features?: string;
  pros?: string;
  cons?: string;
}

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string; parentId?: string | null; parent?: { name: string } | null }[]>([]);
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [content, setContent] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [tagsStr, setTagsStr] = useState('');
  const [views, setViews] = useState(0);

  // Dynamic Array Fields
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
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

  useEffect(() => {
    if (!params?.id) {
      setLoading(false);
      return;
    }

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error('Error loading categories:', err));

    fetch('/api/products?status=ALL')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductsList(data);
      })
      .catch((err) => console.error('Error loading products:', err));

    fetch(`/api/blogs/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Blog not found');
        return res.json();
      })
      .then((blog) => {
        if (blog && blog.id) {
          setTitle(blog.title || '');
          setSlug(blog.slug || '');
          setMetaTitle(blog.metaTitle || '');
          setMetaDescription(blog.metaDescription || '');
          setCategoryId(blog.categoryId || '');
          setProductId(blog.productId || '');
          setFeaturedImage(blog.featuredImage || '');
          setContent(blog.content || '');
          setAmazonUrl(blog.amazonUrl || '');
          setAffiliateUrl(blog.affiliateUrl || '');
          setConclusion(blog.conclusion || '');
          setStatus(blog.status || 'PUBLISHED');
          setViews(blog.views || 0);

          const tags = safeJsonParse<string[]>(blog.tags, []);
          setTagsStr(tags.join(', '));

          const pList = safeJsonParse<string[]>(blog.pros, []);
          setPros(pList);

          const cList = safeJsonParse<string[]>(blog.cons, []);
          setCons(cList);

          const fList = safeJsonParse<{ question: string; answer: string }[]>(blog.faqs, []);
          setFaqs(fList);

          const sObj = safeJsonParse<Record<string, any>>(blog.specifications, {});
          if (sObj && sObj._ratingScores) {
            const rObj = typeof sObj._ratingScores === 'string'
              ? safeJsonParse<Record<string, number | string>>(sObj._ratingScores, {})
              : sObj._ratingScores;
            const rArr = Object.entries(rObj || {}).map(([label, val]) => ({ label, score: String(val) }));
            if (rArr.length > 0) setRatingsState(rArr);
          }

          if (sObj && sObj._priceHistory) {
            const pArr = typeof sObj._priceHistory === 'string'
              ? safeJsonParse<{ date: string; price: string }[]>(sObj._priceHistory, [])
              : sObj._priceHistory;
            if (Array.isArray(pArr) && pArr.length > 0) setPriceHistoryState(pArr);
          }

          if (sObj) {
            const sArr = Object.entries(sObj)
              .filter(([k]) => k !== '_ratingScores' && k !== '_priceHistory')
              .map(([k, v]) => ({ key: k, value: String(v) }));
            setSpecs(sArr);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching blog detail:', err);
        setLoading(false);
      });
  }, [params?.id]);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setFeaturedImage(data.url);
      } else {
        alert('Image upload failed');
      }
    } catch (err) {
      alert('Failed to upload image file');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleForceImportProductDetails = () => {
    if (!productId) {
      alert('Please select an Associated Product first!');
      return;
    }
    const prod = productsList.find((p) => p.id === productId);
    if (!prod) return;

    if (confirm(`Sync A-to-Z details from "${prod.name}" into this blog post?`)) {
      setTitle(`${prod.name} Review: Features, Specs & Buying Guide`);
      setSlug(slugify(prod.name));
      if (prod.categoryId) setCategoryId(prod.categoryId);
      if (prod.amazonUrl) setAmazonUrl(prod.amazonUrl);
      if (prod.affiliateUrl) setAffiliateUrl(prod.affiliateUrl);

      const prodImgs = safeJsonParse<string[]>(prod.images, []);
      if (prodImgs.length > 0) setFeaturedImage(prodImgs[0]);

      const pSpecsObj = safeJsonParse<Record<string, string>>(prod.specifications, {});
      const pSpecsArr = Object.entries(pSpecsObj).map(([k, v]) => ({ key: k, value: v }));
      if (pSpecsArr.length > 0) setSpecs(pSpecsArr);

      const pPros = safeJsonParse<string[]>(prod.pros, []);
      if (pPros.length > 0) setPros(pPros);

      const pCons = safeJsonParse<string[]>(prod.cons, []);
      if (pCons.length > 0) setCons(pCons);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specObj: Record<string, any> = {};
    specs.forEach((s) => {
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

    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);

    const payload = {
      title,
      slug,
      metaTitle,
      metaDescription,
      categoryId,
      productId: productId || null,
      featuredImage,
      content,
      amazonUrl,
      affiliateUrl,
      conclusion,
      status,
      specifications: specObj,
      pros: pros.filter(Boolean),
      cons: cons.filter(Boolean),
      faqs: faqs.filter((f) => f.question.trim()),
      tags,
    };

    const res = await fetch(`/api/blogs/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert('Blog updated successfully!');
      router.push('/admin/blogs');
    } else {
      alert('Failed to update blog post.');
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-500 font-medium">Loading blog data for editing...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-neutral-900">Edit Product Blog</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-extrabold text-xs border border-brand-200">
                👁️ {views.toLocaleString()} Views
              </span>
            </div>
            <p className="text-xs text-neutral-500">ID: {params.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live</span>
          </a>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Update Changes</span>
          </button>
        </div>
      </div>

      {/* Product Binding Header Box */}
      <div className="bg-brand-50/80 border border-brand-200 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <h3 className="font-extrabold text-brand-900 text-sm">
              Link Associated Product (jis product ka blog ho, vo hi product bind karein)
            </h3>
          </div>

          {productId && (
            <button
              type="button"
              onClick={handleForceImportProductDetails}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sync Product A-to-Z Details</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-950 mb-1">Select Exact Product *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-300 text-xs font-bold text-neutral-900 bg-white outline-none focus:border-brand-600"
            >
              <option value="">-- Select Product from Database --</option>
              {productsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand}) - {p.price}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-xs text-brand-800 font-medium pt-5">
            {productId ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                ✓ Bound to Product ID! Readers will see exact product specs, images, price, and affiliate links in this blog.
              </span>
            ) : (
              <span className="text-amber-800">
                ⚠️ Select a product to bind this blog post directly to its exact product page and deals.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Blog Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-bold text-neutral-900 outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-mono outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs outline-none focus:border-brand-500 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parent ? `↳ ${cat.name} (${cat.parent.name})` : `📁 ${cat.name}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">Detailed Article Content (Rich Editor) *</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          {/* Benchmark & Editor Review Scores (0 to 10 Ratings) */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-6 rounded-2xl shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/80">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="font-extrabold text-amber-950 text-sm">
                    Performance Breakdown & Benchmark Ratings
                  </h3>
                </div>
                <p className="text-xs text-amber-900/70 mt-0.5">
                  Set scores (0.0 to 10.0) to display the visual ratings breakdown card on the blog post.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-xs shrink-0">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div>
                  <div className="text-base font-black text-amber-700 leading-none">
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

            {/* Quick Presets & Sync */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-amber-900">Presets:</span>
              <button
                type="button"
                onClick={() => loadRatingPreset('laptop')}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-[11px] font-bold transition-colors"
              >
                💻 Laptop/PC
              </button>
              <button
                type="button"
                onClick={() => loadRatingPreset('phone')}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-[11px] font-bold transition-colors"
              >
                📱 Smartphone
              </button>
              <button
                type="button"
                onClick={() => loadRatingPreset('audio')}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-[11px] font-bold transition-colors"
              >
                🎧 Audio/Headphones
              </button>
              <button
                type="button"
                onClick={() => loadRatingPreset('tv')}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-[11px] font-bold transition-colors"
              >
                📺 TV/Display
              </button>

              {productId && (
                <button
                  type="button"
                  onClick={() => {
                    const prod = productsList.find((p) => p.id === productId);
                    if (prod && prod.specifications) {
                      const pSpecs = safeJsonParse<Record<string, any>>(prod.specifications, {});
                      if (pSpecs._ratingScores) {
                        const rObj = typeof pSpecs._ratingScores === 'string'
                          ? safeJsonParse<Record<string, number | string>>(pSpecs._ratingScores, {})
                          : pSpecs._ratingScores;
                        const rArr = Object.entries(rObj).map(([label, val]) => ({ label, score: String(val) }));
                        if (rArr.length > 0) setRatingsState(rArr);
                      }
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-brand-100 text-brand-800 hover:bg-brand-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Sync from Product
                </button>
              )}
            </div>

            {/* Ratings List */}
            <div className="space-y-3 pt-1">
              {ratingsState.map((r, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-3 rounded-xl border border-amber-200 shadow-xs"
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
                    className="w-full sm:w-1/2 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold"
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
                      className="w-16 px-2 py-1 rounded-lg border border-neutral-300 text-xs font-extrabold text-amber-600 text-center shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => setRatingsState(ratingsState.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1 shrink-0"
                      title="Delete Rating"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setRatingsState([...ratingsState, { label: '', score: '9.0' }])}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-amber-300 text-amber-800 font-bold hover:bg-amber-100/50 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Rating Category</span>
            </button>
          </div>

          {/* Amazon Price History Tracker Editor */}
          <div className="bg-emerald-50/60 border border-emerald-200 p-6 rounded-2xl shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>📈 Amazon Historical Price Trend (Price History Points)</span>
              </h3>
              <button
                type="button"
                onClick={() => setPriceHistoryState([...priceHistoryState, { date: '', price: '' }])}
                className="text-xs text-emerald-800 font-bold flex items-center gap-1"
              >
                + Add Price Point
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {priceHistoryState.map((ph, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-emerald-200">
                  <input
                    type="text"
                    placeholder="Date (e.g. May 2026)"
                    value={ph.date}
                    onChange={(e) => {
                      const copy = [...priceHistoryState];
                      copy[idx].date = e.target.value;
                      setPriceHistoryState(copy);
                    }}
                    className="w-1/2 px-2.5 py-1 rounded-lg border border-neutral-300 text-xs font-bold"
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
                    className="w-1/2 px-2.5 py-1 rounded-lg border border-neutral-300 text-xs font-extrabold text-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setPriceHistoryState(priceHistoryState.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications key-value editor */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-sm">Product Specifications</h3>
              <button
                type="button"
                onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                className="text-xs text-brand-600 font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Spec
              </button>
            </div>

            {specs.map((s, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Spec Key"
                  value={s.key}
                  onChange={(e) => {
                    const copy = [...specs];
                    copy[idx].key = e.target.value;
                    setSpecs(copy);
                  }}
                  className="w-1/2 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Spec Value"
                  value={s.value}
                  onChange={(e) => {
                    const copy = [...specs];
                    copy[idx].value = e.target.value;
                    setSpecs(copy);
                  }}
                  className="w-1/2 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm">Pros & Cons Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-2">Pros</label>
                {pros.map((p, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => {
                        const newPros = [...pros];
                        newPros[idx] = e.target.value;
                        setPros(newPros);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setPros(pros.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPros([...pros, ''])}
                  className="text-xs text-brand-600 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" /> Add Pro
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-700 mb-2">Cons</label>
                {cons.map((c, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => {
                        const newCons = [...cons];
                        newCons[idx] = e.target.value;
                        setCons(newCons);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setCons(cons.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCons([...cons, ''])}
                  className="text-xs text-brand-600 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" /> Add Con
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">Status & Image</h3>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-bold outline-none bg-white"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Featured Image URL / Upload</label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                    id="edit-blog-image-upload"
                  />
                  <label
                    htmlFor="edit-blog-image-upload"
                    className="px-3 py-1.5 bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 cursor-pointer flex items-center gap-1 hover:bg-neutral-200"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Amazon Affiliate Link</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">Amazon Product URL *</label>
              <input
                type="url"
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">Tagged Affiliate Link</label>
              <input
                type="url"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">SEO Metadata</h3>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
