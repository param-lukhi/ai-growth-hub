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

const { POST } = require('../app/api/saas/websites/route');

async function testPost() {
  const payload = {
    name: 'SmartHomeHub',
    domainUrl: 'https://smarthomehub.io',
    niche: 'Custom',
    customNiche: 'Smart Home Automation',
    subNiche: 'Home Security',
    targetCountry: 'United States',
    targetLanguage: 'English',
    targetAudience: 'Home owners looking for smart security devices',
    brandVoice: 'Clear, helpful, practical, trustworthy',
    contentStyle: 'In-depth research-backed buying guides',
    monetization: ['AMAZON_AFFILIATE', 'ADSENSE'],
    publishingFrequency: '3_PER_WEEK',
    approvalMode: 'MANUAL',
    cmsType: 'NATIVE'
  };

  const req = new Request('http://localhost:3000/api/saas/websites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      niche: payload.niche === 'Custom' ? (payload.customNiche || 'General') : payload.niche
    })
  });

  console.log('Sending POST to /api/saas/websites...');
  const res = await POST(req);
  const data = await res.json();
  console.log('Status code:', res.status);
  console.log('Response body:', JSON.stringify(data, null, 2));
}

testPost().catch(console.error);
