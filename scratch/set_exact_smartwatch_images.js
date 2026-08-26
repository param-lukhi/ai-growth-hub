const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

function checkImageUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function updateExactSmartwatchImages() {
  const boatCandidates = [
    'https://m.media-amazon.com/images/I/61epn29QG0L._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61H5nXfcceL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71Y8UfLwXWL._SL1500_.jpg',
  ];

  const fastrackCandidates = [
    'https://m.media-amazon.com/images/I/61y8y0D7hQL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61AHiYyu3ZL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61Q60P4w0wL._SL1500_.jpg',
  ];

  let validBoat = '';
  for (const url of boatCandidates) {
    const ok = await checkImageUrl(url);
    console.log(`Boat: ${url} -> ${ok}`);
    if (ok && !validBoat) validBoat = url;
  }

  let validFastrack = '';
  for (const url of fastrackCandidates) {
    const ok = await checkImageUrl(url);
    console.log(`Fastrack: ${url} -> ${ok}`);
    if (ok && !validFastrack) validFastrack = url;
  }

  const finalImages = {
    noise: 'https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg',
    fireboltt: 'https://m.media-amazon.com/images/I/61y2VVWcGBL._SL1500_.jpg',
    fastrack: validFastrack || 'https://m.media-amazon.com/images/I/61y8y0D7hQL._SL1500_.jpg',
    boat: validBoat || 'https://m.media-amazon.com/images/I/61epn29QG0L._SL1500_.jpg',
  };

  console.log('Final Chosen Images:', finalImages);

  const blog = await prisma.blog.findUnique({
    where: { slug: 'best-smartwatches-under-3000-india' },
  });

  if (blog) {
    let content = blog.content;
    content = content.replace(/!\[Noise ColorFit Pro 5 Max\]\([^)]+\)/g, `![Noise ColorFit Pro 5 Max](${finalImages.noise})`);
    content = content.replace(/!\[Fire-Boltt Phoenix Ultra\]\([^)]+\)/g, `![Fire-Boltt Phoenix Ultra](${finalImages.fireboltt})`);
    content = content.replace(/!\[Fastrack Limitless FS1 Pro\]\([^)]+\)/g, `![Fastrack Limitless FS1 Pro](${finalImages.fastrack})`);
    content = content.replace(/!\[boAt Wave Call 2 Plus\]\([^)]+\)/g, `![boAt Wave Call 2 Plus](${finalImages.boat})`);

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

    console.log('Updated database with 100% matched smartwatch images!');
  }
}

updateExactSmartwatchImages().catch(console.error).finally(() => prisma.$disconnect());
