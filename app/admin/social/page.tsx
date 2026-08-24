'use client';

import React from 'react';
import Link from 'next/link';
import { useWebsite } from '@/lib/saas/website-context';
import { Sparkles, Youtube, Instagram, BookOpen, ArrowRight, Share2, Bot, Layers } from 'lucide-react';

export default function SocialHubPage() {
  const { currentWebsite } = useWebsite();

  const socialPlatforms = [
    {
      name: 'Pinterest AI Agent',
      href: '/admin/social/pinterest',
      icon: Sparkles,
      color: 'from-rose-500 to-red-600',
      badge: 'High Referral Traffic',
      description: 'Generates SEO-optimized pin graphics, clickable titles, keyword-rich board descriptions, and direct affiliate outbound links.',
      features: ['Viral Pin Title & Descriptions', 'Hashtag Generation', 'Destination Link Tracking']
    },
    {
      name: 'YouTube Shorts Agent',
      href: '/admin/social/youtube',
      icon: Youtube,
      color: 'from-red-600 to-rose-700',
      badge: 'Fast Video Growth',
      description: 'Generates structured 30-60s short-form video scripts, opening hooks, visual B-roll scene breakdowns, and pinned comment CTAs.',
      features: ['0-3s Hook Engineering', 'Scene-by-scene B-roll prompts', 'Comment CTA & Disclosures']
    },
    {
      name: 'Instagram Reels Agent',
      href: '/admin/social/instagram',
      icon: Instagram,
      color: 'from-fuchsia-600 to-pink-600',
      badge: 'High Engagement',
      description: 'Generates viral Reel captions, audio suggestions, lifestyle visual cues, and bio-link click funnels for product reviews.',
      features: ['Engagement Bio Hooks', 'Trending Audio Framing', 'High-Converting Hashtags']
    },
    {
      name: 'Medium Syndication Agent',
      href: '/admin/social/medium',
      icon: BookOpen,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Authority Backlinks',
      description: 'Adapts full-length reviews into canonical-backed Medium thought-leadership stories to capture high-authority Google search rankings.',
      features: ['Canonical URL Linkage', 'Editorial Story Adaptation', 'Brand Authority Building']
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Multi-Channel Social Growth Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Autonomous multi-platform distribution tailored for <strong>{currentWebsite?.name || 'Selected Website'}</strong>.
          </p>
        </div>
      </div>

      {/* Grid of Social Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {socialPlatforms.map((plat) => {
          const Icon = plat.icon;
          return (
            <Link
              key={plat.name}
              href={plat.href}
              className="group p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-soft transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plat.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                    {plat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {plat.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    {plat.description}
                  </p>
                </div>

                <div className="pt-2 space-y-1.5 border-t border-neutral-100 dark:border-neutral-800">
                  {plat.features.map((feat, idx) => (
                    <div key={idx} className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                <span>Open {plat.name}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
