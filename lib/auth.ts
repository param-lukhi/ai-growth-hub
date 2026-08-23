import { cookies } from 'next/headers';

export function isAuthorizedAdmin(): boolean {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  const expectedSecret = process.env.ADMIN_SESSION_SECRET || 'authenticated_token_secret';
  return Boolean(sessionToken && sessionToken === expectedSecret);
}
