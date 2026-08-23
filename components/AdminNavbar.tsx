'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Bell, Plus, Moon, Sun, Shield, LogOut, User, Settings,
  Key, CreditCard, ChevronDown, Check, Sparkles, ExternalLink, Globe
} from 'lucide-react';
import CountrySelector from './CountrySelector';
import WishlistButton from './WishlistButton';
import ThemeToggle from './ThemeToggle';
import WebsiteSwitcher from './saas/WebsiteSwitcher';
import { useWebsite } from '@/lib/saas/website-context';

interface AdminNavbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function AdminNavbar({ isSidebarCollapsed, onToggleSidebar }: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { openAddModal } = useWebsite();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Close dropdowns on outside click or esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
        setIsQuickCreateOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    router.push('/admin/login');
  };

  const mockNotifications = [
    { id: '1', title: 'Agent Completed Topic Discovery', desc: 'Found 25 high-priority buying guide keywords', time: '2m ago', unread: true },
    { id: '2', title: 'New SEO Opportunity Identified', desc: 'Low CTR query detected on page 1', time: '15m ago', unread: true },
    { id: '3', title: 'Quality Control Passed', desc: 'Article ready for manual review', time: '1h ago', unread: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-3 sm:px-6 h-16 flex items-center justify-between gap-3 transition-all">
        
        {/* Left: Sidebar Toggle & Website Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* SaaS Multi-Website Switcher */}
          <WebsiteSwitcher />

          {/* Search Trigger */}
          <div className="relative w-full hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between pl-9 pr-4 py-1.5 bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-xl text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-all text-left"
            >
              <span className="truncate">Search websites, topics, drafts, SEO data...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold text-neutral-400 bg-white dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600">
                ⌘K
              </kbd>
            </button>
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Right: Controls & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Quick Create (+) */}
          <div className="relative">
            <button
              onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {isQuickCreateOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5 text-neutral-900 dark:text-neutral-100">
                <button
                  onClick={() => {
                    setIsQuickCreateOpen(false);
                    openAddModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-xl transition-colors text-left"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>+ Add New Website</span>
                </button>
                <Link
                  href="/admin/content"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>New Content Draft</span>
                </Link>
                <Link
                  href="/admin/blogs/new"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>TechPulse Native Article</span>
                </Link>
              </div>
            )}
          </div>

          {/* Country Selector */}
          <CountrySelector />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-neutral-900" />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-extrabold">Agent Notifications</span>
                  <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2 py-0.5 rounded-full">
                    2 New
                  </span>
                </div>
                <div className="space-y-2">
                  {mockNotifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">{n.time}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{n.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                A
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="text-xs font-extrabold text-neutral-900 dark:text-white">Admin / Platform Owner</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">lukhiparam904@gmail.com</div>
                </div>
                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <span>Platform Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search websites, topics, drafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-neutral-900 dark:text-white outline-none text-sm"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-lg hover:bg-neutral-200"
              >
                ESC
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto space-y-2 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Quick Navigation</div>
              <Link
                href="/admin/dashboard"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span>SaaS Growth Dashboard</span>
                <kbd className="text-[10px] text-neutral-400">/dashboard</kbd>
              </Link>
              <Link
                href="/admin/websites"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span>Website Manager & Tenants</span>
                <kbd className="text-[10px] text-neutral-400">/websites</kbd>
              </Link>
              <Link
                href="/admin/content"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span>Content Pipeline & Kanban</span>
                <kbd className="text-[10px] text-neutral-400">/content</kbd>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
