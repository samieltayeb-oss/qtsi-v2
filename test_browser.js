import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  console.log('Navigating to localhost:5173...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('Page loaded. Checking classes of .fade-up elements...');
    const fadeUpCount = await page.evaluate(() => document.querySelectorAll('.fade-up').length);
    const visibleCount = await page.evaluate(() => document.querySelectorAll('.fade-up.visible').length);
    console.log(`Fade up elements: ${fadeUpCount}`);
    console.log(`Visible elements: ${visibleCount}`);
  } catch (e) {
    console.log('Navigation failed:', e.message);
  }
  
  await browser.close();
})();
