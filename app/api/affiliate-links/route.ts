import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const links = await db.affiliateLink.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch affiliate links' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, originalUrl, cloakedUrl, category } = body;

    if (!title || !originalUrl || !cloakedUrl) {
      return NextResponse.json({ error: 'Title, original URL, and cloaked URL are required' }, { status: 400 });
    }

    const link = await db.affiliateLink.create({
      data: {
        title,
        originalUrl,
        cloakedUrl,
        category: category || 'General',
        clicks: 0,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create affiliate link' }, { status: 500 });
  }
}
