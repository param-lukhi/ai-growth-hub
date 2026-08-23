import React from 'react';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import BlogCard from '@/components/BlogCard';
import { Search } from 'lucide-react';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';

  let products: any[] = [];
  let blogs: any[] = [];

  if (query) {
    products = await db.product.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { name: { contains: query } },
          { brand: { contains: query } },
          { specifications: { contains: query } },
          { category: { name: { contains: query } } }
        ],
      },
      include: { category: true },
    });

    blogs = await db.blog.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { tags: { contains: query } },
          { category: { name: { contains: query } } }
        ],
      },
      include: { category: true },
    });
  }

  return (
    <div className="pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div>
        <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium mb-1">
          <Search className="w-4 h-4 text-brand-600" />
          <span>Search Results</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900">
          {query ? `Results for "${query}"` : 'Enter a search query'}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Showing matching products, brands, categories, and review articles.
        </p>
      </div>

      {/* Matching Products */}
      {products.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold text-neutral-900 mb-4 font-sans">
            Matching Products ({products.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Matching Blogs */}
      {blogs.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold text-neutral-900 mb-4 font-sans">
            Matching Review Articles ({blogs.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((b) => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        </section>
      )}

      {query && products.length === 0 && blogs.length === 0 && (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200">
          <p className="text-neutral-600 font-medium text-base">No products or reviews matched your query "{query}".</p>
          <p className="text-neutral-400 text-xs mt-1">Try searching for keywords like "Apple", "iPhone", "MacBook", "Sony", or "TVs".</p>
        </div>
      )}
    </div>
  );
}
