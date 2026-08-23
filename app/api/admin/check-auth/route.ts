import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  const expectedSecret = process.env.ADMIN_SESSION_SECRET || 'authenticated_token_secret';

  if (sessionToken && sessionToken === expectedSecret) {
    return NextResponse.json({
      authenticated: true,
      user: {
        name: 'Param Lukhi',
        email: process.env.ADMIN_EMAIL || 'lukhiparam904@gmail.com',
        role: 'ADMIN',
      },
    });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
