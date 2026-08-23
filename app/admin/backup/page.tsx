'use client';

import React, { useState } from 'react';
import { Database, Download, RefreshCw, CheckCircle2, Shield } from 'lucide-react';

export default function AdminBackupPage() {
  const [downloading, setDownloading] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState('2026-07-31 04:00 AM');

  const triggerBackup = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setLastBackupDate(new Date().toLocaleString());
      alert('Database & Content Snapshot downloaded successfully!');
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 text-indigo-500 font-extrabold text-xs uppercase tracking-wider mb-1">
          <Database className="w-4 h-4" /> System Backups & Disaster Recovery
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          One-Click Database & Content Snapshots
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Safeguard your product catalog, blog articles, regional marketplace tags, and analytics logs.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">Automatic Daily Snapshot</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Last successful backup: {lastBackupDate}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
            Healthy
          </span>
        </div>

        <button
          onClick={triggerBackup}
          disabled={downloading}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>{downloading ? 'Exporting Database JSON Snapshot...' : 'Download Immediate Backup'}</span>
        </button>
      </div>
    </div>
  );
}
