import prisma from '@/lib/db';

export async function ensureDefaultWebsitesSeeded() {
  try {
    const existingWebsitesCount = await prisma.website.count();
    if (existingWebsitesCount > 0) {
      return;
    }

    console.log('Seeding initial SaaS multi-website tenant data...');

    // 1. Seed Website #1: TechPulse (Preserving complete existing website identity)
    const techpulse = await prisma.website.create({
      data: {
        name: 'TechPulse',
        slug: 'techpulse',
        domainUrl: 'https://blogweb904.vercel.app',
        niche: 'Technology',
        subNiche: 'Consumer Electronics, Smart Devices & Gadgets',
        targetCountry: 'India',
        targetLanguage: 'English',
        targetAudience: 'Indian technology buyers, smartphone enthusiasts, and gadget shoppers',
        brandVoice: 'Clear, helpful, practical, trustworthy and research-backed',
        contentStyle: 'In-depth specification analysis, verified pros/cons, buying guides, and hands-on advice',
        primaryTopics: JSON.stringify(['Smartphones', 'Wireless Earbuds', 'Laptops', 'Smartwatches', 'Smart TVs', 'Audio & Accessories']),
        topicsToAvoid: JSON.stringify(['Unverified rumors', 'Financial trading crypto advice', 'Low-effort spam listicles']),
        monetization: JSON.stringify(['AMAZON_AFFILIATE', 'ADSENSE']),
        publishingFrequency: '3_PER_WEEK',
        approvalMode: 'MANUAL',
        cmsType: 'NATIVE',
        status: 'ACTIVE',
        articlesCount: 18,
        trafficCount: 4820,
        affiliateClicks: 742,
        lastAgentRun: new Date(),
        agent: {
          create: {
            agentName: 'TechPulse Growth Agent',
            role: 'Technology content, SEO optimization, and Amazon affiliate growth agent',
            tone: 'Authoritative, analytical, accessible, and reader-first',
            systemPrompt: 'You are the dedicated AI Growth Agent for TechPulse. Analyze consumer technology search trends in India, generate high-converting buyer guides, strictly adhere to FTC affiliate disclosure standards, and ensure every article contains structured data and verified specs.',
            memoryState: JSON.stringify({
              brandVoice: 'Clear, helpful, practical, trustworthy',
              coveredTopics: ['OnePlus Nord Buds 4 Review', 'Best Earbuds Under 2000', 'Gaming Laptops Under 70k'],
              reviewedProducts: ['OnePlus Nord Buds 3', 'OnePlus Nord Buds 4', 'Boat Airdopes 141', 'Realme Buds Air 5'],
              affiliateRules: ['Use Amazon India tag', 'Never hide disclosures', 'Use dynamic CTA buttons'],
              targetAudience: 'Indian gadget buyers looking for best value under ₹5,000 to ₹80,000'
            }),
            customRules: JSON.stringify({
              minWordCount: 800,
              requireFaqSchema: true,
              requireComparisonTable: true
            }),
            active: true
          }
        },
        integrations: {
          create: [
            {
              provider: 'GOOGLE_SEARCH_CONSOLE',
              displayName: 'Google Search Console (TechPulse Property)',
              status: 'CONNECTED',
              configJson: JSON.stringify({ siteUrl: 'https://blogweb904.vercel.app/', propertyType: 'URL-prefix' })
            },
            {
              provider: 'AMAZON_ASSOCIATES',
              displayName: 'Amazon India Associates (techpulse-20)',
              status: 'CONNECTED',
              configJson: JSON.stringify({ marketplace: 'amazon.in', affiliateTag: 'techpulse-20' })
            },
            {
              provider: 'GOOGLE_ANALYTICS',
              displayName: 'Google Analytics 4 (G-TECHPULSE904)',
              status: 'CONNECTED',
              configJson: JSON.stringify({ measurementId: 'G-TECHPULSE904' })
            },
            {
              provider: 'PINTEREST',
              displayName: 'Pinterest Business Profile',
              status: 'REQUIRES_CONNECTION'
            },
            {
              provider: 'YOUTUBE',
              displayName: 'YouTube Channel API',
              status: 'REQUIRES_CONNECTION'
            },
            {
              provider: 'INSTAGRAM',
              displayName: 'Meta / Instagram Graph API',
              status: 'REQUIRES_CONNECTION'
            },
            {
              provider: 'MEDIUM',
              displayName: 'Medium Integration Token',
              status: 'REQUIRES_CONNECTION'
            }
          ]
        },
        automationRules: {
          create: [
            {
              ruleName: 'DAILY_TOPIC_DISCOVERY',
              frequency: 'DAILY',
              isEnabled: true,
              lastRunAt: new Date(),
              lastRunStatus: 'SUCCESS'
            },
            {
              ruleName: 'WEEKLY_CONTENT_PLAN',
              frequency: 'WEEKLY',
              isEnabled: true,
              lastRunAt: new Date(),
              lastRunStatus: 'SUCCESS'
            },
            {
              ruleName: 'POST_PUBLISH_SOCIAL',
              frequency: 'ON_PUBLISH',
              isEnabled: true,
              lastRunAt: new Date(),
              lastRunStatus: 'SUCCESS'
            },
            {
              ruleName: 'WEEKLY_GSC_AUDIT',
              frequency: 'WEEKLY',
              isEnabled: false
            }
          ]
        },
        activityLogs: {
          create: [
            {
              agentName: 'TechPulse Growth Agent',
              actionType: 'TOPIC_DISCOVERY',
              message: 'Agent scanned tech market queries and discovered 25 high-priority content opportunities',
              status: 'SUCCESS'
            },
            {
              agentName: 'TechPulse Growth Agent',
              actionType: 'DRAFT_GENERATED',
              message: 'Generated comprehensive draft for "Best Wireless Earbuds Under ₹2,000 in India"',
              status: 'SUCCESS'
            },
            {
              agentName: 'TechPulse Growth Agent',
              actionType: 'SEO_OPTIMIZATION',
              message: 'Generated Schema.org ItemList and Product JSON-LD structured data',
              status: 'SUCCESS'
            },
            {
              agentName: 'TechPulse Growth Agent',
              actionType: 'QUALITY_CHECK',
              message: 'Quality Control passed with Score 94/100 (Affiliate disclosure verified, no hallucinations)',
              status: 'SUCCESS'
            }
          ]
        }
      }
    });

    // Seed Topics for TechPulse
    await prisma.topicOpportunity.createMany({
      data: [
        {
          websiteId: techpulse.id,
          topic: 'Best Wireless Earbuds Under ₹2,000',
          primaryKeyword: 'best earbuds under 2000',
          secondaryKeywords: JSON.stringify(['tws under 2000', 'best anc earbuds under 2000', 'boat vs realme earbuds']),
          searchIntent: 'Commercial Investigation',
          buyerIntent: 'High',
          competitionEstimate: 'Medium',
          contentOpportunity: 'High search volume segment with frequent price shifts and new Bluetooth 5.4 releases.',
          affiliatePotential: 'High',
          suggestedArticleType: 'Buying Guide',
          suggestedTitle: 'Best Wireless Earbuds Under ₹2,000 in India (2026 Edition)',
          priorityScore: 95,
          status: 'CONVERTED_TO_DRAFT'
        },
        {
          websiteId: techpulse.id,
          topic: 'Best Gaming Laptops Under ₹70,000',
          primaryKeyword: 'best gaming laptop under 70000',
          secondaryKeywords: JSON.stringify(['rtx 4050 laptop india', 'budget gaming laptop 2026', '144hz display laptop']),
          searchIntent: 'Commercial Investigation',
          buyerIntent: 'High',
          competitionEstimate: 'High',
          contentOpportunity: 'Students and casual gamers seeking RTX 4050 / 3050 GPUs.',
          affiliatePotential: 'High',
          suggestedArticleType: 'Round-up',
          suggestedTitle: 'Top 5 Best Gaming Laptops Under ₹70,000 for High FPS Gaming',
          priorityScore: 92,
          status: 'DISCOVERED'
        },
        {
          websiteId: techpulse.id,
          topic: 'OnePlus Nord Buds 4 vs Nord Buds 3',
          primaryKeyword: 'nord buds 4 vs nord buds 3',
          secondaryKeywords: JSON.stringify(['oneplus nord buds 4 review', 'nord buds comparison', 'anc test']),
          searchIntent: 'Commercial Investigation',
          buyerIntent: 'High',
          competitionEstimate: 'Low',
          contentOpportunity: 'Specific side-by-side comparison for buyers deciding between new and older models.',
          affiliatePotential: 'High',
          suggestedArticleType: 'Comparison',
          suggestedTitle: 'OnePlus Nord Buds 4 vs Nord Buds 3: Should You Upgrade?',
          priorityScore: 90,
          status: 'DISCOVERED'
        }
      ]
    });

    // Seed Sample Content Article for TechPulse
    const seededArticle = await prisma.contentArticle.create({
      data: {
        websiteId: techpulse.id,
        title: 'Best Wireless Earbuds Under ₹2,000 in India (2026 Edition)',
        slug: 'best-wireless-earbuds-under-2000',
        category: 'Electronics & Technology',
        tags: JSON.stringify(['Earbuds', 'Audio', 'Tech Reviews', 'Buying Guide', 'Amazon Deals']),
        author: 'TechPulse Editorial Team',
        featuredImage: 'https://m.media-amazon.com/images/I/61aLy7kImQL._SL1500_.jpg',
        introduction: 'Finding the right pair of True Wireless Stereo (TWS) earbuds under ₹2,000 used to mean settling for tinny audio and terrible microphones. In 2026, the budget audio segment has matured tremendously with Active Noise Cancellation (ANC), multi-device pairing, and 40+ hours of battery life.',
        content: `## Quick Summary: Top Picks at a Glance

If you are in a hurry, here are our verified editorial recommendations:

1. **Overall Best Audio Quality**: OnePlus Nord Buds 2r / 3r
2. **Best Battery Life & Value**: Boat Airdopes 141 ANC
3. **Best Gaming & Low Latency**: Realme Buds T300

---

## Detailed Review Breakdown

### 1. OnePlus Nord Buds 2r
The OnePlus Nord Buds 2r remains our highest recommended choice for buyers who prioritize balanced acoustic sound and crystal-clear calls. Equipped with 12.4mm dynamic titanium drivers, they produce punchy bass without overpowering vocals.

- **Battery Life**: Up to 38 hours with charging case
- **Driver Size**: 12.4mm Extra Large Drivers
- **Bluetooth**: 5.3 with Fast Pair
- **IP Rating**: IP55 Water and Sweat Resistance

---

## Side-by-Side Comparison

| Model | Driver Size | Battery Life | Latency | Water Resistance | Price Range |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OnePlus Nord Buds 2r** | 12.4mm | 38 Hours | 94ms | IP55 | ₹1,799 - ₹1,999 |
| **Boat Airdopes 141 ANC** | 10mm | 42 Hours | 65ms | IPX5 | ₹1,499 - ₹1,799 |
| **Realme Buds T300** | 12.4mm | 40 Hours | 50ms | IP55 | ₹1,999 |

---

## Frequently Asked Questions (FAQ)

### Do earbuds under ₹2,000 have real Active Noise Cancellation?
Yes, modern models in this bracket offer hybrid ANC up to 25dB–30dB, which effectively cancels low-frequency air conditioner and commute hums.

### Are these earbuds sweatproof for workouts?
All top picks featured here carry an IPX4 or IP55 rating, making them safe for gym sweat and light rain.
`,
        pros: JSON.stringify(['12.4mm Titanium Drivers with punchy bass', '38-42 hour battery endurance', 'Dual-mic AI noise cancellation for calls', 'Comfortable in-ear ergonomic fit']),
        cons: JSON.stringify(['No wireless charging in this budget range', 'Plastic charging cases can pick up fine scratches']),
        faqs: JSON.stringify([
          { question: 'Do earbuds under ₹2,000 have real Active Noise Cancellation?', answer: 'Yes, models like Realme Buds T300 offer hybrid ANC up to 30dB.' },
          { question: 'Are these earbuds safe for gym workouts?', answer: 'Yes, all top picks carry IP55 sweat resistance.' }
        ]),
        affiliateProducts: JSON.stringify([
          {
            name: 'OnePlus Nord Buds 2r',
            url: 'https://www.amazon.in/dp/B0CHX6QG73',
            affiliateUrl: 'https://www.amazon.in/dp/B0CHX6QG73?tag=techpulse-20',
            merchant: 'Amazon India',
            price: '₹1,999',
            category: 'Earbuds & Audio',
            features: ['12.4mm Dynamic Titanium Drivers', 'Up to 38 hours playback', 'IP55 Water & Sweat Resistance', 'Dual Mic AI Noise Cancellation'],
            pros: ['Punchy bass with clear vocals', 'Comfortable ergonomic in-ear seal', 'Long battery life with fast charging'],
            cons: ['No dedicated active noise cancellation (ANC)', 'App customization limited on iOS'],
            cta: 'Check Latest Price on Amazon'
          },
          {
            name: 'Boat Airdopes 141 ANC',
            url: 'https://www.amazon.in/dp/B0C3CGN2K7',
            affiliateUrl: 'https://www.amazon.in/dp/B0C3CGN2K7?tag=techpulse-20',
            merchant: 'Amazon India',
            price: '₹1,699',
            category: 'Earbuds & Audio',
            features: ['Active Noise Cancellation up to 32dB', '42 hours total playtime', 'ENx Technology for Quad Mics', 'BEAST Mode 50ms Low Latency'],
            pros: ['Effective budget ANC for commute', 'Massive 42-hour total battery endurance', 'Fast ASAP charge (10 mins = 150 mins playback)'],
            cons: ['Slightly bulkier charging case', 'Bass-heavy tuning out of the box'],
            cta: 'Check Latest Price on Amazon'
          },
          {
            name: 'Realme Buds T300',
            url: 'https://www.amazon.in/dp/B0CGDD1W75',
            affiliateUrl: 'https://www.amazon.in/dp/B0CGDD1W75?tag=techpulse-20',
            merchant: 'Amazon India',
            price: '₹1,999',
            category: 'Earbuds & Audio',
            features: ['30dB Active Noise Cancellation', '12.4mm Dynamic Bass Boost Drivers', '360° Spatial Audio Effect', '40 hours total playback'],
            pros: ['Crisp soundstage with 360 spatial audio', 'Reliable 30dB ANC in noisy environments', 'Low latency mode ideal for mobile gaming'],
            cons: ['Case is prone to fine hairline scratches'],
            cta: 'Check Latest Price on Amazon'
          }
        ]),
        affiliateDisclosure: 'This article may contain affiliate links. If you purchase through our links, we may earn a commission at no additional cost to you.',
        seoTitle: 'Best Wireless Earbuds Under ₹2,000 in India (2026 Edition)',
        metaDescription: 'Looking for the best wireless earbuds under ₹2,000 in India? We researched and compared top models from OnePlus, Boat, and Realme for sound quality, ANC, and battery life.',
        canonicalUrl: 'https://blogweb904.vercel.app/blog/best-wireless-earbuds-under-2000',
        schemaJson: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Best Wireless Earbuds Under ₹2,000 in India (2026 Edition)",
          "author": { "@type": "Organization", "name": "TechPulse" },
          "publisher": { "@type": "Organization", "name": "TechPulse" }
        }),
        qualityScore: 96,
        qualityBreakdown: JSON.stringify({
          overallScore: 96,
          seoScore: 95,
          contentScore: 96,
          affiliateScore: 98,
          readabilityScore: 94,
          originalityCheck: 98,
          technicalScore: 95,
          validationFlags: []
        }),
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedUrl: 'https://blogweb904.vercel.app/blog/best-wireless-earbuds-under-2000',
        views: 1240,
        affiliateClicks: 184
      }
    });

    // 2. Seed Website #2: CarCareMakers (Automotive Niche Example)
    const carcare = await prisma.website.create({
      data: {
        name: 'CarCareMakers',
        slug: 'carcaremakers',
        domainUrl: 'https://example.com',
        niche: 'Automotive',
        subNiche: 'DIY Car Detailing, Vehicle Maintenance & Car Accessories',
        targetCountry: 'United States',
        targetLanguage: 'English',
        targetAudience: 'Car owners, automotive DIY enthusiasts, and daily commuters',
        brandVoice: 'Practical, mechanic-approved, straightforward, and reliable',
        contentStyle: 'Step-by-step detailing tutorials, rigorous accessory testing, and maintenance guides',
        primaryTopics: JSON.stringify(['Dash Cams', 'Ceramic Coatings', 'Car Vacuums', 'Tyre Inflators', 'Car Polishers', 'Interior Cleaners']),
        topicsToAvoid: JSON.stringify(['Illegal modifications', 'Street racing advice', 'Unverified mechanical repairs']),
        monetization: JSON.stringify(['AMAZON_AFFILIATE', 'DIGITAL_PRODUCTS']),
        publishingFrequency: 'WEEKLY',
        approvalMode: 'MANUAL',
        cmsType: 'WORDPRESS',
        cmsConfig: JSON.stringify({
          wpUrl: 'https://example.com',
          username: 'editor_carcare',
          appPassword: 'configured_in_secrets'
        }),
        status: 'ACTIVE',
        articlesCount: 6,
        trafficCount: 1850,
        affiliateClicks: 215,
        lastAgentRun: new Date(),
        agent: {
          create: {
            agentName: 'CarCare Growth Agent',
            role: 'Automotive detailing, accessory reviews, and organic growth agent',
            tone: 'Practical, knowledgeable, mechanic-level accuracy',
            systemPrompt: 'You are the dedicated AI Growth Agent for CarCareMakers. Research automotive consumer products, focus on real durability and ease of use, provide verified Amazon accessory recommendations, and maintain strict quality standards.',
            memoryState: JSON.stringify({
              brandVoice: 'Practical, mechanic-approved, straightforward',
              coveredTopics: ['Best Ceramic Coating Spray', 'Top 5 Car Dash Cams'],
              reviewedProducts: ['Chemical Guys HydroSlick', 'Vantrue N4 Dash Cam', 'Fanttik X8 Apex Tyre Inflator'],
              affiliateRules: ['Highlight US and Global Amazon pricing', 'Include clear safety disclaimers'],
              targetAudience: 'DIY car detailers and drivers seeking reliable automotive products'
            }),
            customRules: JSON.stringify({
              minWordCount: 900,
              requireSafetyNotice: true
            }),
            active: true
          }
        },
        integrations: {
          create: [
            {
              provider: 'GOOGLE_SEARCH_CONSOLE',
              displayName: 'Google Search Console (CarCare Property)',
              status: 'REQUIRES_CONNECTION'
            },
            {
              provider: 'AMAZON_ASSOCIATES',
              displayName: 'Amazon Associates (carcare-20)',
              status: 'REQUIRES_CONNECTION'
            },
            {
              provider: 'WORDPRESS',
              displayName: 'WordPress REST API Publishing',
              status: 'REQUIRES_CONNECTION'
            }
          ]
        },
        automationRules: {
          create: [
            {
              ruleName: 'DAILY_TOPIC_DISCOVERY',
              frequency: 'DAILY',
              isEnabled: true,
              lastRunAt: new Date(),
              lastRunStatus: 'SUCCESS'
            },
            {
              ruleName: 'POST_PUBLISH_SOCIAL',
              frequency: 'ON_PUBLISH',
              isEnabled: true,
              lastRunAt: new Date(),
              lastRunStatus: 'SUCCESS'
            }
          ]
        },
        activityLogs: {
          create: [
            {
              agentName: 'CarCare Growth Agent',
              actionType: 'TOPIC_DISCOVERY',
              message: 'Scanned automotive accessories and identified 18 high-intent product review keywords',
              status: 'SUCCESS'
            },
            {
              agentName: 'CarCare Growth Agent',
              actionType: 'DRAFT_GENERATED',
              message: 'Generated buying guide for "Best Ceramic Coating Spray for Cars (2026)"',
              status: 'SUCCESS'
            }
          ]
        }
      }
    });

    // Seed Topics for CarCareMakers
    await prisma.topicOpportunity.createMany({
      data: [
        {
          websiteId: carcare.id,
          topic: 'Best Ceramic Coating Spray for Cars',
          primaryKeyword: 'best ceramic coating spray',
          secondaryKeywords: JSON.stringify(['diy ceramic coating', 'hydrophobic car spray', 'paint sealant']),
          searchIntent: 'Commercial Investigation',
          buyerIntent: 'High',
          competitionEstimate: 'Medium',
          contentOpportunity: 'Growing demand for easy spray-on SiO2 coatings vs expensive professional jobs.',
          affiliatePotential: 'High',
          suggestedArticleType: 'Buying Guide',
          suggestedTitle: 'Top 7 Best Ceramic Coating Sprays for Cars (Tested for Gloss & Longevity)',
          priorityScore: 94,
          status: 'DISCOVERED'
        },
        {
          websiteId: carcare.id,
          topic: 'Best Dash Cams for Cars (Front & Rear Night Vision)',
          primaryKeyword: 'best dash cam for car',
          secondaryKeywords: JSON.stringify(['dual dash cam 4k', 'dash cam night vision', 'parking monitor camera']),
          searchIntent: 'Commercial Investigation',
          buyerIntent: 'High',
          competitionEstimate: 'Medium',
          contentOpportunity: 'Essential safety accessory with high conversion rates.',
          affiliatePotential: 'High',
          suggestedArticleType: 'Round-up',
          suggestedTitle: 'Best 4K Dash Cams for Cars in 2026: Complete Buyer Guide',
          priorityScore: 92,
          status: 'DISCOVERED'
        }
      ]
    });

    console.log('Successfully seeded multi-website data for TechPulse & CarCareMakers.');
  } catch (error) {
    console.error('Error seeding multi-website SaaS data:', error);
  }
}
