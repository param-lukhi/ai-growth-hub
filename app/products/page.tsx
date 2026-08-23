import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import AffiliateDisclosureNotice from '@/components/AffiliateDisclosureNotice';
import AdBanner from '@/components/AdBanner';
import { Package, Sparkles, SlidersHorizontal, ArrowRight, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Best Tech Products, Buying Guides & Recommendations - TechPulse',
  description: 'Browse our complete catalog of researched tech products, smartphones, laptops, audio gear, and appliances with Amazon marketplace pricing.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string; query?: string };
}) {
  const categoryFilter = searchParams?.category;
  const searchQuery = searchParams?.query;

  const whereClause: any = { status: 'PUBLISHED' };
  if (categoryFilter) {
    whereClause.category = { slug: categoryFilter };
  }
  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { brand: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  const products = await db.product.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  }).catch(() => []);

  const buyingGuides = [
    { label: 'Best Audio & Earbuds', slug: 'earbuds', icon: '🎧' },
    { label: 'Top Mobiles & Flagships', slug: 'mobiles', icon: '📱' },
    { label: 'Best Laptops & Ultrabooks', slug: 'laptops', icon: '💻' },
    { label: 'Best Smartwatches', slug: 'smart-watches', icon: '⌚' },
    { label: 'Best 4K & OLED TVs', slug: 'tvs', icon: '📺' },
    { label: 'Best Gaming Gear', slug: 'gaming', icon: '🎮' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-extrabold uppercase tracking-wide">
            <Package className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Curated Product Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Best Tech Products & Buying Guides
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Explore our researched product directory with verified specifications, pros, cons, and current Amazon pricing.
          </p>
        </div>

        {/* Popular Buying Guide Shortcuts */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-neutral-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Popular Buying Guide Shortcuts</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {buyingGuides.map((guide, idx) => (
              <Link
                key={idx}
                href={`/category/${guide.slug}`}
                className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/70 hover:border-brand-500 text-center space-y-1 transition-all group"
              >
                <span className="text-xl block group-hover:scale-110 transition-transform">{guide.icon}</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {guide.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-colors ${
              !categoryFilter
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-brand-500'
            }`}
          >
            All Products ({products.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full font-semibold text-xs transition-colors ${
                categoryFilter === cat.slug
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-brand-500 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Affiliate Disclosure */}
        <AffiliateDisclosureNotice compact />

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800 space-y-3">
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              No products found matching the selected filter.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* AdSense Placeholder */}
        <AdBanner slot="products-bottom-ad" format="horizontal" />
      </div>
    </div>
  );
}
