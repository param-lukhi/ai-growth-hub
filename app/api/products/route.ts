import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const statusParam = searchParams.get('status');
    const featured = searchParams.get('featured') === 'true';
    const trending = searchParams.get('trending') === 'true';
    const deal = searchParams.get('deal') === 'true';
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

    if (featured) where.isFeatured = true;
    if (trending) where.isTrending = true;
    if (deal) where.isDeal = true;

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { specifications: { contains: q } },
      ];
    }

    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      brand,
      price,
      images,
      amazonUrl,
      affiliateUrl,
      marketplaces,
      categoryId,
      specifications,
      features,
      pros,
      cons,
      isFeatured,
      isTrending,
      isDeal,
      status,
    } = body;

    if (!name || !slug || !brand || !price || !amazonUrl || !categoryId) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        brand,
        price,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        amazonUrl,
        affiliateUrl: affiliateUrl || amazonUrl,
        marketplaces: typeof marketplaces === 'string' ? marketplaces : JSON.stringify(marketplaces || {}),
        categoryId,
        specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {}),
        features: typeof features === 'string' ? features : JSON.stringify(features || []),
        pros: typeof pros === 'string' ? pros : JSON.stringify(pros || []),
        cons: typeof cons === 'string' ? cons : JSON.stringify(cons || []),
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isDeal: Boolean(isDeal),
        status: status || 'PUBLISHED',
      },
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/deals');

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
