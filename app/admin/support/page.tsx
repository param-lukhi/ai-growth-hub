'use client';

import React from 'react';
import { HelpCircle, ExternalLink, Mail, FileText, Zap } from 'lucide-react';

export default function AdminSupportPage() {
  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" /> Admin Assistance
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Help & Documentation
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Guides, Amazon API credentials configuration, and developer support.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
          <Zap className="w-6 h-6 text-amber-500" />
          <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">Amazon AI Content Generator Guide</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Paste any Amazon product URL to automatically scrape price, image, features, and generate rich reviews + social media kits.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
          <Mail className="w-6 h-6 text-brand-600" />
          <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">Developer & System Contact</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            TechPulse Enterprise Admin v2.0 • Running Next.js 14, Tailwind CSS, Prisma SQLite & NextAuth Session Guard.
          </p>
        </div>
      </div>
    </div>
  );
}
