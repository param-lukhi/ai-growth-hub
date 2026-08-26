const https = require('https');

const liveUrls = [
  'https://ai-growth-hub-gamma.vercel.app/admin/login',
  'https://ai-growth-hub-gamma.vercel.app/api/settings',
  'https://ai-growth-hub-gamma.vercel.app/api/categories',
  'https://ai-growth-hub-gamma.vercel.app/api/saas/websites',
  'https://blogweb904.vercel.app/',
  'https://blogweb904.vercel.app/deals',
  'https://blogweb904.vercel.app/api/settings'
];

async function checkLive() {
  console.log('Testing live Vercel deployments...\n');
  for (const url of liveUrls) {
    try {
      const start = Date.now();
      const res = await fetch(url, { redirect: 'manual' });
      const duration = Date.now() - start;
      console.log(`[STATUS: ${res.status}] (${duration}ms) -> ${url}`);
      if (url.includes('/api/')) {
        try {
          const json = await res.json();
          console.log(`  Response preview:`, JSON.stringify(json).substring(0, 120) + '...');
        } catch (e) {}
      }
    } catch (err) {
      console.log(`[ERROR] ${url}: ${err.message}`);
    }
  }
}

checkLive();
