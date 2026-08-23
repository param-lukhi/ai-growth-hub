import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import BlogCard from '@/components/BlogCard';
import ProductCard from '@/components/ProductCard';
import { ChevronRight, Layers, Tag } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: { parent: true },
  });
  if (!category) return {};
  return {
    title: `Best ${category.name} Reviews & Buying Guides (2026)`,
    description:
      category.description ||
      `In-depth reviews, expert comparison, and Amazon buying guides for ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
      parent: true,
      subcategories: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!category) notFound();

  // If main category has subcategories, we fetch articles/products of this category + its subcategories
  const subcategoryIds = category.subcategories.map((s) => s.id);
  const targetCategoryIds = [category.id, ...subcategoryIds];

  const blogs = await db.blog.findMany({
    where: { categoryId: { in: targetCategoryIds }, status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const products = await db.product.findMany({
    where: { categoryId: { in: targetCategoryIds }, status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumbs (for subcategories or root categories) */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        {category.parent ? (
          <>
            <Link
              href={`/category/${category.parent.slug}`}
              className="hover:text-brand-600 transition-colors text-neutral-600"
            >
              {category.parent.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-900 dark:text-white font-bold">{category.name}</span>
          </>
        ) : (
          <span className="text-neutral-900 dark:text-white font-bold">{category.name}</span>
        )}
      </nav>

      {/* Category Header Hero */}
      <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 shadow-soft relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-brand-400 inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {category.parent ? `Subcategory of ${category.parent.name}` : 'Category Review Hub'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white dark:text-white tracking-tight flex items-center gap-3">
            {category.icon && <span className="text-3xl sm:text-4xl">{category.icon}</span>}
            <span className="text-white dark:text-white">{category.name}</span>
          </h1>

          {category.description && (
            <p className="text-neutral-300 text-base leading-relaxed max-w-2xl">
              {category.description}
            </p>
          )}

          {/* Subcategories Chips if available */}
          {category.subcategories.length > 0 && (
            <div className="pt-4">
              <span className="text-xs font-bold text-neutral-400 block mb-2">Explore Subcategories:</span>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${sub.slug}`}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/10 hover:scale-105"
                  >
                    <span>{sub.icon || '🏷️'}</span>
                    <span>{sub.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blogs Articles Section */}
      {blogs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Hands-on Reviews & Buying Guides ({blogs.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((b) => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        </section>
      )}

      {/* Products Catalog Section */}
      {products.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Top Rated Products in {category.name} ({products.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {blogs.length === 0 && products.length === 0 && (
        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <p className="text-neutral-500 text-sm">No reviews or products published in this category yet.</p>
          <Link href="/" className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Return to Homepage
          </Link>
        </div>
      )}
    </div>
  );
}
