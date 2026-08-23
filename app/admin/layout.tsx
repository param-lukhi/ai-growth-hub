'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminNavbar from '@/components/AdminNavbar';
import { WebsiteProvider } from '@/lib/saas/website-context';
import AddWebsiteWizard from '@/components/saas/AddWebsiteWizard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // If login page, don't show admin sidebar or top navbar
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">{children}</div>;
  }

  return (
    <WebsiteProvider>
      <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans relative">
        {!isSidebarCollapsed && (
          <div
            onClick={() => setIsSidebarCollapsed(true)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-150"
          />
        )}
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminNavbar
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
        <AddWebsiteWizard />
      </div>
    </WebsiteProvider>
  );
}
