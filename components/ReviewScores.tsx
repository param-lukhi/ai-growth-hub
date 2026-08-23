'use client';

import React from 'react';
import { Star, Zap, Monitor, Camera, Battery, Gamepad2, Cpu, Award, Sparkles, ShieldCheck, Volume2, Gauge, Heart } from 'lucide-react';
import { safeJsonParse } from '@/lib/utils';

interface ScoreItem {
  label: string;
  score: number; // 0 to 10
  icon?: React.ReactNode;
  color?: string;
}

interface ReviewScoresProps {
  scoresData?: string | Record<string, number | string> | ScoreItem[];
}

const DEFAULT_SCORES: ScoreItem[] = [
  { label: 'Performance Score', score: 9.6, icon: <Zap className="w-4 h-4" />, color: 'bg-emerald-500' },
  { label: 'Display Score', score: 9.4, icon: <Monitor className="w-4 h-4" />, color: 'bg-blue-500' },
  { label: 'Camera / Audio', score: 9.8, icon: <Camera className="w-4 h-4" />, color: 'bg-purple-500' },
  { label: 'Battery Score', score: 9.1, icon: <Battery className="w-4 h-4" />, color: 'bg-amber-500' },
  { label: 'Gaming Performance', score: 9.5, icon: <Gamepad2 className="w-4 h-4" />, color: 'bg-indigo-500' },
  { label: 'AI & Value Rating', score: 9.2, icon: <Cpu className="w-4 h-4" />, color: 'bg-rose-500' },
];

const COLOR_PALETTE = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-cyan-500',
];

const ICON_MAP: Record<string, React.ReactNode> = {
  performance: <Zap className="w-4 h-4" />,
  speed: <Gauge className="w-4 h-4" />,
  display: <Monitor className="w-4 h-4" />,
  screen: <Monitor className="w-4 h-4" />,
  camera: <Camera className="w-4 h-4" />,
  audio: <Volume2 className="w-4 h-4" />,
  sound: <Volume2 className="w-4 h-4" />,
  noise: <Volume2 className="w-4 h-4" />,
  battery: <Battery className="w-4 h-4" />,
  gaming: <Gamepad2 className="w-4 h-4" />,
  ai: <Cpu className="w-4 h-4" />,
  value: <Award className="w-4 h-4" />,
  price: <Award className="w-4 h-4" />,
  design: <Sparkles className="w-4 h-4" />,
  build: <ShieldCheck className="w-4 h-4" />,
  comfort: <Heart className="w-4 h-4" />,
};

export default function ReviewScores({ scoresData }: ReviewScoresProps) {
  let parsedScores: ScoreItem[] = [];

  if (scoresData) {
    if (typeof scoresData === 'string') {
      const obj = safeJsonParse<Record<string, number | string>>(scoresData, {});
      parsedScores = Object.entries(obj).map(([label, val], idx) => ({
        label,
        score: Math.min(10, Math.max(0, parseFloat(String(val)) || 9.0)),
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      }));
    } else if (Array.isArray(scoresData)) {
      parsedScores = scoresData.map((item, idx) => ({
        ...item,
        score: Math.min(10, Math.max(0, Number(item.score) || 9.0)),
        color: item.color || COLOR_PALETTE[idx % COLOR_PALETTE.length],
      }));
    } else if (typeof scoresData === 'object') {
      parsedScores = Object.entries(scoresData).map(([label, val], idx) => ({
        label,
        score: Math.min(10, Math.max(0, parseFloat(String(val)) || 9.0)),
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      }));
    }
  }

  const finalScores = parsedScores.length > 0 ? parsedScores : DEFAULT_SCORES;

  const overallScore = (
    finalScores.reduce((acc, s) => acc + s.score, 0) / (finalScores.length || 1)
  ).toFixed(1);

  const getIconForLabel = (label: string) => {
    const l = label.toLowerCase();
    for (const key of Object.keys(ICON_MAP)) {
      if (l.includes(key)) return ICON_MAP[key];
    }
    return <Award className="w-4 h-4" />;
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm my-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            TechPulse Evaluation Breakdown
          </span>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            Feature Breakdown & Rating Analysis
          </h3>
        </div>

        <div className="flex items-center gap-3 bg-brand-50 dark:bg-brand-950/40 px-5 py-3 rounded-2xl border border-brand-200 dark:border-brand-800">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400 shrink-0" />
          <div>
            <div className="text-2xl font-black text-brand-700 dark:text-brand-300 leading-none">
              {overallScore} <span className="text-xs text-neutral-400 font-semibold">/ 10</span>
            </div>
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Overall Editor Score
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {finalScores.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <span className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-xs text-brand-600 dark:text-brand-400">
                  {s.icon || getIconForLabel(s.label)}
                </span>
                {s.label}
              </span>
              <span className="font-extrabold text-sm text-neutral-900 dark:text-white">{s.score} / 10</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${s.color || COLOR_PALETTE[i % COLOR_PALETTE.length]} transition-all duration-500`}
                style={{ width: `${(s.score / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

