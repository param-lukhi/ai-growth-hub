'use client';

import React, { useState } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Copy, Check } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url?: string;
}

export default function SocialShare({ title, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? url || window.location.href : '';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mr-2 flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" /> Share Review:
      </span>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>

      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${shareUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors"
        title="Share on WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </a>

      <button
        onClick={handleCopy}
        className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors flex items-center gap-1.5"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </>
        )}
      </button>
    </div>
  );
}
