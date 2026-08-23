'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, History, X, Sparkles, ArrowRight, Tag, BookOpen, Package } from 'lucide-react';

interface SuggestionResult {
  products: Array<{ id: string; name: string; slug: string; brand: string; price: string; images: string }>;
  blogs: Array<{ id: string; title: string; slug: string; featuredImage: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionResult>({ products: [], blogs: [], categories: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('techpulse_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestion fetch
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions({ products: [], blogs: [], categories: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const filtered = recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase());
    const updated = [term.trim(), ...filtered].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('techpulse_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSearchSubmit = (e?: React.FormEvent, customTerm?: string) => {
    if (e) e.preventDefault();
    const term = customTerm || query;
    if (term.trim()) {
      saveRecentSearch(term.trim());
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('techpulse_recent_searches');
    } catch (e) {}
  };

  // Keyboard navigation
  const allItems = [
    ...suggestions.products.map((p) => ({ type: 'product', url: `/product/${p.slug}`, title: p.name })),
    ...suggestions.blogs.map((b) => ({ type: 'blog', url: `/blog/${b.slug}`, title: b.title })),
    ...suggestions.categories.map((c) => ({ type: 'category', url: `/category/${c.slug}`, title: c.name })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && allItems[selectedIndex]) {
        e.preventDefault();
        saveRecentSearch(allItems[selectedIndex].title);
        setIsOpen(false);
        router.push(allItems[selectedIndex].url);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={(e) => handleSearchSubmit(e)} className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, brands, or reviews..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Search site content"
          className="w-full bg-neutral-100/90 dark:bg-neutral-800/90 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 focus:bg-white dark:focus:bg-neutral-900 text-neutral-900 dark:text-white text-sm rounded-full pl-10 pr-9 py-2 border border-neutral-200/50 dark:border-neutral-700/50 focus:border-brand-500 dark:focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-400 absolute left-3.5 pointer-events-none" />

        {isLoading ? (
          <Loader2 className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-spin absolute right-3" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions({ products: [], blogs: [], categories: [] });
            }}
            className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </form>

      {/* Instant Suggestions & Recent Searches Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-neutral-900/95 rounded-2xl shadow-soft-xl border border-neutral-200/80 dark:border-neutral-800 py-2.5 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          {query.trim().length < 2 ? (
            /* Recent Searches */
            recentSearches.length > 0 ? (
              <div>
                <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-brand-600" /> Recent Searches
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-neutral-400 hover:text-rose-500 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="py-1">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearchSubmit(undefined, term)}
                      className="w-full px-4 py-2 text-left text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between"
                    >
                      <span>{term}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 text-xs text-neutral-400 text-center">
                Type at least 2 characters to search products & reviews
              </div>
            )
          ) : (
            /* Search Results */
            <div className="max-h-96 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {/* Products */}
              {suggestions.products.length > 0 && (
                <div className="py-1.5">
                  <div className="px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <Package className="w-3 h-3 text-brand-600" /> Products
                  </div>
                  {suggestions.products.map((p, idx) => {
                    const globalIdx = idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          saveRecentSearch(p.name);
                          setIsOpen(false);
                          router.push(`/product/${p.slug}`);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <div className="truncate font-semibold">{p.name}</div>
                        <span className="text-[10px] font-extrabold text-neutral-500 shrink-0 ml-2">
                          {p.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Reviews / Blogs */}
              {suggestions.blogs.length > 0 && (
                <div className="py-1.5">
                  <div className="px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-500" /> Reviews & Guides
                  </div>
                  {suggestions.blogs.map((b, idx) => {
                    const globalIdx = suggestions.products.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          saveRecentSearch(b.title);
                          setIsOpen(false);
                          router.push(`/blog/${b.slug}`);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <span className="truncate font-medium">{b.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Categories */}
              {suggestions.categories.length > 0 && (
                <div className="py-1.5">
                  <div className="px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-500" /> Categories
                  </div>
                  {suggestions.categories.map((c, idx) => {
                    const globalIdx = suggestions.products.length + suggestions.blogs.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          saveRecentSearch(c.name);
                          setIsOpen(false);
                          router.push(`/category/${c.slug}`);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">Category</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {suggestions.products.length === 0 &&
                suggestions.blogs.length === 0 &&
                suggestions.categories.length === 0 && (
                  <div className="p-4 text-center text-xs text-neutral-400">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                )}

              {/* See all results link */}
              <button
                onClick={() => handleSearchSubmit()}
                className="w-full p-2.5 text-center text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1"
              >
                <span>See all results for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
