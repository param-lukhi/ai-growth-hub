async function test() {
  const res = await fetch('https://paramaihub.vercel.app/admin/login');
  const text = await res.text();
  const scripts = text.match(/src="([^"]+)"/g);
  console.log('Scripts:', scripts);
}
test();
