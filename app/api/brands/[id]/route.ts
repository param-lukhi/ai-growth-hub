import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.brand.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
