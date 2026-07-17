// Node 24 native fetch

const baseUrl = 'https://qtsi-v2.vercel.app';
const routes = [
  '/',
  '/ai-governance.html',
  '/executive-advisory.html',
  '/academy.html',
  '/academy/employers.html',
  '/academy/community-partners.html',
  '/academy/startups.html',
  '/academy/newcomers.html',
  '/procurement.html',
  '/ai-governance-assessment.html',
  '/contact.html',
  '/privacy.html',
  '/terms.html'
];

async function verifyRoutes() {
  console.log('=== ROUTE VERIFICATION ===');
  for (const route of routes) {
    try {
      const res = await fetch(`${baseUrl}${route}`);
      if (res.ok) {
        console.log(`✅ ${route} - HTTP ${res.status}`);
      } else {
        console.log(`❌ ${route} - HTTP ${res.status}`);
      }
    } catch (e) {
      console.log(`❌ ${route} - Error: ${e.message}`);
    }
  }
}

async function verifyLeadAPI() {
  console.log('\n=== FORM / LEAD API VERIFICATION ===');
  const payload = {
    name: "STAGING TEST - DO NOT CONTACT",
    email: "test@example.com",
    phone: "555-0199",
    company: "Test Corp",
    service_type: "Global Modal Staging Test",
    message: "This is an automated staging test payload.",
    source_page: "/contact.html",
    consent: true
  };

  try {
    const res = await fetch(`${baseUrl}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const json = await res.json();
      console.log(`✅ API Lead Endpoint: HTTP 200 - Response:`, json);
    } else {
      console.log(`❌ API Lead Endpoint: HTTP ${res.status}`);
    }
  } catch (e) {
    console.log(`❌ API Lead Endpoint Error: ${e.message}`);
  }
}

async function run() {
  await verifyRoutes();
  await verifyLeadAPI();
}

run();
