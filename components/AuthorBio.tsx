import React from 'react';
import { UserCheck, ShieldCheck } from 'lucide-react';

interface AuthorBioProps {
  name?: string;
  bio?: string;
  role?: string;
  avatar?: string;
  className?: string;
}

export default function AuthorBio({
  name = 'TechPulse Editorial Team',
  bio = 'Our editorial research team specializes in consumer electronics, product teardowns, specification analysis, and market comparison guides to help buyers find the best tech within their budget.',
  role = 'Editorial Research & Buying Guide Specialist',
  avatar,
  className = '',
}: AuthorBioProps) {
  const initial = name.charAt(0).toUpperCase() || 'T';

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-brand-500/20">
              {initial}
            </div>
          )}
          <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-lg bg-emerald-500 text-white shadow-xs" title="Verified Editorial Contributor">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
              {name}
            </h3>
            <span className="text-[11px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800 px-2 py-0.5 rounded-md">
              {role}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
            {bio}
          </p>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Adheres to TechPulse Research & Editorial Standards</span>
          </div>
        </div>
      </div>
    </div>
  );
}
