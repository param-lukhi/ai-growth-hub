import React from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { db } from '@/lib/db';
import BlogCard from '@/components/BlogCard';
import { Compass, Home, ArrowRight, Search, FileQuestion } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NotFound() {
  const popularBlogs = await db.blog.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { views: 'desc' },
    take: 3,
  }).catch(() => []);

  return (
    <div className="min-h-[80vh] bg-neutral-50 dark:bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        
        {/* Main Error Banner */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 text-center space-y-6 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-2xl font-black shadow-inner">
            404
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Page Not Found
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              The page or review you are looking for may have been moved, renamed, or is temporarily unavailable.
            </p>
          </div>

          {/* Search Box on 404 Page */}
          <div className="max-w-md mx-auto pt-2">
            <SearchBar />
          </div>

          {/* Action Links */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-brand-600/20"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs sm:text-sm transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
          </div>
        </div>

        {/* Explore Popular Articles */}
        {popularBlogs.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Recommended Reads
                </span>
                <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-0.5">
                  Explore Popular Articles
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularBlogs.map((b) => (
                <BlogCard key={b.id} blog={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
