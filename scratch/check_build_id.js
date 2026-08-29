async function test() {
  const res = await fetch('https://paramaihub.vercel.app/admin/login');
  const html = await res.text();
  const match = html.match(/"buildId":"([^"]+)"/);
  console.log('Build ID on live site:', match ? match[1] : 'Not found');
}
test();
