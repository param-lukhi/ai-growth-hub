'use client';

import React from 'react';
import { Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-6">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider mb-2">
            <Cookie className="w-4 h-4" /> Privacy & Preferences
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Cookie Policy</h1>
          <p className="text-xs text-neutral-400 mt-1">Last updated: July 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm space-y-4">
          <p>
            TechPulse uses cookies and local storage technology to enhance your browsing experience, remember your country/currency preferences, save dark mode settings, and remember your wishlist items.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-4">1. Essential Cookies</h2>
          <p>
            These cookies are necessary for core site functionality, including remembering your dark mode setting and region choices.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-4">2. Analytics & Affiliate Cookies</h2>
          <p>
            When you click an Amazon affiliate link on TechPulse, a cookie may be placed by Amazon to credit TechPulse with an affiliate referral commission if a purchase is made.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-4">3. Managing Cookies</h2>
          <p>
            You can modify your browser settings to decline cookies at any time. However, some features of TechPulse (such as stored wishlist items) rely on browser storage.
          </p>
        </div>
      </div>
    </div>
  );
}
