'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-6">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider mb-2">
            <ShoppingBag className="w-4 h-4" /> Amazon Purchases
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Refund Policy</h1>
          <p className="text-xs text-neutral-400 mt-1">Last updated: July 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm space-y-4">
          <p>
            TechPulse is an independent product review and affiliate recommendation website. We do not sell products directly or process monetary payments on this site.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-4">1. Amazon Customer Returns & Refunds</h2>
          <p>
            All physical product orders, payments, shipments, returns, and refunds are handled directly by Amazon or third-party sellers on the respective Amazon marketplace where you completed your checkout.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-4">2. Assistance & Support</h2>
          <p>
            If you need assistance with an order placed on Amazon, please log into your Amazon account and navigate to &ldquo;Your Orders&rdquo; to initiate a return or contact Amazon Customer Support.
          </p>
        </div>
      </div>
    </div>
  );
}
