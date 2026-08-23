import React from 'react';
import Link from 'next/link';
import { formatDate, estimateReadTime } from '@/lib/utils';
import { ArrowRight, Clock, Tag } from 'lucide-react';

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    metaDescription?: string | null;
    featuredImage: string;
    createdAt: Date | string;
    content: string;
    category?: { name: string; slug: string };
  };
}

export default function BlogCard({ blog }: BlogCardProps) {
  const readTime = estimateReadTime(blog.content || '');

  return (
    <article className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-soft hover:shadow-soft-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Featured Image */}
      <Link href={`/blog/${blog.slug}`} className="relative aspect-[16/9] bg-neutral-100 dark:bg-neutral-800/40 overflow-hidden block">
        <img
          src={blog.featuredImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {blog.category && (
          <span className="absolute top-3 left-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-800 dark:text-neutral-200 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-neutral-200/50 dark:border-neutral-700/50">
            {blog.category.name}
          </span>
        )}
      </Link>

      {/* Meta & Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-2 font-medium">
            <span>{formatDate(blog.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
              {readTime}
            </span>
          </div>

          <h3 className="font-bold text-neutral-900 dark:text-white text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug mb-2">
            <Link href={`/blog/${blog.slug}`}>
              {blog.title}
            </Link>
          </h3>

          {blog.metaDescription && (
            <p className="text-neutral-600 dark:text-neutral-300 text-sm line-clamp-2 leading-relaxed mb-4">
              {blog.metaDescription}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <Link
            href={`/blog/${blog.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group/link"
          >
            <span>Read Hands-on Review</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
