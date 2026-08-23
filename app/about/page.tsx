import React from 'react';
import { ShieldCheck, Search, Scale, FileText, CheckCircle2, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'About Us & Editorial Methodology - TechPulse Reviews',
  description: 'Learn about our research-based review methodology, product evaluation standards, and editorial independence.',
};

export default function AboutPage() {
  const methodologySteps = [
    {
      title: '1. Product & Market Research',
      desc: 'We identify popular consumer electronics, new releases, and high-demand devices across categories to determine what truly matters to shoppers.',
    },
    {
      title: '2. Specification & Feature Analysis',
      desc: 'We break down complex technical spec sheets into clear, practical explanations of what features mean for everyday real-world use.',
    },
    {
      title: '3. Buyer Feedback & Sentiment Aggregation',
      desc: 'We aggregate and analyze thousands of verified buyer reviews to uncover long-term reliability, ergonomics, and common product issues.',
    },
    {
      title: '4. Direct Side-by-Side Comparison',
      desc: 'We compare alternatives within the same price bracket to establish which product offers the strongest value for money.',
    },
    {
      title: '5. Balanced Pros, Cons & Who Should Buy',
      desc: 'Every review highlights both strengths and limitations, explicitly outlining who should buy the product and who should consider alternatives.',
    },
    {
      title: '6. Price Tracking & Marketplace Deals',
      desc: 'We monitor official Amazon catalog pricing and promotions to guide buyers toward current deals without manufacturing false live claims.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600 dark:text-brand-400">
          Our Mission & Promise
        </span>
        <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          About TechPulse Reviews
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          We research product specifications, pricing, user feedback, features, and available market information to help you make smarter, more confident buying decisions.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <Search className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">In-Depth Research</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Our editorial process focuses on deep analysis of technical specifications, industry standards, and authentic user feedback.
          </p>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">Editorial Independence</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Brands cannot buy positive reviews or modify our editorial opinions. We evaluate products fairly based on real consumer value.
          </p>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <Scale className="w-8 h-8 text-amber-500" />
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">Transparent Comparisons</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We clearly present side-by-side spec differences and alternative recommendations so you can choose what best fits your budget.
          </p>
        </div>
      </div>

      {/* Editorial Methodology Section */}
      <section className="space-y-6">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Our Review & Research Methodology
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            How we analyze tech products, formulate buying guides, and maintain editorial transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {methodologySteps.map((step, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                <span>{step.title}</span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-6">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Honest Distinction Box */}
      <div className="bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/50 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-brand-900 dark:text-brand-300 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Research-Based Reviews vs Physical Testing</span>
        </h3>
        <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
          At TechPulse, we are committed to complete transparency. Unless an article explicitly states that physical evaluation was conducted by our team, our articles and comparisons represent comprehensive <strong>research-based buying guides</strong> developed through rigorous specification analysis, verified user feedback synthesis, and marketplace data.
        </p>
      </div>
    </div>
  );
}
