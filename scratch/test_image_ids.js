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

async function testAll() {
  const ids = [
    '61TapeOXotL',
    '71g7v38Y-lL',
    '71VjM2v19zL',
    '71d17-91zHL',
    '71S8uR1e4BL',
    '71Q1xKkC5kL',
    '71y3QWzB5dL',
    '71kX6Nl9p6L',
    '614S2M68mIL',
    '71u+m6qS4WL',
    '61aLy7kImQL',
    '71x-j737yQL',
    '61EPYtq1zCL',
    '71m9M21rPCL',
    '71R3T1JgSUL'
  ];

  for (const id of ids) {
    await check(id);
  }
}

testAll();
