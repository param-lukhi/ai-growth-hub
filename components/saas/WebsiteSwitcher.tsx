'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWebsite } from '@/lib/saas/website-context';
import { Globe, Plus, ChevronDown, Check, Sparkles, Activity } from 'lucide-react';

export default function WebsiteSwitcher() {
  const { websites, currentWebsite, setCurrentWebsite, openAddModal } = useWebsite();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-neutral-900/90 dark:bg-neutral-800/90 border border-neutral-700/80 hover:border-brand-500/80 transition-all text-white text-xs sm:text-sm font-semibold shadow-md group focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform">
          {currentWebsite ? currentWebsite.name.charAt(0).toUpperCase() : 'G'}
        </div>
        <div className="text-left hidden xs:block">
          <div className="text-white font-bold leading-tight truncate max-w-[130px] sm:max-w-[160px]">
            {currentWebsite ? currentWebsite.name : 'Select Website'}
          </div>
          <div className="text-[10px] text-neutral-400 font-normal truncate max-w-[130px]">
            {currentWebsite ? `${currentWebsite.niche} • ${currentWebsite.targetCountry}` : 'AI Growth Hub'}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100">
          <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-500" />
              Manage Websites ({websites.length})
            </span>
            <span className="text-[10px] bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800/60">
              Isolated Tenants
            </span>
          </div>

          <div className="py-1.5 max-h-64 overflow-y-auto space-y-1">
            {websites.map((site) => {
              const isSelected = currentWebsite?.id === site.id;
              return (
                <button
                  key={site.id}
                  onClick={() => {
                    setCurrentWebsite(site);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/80 text-brand-900 dark:text-brand-100'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {site.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        {site.name}
                        {site.slug === 'techpulse' && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/20">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {site.niche} • {site.targetCountry}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 mt-1 border-t border-neutral-100 dark:border-neutral-800/80">
            <button
              onClick={() => {
                setIsOpen(false);
                openAddModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Website (Wizard)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
