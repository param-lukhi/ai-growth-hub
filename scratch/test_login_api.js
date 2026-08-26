async function testLogin() {
  try {
    const res = await fetch('https://paramaihub.vercel.app/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'lukhiparam904@gmail.com',
        password: 'Hanumandada@904'
      })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response body first 500 chars:', text.substring(0, 500));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testLogin();
