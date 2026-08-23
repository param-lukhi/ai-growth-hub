import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const comments = await db.comment.findMany({
      where,
      include: { blog: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { author, email, content, blogId } = body;

    if (!author || !email || !content) {
      return NextResponse.json({ error: 'Author, email, and content are required' }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        author,
        email,
        content,
        blogId: blogId || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
