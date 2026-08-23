import { NextResponse } from 'next/server';
import { searchProductMatches } from '@/lib/product-research';
import { getMarketplaceAdapter } from '@/lib/marketplaces';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, url } = body;

    if (!query && !url) {
      return NextResponse.json(
        { error: 'Please provide a search keyword or product URL' },
        { status: 400 }
      );
    }

    const searchTerm = query || url;
    const adapter = getMarketplaceAdapter(searchTerm);
    const matches = await adapter.searchProducts(searchTerm, 3);

    return NextResponse.json({
      success: true,
      query: searchTerm,
      marketplace: adapter.marketplace,
      marketplaceName: adapter.name,
      matches,
    });
  } catch (error: any) {
    console.error('Search matches API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to search for product matches' },
      { status: 500 }
    );
  }
}
