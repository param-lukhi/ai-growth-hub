'use client';

import React, { useState, useEffect } from 'react';
import { MARKETPLACE_LIST, getMarketplaceByCode, detectBrowserCountry } from '@/lib/location';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';

interface CountrySelectorProps {
  align?: 'left' | 'right' | 'auto';
}

export default function CountrySelector({ align = 'auto' }: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // 1. Initial browser locale detection
    const current = detectBrowserCountry();
    setSelectedCountry(current);

    // 2. IP Geolocation API in background if not saved in localStorage
    if (!localStorage.getItem('user_country')) {
      fetch('/api/location')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.country) {
            setSelectedCountry(data.country);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSelect = (code: string) => {
    setSelectedCountry(code);
    localStorage.setItem('user_country', code);
    setIsOpen(false);

    // Notify all components to re-render local prices dynamically
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('countryChange', { detail: { country: code } }));
    }
  };

  const currentMarket = getMarketplaceByCode(selectedCountry);

  const filteredMarketplaces = MARKETPLACE_LIST.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.currency.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase())
  );

  const alignmentClass = align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-0 sm:left-auto sm:right-0';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 hover:bg-neutral-200/90 dark:hover:bg-neutral-700/90 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs hover:shadow-md backdrop-blur-xs"
        title="Change Amazon Region & Currency"
      >
        <span className="text-xs font-extrabold">{currentMarket.symbol}</span>
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-extrabold uppercase tracking-wide">{currentMarket.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 dark:text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full ${alignmentClass} mt-2 w-70 max-w-[calc(100vw-2.5rem)] bg-white/95 dark:bg-neutral-900/95 rounded-2xl shadow-soft-xl dark:shadow-2xl border border-neutral-200/90 dark:border-neutral-800 py-2.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150`}>
          <div className="px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
            <span>20 Amazon Marketplaces</span>
            <Globe className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          </div>

          {/* Search box for 20 marketplaces */}
          <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800/80">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5" />
              <input
                type="text"
                placeholder="Search country or currency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-brand-500 dark:focus:border-brand-400 transition-colors"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-0.5 px-1.5 py-1.5">
            {filteredMarketplaces.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400 dark:text-neutral-500 font-medium">No marketplace found</div>
            ) : (
              filteredMarketplaces.map((market) => {
                const isSelected = market.code === selectedCountry;
                return (
                  <button
                    key={market.code}
                    onClick={() => handleSelect(market.code)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-extrabold border border-brand-200/60 dark:border-brand-800/60'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{market.flag}</span>
                      <div className="truncate">
                        <div className="font-bold leading-snug truncate">{market.name}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-400 font-normal truncate">
                          {market.currency} ({market.symbol}) • {market.domain}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 ml-1" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
