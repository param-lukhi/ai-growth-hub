'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Sparkles, Shield } from 'lucide-react';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import WishlistButton from './WishlistButton';
import NotificationBell from './NotificationBell';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  parentId?: string | null;
  subcategories?: { id: string; name: string; slug: string; icon?: string | null }[];
}

export default function Header() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState('TechPulse');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setExpandedCategoryId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    // Fetch categories & site settings
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.site_name) setSiteName(data.site_name);
      })
      .catch(() => {});

    // Check if admin is logged in
    fetch('/api/admin/check-auth')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.authenticated) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
        }
      })
      .catch(() => setIsAdminAuthenticated(false));
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Reviews', href: '/blog' },
    { name: 'Best Products', href: '/products' },
    { name: 'Comparisons', href: '/comparisons' },
    { name: 'Deals', href: '/deals', isSpecial: true },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/85 backdrop-blur-xl border-b border-neutral-200/60 dark:border-neutral-800/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
              {siteName.charAt(0)}
            </div>
            <span className="font-extrabold text-lg sm:text-xl text-neutral-900 dark:text-white tracking-tight font-sans truncate max-w-[130px] xs:max-w-none">
              {siteName}
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md justify-center">
            <SearchBar />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <Link
              href="/"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>

            <Link
              href="/blog"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/blog') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              Reviews
              {isActive('/blog') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>

            <Link
              href="/products"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/products') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              Best Products
              {isActive('/products') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>

            <Link
              href="/comparisons"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/comparisons') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              Comparisons
              {isActive('/comparisons') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 py-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors outline-none cursor-pointer ${
                  isActive('/category') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
                }`}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                aria-expanded={isCategoryOpen}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isCategoryOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : 'text-neutral-400'
                  }`}
                />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 w-80 sm:w-96 max-h-[30rem] overflow-y-auto bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-soft-xl border border-neutral-200/80 dark:border-neutral-800 p-2.5 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50 divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {categories.length > 0 ? (
                    categories
                      .filter((c) => !c.parentId)
                      .map((cat) => {
                        // Gather all subcategories (from relation or parentId match)
                        const rawSubs = [
                          ...(cat.subcategories || []),
                          ...categories.filter((c) => c.parentId === cat.id),
                        ];
                        const subs = Array.from(
                          new Map(rawSubs.map((s) => [s.id, s])).values()
                        );
                        const isExpanded = expandedCategoryId === cat.id;

                        return (
                          <div key={cat.id} className="pt-1.5 first:pt-0 space-y-1">
                            {/* Main Category Link / Accordion Header */}
                            {subs.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => toggleCategory(cat.id)}
                                aria-expanded={isExpanded}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:bg-brand-50 dark:hover:bg-neutral-800/80 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-colors flex items-center justify-between group cursor-pointer"
                              >
                                <span className="flex items-center gap-2.5 truncate">
                                  <span className="text-base shrink-0">{cat.icon || '📁'}</span>
                                  <span className="truncate">{cat.name}</span>
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full group-hover:bg-brand-100 dark:group-hover:bg-brand-950/60 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                    {subs.length} {subs.length === 1 ? 'sub' : 'subs'}
                                  </span>
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                                      isExpanded
                                        ? 'rotate-180 text-brand-600 dark:text-brand-400'
                                        : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                                    }`}
                                  />
                                </div>
                              </button>
                            ) : (
                              <Link
                                href={`/category/${cat.slug}`}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:bg-brand-50 dark:hover:bg-neutral-800/80 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-colors flex items-center justify-between group"
                                onClick={() => setIsCategoryOpen(false)}
                              >
                                <span className="flex items-center gap-2.5 truncate">
                                  <span className="text-base shrink-0">{cat.icon || '📁'}</span>
                                  <span className="truncate">{cat.name}</span>
                                </span>
                              </Link>
                            )}

                            {/* Subcategories with Smooth Expand/Collapse Animation */}
                            {subs.length > 0 && (
                              <div
                                className={`grid transition-all duration-300 ease-in-out ${
                                  isExpanded
                                    ? 'grid-rows-[1fr] opacity-100'
                                    : 'grid-rows-[0fr] opacity-0'
                                }`}
                              >
                                <div className="overflow-hidden">
                                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-l-2 border-brand-100 dark:border-neutral-800 ml-4.5">
                                    <Link
                                      href={`/category/${cat.slug}`}
                                      className="px-2.5 py-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-lg flex items-center gap-2 transition-colors truncate"
                                      onClick={() => setIsCategoryOpen(false)}
                                    >
                                      <span className="text-xs shrink-0">✨</span>
                                      <span className="truncate">All {cat.name}</span>
                                    </Link>
                                    {subs.map((sub) => (
                                      <Link
                                        key={sub.id}
                                        href={`/category/${sub.slug}`}
                                        className="px-2.5 py-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg flex items-center gap-2 transition-colors truncate"
                                        onClick={() => setIsCategoryOpen(false)}
                                      >
                                        <span className="text-xs shrink-0">{sub.icon || '🏷️'}</span>
                                        <span className="truncate">{sub.name}</span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="px-4 py-3 text-xs text-neutral-400 dark:text-neutral-500 text-center">Loading categories...</div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/deals"
              className={`relative py-1 flex items-center gap-1 text-amazon-orange font-bold hover:text-amazon-hover transition-colors ${
                isActive('/deals') ? 'underline underline-offset-4' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Deals
            </Link>

            <Link
              href="/about"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/about') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              About
              {isActive('/about') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>
          </nav>

          {/* Right Action Icons & Selectors */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Notification Bell - Desktop / Tablet */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* Wishlist Button - Desktop / Tablet */}
            <div className="hidden sm:block">
              <WishlistButton />
            </div>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 pt-1">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
          
          {/* Mobile Quick Actions Bar */}
          <div className="flex items-center justify-end pb-3 border-b border-neutral-100 dark:border-neutral-800 sm:hidden">
            <div className="flex items-center gap-2">
              <NotificationBell />
              <WishlistButton />
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/blog"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/blog') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link
              href="/products"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/products') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Best Products
            </Link>
            <Link
              href="/comparisons"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/comparisons') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Comparisons
            </Link>
            <Link
              href="/deals"
              className={`block px-3 py-2 rounded-xl text-sm font-bold text-amazon-orange hover:bg-neutral-100 dark:hover:bg-neutral-800`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Amazon Deals
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/about') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>

            <Link
              href="/wishlist"
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Wishlist
            </Link>
          </div>

          {/* Mobile Categories Accordion / Nested List */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <div className="px-3 py-1 font-extrabold text-[11px] text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Categories & Subcategories</span>
            </div>
            <div className="space-y-1.5">
              {categories.filter((c) => !c.parentId).map((cat) => {
                const rawSubs = [
                  ...(cat.subcategories || []),
                  ...categories.filter((c) => c.parentId === cat.id),
                ];
                const subs = Array.from(
                  new Map(rawSubs.map((s) => [s.id, s])).values()
                );
                const isExpanded = expandedCategoryId === cat.id;

                return (
                  <div key={cat.id} className="rounded-xl bg-neutral-50/80 dark:bg-neutral-800/40 p-2 space-y-1">
                    {subs.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        aria-expanded={isExpanded}
                        className="w-full text-left px-2 py-1 text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-sm shrink-0">{cat.icon || '📁'}</span>
                          <span className="truncate">{cat.name}</span>
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {subs.length} sub{subs.length > 1 ? 's' : ''}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${
                              isExpanded ? 'rotate-180 text-brand-600 dark:text-brand-400' : 'text-neutral-400'
                            }`}
                          />
                        </div>
                      </button>
                    ) : (
                      <Link
                        href={`/category/${cat.slug}`}
                        className="px-2 py-1 text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between hover:text-brand-600 dark:hover:text-brand-400"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-sm shrink-0">{cat.icon || '📁'}</span>
                          <span className="truncate">{cat.name}</span>
                        </span>
                      </Link>
                    )}

                    {subs.length > 0 && (
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-neutral-200 dark:border-neutral-700 ml-2">
                            <Link
                              href={`/category/${cat.slug}`}
                              className="px-2 py-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-400 block rounded transition-colors truncate"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span className="mr-1.5">✨</span>
                              <span>All {cat.name}</span>
                            </Link>
                            {subs.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/category/${sub.slug}`}
                                className="px-2 py-1 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 block rounded transition-colors truncate"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span className="mr-1.5">{sub.icon || '🏷️'}</span>
                                <span>{sub.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
