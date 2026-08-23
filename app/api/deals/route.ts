import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deals = await db.deal.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(deals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, discount, originalPrice, dealPrice, dealUrl, badge, productId, status } = body;

    if (!title || !dealPrice || !dealUrl) {
      return NextResponse.json({ error: 'Title, deal price, and deal URL are required' }, { status: 400 });
    }

    const deal = await db.deal.create({
      data: {
        title,
        discount: discount || '',
        originalPrice: originalPrice || dealPrice,
        dealPrice,
        dealUrl,
        badge: badge || 'HOT',
        productId: productId || null,
        status: status || 'PUBLISHED',
      },
    });

    revalidatePath('/deals');
    revalidatePath('/');

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
