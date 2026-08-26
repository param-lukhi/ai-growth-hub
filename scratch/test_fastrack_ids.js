const https = require('https');

function check(id) {
  return new Promise((resolve) => {
    const url = `https://m.media-amazon.com/images/I/${id}._SL1500_.jpg`;
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`FOUND 200 OK: ${id} -> ${url}`);
        resolve(url);
      } else {
        resolve(null);
      }
    }).on('error', () => resolve(null));
  });
}

async function testFastrack() {
  const ids = [
    '61-G1i4oIeL',
    '71Q9PZf9t5L',
    '71kWB-tV2GL',
    '71-uR57yqXL',
    '71Jd1u5kX0L',
    '61u-10t1WYL',
    '714o-R7748L',
    '61i-q9-9b9L',
    '71X8k7-y8QL',
    '61u8p5Kz8-L',
    '71s50f16k5L',
    '61ZjlBOVEL'
  ];

  for (const id of ids) {
    await check(id);
  }
}

testFastrack();
