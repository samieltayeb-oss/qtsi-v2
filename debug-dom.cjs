const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/ai-governance-assessment.html');
  await page.waitForTimeout(1000);
  
  const landingDisplay = await page.evaluate(() => {
    const el = document.getElementById('ag-landing');
    return el ? window.getComputedStyle(el).display : 'null';
  });
  
  const resultsDisplay = await page.evaluate(() => {
    const el = document.getElementById('ag-results');
    return el ? window.getComputedStyle(el).display : 'null';
  });

  const h1Display = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return el ? window.getComputedStyle(el).color : 'null';
  });

  const h1Text = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return el ? el.innerText : 'null';
  });

  const bodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });

  console.log(`ag-landing display: ${landingDisplay}`);
  console.log(`ag-results display: ${resultsDisplay}`);
  console.log(`h1 color: ${h1Display}, text: ${h1Text}`);
  console.log(`body background: ${bodyBg}`);

  await browser.close();
})();
