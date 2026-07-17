const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

(async () => {
  console.log('Starting headless browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Create artifact directory if it doesn't exist
  const artifactDir = path.join(os.homedir(), '.gemini', 'antigravity', 'brain', '6873efe1-ca7e-4190-8589-ac7b2a8da997');
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const urls = [
    { url: 'http://localhost:5173/academy/employers.html#contact-form', name: 'v2_employers_form.png' },
    { url: 'http://localhost:5173/academy/community-partners.html#contact-form', name: 'v2_community_form.png' },
    { url: 'http://localhost:5173/academy/startups.html#contact-form', name: 'v2_startups_form.png' },
    { url: 'http://localhost:5173/academy/newcomers.html#contact-form', name: 'v2_newcomers_form.png' },
    { url: 'http://localhost:5173/procurement.html#contact-form', name: 'v2_procurement_form.png' }
  ];

  for (const item of urls) {
    console.log(`Navigating to ${item.url}...`);
    await page.goto(item.url);
    // Wait a moment for rendering and scrolling
    await page.waitForTimeout(1000);
    
    const screenshotPath = path.join(artifactDir, item.name);
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot: ${screenshotPath}`);
  }

  await browser.close();
  console.log('Done!');
})();
