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

async function findFastrackImage() {
  const candidates = [
    'https://m.media-amazon.com/images/I/71w8NqD88WL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61Xvg8eQvCL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61tXn+kR5LL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71k4oBvM6pL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61WfQ8t3sDL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71R3T1JgSUL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61EPYtq1zCL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71qZ+0iR5SL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61-G1i4oIeL._SL1500_.jpg',
  ];

  let chosenFastrack = '';
  for (const url of candidates) {
    const ok = await checkImageUrl(url);
    if (ok && !chosenFastrack) {
      chosenFastrack = url;
      console.log(`Found valid Fastrack image: ${url}`);
    }
  }

  const validImages = {
    noise: 'https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg',
    fireboltt: 'https://m.media-amazon.com/images/I/61y2VVWcGBL._SL1500_.jpg',
    fastrack: chosenFastrack || 'https://m.media-amazon.com/images/I/61Xvg8eQvCL._SL1500_.jpg',
    boat: 'https://m.media-amazon.com/images/I/61TapeOXotL._SL1500_.jpg',
  };

  const blog = await prisma.blog.findUnique({
    where: { slug: 'best-smartwatches-under-3000-india' },
  });

  if (blog) {
    let content = blog.content;
    content = content.replace(/!\[Noise ColorFit Pro 5 Max\]\([^)]+\)/g, `![Noise ColorFit Pro 5 Max](${validImages.noise})`);
    content = content.replace(/!\[Fire-Boltt Phoenix Ultra\]\([^)]+\)/g, `![Fire-Boltt Phoenix Ultra](${validImages.fireboltt})`);
    content = content.replace(/!\[Fastrack Limitless FS1 Pro\]\([^)]+\)/g, `![Fastrack Limitless FS1 Pro](${validImages.fastrack})`);
    content = content.replace(/!\[boAt Wave Call 2 Plus\]\([^)]+\)/g, `![boAt Wave Call 2 Plus](${validImages.boat})`);

    await prisma.blog.update({
      where: { slug: 'best-smartwatches-under-3000-india' },
      data: { content },
    });

    const saas = await prisma.contentArticle.findFirst({
      where: { slug: 'best-smartwatches-under-3000-india' },
    });
    if (saas) {
      await prisma.contentArticle.update({
        where: { id: saas.id },
        data: { content },
      });
    }
    console.log('Database updated successfully with 100% verified images!');
  }
}

findFastrackImage().catch(console.error).finally(() => prisma.$disconnect());
