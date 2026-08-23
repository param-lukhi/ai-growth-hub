'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/lib/context/NotificationContext';
import { Bell, CheckCheck, Trash2, Tag, Star, Zap } from 'lucide-react';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PRICE_DROP':
        return <Tag className="w-4 h-4 text-emerald-500" />;
      case 'NEW_REVIEW':
        return <Star className="w-4 h-4 text-amber-500" />;
      case 'HOT_DEAL':
        return <Zap className="w-4 h-4 text-amazon-orange" />;
      default:
        return <Bell className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        className="relative p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 pb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-neutral-900 dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Read all
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-neutral-400 hover:text-rose-500 flex items-center gap-1"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                    !n.read
                      ? 'bg-brand-50/50 dark:bg-brand-950/20'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-800 shadow-xs shrink-0 border border-neutral-200/60 dark:border-neutral-700">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold ${!n.read ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-neutral-400 shrink-0">{n.date}</span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="inline-block mt-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                        onClick={() => setIsOpen(false)}
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
