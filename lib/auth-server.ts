import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface AuthValidationResult {
  authorized: boolean;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  error?: string;
}

/**
 * Validates whether the incoming API request is from an authenticated admin.
 * Checks HTTP cookies (admin_session) and Authorization Bearer header.
 */
export function validateAdminAuth(request?: Request): AuthValidationResult {
  const expectedSecret = process.env.ADMIN_SESSION_SECRET || 'authenticated_token_secret';
  const adminEmail = (process.env.ADMIN_EMAIL || 'lukhiparam904@gmail.com').trim().toLowerCase();

  // 1. Check cookies via next/headers
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('admin_session')?.value;
    if (sessionCookie && sessionCookie === expectedSecret) {
      return {
        authorized: true,
        user: {
          name: 'Param Lukhi',
          email: adminEmail,
          role: 'ADMIN'
        }
      };
    }
  } catch (e) {
    // cookies() might fail in certain contexts; proceed to request headers check
  }

  // 2. Check Request headers if available
  if (request) {
    // Check cookie header directly
    const cookieHeader = request.headers.get('cookie') || '';
    if (cookieHeader) {
      const match = cookieHeader.match(/admin_session=([^;]+)/);
      if (match && decodeURIComponent(match[1]) === expectedSecret) {
        return {
          authorized: true,
          user: {
            name: 'Param Lukhi',
            email: adminEmail,
            role: 'ADMIN'
          }
        };
      }
    }

    // Check Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token === expectedSecret) {
        return {
          authorized: true,
          user: {
            name: 'Param Lukhi',
            email: adminEmail,
            role: 'ADMIN'
          }
        };
      }
    }
  }

  return {
    authorized: false,
    error: 'Unauthorized. Admin session is missing or invalid.'
  };
}

/**
 * Returns a standard JSON 401 Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    {
      success: false,
      error: message
    },
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
