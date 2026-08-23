import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(brands);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, logo } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const brand = await db.brand.create({
      data: {
        name,
        slug,
        description: description || '',
        logo: logo || '',
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
