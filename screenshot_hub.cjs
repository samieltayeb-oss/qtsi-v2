const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1080 }
  });
  
  await page.goto('http://localhost:5173/ai-governance-assessment.html');
  // Wait for animation to finish
  await page.waitForTimeout(2000);
  
  const dest = path.join('C:', 'Users', 'mcreg', '.gemini', 'antigravity', 'brain', '6873efe1-ca7e-4190-8589-ac7b2a8da997', 'hub_redesign.png');
  await page.screenshot({ path: dest, fullPage: true });
  
  console.log(`Saved screenshot to ${dest}`);
  await browser.close();
  process.exit(0);
})();
