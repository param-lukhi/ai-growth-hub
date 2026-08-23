import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const comparisons = await db.comparison.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const populated = await Promise.all(
      comparisons.map(async (c) => {
        const p1 = await db.product.findUnique({ where: { id: c.product1Id } });
        const p2 = await db.product.findUnique({ where: { id: c.product2Id } });
        return {
          ...c,
          product1: p1,
          product2: p2,
        };
      })
    );

    return NextResponse.json(populated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comparisons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, summary, product1Id, product2Id, winnerId } = body;

    if (!title || !slug || !product1Id || !product2Id) {
      return NextResponse.json({ error: 'Title, slug, product1, and product2 are required' }, { status: 400 });
    }

    const comparison = await db.comparison.create({
      data: {
        title,
        slug,
        summary: summary || '',
        product1Id,
        product2Id,
        winnerId: winnerId || product1Id,
        status: 'PUBLISHED',
      },
    });

    revalidatePath('/comparisons');

    return NextResponse.json(comparison, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comparison' }, { status: 500 });
  }
}
