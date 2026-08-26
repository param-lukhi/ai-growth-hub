const { firestoreDb } = require('../lib/db');

async function main() {
  console.log('Testing Cloud Firestore database connection & collections...');
  try {
    const websiteCount = await firestoreDb.website.count();
    console.log('✅ Connection SUCCESS!');
    console.log('Website count:', websiteCount);
    
    const userCount = await firestoreDb.user.count();
    console.log('User count:', userCount);

    const agentCount = await firestoreDb.websiteAgent.count();
    console.log('WebsiteAgent count:', agentCount);

    const articleCount = await firestoreDb.contentArticle.count();
    console.log('ContentArticle count:', articleCount);

    const productCount = await firestoreDb.product.count();
    console.log('Product count:', productCount);

    const blogCount = await firestoreDb.blog.count();
    console.log('Blog count:', blogCount);

    const websites = await firestoreDb.website.findMany({
      include: { agent: true }
    });
    console.log('\nExisting Websites in Firestore:');
    if (websites.length === 0) {
      console.log('No websites found yet in Firestore.');
    } else {
      for (const w of websites) {
        console.log(`- ID: ${w.id}, Name: ${w.name}, Domain: ${w.domainUrl || w.domain}, Agent: ${w.agent ? (w.agent.name || w.agent.agentName) : 'None'}`);
      }
    }
  } catch (err) {
    console.error('Firestore Query Error:', err.message);
  }
}

main();
