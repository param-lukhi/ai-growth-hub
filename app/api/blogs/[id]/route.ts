import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const blog = await db.blog.findUnique({
      where: { id: params.id },
      include: { category: true, product: true },
    });

    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    // Clean fields that should not be in update object
    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.category;
    delete updateData.product;
    delete updateData.comments;

    if (typeof updateData.specifications === 'object') updateData.specifications = JSON.stringify(updateData.specifications);
    if (typeof updateData.features === 'object') updateData.features = JSON.stringify(updateData.features);
    if (typeof updateData.pros === 'object') updateData.pros = JSON.stringify(updateData.pros);
    if (typeof updateData.cons === 'object') updateData.cons = JSON.stringify(updateData.cons);
    if (typeof updateData.faqs === 'object') updateData.faqs = JSON.stringify(updateData.faqs);
    if (typeof updateData.tags === 'object') updateData.tags = JSON.stringify(updateData.tags);

    const updatedBlog = await db.blog.update({
      where: { id: params.id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${updatedBlog.slug}`);

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
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
    delete updateData.product;
    delete updateData.comments;

    if (typeof updateData.specifications === 'object') updateData.specifications = JSON.stringify(updateData.specifications);
    if (typeof updateData.features === 'object') updateData.features = JSON.stringify(updateData.features);
    if (typeof updateData.pros === 'object') updateData.pros = JSON.stringify(updateData.pros);
    if (typeof updateData.cons === 'object') updateData.cons = JSON.stringify(updateData.cons);
    if (typeof updateData.faqs === 'object') updateData.faqs = JSON.stringify(updateData.faqs);
    if (typeof updateData.tags === 'object') updateData.tags = JSON.stringify(updateData.tags);

    const updatedBlog = await db.blog.update({
      where: { id: params.id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${updatedBlog.slug}`);

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to patch blog' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const blog = await db.blog.findUnique({ where: { id: params.id } });
    await db.blog.delete({ where: { id: params.id } });

    revalidatePath('/');
    revalidatePath('/blog');
    if (blog) revalidatePath(`/blog/${blog.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
