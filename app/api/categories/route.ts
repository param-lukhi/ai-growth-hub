import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rootOnly = searchParams.get('rootOnly') === 'true';

    const where = rootOnly ? { parentId: null } : {};

    const categories = await db.category.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        subcategories: {
          select: { id: true, name: true, slug: true, description: true, icon: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            products: true,
            blogs: true,
            subcategories: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, icon, image, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and Slug are required' }, { status: 400 });
    }

    // Verify parentId exists if provided
    let validParentId: string | null = null;
    if (parentId && parentId.trim() !== '') {
      const parentCat = await db.category.findUnique({ where: { id: parentId } });
      if (!parentCat) {
        return NextResponse.json({ error: 'Selected parent category does not exist' }, { status: 400 });
      }
      validParentId = parentId;
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description ? description.trim() : null,
        icon: icon ? icon.trim() : null,
        image: image ? image.trim() : null,
        parentId: validParentId,
      },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: { products: true, blogs: true, subcategories: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

