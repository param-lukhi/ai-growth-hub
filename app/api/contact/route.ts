import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Message must be at least 5 characters long' }, { status: 400 });
    }

    // In a production setup with configured SMTP/Resend/SendGrid, dispatch email here.
    // For now, log server-side contact request securely without exposing secrets
    console.log(`[Contact Form Received] From: ${name} (${email}), Subject: ${subject || 'General Inquiry'}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message. Our editorial team will review your inquiry.',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error processing contact form' }, { status: 500 });
  }
}
