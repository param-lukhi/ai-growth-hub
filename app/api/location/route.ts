import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Check Vercel, Cloudflare, or standard proxy headers
    const headers = request.headers;
    const country =
      headers.get('x-vercel-ip-country') ||
      headers.get('cf-ipcountry') ||
      headers.get('x-country') ||
      headers.get('x-visitor-country');

    if (country && country.length === 2 && country !== 'XX') {
      return NextResponse.json({ country: country.toUpperCase(), source: 'header' });
    }

    // 2. Fallback IP Geo lookup for local development or non-proxy environments
    const clientIp =
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers.get('x-real-ip') ||
      '';

    if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.country_code) {
            return NextResponse.json({
              country: geoData.country_code.toUpperCase(),
              source: 'ip-api',
            });
          }
        }
      } catch (e) {
        // Ignore timeout or geo API errors
      }
    }

    return NextResponse.json({ country: 'US', source: 'default' });
  } catch (error) {
    return NextResponse.json({ country: 'US', source: 'fallback' });
  }
}
