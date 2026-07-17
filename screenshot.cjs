const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

(async () => {
  const artifactDir = path.join(os.homedir(), '.gemini', 'antigravity', 'brain', '6873efe1-ca7e-4190-8589-ac7b2a8da997');
  
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const pages = [
    { url: 'http://localhost:5173/index.html', name: 'index' },
    { url: 'http://localhost:5173/contact.html', name: 'contact' },
    { url: 'http://localhost:5173/ai-governance-assessment.html', name: 'assessment' }
  ];

  const viewports = [
    { name: 'desktop_1440', width: 1440, height: 900 }
  ];

  console.log(`Starting headless browser...`);
  const browser = await chromium.launch();
  
  for (const p of pages) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();
      
      console.log(`Navigating to ${p.url} at ${vp.width}x${vp.height}...`);
      await page.goto(p.url, { waitUntil: 'networkidle' });
      
      // Wait an extra second for animations to settle
      await page.waitForTimeout(1000);
      
      const screenshotPath = path.join(artifactDir, `v2_${p.name}_${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Saved screenshot: ${screenshotPath}`);
      
      await context.close();
    }
  }
  
  await browser.close();
  console.log('Done!');
})();
