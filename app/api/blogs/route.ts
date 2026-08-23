import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const statusParam = searchParams.get('status');
    const q = searchParams.get('q');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const where: any = {};
    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam;
    } else if (!statusParam) {
      where.status = 'PUBLISHED';
    }

    if (categorySlug) {
      const cat = await db.category.findUnique({ where: { slug: categorySlug } });
      if (cat) where.categoryId = cat.id;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
        { metaDescription: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    const blogs = await db.blog.findMany({
      where,
      include: { category: true, product: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      metaTitle,
      metaDescription,
      featuredImage,
      content,
      specifications,
      features,
      pros,
      cons,
      faqs,
      conclusion,
      amazonUrl,
      affiliateUrl,
      categoryId,
      productId,
      tags,
      status,
    } = body;

    if (!title || !slug || !content || !categoryId || !amazonUrl) {
      return NextResponse.json({ error: 'Missing required blog fields' }, { status: 400 });
    }

    const blog = await db.blog.create({
      data: {
        title,
        slug,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || '',
        featuredImage: featuredImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
        content,
        specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {}),
        features: typeof features === 'string' ? features : JSON.stringify(features || []),
        pros: typeof pros === 'string' ? pros : JSON.stringify(pros || []),
        cons: typeof cons === 'string' ? cons : JSON.stringify(cons || []),
        faqs: typeof faqs === 'string' ? faqs : JSON.stringify(faqs || []),
        conclusion: conclusion || '',
        amazonUrl,
        affiliateUrl: affiliateUrl || amazonUrl,
        categoryId,
        productId: productId || null,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        status: status || 'PUBLISHED',
      },
    });

    revalidatePath('/');
    revalidatePath('/blog');

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
