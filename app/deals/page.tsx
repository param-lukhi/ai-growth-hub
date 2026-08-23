import React from 'react';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Today\'s Best Amazon Deals & Price Drops - TechPulse',
  description: 'Handpicked Amazon tech deals, price drops, and discounts updated daily.',
};

export default async function DealsPage() {
  const deals = await db.product.findMany({
    where: { status: 'PUBLISHED', isDeal: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  return (
    <div className="pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-500 text-white rounded-2xl">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900">Today's Amazon Deals</h1>
          <p className="text-neutral-500 text-sm">Top handpicked discounts and price drops across Amazon.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {deals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
