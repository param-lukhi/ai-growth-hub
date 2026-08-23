import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import BlogCard from '@/components/BlogCard';
import CategoryCard from '@/components/CategoryCard';
import FaqAccordion from '@/components/FaqAccordion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award, Flame, Scale, Star, CheckCircle2, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  try {
    const categories = await db.category.findMany({ take: 16, orderBy: { name: 'asc' } }).catch(() => []);
    const featuredProducts = await db.product.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      include: { category: true },
      take: 4,
    }).catch(() => []);
    const trendingProducts = await db.product.findMany({
      where: { status: 'PUBLISHED', isTrending: true },
      include: { category: true },
      take: 4,
    }).catch(() => []);
    const dealProducts = await db.product.findMany({
      where: { status: 'PUBLISHED', isDeal: true },
      include: { category: true },
      take: 4,
    }).catch(() => []);
    const latestBlogs = await db.blog.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }).catch(() => []);

    const settingsList = await db.setting.findMany().catch(() => []);
    const settings: Record<string, string> = {};
    if (Array.isArray(settingsList)) {
      settingsList.forEach((s) => {
        settings[s.key] = s.value;
      });
    }

    return {
      categories: categories || [],
      featuredProducts: featuredProducts || [],
      trendingProducts: trendingProducts || [],
      dealProducts: dealProducts || [],
      latestBlogs: latestBlogs || [],
      settings: settings || {},
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      categories: [],
      featuredProducts: [],
      trendingProducts: [],
      dealProducts: [],
      latestBlogs: [],
      settings: {},
    };
  }
}

export default async function HomePage() {
  const { categories, featuredProducts, trendingProducts, dealProducts, latestBlogs, settings } = await getData();

  const heroTitle = settings.hero_title || 'Research-Based Product Reviews & Buying Guides';
  const heroSubtitle = settings.hero_subtitle || 'We research product specifications, pricing, user feedback, features, and available product information to help you make smarter buying decisions.';
  const heroButtonText = settings.hero_button_text || 'Browse Latest Reviews';

  const homeFaqs = [
    {
      question: 'How does TechPulse research and evaluate products?',
      answer: 'Our editorial team thoroughly analyzes official technical specifications, user feedback, verified buyer sentiment, build quality data, and price-to-performance metrics to formulate balanced, research-driven buying guides and reviews.',
    },
    {
      question: 'How are product prices and deals determined?',
      answer: 'We research and track official Amazon catalog prices and regional marketplace promotions. Because merchant prices fluctuate regularly, always verify final pricing and warranty details directly on Amazon at checkout.',
    },
    {
      question: 'Does TechPulse accept paid sponsorships for review scores?',
      answer: 'No. We maintain strict editorial independence. Brand sponsorships or affiliate relationships never dictate our ratings, product selection, or review conclusions.',
    },
  ];

  const testimonials = [
    {
      quote: 'TechPulse saved me from buying the wrong laptop! Their side-by-side comparison table was clear and easy to understand.',
      author: 'Alex Rivera',
      role: 'Verified Reader',
    },
    {
      quote: 'The regional price details for Amazon India were very helpful. Found the right tech gear within my exact budget.',
      author: 'Priya Sharma',
      role: 'Tech Enthusiast',
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-white dark:bg-neutral-950">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-1/4 w-80 h-80 bg-amazon-orange/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>Research-Based & Editorial Independence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {heroSubtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#latest-reviews"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold text-sm transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-500/50 active:scale-95"
            >
              {heroButtonText}
            </Link>

            <Link
              href="/deals"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800/90 text-neutral-100 font-semibold text-sm border border-neutral-700/80 shadow-md backdrop-blur-xs transition-all flex items-center justify-center gap-2 hover:border-amber-500/40"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Explore Top Deals</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-10 border-t border-neutral-800/80 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-neutral-400">
            <div className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Specification & Feature Analysis</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No Sponsored Bias</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Curated Amazon Recommendations</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Browse by Category</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-sans tracking-tight">
              Popular Product Review Hubs
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Select a category to view buying guides, feature breakdowns, and research-backed reviews.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. Top Amazon Deals Section */}
      {dealProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500 text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                    Today&apos;s Top Deals & Discounts
                  </h2>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Handpicked price drops and notable product discounts</p>
                </div>
              </div>

              <Link
                href="/deals"
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View All Deals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Head-to-Head Comparison Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-800 text-brand-200 text-xs font-extrabold uppercase">
              <Scale className="w-3.5 h-3.5 text-brand-300" /> Comparison Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Compare Any Two Devices Side-by-Side
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Unsure between two devices? Select any two smartphones, laptops, or earbuds to compare detailed specs, features, pros, cons, and merchant links.
            </p>
          </div>
          <Link
            href="/comparisons"
            className="px-8 py-3.5 rounded-2xl bg-white text-neutral-900 font-extrabold text-sm hover:bg-neutral-100 transition-colors shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Launch Comparison Engine</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Latest Product Reviews */}
      <section id="latest-reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sans">
              Latest Product Reviews & Guides
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Detailed evaluation of specifications, pros, cons, and user value</p>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </section>

      {/* 6. Featured Products Showcase */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sans">
                Featured Product Recommendations
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Our curated product picks across categories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Reader Feedback */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Reader Feedback
            </span>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
              Feedback from Our Readers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="text-xs">
                  <strong className="text-neutral-900 dark:text-white block">{t.author}</strong>
                  <span className="text-neutral-400">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Learn more about our editorial methodology and affiliate disclosure standards.
          </p>
        </div>
        <FaqAccordion faqs={homeFaqs} />
      </section>
    </div>
  );
}
