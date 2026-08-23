import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ProsConsProps {
  pros: string[];
  cons: string[];
}

export default function ProsCons({ pros, cons }: ProsConsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
      {/* Pros Card */}
      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 font-extrabold text-emerald-900 text-base">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>PROS (What We Loved)</span>
        </div>
        <ul className="space-y-2.5 text-sm text-emerald-950">
          {pros.map((pro, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons Card */}
      <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 font-extrabold text-rose-900 text-base">
          <XCircle className="w-5 h-5 text-rose-600" />
          <span>CONS (Things to Keep in Mind)</span>
        </div>
        <ul className="space-y-2.5 text-sm text-rose-950">
          {cons.map((con, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
