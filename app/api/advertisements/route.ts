import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ads = await db.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch advertisements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, location, image, targetUrl, active } = body;

    if (!title || !image || !targetUrl) {
      return NextResponse.json({ error: 'Title, image URL, and target URL are required' }, { status: 400 });
    }

    const ad = await db.advertisement.create({
      data: {
        title,
        location: location || 'HEADER',
        image,
        targetUrl,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create advertisement' }, { status: 500 });
  }
}
