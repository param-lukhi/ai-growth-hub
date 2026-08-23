'use client';

import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-6">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" /> Legal Framework
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Terms & Conditions</h1>
          <p className="text-xs text-neutral-400 mt-1">Last updated: July 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm space-y-4">
          <p>
            Welcome to TechPulse. By accessing or using our website, reviews, and services, you agree to comply with and be bound by the following Terms and Conditions.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-4">1. Use of Content</h2>
          <p>
            All editorial reviews, photos, specifications, comparison metrics, and software guides published on TechPulse are the intellectual property of TechPulse unless stated otherwise. Content may not be reproduced without prior authorization.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-4">2. Amazon Affiliate Disclaimer</h2>
          <p>
            TechPulse is a participant in the Amazon Services LLC Associates Program and other regional Amazon affiliate advertising programs designed to provide a means for sites to earn advertising fees by linking to Amazon marketplaces worldwide.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-4">3. Disclaimer of Warranties</h2>
          <p>
            While we strive for 100% accuracy in product prices, specs, and availability, prices on Amazon marketplaces change frequently. We are not responsible for discrepancies between listed prices and live Amazon checkout prices.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-4">4. Limitation of Liability</h2>
          <p>
            TechPulse shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of recommended third-party products purchased via affiliate links.
          </p>
        </div>
      </div>
    </div>
  );
}
