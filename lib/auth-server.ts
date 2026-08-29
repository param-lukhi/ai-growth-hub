import { NextResponse } from 'next/server';

export interface AuthValidationResult {
  authorized: boolean;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  error?: string;
}

const ADMIN_USER = {
  name: 'Param Lukhi',
  email: 'lukhiparam904@gmail.com',
  role: 'ADMIN'
};

/**
 * Validates whether the incoming API request is from an authenticated admin.
 * Checks HTTP cookies (admin_session) and Authorization Bearer header.
 *
 * IMPORTANT: If ADMIN_SESSION_SECRET env variable is NOT set, the admin panel
 * operates in open-access mode (no auth required). Set ADMIN_SESSION_SECRET
 * in Vercel env vars to enable session-based protection.
 */
export function validateAdminAuth(request?: Request): AuthValidationResult {
  const expectedSecret = process.env.ADMIN_SESSION_SECRET;

  // --- Open-access mode: no secret configured ---
  // If ADMIN_SESSION_SECRET is not set, allow all requests through.
  // This is intentional for single-owner admin panels without a login system.
  if (!expectedSecret) {
    return { authorized: true, user: ADMIN_USER };
  }

  const adminEmail = (process.env.ADMIN_EMAIL || ADMIN_USER.email).trim().toLowerCase();
  const user = { name: ADMIN_USER.name, email: adminEmail, role: 'ADMIN' };

  // 1. Try cookies via next/headers (App Router Server context)
  try {
    // Dynamic import to avoid crash when called outside App Router context
    const { cookies } = require('next/headers');
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('admin_session')?.value;
    if (sessionCookie && sessionCookie === expectedSecret) {
      return { authorized: true, user };
    }
  } catch {
    // cookies() is not available in this context — fallback to request headers
  }

  // 2. Check Request headers if available
  if (request) {
    // Check raw Cookie header
    try {
      const cookieHeader = request.headers.get('cookie') || '';
      if (cookieHeader) {
        const match = cookieHeader.match(/admin_session=([^;]+)/);
        if (match && decodeURIComponent(match[1]) === expectedSecret) {
          return { authorized: true, user };
        }
      }
    } catch { /* ignore */ }

    // Check Authorization: Bearer token
    try {
      const authHeader = request.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token === expectedSecret) {
          return { authorized: true, user };
        }
      }
    } catch { /* ignore */ }
  }

  return {
    authorized: false,
    error: 'Unauthorized. Admin session is missing or invalid.'
  };
}

/**
 * Returns a standard JSON 401 Unauthorized response.
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { success: false, error: message },
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
