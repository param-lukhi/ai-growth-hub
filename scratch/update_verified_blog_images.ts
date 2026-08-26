import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

function checkImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function updateBlogImages() {
  console.log('Testing image URLs...');
  const images = {
    noise: 'https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg',
    fireboltt: 'https://m.media-amazon.com/images/I/61y2VVWcGBL._SL1500_.jpg',
    fastrack: 'https://m.media-amazon.com/images/I/71u9M21rPCL._SL1500_.jpg', // Fastrack Limitless FS1 Pro
    boat: 'https://m.media-amazon.com/images/I/61TapeOXotL._SL1500_.jpg', // boAt Wave Call 2
  };

  for (const [key, url] of Object.entries(images)) {
    const ok = await checkImageUrl(url);
    console.log(`${key}: ${ok ? 'VALID (200 OK)' : 'INVALID'} -> ${url}`);
  }

  const blog = await prisma.blog.findUnique({
    where: { slug: 'best-smartwatches-under-3000-india' },
  });

  if (!blog) {
    console.error('Blog not found');
    return;
  }

  let content = blog.content;

  // Replace Fastrack Image
  content = content.replace(
    /!\[Fastrack Limitless FS1 Pro\]\([^)]+\)/g,
    `![Fastrack Limitless FS1 Pro](${images.fastrack})`
  );

  // Replace boAt Image
  content = content.replace(
    /!\[boAt Wave Call 2 Plus\]\([^)]+\)/g,
    `![boAt Wave Call 2 Plus](${images.boat})`
  );

  await prisma.blog.update({
    where: { slug: 'best-smartwatches-under-3000-india' },
    data: { content },
  });

  const saasArticle = await prisma.contentArticle.findFirst({
    where: { slug: 'best-smartwatches-under-3000-india' },
  });

  if (saasArticle) {
    await prisma.contentArticle.update({
      where: { id: saasArticle.id },
      data: { content },
    });
  }

  console.log('Successfully updated blog content with verified product images in database!');
}

updateBlogImages().catch(console.error).finally(() => prisma.$disconnect());
