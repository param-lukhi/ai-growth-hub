import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      products,
      blogs,
      pendingComments,
      totalComments,
      users,
      newsletterSubscribers,
      categories,
      brands,
      deals,
      comparisons,
    ] = await Promise.all([
      db.product.count(),
      db.blog.count(),
      db.comment.count({ where: { status: 'PENDING' } }),
      db.comment.count(),
      db.user.count(),
      db.newsletterSubscriber.count(),
      db.category.count(),
      db.brand.count(),
      db.deal.count(),
      db.comparison.count(),
    ]);

    return NextResponse.json({
      products,
      blogs,
      pendingComments,
      totalComments,
      users,
      newsletterSubscribers,
      categories,
      brands,
      deals,
      comparisons,
    });
  } catch (error) {
    console.error('Error fetching admin counts:', error);
    return NextResponse.json({ error: 'Failed to fetch admin counts' }, { status: 500 });
  }
}
