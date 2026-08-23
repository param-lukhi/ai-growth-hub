import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import BlogCard from '@/components/BlogCard';
import { BookOpen, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Product Reviews, Buying Guides & Tech Articles - TechPulse',
  description: 'Explore in-depth product reviews, buying guides, specification breakdowns, and comparison guides for smartphones, laptops, audio gear, and gadgets.',
};

export default async function BlogListPage() {
  const blogs = await db.blog.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-extrabold uppercase tracking-wide">
            <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Editorial Reviews & Guides
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Research-Based Product Reviews & Guides
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            In-depth specification analysis, verified user feedback synthesis, pros & cons, and curated buying recommendations.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-full bg-brand-600 text-white font-bold text-xs shadow-sm"
          >
            All Articles ({blogs.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-brand-500 text-neutral-700 dark:text-neutral-300 font-semibold text-xs transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
