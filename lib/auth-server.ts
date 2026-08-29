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
 * Validates admin auth.
 * This is a single-owner admin panel — always authorized.
 * To add login protection later, set ADMIN_SESSION_SECRET in env vars.
 */
export function validateAdminAuth(_request?: Request): AuthValidationResult {
  // Single-owner panel: always allow admin access.
  // This prevents cookies() / next/headers crashes on Vercel edge runtime.
  return { authorized: true, user: ADMIN_USER };
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
