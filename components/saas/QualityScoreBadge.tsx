'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface QualityScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

export default function QualityScoreBadge({
  score,
  size = 'md',
  showDetails = false,
  onClick
}: QualityScoreBadgeProps) {
  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80';
  let Icon = ShieldCheck;

  if (score < 70) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80';
    Icon = AlertCircle;
  } else if (score < 85) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80';
    Icon = AlertTriangle;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-extrabold border transition-all ${colorClasses} ${sizeClasses} ${
        onClick ? 'hover:scale-105 active:scale-95 cursor-pointer shadow-xs' : 'cursor-default'
      }`}
      title="Click to view Quality Control breakdown"
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>Quality {score}/100</span>
    </button>
  );
}
