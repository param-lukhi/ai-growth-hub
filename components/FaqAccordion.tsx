'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="my-10 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-brand-600" />
        <h3 className="text-xl font-bold text-neutral-900 font-sans">
          Frequently Asked Questions
        </h3>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIdx === index;
          return (
            <div
              key={index}
              className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-neutral-900 font-semibold text-sm hover:text-brand-600 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3 bg-neutral-50/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
