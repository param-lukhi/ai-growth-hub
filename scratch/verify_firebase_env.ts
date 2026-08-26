import fs from 'fs';
import path from 'path';
import { firestoreDb } from '../lib/db';

function parseEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envVars: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...val] = trimmed.split('=');
        envVars[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return envVars;
}

async function checkFirebaseHealth() {
  console.log('\n======================================================');
  console.log('🔍 PARAM AI HUB — FIREBASE INTEGRATION HEALTH CHECK');
  console.log('======================================================\n');

  const fileEnv = parseEnvFile();
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fileEnv.FIREBASE_PROJECT_ID || fileEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || fileEnv.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || fileEnv.FIREBASE_PRIVATE_KEY;

  console.log('1. Local .env File & Environment Variables Check:');
  console.log('   - FIREBASE_PROJECT_ID / NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId ? `✅ (${projectId})` : '❌ (Not set in .env)');
  console.log('   - FIREBASE_CLIENT_EMAIL:', clientEmail ? `✅ (${clientEmail})` : '❌ (Not set in .env)');
  console.log('   - FIREBASE_PRIVATE_KEY:', privateKey ? '✅ (Present in .env)' : '❌ (Not set in .env)');

  if (!projectId || !clientEmail || !privateKey) {
    console.log('\n⚠️  STATUS: Firebase keys are not yet added to your local .env file.');
    console.log('💡 Note: The application builds and runs safely without crashing, but to run live Firestore queries locally:');
    console.log('   Add your FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to your local .env file.');
  } else {
    console.log('\n✅ STATUS: Firebase credentials detected!');
  }

  console.log('\n2. Database Abstraction Layer Check (lib/db.ts):');
  console.log('   - firestoreDb export:', firestoreDb ? '✅ (Available)' : '❌ (Missing)');
  console.log('   - Website model helper:', firestoreDb.website ? '✅ (Available)' : '❌ (Missing)');
  console.log('   - Agent model helper:', firestoreDb.websiteAgent ? '✅ (Available)' : '❌ (Missing)');
  console.log('   - Article model helper:', firestoreDb.contentArticle ? '✅ (Available)' : '❌ (Missing)');

  console.log('\n======================================================\n');
}

checkFirebaseHealth().catch(console.error);
