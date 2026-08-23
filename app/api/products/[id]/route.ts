import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.category;

    if (typeof updateData.images === 'object') updateData.images = JSON.stringify(updateData.images);
    if (typeof updateData.specifications === 'object') updateData.specifications = JSON.stringify(updateData.specifications);
    if (typeof updateData.features === 'object') updateData.features = JSON.stringify(updateData.features);
    if (typeof updateData.pros === 'object') updateData.pros = JSON.stringify(updateData.pros);
    if (typeof updateData.cons === 'object') updateData.cons = JSON.stringify(updateData.cons);
    if (typeof updateData.marketplaces === 'object') updateData.marketplaces = JSON.stringify(updateData.marketplaces);

    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/product/${updatedProduct.slug}`);
    revalidatePath('/deals');

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.category;

    if (typeof updateData.images === 'object') updateData.images = JSON.stringify(updateData.images);
    if (typeof updateData.specifications === 'object') updateData.specifications = JSON.stringify(updateData.specifications);
    if (typeof updateData.features === 'object') updateData.features = JSON.stringify(updateData.features);
    if (typeof updateData.pros === 'object') updateData.pros = JSON.stringify(updateData.pros);
    if (typeof updateData.cons === 'object') updateData.cons = JSON.stringify(updateData.cons);
    if (typeof updateData.marketplaces === 'object') updateData.marketplaces = JSON.stringify(updateData.marketplaces);

    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/product/${updatedProduct.slug}`);
    revalidatePath('/deals');

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to patch product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await db.product.findUnique({ where: { id: params.id } });
    await db.product.delete({ where: { id: params.id } });

    revalidatePath('/');
    revalidatePath('/products');
    if (product) revalidatePath(`/product/${product.slug}`);
    revalidatePath('/deals');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
