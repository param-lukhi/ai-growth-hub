'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, XCircle, CheckCircle2, RefreshCw, X, Globe,
  Database, Sparkles, Search, ShoppingBag, Radio, Share2, Send
} from 'lucide-react';

interface DiagnosticCheck {
  category: string;
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  details?: string;
}

interface AgentTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  websiteName: string;
}

export default function AgentTestModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  websiteName
}: AgentTestModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [checks, setChecks] = useState<DiagnosticCheck[]>([]);
  const [overallSuccess, setOverallSuccess] = useState<boolean | null>(null);

  const runTest = async () => {
    try {
      setIsRunning(true);
      const res = await fetch(`/api/saas/agents/${agentId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TEST_AGENT' })
      });
      const data = await res.json();
      if (data.success && data.diagnostics) {
        setChecks(data.diagnostics.checks || []);
        setOverallSuccess(data.diagnostics.overallSuccess);
      }
    } catch (e) {
      console.error('Failed to run agent diagnostics:', e);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && agentId) {
      runTest();
    }
  }, [isOpen, agentId]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'WEBSITE': return <Globe className="w-4 h-4 text-blue-500" />;
      case 'DATABASE': return <Database className="w-4 h-4 text-emerald-500" />;
      case 'AI_MODEL': return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case 'SEO': return <Search className="w-4 h-4 text-amber-500" />;
      case 'AFFILIATE': return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'SEARCH_CONSOLE': return <Radio className="w-4 h-4 text-orange-500" />;
      case 'SOCIAL': return <Share2 className="w-4 h-4 text-pink-500" />;
      case 'PUBLISHING': return <Send className="w-4 h-4 text-brand-600" />;
      default: return <ShieldCheck className="w-4 h-4 text-neutral-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                Agent Diagnostic Verification
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Testing {agentName} connected to <strong>{websiteName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isRunning ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                Running Comprehensive System Diagnostics...
              </p>
              <p className="text-xs text-neutral-400">
                Checking website connectivity, database tenant isolation, AI rules, affiliate tags, and SEO engines.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Overall Summary Banner */}
              {overallSuccess !== null && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  overallSuccess
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                }`}>
                  <div className="flex items-center gap-3">
                    {overallSuccess ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-extrabold text-sm">
                        {overallSuccess ? 'Agent Fully Configured & Operational' : 'Attention Required on Some Checks'}
                      </div>
                      <div className="text-xs opacity-80">
                        {overallSuccess ? 'All core systems and data isolation boundaries verified.' : 'Review the warnings below to complete setup.'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={runTest}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-extrabold hover:bg-neutral-50 flex items-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-test</span>
                  </button>
                </div>
              )}

              {/* Diagnostic Checklist */}
              <div className="space-y-2.5">
                {checks.map((check, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0 mt-0.5">
                        {getCategoryIcon(check.category)}
                      </div>
                      <div>
                        <div className="font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                          <span>{check.label}</span>
                        </div>
                        <div className="text-neutral-600 dark:text-neutral-300 mt-0.5 font-medium">
                          {check.message}
                        </div>
                        {check.details && (
                          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-mono">
                            {check.details}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {check.status === 'PASS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-extrabold text-[11px]">
                          ✓ Connected
                        </span>
                      )}
                      {check.status === 'WARN' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100/70 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-extrabold text-[11px]">
                          ⚠ Action Needed
                        </span>
                      )}
                      {check.status === 'FAIL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100/70 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-extrabold text-[11px]">
                          ✕ Error
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-100 text-xs font-extrabold transition-all"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
}
