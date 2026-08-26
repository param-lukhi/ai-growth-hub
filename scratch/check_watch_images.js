const https = require('https');

function check(id, label) {
  return new Promise((resolve) => {
    const url = `https://m.media-amazon.com/images/I/${id}._SL1500_.jpg`;
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`[VALID 200 OK] ${label}: ${url}`);
        resolve(url);
      } else {
        resolve(null);
      }
    }).on('error', () => resolve(null));
  });
}

async function testAllWatches() {
  await check('61SSVxTSs3L', 'Noise ColorFit Pro 5 Max');
  await check('61y2VVWcGBL', 'Fire-Boltt Phoenix Ultra');
  await check('61epn29QG0L', 'boAt Wave Call');
  await check('61TapeOXotL', 'Noise Pulse 2');
  await check('61Akt30n5-L', 'boAt Storm Call');
  await check('71g6A7B5hQL', 'Fastrack Limitless');
  await check('61O0v-5U-5L', 'Noise Icon Buzz');
  await check('71s50f16k5L', 'Fire-Boltt Ninja');
}

testAllWatches();
