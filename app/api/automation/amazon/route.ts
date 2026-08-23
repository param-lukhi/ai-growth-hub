import { NextResponse } from 'next/server';
import { generateFullProductAndBlog, extractAsin } from '@/lib/amazon-generator';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      url,
      query,
      imageUrl,
      categoryId: requestedCategoryId,
      publishImmediately = false,
    } = body;

    if (!url && !query && !imageUrl) {
      return NextResponse.json(
        { error: 'Please provide an Amazon/Product URL, Product Name, or Image URL' },
        { status: 400 }
      );
    }

    // 1. Fetch site affiliate tag from Settings
    const settingTag = await db.setting.findUnique({ where: { key: 'affiliate_tag' } });
    const tag = settingTag ? settingTag.value : 'techpulse-20';

    // 2. Resolve requested category name if categoryId was provided
    let targetCategoryName: string | undefined = undefined;
    if (requestedCategoryId) {
      const selectedCat = await db.category.findUnique({ where: { id: requestedCategoryId } });
      if (selectedCat) {
        targetCategoryName = selectedCat.name;
      }
    }

    // 3. Exact ASIN Verification Engine: Extract and verify input ASIN
    const inputAsin = extractAsin(url);

    // 4. Generate Complete Real Metadata, Verified Single Source of Truth & 2000+ words Draft
    const draft = await generateFullProductAndBlog({
      url: url?.trim() || undefined,
      query: query?.trim() || undefined,
      imageUrl: imageUrl?.trim() || undefined,
      affiliateTag: tag,
      targetCategory: targetCategoryName,
    });

    // 5. ASIN Matching Validation: If user provided an Amazon URL with ASIN, ensure exact match
    if (inputAsin && draft.asin && inputAsin.toUpperCase() !== draft.asin.toUpperCase()) {
      return NextResponse.json(
        {
          error: `❌ Product ID mismatch: Input ASIN (${inputAsin}) does not match returned product ASIN (${draft.asin}). Stopped generation to prevent incorrect product data.`,
        },
        { status: 400 }
      );
    }

    // 4. Find or Auto-Create Category
    let category = requestedCategoryId
      ? await db.category.findUnique({ where: { id: requestedCategoryId } })
      : await db.category.findFirst({
          where: { name: { equals: draft.categoryName, mode: 'insensitive' } },
        });

    if (!category) {
      category = await db.category.findFirst({
        where: { slug: slugify(draft.categoryName) },
      });
    }

    if (!category) {
      category = await db.category.create({
        data: {
          name: draft.categoryName,
          slug: slugify(draft.categoryName),
          description: `${draft.categoryName} buying guides, real-world benchmarks, and deals.`,
          icon: 'Sparkles',
        },
      });
    }

    const itemStatus = publishImmediately ? 'PUBLISHED' : 'DRAFT';

    // 5. Duplicate Product Protection by ASIN or Slug
    const baseSlug = draft.slug.replace(/-review$/, '');
    let targetProduct: any = null;

    // Check by ASIN first if available
    if (draft.asin) {
      targetProduct = await db.product.findFirst({
        where: {
          amazonUrl: {
            contains: draft.asin,
          },
        },
      });
    }

    // Check by exact slug fallback
    if (!targetProduct) {
      targetProduct = await db.product.findUnique({
        where: { slug: baseSlug },
      });
    }

    let createdProduct: any;

    if (targetProduct) {
      // Update existing product with latest verified product data to avoid duplicates
      createdProduct = await db.product.update({
        where: { id: targetProduct.id },
        data: {
          name: draft.title.replace(/\s+Review:.*$/i, '').trim() || draft.title,
          brand: draft.brand,
          price: draft.price,
          images: JSON.stringify(draft.images && draft.images.length > 0 ? draft.images : [draft.featuredImage]),
          amazonUrl: draft.amazonUrl,
          affiliateUrl: draft.affiliateUrl,
          marketplaces: JSON.stringify(draft.marketplaces || {}),
          categoryId: category.id,
          specifications: JSON.stringify(draft.specifications),
          features: JSON.stringify(draft.features),
          pros: JSON.stringify(draft.pros),
          cons: JSON.stringify(draft.cons),
          status: itemStatus,
        },
      });
    } else {
      // Create new unique product
      let productSlug = baseSlug;
      const existingSlugCheck = await db.product.findUnique({ where: { slug: productSlug } });
      if (existingSlugCheck) {
        productSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      createdProduct = await db.product.create({
        data: {
          name: draft.title.replace(/\s+Review:.*$/i, '').trim() || draft.title,
          slug: productSlug,
          brand: draft.brand,
          price: draft.price,
          images: JSON.stringify(draft.images && draft.images.length > 0 ? draft.images : [draft.featuredImage]),
          amazonUrl: draft.amazonUrl,
          affiliateUrl: draft.affiliateUrl,
          marketplaces: JSON.stringify(draft.marketplaces || {}),
          categoryId: category.id,
          specifications: JSON.stringify(draft.specifications),
          features: JSON.stringify(draft.features),
          pros: JSON.stringify(draft.pros),
          cons: JSON.stringify(draft.cons),
          isFeatured: false,
          isTrending: true,
          isDeal: false,
          status: itemStatus,
        },
      });
    }

    // 6. Blog Creation or Update with 2000+ Words Content linked to the Verified Product
    let blogSlug = draft.slug;
    let existingBlog = await db.blog.findFirst({
      where: {
        OR: [
          { slug: blogSlug },
          { productId: createdProduct.id },
        ],
      },
    });

    let createdBlog: any;

    if (existingBlog) {
      // Update existing blog
      createdBlog = await db.blog.update({
        where: { id: existingBlog.id },
        data: {
          title: draft.title,
          metaTitle: draft.metaTitle,
          metaDescription: draft.metaDescription,
          featuredImage: draft.featuredImage,
          content: draft.content,
          specifications: JSON.stringify(draft.specifications),
          features: JSON.stringify(draft.features),
          pros: JSON.stringify(draft.pros),
          cons: JSON.stringify(draft.cons),
          faqs: JSON.stringify(draft.faqs),
          conclusion: draft.conclusion,
          amazonUrl: draft.amazonUrl,
          affiliateUrl: draft.affiliateUrl,
          marketplaces: JSON.stringify(draft.marketplaces || {}),
          categoryId: category.id,
          productId: createdProduct.id,
          tags: JSON.stringify(draft.tags),
          status: itemStatus,
        },
      });
    } else {
      // Create new blog
      const slugConflict = await db.blog.findUnique({ where: { slug: blogSlug } });
      if (slugConflict) {
        blogSlug = `${draft.slug}-${Date.now().toString().slice(-4)}`;
      }

      createdBlog = await db.blog.create({
        data: {
          title: draft.title,
          slug: blogSlug,
          metaTitle: draft.metaTitle,
          metaDescription: draft.metaDescription,
          featuredImage: draft.featuredImage,
          content: draft.content,
          specifications: JSON.stringify(draft.specifications),
          features: JSON.stringify(draft.features),
          pros: JSON.stringify(draft.pros),
          cons: JSON.stringify(draft.cons),
          faqs: JSON.stringify(draft.faqs),
          conclusion: draft.conclusion,
          amazonUrl: draft.amazonUrl,
          affiliateUrl: draft.affiliateUrl,
          marketplaces: JSON.stringify(draft.marketplaces || {}),
          categoryId: category.id,
          productId: createdProduct.id,
          tags: JSON.stringify(draft.tags),
          status: itemStatus,
        },
      });
    }

    // 7. Revalidate cached routes
    try {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath('/products');
      revalidatePath('/admin/blogs');
      revalidatePath('/admin/products');
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Successfully generated and saved ${itemStatus === 'DRAFT' ? 'Draft' : 'Published'} Blog & Product (${draft.wordCount || 2000}+ words)!`,
      status: itemStatus,
      blog: createdBlog,
      product: createdProduct,
      category: category,
      draft,
    });
  } catch (error: any) {
    console.error('Amazon & AI generator API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate product and blog content' },
      { status: 500 }
    );
  }
}
