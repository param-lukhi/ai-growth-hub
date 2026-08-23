'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteData } from './types';

interface WebsiteContextType {
  websites: WebsiteData[];
  currentWebsite: WebsiteData | null;
  setCurrentWebsite: (website: WebsiteData) => void;
  selectWebsiteById: (id: string) => void;
  refreshWebsites: () => Promise<void>;
  isLoading: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
  isAddModalOpen: boolean;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [currentWebsite, setCurrentWebsiteState] = useState<WebsiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchWebsites = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/saas/websites');
      const data = await res.json();
      if (data.success && Array.isArray(data.websites) && data.websites.length > 0) {
        setWebsites(data.websites);

        // Check if there is a saved website ID in localStorage
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('ai_growth_active_website_id') : null;
        const matched = savedId ? data.websites.find((w: WebsiteData) => w.id === savedId) : null;

        if (matched) {
          setCurrentWebsiteState(matched);
        } else {
          // Default to TechPulse or first website
          const techpulse = data.websites.find((w: WebsiteData) => w.slug === 'techpulse') || data.websites[0];
          setCurrentWebsiteState(techpulse);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ai_growth_active_website_id', techpulse.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load websites context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const setCurrentWebsite = (website: WebsiteData) => {
    setCurrentWebsiteState(website);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_growth_active_website_id', website.id);
    }
  };

  const selectWebsiteById = (id: string) => {
    const found = websites.find(w => w.id === id);
    if (found) {
      setCurrentWebsite(found);
    }
  };

  return (
    <WebsiteContext.Provider
      value={{
        websites,
        currentWebsite,
        setCurrentWebsite,
        selectWebsiteById,
        refreshWebsites: fetchWebsites,
        isLoading,
        openAddModal: () => setIsAddModalOpen(true),
        closeAddModal: () => setIsAddModalOpen(false),
        isAddModalOpen
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
}
