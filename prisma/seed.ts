import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with initial tech models...');

  // 1. Seed Categories
  const categoriesData = [
    { name: 'Mobiles', slug: 'mobiles', description: 'Smartphones, flagship phones, and mobile accessories.', icon: 'Smartphone' },
    { name: 'Laptops', slug: 'laptops', description: 'MacBooks, Windows laptops, ultrabooks, and notebooks.', icon: 'Laptop' },
    { name: 'Audio & Earbuds', slug: 'earbuds', description: 'Wireless earbuds, noise canceling headphones, and audio.', icon: 'Headphones' },
    { name: 'Smart Watches', slug: 'smart-watches', description: 'Fitness trackers, Apple Watches, and smart wearables.', icon: 'Watch' },
    { name: 'TVs', slug: 'tvs', description: 'OLED, QLED, Smart 4K & 8K Televisions.', icon: 'Tv' },
    { name: 'Gaming', slug: 'gaming', description: 'Consoles, gaming laptops, mice, keyboards, and VR headsets.', icon: 'Gamepad2' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Smart home gear, robotic vacuums, and living essentials.', icon: 'Home' },
    { name: 'Accessories', slug: 'accessories', description: 'Chargers, power banks, cables, and tech adapters.', icon: 'Plugin' },
    { name: 'Personal Care', slug: 'personal-care', description: 'Grooming tools, smart toothbrushes, and health tech.', icon: 'Sparkles' },
    { name: 'AI & Technology', slug: 'ai-technology', description: 'AI productivity tools, gadgets, and tech explainers.', icon: 'Cpu' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // 2. Seed Brands
  const brandsData = [
    { name: 'Apple', slug: 'apple', description: 'Innovative gadgets & premium electronics.' },
    { name: 'Sony', slug: 'sony', description: 'Leading audio and entertainment products.' },
    { name: 'Samsung', slug: 'samsung', description: 'World leader in displays and mobile technology.' },
    { name: 'Dell', slug: 'dell', description: 'High performance PCs, laptops, and displays.' },
    { name: 'Bose', slug: 'bose', description: 'Premium noise-canceling audio equipment.' },
    { name: 'Asus', slug: 'asus', description: 'Gaming hardware and high end motherboards.' },
  ];

  for (const b of brandsData) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
  }

  // 3. Seed Users
  const defaultAdminEmail = process.env.ADMIN_EMAIL || 'lukhiparam904@gmail.com';
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

  // Clean up legacy demo admin if present
  await prisma.user.deleteMany({
    where: { email: { in: ['admin@techpulse.com', 'admin'] } }
  }).catch(() => {});

  await prisma.user.upsert({
    where: { email: defaultAdminEmail },
    update: {
      password: hashedPassword,
      status: 'ACTIVE',
      role: 'ADMIN',
    },
    create: {
      name: 'Param Lukhi',
      email: defaultAdminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 4. Seed Default Settings
  const settingsData = [
    { key: 'site_name', value: 'TechPulse Reviews' },
    { key: 'site_tagline', value: 'Research-Based Product Reviews & Unbiased Buying Guides' },
    { key: 'site_logo', value: 'TechPulse' },
    { key: 'hero_title', value: 'Research-Based Product Reviews & Buying Guides' },
    { key: 'hero_subtitle', value: 'We research product specifications, pricing, user feedback, features, and available product information to help you make smarter buying decisions.' },
    { key: 'hero_button_text', value: 'Browse Latest Reviews' },
    { key: 'default_currency', value: 'USD' },
    { key: 'enable_auto_currency', value: 'true' },
    { key: 'enable_multi_country', value: 'true' },
    { key: 'default_marketplace', value: 'amazon.com' },
    { key: 'affiliate_tag', value: 'techpulse-20' },
  ];

  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }

  // 5. Fetch Categories
  const mobilesCat = await prisma.category.findUnique({ where: { slug: 'mobiles' } });
  const laptopsCat = await prisma.category.findUnique({ where: { slug: 'laptops' } });
  const earbudsCat = await prisma.category.findUnique({ where: { slug: 'earbuds' } });

  if (mobilesCat && laptopsCat && earbudsCat) {
    const p1Marketplaces = JSON.stringify({
      US: { price: '$1,199.00', url: 'https://www.amazon.com/dp/B0CHX6QG73?tag=techpulse-20' },
      IN: { price: '₹1,34,900', url: 'https://www.amazon.in/dp/B0CHX6QG73?tag=techpulsein-20' },
    });

    const p1 = await prisma.product.upsert({
      where: { slug: 'apple-iphone-15-pro-max' },
      update: { marketplaces: p1Marketplaces },
      create: {
        name: 'Apple iPhone 15 Pro Max (256GB, Natural Titanium)',
        slug: 'apple-iphone-15-pro-max',
        brand: 'Apple',
        price: '$1,199.00',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop&q=80'
        ]),
        amazonUrl: 'https://www.amazon.com/dp/B0CHX6QG73',
        affiliateUrl: 'https://www.amazon.com/dp/B0CHX6QG73?tag=techpulse-20',
        marketplaces: p1Marketplaces,
        categoryId: mobilesCat.id,
        specifications: JSON.stringify({
          "Display": "6.7-inch Super Retina XDR OLED 120Hz",
          "Processor": "Apple A17 Pro (3nm)",
          "Camera": "48MP Main + 12MP Telephoto 5x"
        }),
        features: JSON.stringify([
          "Forged in titanium for lightweight strength",
          "A17 Pro chip delivers pro-class GPU performance"
        ]),
        pros: JSON.stringify([
          "Substantially lighter weight than 14 Pro Max",
          "Unmatched smartphone video recording"
        ]),
        cons: JSON.stringify(["Premium price tag"]),
        isFeatured: true,
        isTrending: true,
        isDeal: false,
        status: 'PUBLISHED'
      }
    });

    const p2Marketplaces = JSON.stringify({
      US: { price: '$1,299.00', url: 'https://www.amazon.com/dp/B0CX23GVDL?tag=techpulse-20' },
      IN: { price: '₹1,24,900', url: 'https://www.amazon.in/dp/B0CX23GVDL?tag=techpulsein-20' },
    });

    const p2 = await prisma.product.upsert({
      where: { slug: 'apple-macbook-air-m3-15-inch' },
      update: { marketplaces: p2Marketplaces },
      create: {
        name: 'Apple MacBook Air 15-inch M3 Laptop (16GB, 512GB SSD)',
        slug: 'apple-macbook-air-m3-15-inch',
        brand: 'Apple',
        price: '$1,299.00',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80'
        ]),
        amazonUrl: 'https://www.amazon.com/dp/B0CX23GVDL',
        affiliateUrl: 'https://www.amazon.com/dp/B0CX23GVDL?tag=techpulse-20',
        marketplaces: p2Marketplaces,
        categoryId: laptopsCat.id,
        specifications: JSON.stringify({
          "Processor": "Apple M3 8-core CPU / 10-core GPU",
          "Display": "15.3-inch Liquid Retina Display"
        }),
        features: JSON.stringify([
          "Lean, light 11.5mm thin fanless aluminum chassis",
          "Supports up to two external displays"
        ]),
        pros: JSON.stringify(["Silent fanless operation"]),
        cons: JSON.stringify(["Base RAM upgrades cost extra"]),
        isFeatured: true,
        isTrending: true,
        isDeal: true,
        status: 'PUBLISHED'
      }
    });

    const p3Marketplaces = JSON.stringify({
      US: { price: '$348.00', url: 'https://www.amazon.com/dp/B09XS7JWHH?tag=techpulse-20' },
    });

    const p3 = await prisma.product.upsert({
      where: { slug: 'sony-wh-1000xm5-noise-canceling-headphones' },
      update: { marketplaces: p3Marketplaces },
      create: {
        name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        slug: 'sony-wh-1000xm5-noise-canceling-headphones',
        brand: 'Sony',
        price: '$348.00',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80'
        ]),
        amazonUrl: 'https://www.amazon.com/dp/B09XS7JWHH',
        affiliateUrl: 'https://www.amazon.com/dp/B09XS7JWHH?tag=techpulse-20',
        marketplaces: p3Marketplaces,
        categoryId: earbudsCat.id,
        specifications: JSON.stringify({
          "Noise Cancellation": "Auto NC Optimizer with 8 microphones",
          "Battery Life": "30 Hours ANC ON"
        }),
        features: JSON.stringify(["Unparalleled active noise cancellation"]),
        pros: JSON.stringify(["Best active noise cancellation in class"]),
        cons: JSON.stringify(["Non-folding headband"]),
        isFeatured: true,
        isTrending: true,
        isDeal: true,
        status: 'PUBLISHED'
      }
    });

    // Seed Blog
    const b1 = await prisma.blog.upsert({
      where: { slug: 'apple-iphone-15-pro-max-review' },
      update: { marketplaces: p1Marketplaces },
      create: {
        title: 'Apple iPhone 15 Pro Max Review: Is It Worth The Titanium Upgrade?',
        slug: 'apple-iphone-15-pro-max-review',
        metaTitle: 'Apple iPhone 15 Pro Max Detailed Review (2026)',
        metaDescription: 'Hands-on review of the iPhone 15 Pro Max. Specs, camera benchmarks, battery tests, and the best Amazon price deals.',
        featuredImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&auto=format&fit=crop&q=80',
        content: '<p>Testing the Apple iPhone 15 Pro Max across global markets...</p>',
        specifications: p1.specifications,
        features: p1.features,
        pros: p1.pros,
        cons: p1.cons,
        conclusion: 'The iPhone 15 Pro Max is an absolute powerhouse globally.',
        amazonUrl: p1.amazonUrl,
        affiliateUrl: p1.affiliateUrl,
        marketplaces: p1Marketplaces,
        status: 'PUBLISHED',
        categoryId: mobilesCat.id,
        productId: p1.id,
        tags: JSON.stringify(['iPhone', 'Apple', 'Review']),
        views: 1450
      }
    });

    // 6. Seed Comments
    await prisma.comment.createMany({
      data: [
        {
          author: 'David Vance',
          email: 'david@example.com',
          content: 'Extremely thorough review! The titanium chassis really makes a noticeable weight difference in hand.',
          status: 'APPROVED',
          blogId: b1.id,
        },
        {
          author: 'Elena Rostova',
          email: 'elena@example.com',
          content: 'How does the battery hold up when recording 4K 60fps ProRes video?',
          status: 'PENDING',
          blogId: b1.id,
        },
      ],
    });

    // 7. Seed Newsletter Subscribers
    await prisma.newsletterSubscriber.upsert({
      where: { email: 'subscriber1@techpulse.com' },
      update: {},
      create: { email: 'subscriber1@techpulse.com', status: 'SUBSCRIBED' },
    });
    await prisma.newsletterSubscriber.upsert({
      where: { email: 'subscriber2@techpulse.com' },
      update: {},
      create: { email: 'subscriber2@techpulse.com', status: 'SUBSCRIBED' },
    });

    // 8. Seed Deals
    await prisma.deal.create({
      data: {
        title: 'MacBook Air M3 Flash Discount',
        discount: '15% OFF',
        originalPrice: '$1,299.00',
        dealPrice: '$1,099.00',
        dealUrl: p2.affiliateUrl,
        badge: 'Hot Deal',
        productId: p2.id,
        status: 'PUBLISHED',
      },
    });

    // 9. Seed Comparisons
    await prisma.comparison.upsert({
      where: { slug: 'iphone-15-pro-max-vs-macbook-air-m3' },
      update: {},
      create: {
        title: 'iPhone 15 Pro Max vs MacBook Air M3',
        slug: 'iphone-15-pro-max-vs-macbook-air-m3',
        summary: 'Comparing Apple flagship mobility vs desktop productivity performance.',
        product1Id: p1.id,
        product2Id: p2.id,
        winnerId: p1.id,
        status: 'PUBLISHED',
      },
    });

    // 10. Seed Affiliate Links
    await prisma.affiliateLink.upsert({
      where: { cloakedUrl: '/go/iphone15promax' },
      update: {},
      create: {
        title: 'iPhone 15 Pro Max Official Amazon Link',
        originalUrl: p1.amazonUrl,
        cloakedUrl: '/go/iphone15promax',
        category: 'Mobiles',
        clicks: 342,
      },
    });

    // 11. Seed Advertisements
    await prisma.advertisement.create({
      data: {
        title: 'Prime Big Deal Days Banner',
        location: 'HEADER',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
        targetUrl: 'https://www.amazon.com',
        active: true,
      },
    });
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
