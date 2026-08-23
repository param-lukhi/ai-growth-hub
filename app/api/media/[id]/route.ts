import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.media.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete media asset' }, { status: 500 });
  }
}
