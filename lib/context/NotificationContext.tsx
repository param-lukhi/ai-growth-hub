'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  link?: string;
  read: boolean;
  type: 'PRICE_DROP' | 'NEW_REVIEW' | 'HOT_DEAL';
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Price Drop Alert!',
    message: 'Apple iPhone 15 Pro Max is now available at a special discount on Amazon.',
    date: 'Just now',
    link: '/product/apple-iphone-15-pro-max',
    read: false,
    type: 'PRICE_DROP',
  },
  {
    id: '2',
    title: 'New Review Published',
    message: 'Read our in-depth review on Sony WH-1000XM5 wireless noise cancelling headphones.',
    date: '2 hours ago',
    link: '/blog/sony-wh-1000xm5-review',
    read: false,
    type: 'NEW_REVIEW',
  },
  {
    id: '3',
    title: 'Hot Amazon Deal',
    message: 'MacBook Air 15" M3 Laptop is 15% OFF for a limited time.',
    date: '1 day ago',
    link: '/deals',
    read: false,
    type: 'HOT_DEAL',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('techpulse_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  }, []);

  const save = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem('techpulse_notifications', JSON.stringify(items));
    } catch (e) {}
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    save(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    save(updated);
  };

  const clearNotifications = () => {
    save([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
