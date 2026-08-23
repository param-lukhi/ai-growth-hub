import { NextResponse } from 'next/server';
import { rollbackArticleVersion } from '@/lib/saas/publishing-engine';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json({ success: false, error: 'versionId is required.' }, { status: 400 });
    }

    const result = await rollbackArticleVersion(params.id, versionId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Article successfully restored to previous version.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
