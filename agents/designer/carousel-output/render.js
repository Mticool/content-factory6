const playwright = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderSlides() {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 2
  });
  
  const page = await context.newPage();
  
  for (let i = 1; i <= 5; i++) {
    const htmlPath = path.join(__dirname, `slide-${i}.html`);
    const outputPath = path.join(__dirname, `slide-${i}.png`);
    
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: outputPath,
      type: 'png',
      fullPage: false
    });
    
    console.log(`✓ Слайд ${i} отрендерен: slide-${i}.png`);
  }
  
  await browser.close();
  console.log('\n✅ Все 5 слайдов готовы!');
}

renderSlides().catch(console.error);
