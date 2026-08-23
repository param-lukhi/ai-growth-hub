import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, targetId, targetType, path, keyword, referrer } = body;

    const userAgent = request.headers.get('user-agent') || '';

    await db.analytics.create({
      data: {
        eventType: eventType || 'PAGE_VIEW',
        targetId: targetId || null,
        targetType: targetType || null,
        path: path || null,
        keyword: keyword || null,
        referrer: referrer || request.headers.get('referer') || null,
        userAgent,
      },
    });

    // If blog view, increment views counter
    if (eventType === 'PAGE_VIEW' && targetType === 'BLOG' && targetId) {
      await db.blog.update({
        where: { id: targetId },
        data: { views: { increment: 1 } },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 500 });
  }
}
