'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Globe, Bot, FileEdit, Calendar, ShieldCheck,
  Search, Link2, Sparkles, Youtube, Instagram, BookOpen,
  BarChart3, Cpu, Key, Settings, ShoppingBag, FolderKanban,
  Tag, Image as ImageIcon, MessageSquare, Users, Mail, Tv,
  Database, HelpCircle, ChevronLeft, ChevronRight, ChevronDown, LogOut
} from 'lucide-react';
import { useWebsite } from '@/lib/saas/website-context';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface Counts {
  products?: number;
  blogs?: number;
  pendingComments?: number;
  users?: number;
  newsletterSubscribers?: number;
  categories?: number;
  brands?: number;
  deals?: number;
  comparisons?: number;
}

export default function AdminSidebar({ isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentWebsite } = useWebsite();
  const [counts, setCounts] = useState<Counts>({});
  const [isLegacyOpen, setIsLegacyOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/counts')
      .then((res) => res.json())
      .then((data) => setCounts(data))
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    router.push('/admin/login');
  };

  // SaaS Multi-Website Platform Nav Items
  const saasNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Websites', href: '/admin/websites', icon: Globe, badge: 'SaaS' },
    { name: 'AI Agents', href: '/admin/agents', icon: Bot },
    { name: 'Content Pipeline', href: '/admin/content', icon: FileEdit },
    { name: 'Content Calendar', href: '/admin/calendar', icon: Calendar },
    { name: 'SEO Opportunities', href: '/admin/seo', icon: ShieldCheck },
    { name: 'Search Console', href: '/admin/search-console', icon: Search },
    { name: 'Affiliate Hub', href: '/admin/affiliate', icon: Link2 },
  ];

  const socialNavItems = [
    { name: 'Pinterest Agent', href: '/admin/social/pinterest', icon: Sparkles },
    { name: 'YouTube Shorts', href: '/admin/social/youtube', icon: Youtube },
    { name: 'Instagram Reels', href: '/admin/social/instagram', icon: Instagram },
    { name: 'Medium Agent', href: '/admin/social/medium', icon: BookOpen },
  ];

  const platformNavItems = [
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Automation', href: '/admin/automation', icon: Cpu },
    { name: 'Integrations & API', href: '/admin/integrations', icon: Key },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // TechPulse Store Items (Preserved)
  const legacyItems = [
    { name: 'Products', href: '/admin/products', icon: ShoppingBag, count: counts.products },
    { name: 'Blogs & Articles', href: '/admin/blogs', icon: FileEdit, count: counts.blogs },
    { name: 'Categories', href: '/admin/categories', icon: FolderKanban, count: counts.categories },
    { name: 'Brands', href: '/admin/brands', icon: Tag, count: counts.brands },
    { name: 'Deals', href: '/admin/deals', icon: Sparkles, count: counts.deals },
    { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { name: 'Comments', href: '/admin/comments', icon: MessageSquare, count: counts.pendingComments },
    { name: 'Users', href: '/admin/users', icon: Users, count: counts.users },
    { name: 'Newsletter', href: '/admin/newsletter', icon: Mail, count: counts.newsletterSubscribers },
    { name: 'Ads & Banners', href: '/admin/advertisements', icon: Tv },
    { name: 'Backup & Restore', href: '/admin/backup', icon: Database },
    { name: 'Support', href: '/admin/support', icon: HelpCircle },
  ];

  return (
    <aside
      className={`bg-neutral-950 text-neutral-300 min-h-screen p-3 flex flex-col justify-between shrink-0 border-r border-neutral-800/80 transition-all duration-300 select-none ${
        isCollapsed
          ? 'hidden md:flex md:w-20'
          : 'fixed md:relative inset-y-0 left-0 z-50 w-64 shadow-2xl md:shadow-none'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand & Collapse Switcher */}
        <div className="flex items-center justify-between px-2.5 py-3 mb-3 border-b border-neutral-800/80">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-extrabold text-white text-sm tracking-tight leading-tight flex items-center gap-1.5">
                  <span>AI Growth Hub</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-medium truncate">
                  {currentWebsite ? `${currentWebsite.name} • Growth Agent` : 'Multi-Website Platform'}
                </div>
              </div>
            )}
          </Link>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {/* Section 1: Growth Hub Core */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                AI Growth Platform
              </div>
            )}
            {saasNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(`${item.href}`));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Section 2: Social Agents */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                Social Growth Agents
              </div>
            )}
            {socialNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Section 3: Platform Settings & Automation */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                Operations & Integrations
              </div>
            )}
            {platformNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Section 4: TechPulse Store Accordion */}
          {!isCollapsed && (
            <div className="pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => setIsLegacyOpen(!isLegacyOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
              >
                <span>TechPulse Store CMS</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLegacyOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLegacyOpen && (
                <div className="mt-1 space-y-0.5 pl-1 animate-in fade-in duration-150">
                  {legacyItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-neutral-800 text-white font-bold'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                          <span className="truncate text-[11px]">{item.name}</span>
                        </div>
                        {item.count !== undefined && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-800 text-neutral-400">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-neutral-800/80 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          title={isCollapsed ? 'View Live Public Site' : undefined}
        >
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          {!isCollapsed && <span>View TechPulse Site</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 transition-colors text-left cursor-pointer"
          title={isCollapsed ? 'Logout Session' : undefined}
        >
          <LogOut className="w-4 h-4 text-neutral-400 shrink-0" />
          {!isCollapsed && <span>Logout Session</span>}
        </button>
      </div>
    </aside>
  );
}
