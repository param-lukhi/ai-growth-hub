const fs = require('fs');
if (fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8');
  const lines = env.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      const val = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
      console.log('DATABASE_URL exists: YES');
      console.log('DATABASE_URL empty:', val.length === 0 ? 'YES' : 'NO');
      try {
        const u = new URL(val);
        console.log('Database protocol:', u.protocol);
        console.log('Database host:', u.hostname);
        console.log('Database database:', u.pathname);
      } catch (e) {
        console.log('Parse error:', e.message);
      }
    }
  }
} else {
  console.log('No .env file found');
}
