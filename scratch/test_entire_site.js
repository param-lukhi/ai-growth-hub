const fs = require('fs');

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const routesToTest = [
  // Public Pages & Info
  { path: '/admin/login', name: 'Admin Login', requireAuth: false },
  { path: '/deals', name: 'Deals Page', requireAuth: false },
  { path: '/comparisons', name: 'Comparisons Main Page', requireAuth: false },
  { path: '/compare', name: 'Compare Alias Redirect', requireAuth: false },
  { path: '/about', name: 'About Page', requireAuth: false },
  { path: '/contact', name: 'Contact Page', requireAuth: false },
  { path: '/privacy', name: 'Privacy Policy', requireAuth: false },
  { path: '/terms', name: 'Terms of Service', requireAuth: false },
  { path: '/affiliate-disclosure', name: 'Affiliate Disclosure', requireAuth: false },

  // Public / Shared API Routes
  { path: '/api/settings', name: 'API Settings', requireAuth: false },
  { path: '/api/categories', name: 'API Categories', requireAuth: false },
  { path: '/api/products', name: 'API Products', requireAuth: false },
  { path: '/api/blogs', name: 'API Blogs', requireAuth: false },
  { path: '/api/deals', name: 'API Deals', requireAuth: false },
  { path: '/api/admin/check-auth', name: 'API Admin Check Auth', requireAuth: true },

  // SaaS API Routes
  { path: '/api/saas/websites', name: 'API SaaS Websites List', requireAuth: true },
  { path: '/api/saas/integrations?websiteId=cmt4840no0000ee6qk7yzzk5x', name: 'API SaaS Integrations', requireAuth: true },
  { path: '/api/saas/content?websiteId=cmt4840no0000ee6qk7yzzk5x', name: 'API SaaS Content List', requireAuth: true },
  
  // Admin SaaS Platform Pages
  { path: '/admin/dashboard', name: 'Admin Dashboard', requireAuth: true },
  { path: '/admin/websites', name: 'Admin Websites Portfolio', requireAuth: true },
  { path: '/admin/agents', name: 'Admin AI Agents Hub', requireAuth: true },
  { path: '/admin/content', name: 'Admin Content Review Studio', requireAuth: true },
  { path: '/admin/calendar', name: 'Admin Publishing Calendar', requireAuth: true },
  { path: '/admin/seo', name: 'Admin SEO Audit Engine', requireAuth: true },
  { path: '/admin/search-console', name: 'Admin Search Console', requireAuth: true },
  { path: '/admin/affiliate', name: 'Admin Affiliate Hub', requireAuth: true },
  { path: '/admin/affiliate-links', name: 'Admin Affiliate Links Manager', requireAuth: true },
  { path: '/admin/analytics', name: 'Admin Analytics Dashboard', requireAuth: true },
  { path: '/admin/automation', name: 'Admin Automation Schedules', requireAuth: true },
  { path: '/admin/integrations', name: 'Admin Integrations Center', requireAuth: true },
  { path: '/admin/social', name: 'Admin Multi-Channel Social Hub', requireAuth: true },
  { path: '/admin/social/pinterest', name: 'Admin Pinterest Agent', requireAuth: true },
  { path: '/admin/social/youtube', name: 'Admin YouTube Shorts Agent', requireAuth: true },
  { path: '/admin/social/instagram', name: 'Admin Instagram Reels Agent', requireAuth: true },
  { path: '/admin/social/medium', name: 'Admin Medium Syndication Agent', requireAuth: true },
  
  // TechPulse Store Management Pages
  { path: '/admin/blogs', name: 'Admin Blog Management', requireAuth: true },
  { path: '/admin/products', name: 'Admin Products Catalog', requireAuth: true },
  { path: '/admin/categories', name: 'Admin Categories', requireAuth: true },
  { path: '/admin/brands', name: 'Admin Brands', requireAuth: true },
  { path: '/admin/deals', name: 'Admin Deals', requireAuth: true },
  { path: '/admin/comparisons', name: 'Admin Comparisons', requireAuth: true },
  { path: '/admin/media', name: 'Admin Media Library', requireAuth: true },
  { path: '/admin/comments', name: 'Admin Comments & Moderation', requireAuth: true },
  { path: '/admin/newsletter', name: 'Admin Newsletter Subscribers', requireAuth: true },
  { path: '/admin/settings', name: 'Admin Settings', requireAuth: true },
  { path: '/admin/users', name: 'Admin Users & Roles', requireAuth: true },
  { path: '/admin/backup', name: 'Admin Backup & Restore', requireAuth: true },
  { path: '/admin/support', name: 'Admin Support Desk', requireAuth: true }
];

async function runSiteCheck() {
  console.log('====================================================');
  console.log('FINAL 100% COMPLETE WEBSITE INTEGRATION TEST');
  console.log('====================================================\n');
  
  const baseUrl = 'http://localhost:3000';
  const secret = process.env.ADMIN_SESSION_SECRET || 'authenticated_token_secret';
  let passedCount = 0;
  let failedCount = 0;

  for (const r of routesToTest) {
    const url = `${baseUrl}${r.path}`;
    try {
      const headers = {};
      if (r.requireAuth) {
        headers['Cookie'] = `admin_session=${secret}`;
      }
      
      const start = Date.now();
      const res = await fetch(url, { headers, redirect: 'follow' });
      const duration = Date.now() - start;
      const status = res.status;
      const ok = status >= 200 && status < 400;
      
      if (ok) {
        passedCount++;
        console.log(`[PASS] HTTP ${status} (${duration}ms) - ${r.name} (${r.path})`);
      } else {
        failedCount++;
        console.log(`[FAIL] HTTP ${status} (${duration}ms) - ${r.name} (${r.path})`);
      }
    } catch (err) {
      failedCount++;
      console.log(`[ERROR] - ${r.name} (${r.path}): ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log(`TOTAL TESTED: ${routesToTest.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('====================================================');
}

runSiteCheck();
