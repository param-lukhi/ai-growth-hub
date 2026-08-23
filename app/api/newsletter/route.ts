import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(subscribers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email },
      update: { status: 'SUBSCRIBED' },
      create: { email, status: 'SUBSCRIBED' },
    });

    return NextResponse.json(subscriber, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
