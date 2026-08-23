'use client';

import React, { useState, useEffect } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content?: string;
  items?: TocItem[];
}

export default function TableOfContents({ content, items: initialItems }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>(initialItems || []);
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
      return;
    }

    if (!content) return;

    // Parse markdown headings ##, ###
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const extracted: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const cleanText = rawText.replace(/[*_`]/g, '');
      const id = cleanText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (id && cleanText) {
        extracted.push({ id, text: cleanText, level });
      }
    }

    setItems(extracted);
  }, [content, initialItems]);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <div className="my-8 bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <List className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
              Quick Navigation
            </span>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              Table of Contents
            </h3>
          </div>
        </div>

        <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <nav className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-sm">
          {items.map((item, idx) => (
            <a
              key={idx}
              href={`#${item.id}`}
              onClick={(e) => scrollToHeading(e, item.id)}
              className={`block py-1 px-2.5 rounded-lg transition-colors leading-relaxed ${
                item.level === 3 ? 'ml-4 text-xs' : 'font-medium'
              } ${
                activeId === item.id
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {item.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
