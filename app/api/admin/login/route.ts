import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {

  try {
    const body = await request.json();
    const emailInput = body.email || body.username || '';
    const passwordInput = body.password || '';

    if (!emailInput || !passwordInput) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const normalizedEmail = String(emailInput).trim().toLowerCase();
    const allowedAdminEmail = (process.env.ADMIN_EMAIL || 'lukhiparam904@gmail.com').trim().toLowerCase();

    // 1. Strict Email check: Only lukhiparam904@gmail.com (or process.env.ADMIN_EMAIL) is allowed to log in
    if (normalizedEmail !== allowedAdminEmail) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    let isPasswordValid = false;
    let user: any = null;

    // 2. Check environment variable ADMIN_PASSWORD first (fast path)
    const envPassword = process.env.ADMIN_PASSWORD || 'Hanumandada@904';
    if (passwordInput === envPassword || passwordInput.trim() === envPassword.trim()) {
      isPasswordValid = true;
    }

    // 3. Fallback: Try DB lookup only if env password didn't match and Firebase credentials exist
    if (!isPasswordValid && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });
      } catch (dbError) {
        console.warn('[AUTH] Database lookup warning:', dbError);
      }

      if (user && user.status === 'ACTIVE' && user.password) {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          isPasswordValid = await bcrypt.compare(passwordInput, user.password);
        } else {
          isPasswordValid = (user.password === passwordInput);
        }
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        name: user?.name || 'Param Lukhi',
        email: normalizedEmail,
        role: 'ADMIN',
      },
    });

    // 4. Set secure HTTP-only session cookie
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'authenticated_token_secret';
    response.cookies.set('admin_session', sessionSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[AUTH] Login handler error:', error);
    return NextResponse.json({ error: 'Internal server error during authentication.' }, { status: 500 });
  }
}

