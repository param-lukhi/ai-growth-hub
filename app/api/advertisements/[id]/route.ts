import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await db.advertisement.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update advertisement' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.advertisement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete advertisement' }, { status: 500 });
  }
}
