import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOP_LEVEL_ADMIN_ROUTES: Record<string, string> = {
  '/dashboard': '/admin/dashboard',
  '/websites': '/admin/websites',
  '/agents': '/admin/agents',
  '/agents/new': '/admin/agents/new',
  '/content': '/admin/content',
  '/calendar': '/admin/calendar',
  '/seo': '/admin/seo',
  '/search-console': '/admin/search-console',
  '/affiliate': '/admin/affiliate',
  '/analytics': '/admin/analytics',
  '/automation': '/admin/automation',
  '/integrations': '/admin/integrations',
  '/settings': '/admin/settings',
  '/login': '/admin/login'
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('admin_session')?.value;
  const expectedSecret = process.env.ADMIN_SESSION_SECRET || 'authenticated_token_secret';
  const isAuthenticated = Boolean(sessionToken && sessionToken === expectedSecret);

  // 1. Rewrite top-level aliases to /admin/*
  if (TOP_LEVEL_ADMIN_ROUTES[pathname]) {
    const targetAdminPath = TOP_LEVEL_ADMIN_ROUTES[pathname];

    if (targetAdminPath === '/admin/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.rewrite(new URL('/admin/login', request.url));
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', targetAdminPath);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.rewrite(new URL(targetAdminPath, request.url));
  }

  // Handle dynamic /agents/:id/edit top level
  if (pathname.startsWith('/agents/') && pathname.endsWith('/edit')) {
    const targetAdminPath = `/admin${pathname}`;
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', targetAdminPath);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.rewrite(new URL(targetAdminPath, request.url));
  }

  // Handle dynamic /social/:platform top level
  if (pathname.startsWith('/social/')) {
    const targetAdminPath = `/admin${pathname}`;
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', targetAdminPath);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.rewrite(new URL(targetAdminPath, request.url));
  }

  // 2. Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and trying to access /admin/login, redirect to /admin/dashboard
  if (pathname === '/admin/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Redirect /admin base route to dashboard if authenticated
  if (pathname === '/admin' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard',
    '/websites',
    '/agents',
    '/agents/:path*',
    '/content',
    '/calendar',
    '/seo',
    '/search-console',
    '/affiliate',
    '/analytics',
    '/automation',
    '/integrations',
    '/settings',
    '/social/:path*',
    '/admin',
    '/admin/:path*'
  ],
};
