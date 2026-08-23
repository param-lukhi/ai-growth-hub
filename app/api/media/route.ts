import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const media = await db.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/png';
      const base64DataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

      let publicUrl = base64DataUri;

      // Try writing to local disk (works in local dev, will catch and fallback to data URI on read-only environments like Vercel)
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = `${Date.now()}_${sanitizeName}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        await writeFile(filePath, buffer);
        publicUrl = `/uploads/${uniqueFilename}`;
      } catch (fsErr) {
        // Read-only filesystem (e.g. Vercel Serverless) - publicUrl remains base64DataUri
        console.log('Using Data URI for serverless media storage (read-only filesystem detected).');
      }

      let newMedia: any = null;
      try {
        newMedia = await db.media.create({
          data: {
            filename: file.name,
            url: publicUrl,
            size: file.size,
            mimeType: mimeType,
          },
        });
      } catch (dbErr) {
        console.warn('Media DB record log skipped:', dbErr);
        newMedia = {
          filename: file.name,
          url: publicUrl,
          size: file.size,
          mimeType: mimeType,
        };
      }

      return NextResponse.json(newMedia, { status: 201 });
    } else {
      const body = await req.json();
      const { filename, url, size, mimeType } = body;

      if (!filename || !url) {
        return NextResponse.json({ error: 'Filename and URL are required' }, { status: 400 });
      }

      let newMedia: any = null;
      try {
        newMedia = await db.media.create({
          data: {
            filename,
            url,
            size: size || 102400,
            mimeType: mimeType || 'image/webp',
          },
        });
      } catch (dbErr) {
        newMedia = {
          filename,
          url,
          size: size || 102400,
          mimeType: mimeType || 'image/webp',
        };
      }

      return NextResponse.json(newMedia, { status: 201 });
    }
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save media asset' }, { status: 500 });
  }
}
