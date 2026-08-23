'use client';

import React from 'react';
import { QualityScoreData } from '@/lib/saas/types';
import { X, ShieldCheck, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface ArticleQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  qualityBreakdown?: QualityScoreData | null;
}

export default function ArticleQualityModal({
  isOpen,
  onClose,
  title,
  qualityBreakdown
}: ArticleQualityModalProps) {
  if (!isOpen || !qualityBreakdown) return null;

  const {
    overallScore,
    seoScore,
    contentScore,
    affiliateScore,
    readabilityScore,
    originalityCheck,
    technicalScore,
    validationFlags = []
  } = qualityBreakdown;

  const scoreBars = [
    { label: 'SEO & Meta Structure', score: seoScore, weight: '25%' },
    { label: 'Content Depth & Accuracy', score: contentScore, weight: '25%' },
    { label: 'Affiliate & FTC Compliance', score: affiliateScore, weight: '15%' },
    { label: 'Readability & Engagement', score: readabilityScore, weight: '15%' },
    { label: 'Originality & Value', score: originalityCheck, weight: '10%' },
    { label: 'Technical & Schema.org', score: technicalScore, weight: '10%' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-900 dark:text-neutral-100">
        <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-white text-lg shadow-md ${
              overallScore >= 85 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'
            }`}>
              {overallScore}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">Article Quality Control Breakdown</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-md">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Sub-Score Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Dimension Scores</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scoreBars.map((bar, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/70">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-neutral-700 dark:text-neutral-300">{bar.label}</span>
                    <span className="text-brand-600 dark:text-brand-400 font-extrabold">{bar.score}/100</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        bar.score >= 85 ? 'bg-emerald-500' : bar.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${bar.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Flags */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Quality Checks & Suggestions</h4>
            {validationFlags.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  All automated quality control validations passed with zero critical flags!
                </span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {validationFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                      flag.type === 'ERROR'
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-200'
                        : flag.type === 'WARNING'
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
                        : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/80 text-blue-950 dark:text-blue-200'
                    }`}
                  >
                    {flag.type === 'ERROR' ? (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : flag.type === 'WARNING' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-1">
                      <div className="font-bold">{flag.message}</div>
                      {flag.suggestion && (
                        <div className="text-[11px] opacity-80 leading-relaxed font-normal">
                          <strong>Fix suggestion:</strong> {flag.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-bold transition-all"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
