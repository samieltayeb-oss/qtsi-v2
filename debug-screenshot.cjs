const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/ai-governance-assessment.html');
  await page.waitForTimeout(2000);
  
  const artifactDir = path.join(os.homedir(), '.gemini', 'antigravity', 'brain', '6873efe1-ca7e-4190-8589-ac7b2a8da997');
  await page.screenshot({ path: path.join(artifactDir, 'debug.png'), fullPage: true });
  
  await browser.close();
})();
