import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const dynamicBaseUrl = host ? `${proto}://${host}` : null;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || dynamicBaseUrl || 'https://blogweb904.vercel.app').replace(/\/$/, '');

  // 1. Fetch live published blogs, products, and categories
  const [blogs, products, categories] = await Promise.all([
    db.blog.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    db.product.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    db.category.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  // 2. Define canonical public static pages with appropriate priorities
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/blog', priority: '0.9', changefreq: 'daily' },
    { path: '/products', priority: '0.9', changefreq: 'daily' },
    { path: '/comparisons', priority: '0.8', changefreq: 'weekly' },
    { path: '/deals', priority: '0.8', changefreq: 'daily' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { path: '/terms', priority: '0.5', changefreq: 'yearly' },
    { path: '/affiliate-disclosure', priority: '0.6', changefreq: 'monthly' },
    { path: '/cookie-policy', priority: '0.4', changefreq: 'yearly' },
    { path: '/refund-policy', priority: '0.4', changefreq: 'yearly' },
  ];

  // Helper to format ISO date to W3C datetime (YYYY-MM-DDThh:mm:ssTZD)
  const formatDate = (date: Date) => {
    try {
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  // Build unique XML URL set
  const urlEntries: string[] = [];

  // Static Pages
  staticPages.forEach((page) => {
    urlEntries.push(`  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  });

  // Category Hubs
  categories.forEach((cat) => {
    if (cat.slug) {
      urlEntries.push(`  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <lastmod>${formatDate(cat.updatedAt)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  });

  // Published Blog Articles
  blogs.forEach((b) => {
    if (b.slug) {
      urlEntries.push(`  <url>
    <loc>${baseUrl}/blog/${b.slug}</loc>
    <lastmod>${formatDate(b.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
    }
  });

  // Published Products
  products.forEach((p) => {
    if (p.slug) {
      urlEntries.push(`  <url>
    <loc>${baseUrl}/product/${p.slug}</loc>
    <lastmod>${formatDate(p.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

  return new NextResponse(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60',
    },
  });
}
