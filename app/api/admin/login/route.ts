import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

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
    let user = null;

    // 2. Try fetching User from database safely without throwing on DB network error
    try {
      user = await db.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (dbError) {
      console.warn('[AUTH] Database lookup warning (falling back to env credentials):', dbError);
    }

    if (user && user.status === 'ACTIVE' && user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(passwordInput, user.password);
      } else {
        // Handle unhashed legacy password
        isPasswordValid = (user.password === passwordInput);
        if (isPasswordValid) {
          const hashedPassword = await bcrypt.hash(passwordInput, 10);
          await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          }).catch(() => {});
        }
      }
    }

    // 3. Fallback: check against environment variable ADMIN_PASSWORD
    if (!isPasswordValid) {
      const envPassword = process.env.ADMIN_PASSWORD || 'Hanumandada@904';
      if (passwordInput === envPassword || passwordInput.trim() === envPassword.trim()) {
        isPasswordValid = true;
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
  } catch (error) {
    console.error('[AUTH] Login handler error:', error);
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
}
