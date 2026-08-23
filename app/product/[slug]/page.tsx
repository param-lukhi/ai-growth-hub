import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import AmazonButton from '@/components/AmazonButton';
import RegionalPrice from '@/components/RegionalPrice';
import ProsCons from '@/components/ProsCons';
import BlogCard from '@/components/BlogCard';
import ProductCard from '@/components/ProductCard';
import ReviewScores from '@/components/ReviewScores';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import SocialShare from '@/components/SocialShare';
import AffiliateDisclosureNotice from '@/components/AffiliateDisclosureNotice';
import ProductAlternatives from '@/components/ProductAlternatives';
import AdBanner from '@/components/AdBanner';
import { safeJsonParse } from '@/lib/utils';
import { CheckCircle2, ChevronRight, ShieldCheck, Tag } from 'lucide-react';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogweb904.vercel.app';
  const pageUrl = `${siteUrl}/product/${product.slug}`;
  const title = `${product.name} - Price, Specs & Alternatives | TechPulse`;
  const description = `Full technical specifications, feature breakdown, and Amazon pricing for ${product.name} by ${product.brand}.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, blogs: { where: { status: 'PUBLISHED' } } },
  });

  if (!product) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogweb904.vercel.app';
  const pageUrl = `${siteUrl}/product/${product.slug}`;

  const images = safeJsonParse<string[]>(product.images, []);
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
  const rawSpecs = safeJsonParse<Record<string, string>>(product.specifications, {});
  const ratingScores = rawSpecs._ratingScores ? safeJsonParse(rawSpecs._ratingScores, null) || rawSpecs._ratingScores : null;
  const priceHistoryData = rawSpecs._priceHistory ? safeJsonParse(rawSpecs._priceHistory, null) || rawSpecs._priceHistory : null;
  const specifications = { ...rawSpecs };
  delete specifications._ratingScores;
  delete specifications._priceHistory;

  const features = safeJsonParse<string[]>(product.features, []);
  const pros = safeJsonParse<string[]>(product.pros, []);
  const cons = safeJsonParse<string[]>(product.cons, []);

  // Fetch related products
  const relatedProducts = await db.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: 'PUBLISHED' },
    take: 4,
  });

  const jsonLd = generateProductSchema({
    name: product.name,
    description: features.join(', ') || product.name,
    image: mainImage,
    brand: product.brand,
    price: product.price,
    url: pageUrl,
  });

  const breadcrumbLd = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: product.category.name, url: `${siteUrl}/category/${product.category.slug}` },
    { name: product.name, url: pageUrl },
  ]);

  return (
    <div className="pb-16 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-6 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400">Home</Link>
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <Link href={`/category/${product.category.slug}`} className="hover:text-brand-600 dark:hover:text-brand-400">
          {product.category.name}
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery & Buying Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        
        {/* Gallery */}
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center min-h-[400px]">
          <img
            src={mainImage}
            alt={product.name}
            className="max-h-[380px] object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Meta & Buy CTA */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              <span>{product.brand}</span>
              <span>•</span>
              <span className="text-brand-600 dark:text-brand-400">{product.category.name}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white leading-tight mb-4">
              {product.name}
            </h1>

            <div className="mb-6">
              <RegionalPrice
                basePrice={product.price}
                amazonUrl={product.amazonUrl}
                affiliateUrl={product.affiliateUrl}
                marketplaces={product.marketplaces}
                className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white"
                showFlag={true}
                showFallbackBadge={true}
              />
            </div>

            {features.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Key Highlights</h3>
                <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <AmazonButton
                url={product.affiliateUrl || product.amazonUrl}
                price={product.price}
                productId={product.id}
                marketplaces={product.marketplaces}
                size="lg"
                className="w-full flex-1"
                text="Check Price on Amazon"
              />
              {product.blogs.length > 0 && (
                <Link
                  href={`/blog/${product.blogs[0].slug}`}
                  className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
                >
                  <span>📖 Read Full Guide</span>
                </Link>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Amazon Official Merchant Link</span>
              </div>
              <SocialShare title={product.name} />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Affiliate Disclosure */}
      <AffiliateDisclosureNotice compact className="mb-12" />

      {/* AdSense Placement */}
      <AdBanner slot="product-top-ad" format="horizontal" />

      {/* Review Scores Breakdown */}
      <ReviewScores scoresData={ratingScores || undefined} />

      {/* Price History */}
      <PriceHistoryChart currentPrice={product.price} historyData={priceHistoryData || undefined} />

      {/* Specifications Table */}
      {Object.keys(specifications).length > 0 && (
        <section className="my-12">
          <div className="mb-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Detailed Specifications
            </span>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
              Technical Specifications & Features
            </h2>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {Object.entries(specifications).map(([k, v]) => (
              <div key={k} className="bg-white dark:bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 flex justify-between gap-3 min-w-0">
                <span className="text-neutral-500 dark:text-neutral-400 font-medium shrink-0">{k}:</span>
                <span className="font-bold text-neutral-900 dark:text-white text-right min-w-0 break-words">{v}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pros & Cons */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="my-12">
          <ProsCons pros={pros} cons={cons} />
        </div>
      )}

      {/* Smart Alternatives */}
      {relatedProducts.length > 0 && (
        <ProductAlternatives
          currentProductId={product.id}
          currentProductName={product.name}
          alternatives={relatedProducts}
        />
      )}

      {/* Related Blogs for this Product */}
      {product.blogs.length > 0 && (
        <section className="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-6">
            Guides & Reviews for this Product
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.blogs.map((b) => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
