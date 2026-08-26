const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDbImages() {
  const images = {
    noise: 'https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg',
    fireboltt: 'https://m.media-amazon.com/images/I/61y2VVWcGBL._SL1500_.jpg',
    fastrack: 'https://m.media-amazon.com/images/I/61TapeOXotL._SL1500_.jpg',
    boat: 'https://m.media-amazon.com/images/I/61epn29QG0L._SL1500_.jpg',
  };

  const blog = await prisma.blog.findUnique({
    where: { slug: 'best-smartwatches-under-3000-india' },
  });

  if (blog) {
    let content = blog.content;
    content = content.replace(/!\[Noise ColorFit Pro 5 Max\]\([^)]+\)/g, `![Noise ColorFit Pro 5 Max](${images.noise})`);
    content = content.replace(/!\[Fire-Boltt Phoenix Ultra\]\([^)]+\)/g, `![Fire-Boltt Phoenix Ultra](${images.fireboltt})`);
    content = content.replace(/!\[Fastrack Limitless FS1 Pro\]\([^)]+\)/g, `![Fastrack Limitless FS1 Pro](${images.fastrack})`);
    content = content.replace(/!\[boAt Wave Call 2 Plus\]\([^)]+\)/g, `![boAt Wave Call 2 Plus](${images.boat})`);

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

    console.log('SUCCESS: All 4 Smartwatch images updated in DB!');
  }
}

updateDbImages().catch(console.error).finally(() => prisma.$disconnect());
