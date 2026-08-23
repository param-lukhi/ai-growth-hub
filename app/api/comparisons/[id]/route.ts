import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.comparison.delete({ where: { id: params.id } });
    revalidatePath('/comparisons');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comparison' }, { status: 500 });
  }
}
