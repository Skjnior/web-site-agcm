
// Native fetch in Node 20

const INTERNAL_SECRET = 'internal-page-view-secret';
const API_URL = 'http://127.0.0.1:3000/api/internal/page-view';

async function test() {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': INTERNAL_SECRET,
      },
      body: JSON.stringify({
        path: '/test-manual',
        method: 'GET',
        ipAddress: '8.8.8.8',
        userAgent: 'Manual Test Script',
      }),
    });
    const data = await res.json();
    console.log('Response:', data);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
