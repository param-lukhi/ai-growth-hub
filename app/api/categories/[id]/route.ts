import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const category = await db.category.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: { products: true, blogs: true, subcategories: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, slug, description, icon, image, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and Slug are required' }, { status: 400 });
    }

    // Check category exists
    const existing = await db.category.findUnique({
      where: { id },
      include: { subcategories: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    let validParentId: string | null = null;
    if (parentId && parentId.trim() !== '') {
      if (parentId === id) {
        return NextResponse.json({ error: 'A category cannot be its own parent' }, { status: 400 });
      }

      // Check if the proposed parent is one of this category's existing subcategories
      const isChild = existing.subcategories?.some((sub: any) => sub.id === parentId);
      if (isChild) {
        return NextResponse.json({ error: 'Cannot set a subcategory as parent' }, { status: 400 });
      }

      const parentCat = await db.category.findUnique({ where: { id: parentId } });
      if (!parentCat) {
        return NextResponse.json({ error: 'Selected parent category does not exist' }, { status: 400 });
      }

      validParentId = parentId;
    }

    const updated = await db.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
        icon: icon !== undefined ? (icon ? icon.trim() : null) : existing.icon,
        image: image !== undefined ? (image ? image.trim() : null) : existing.image,
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

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const existing = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, blogs: true, subcategories: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
