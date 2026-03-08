/**
 * Carousel Render Script
 * Рендерит слайды из slides.json через HTML-шаблон в PNG.
 * 
 * Использование:
 *   node render.js
 * 
 * Требования:
 *   npm install playwright
 *   npx playwright install chromium
 * 
 * Входные данные:
 *   slides.json — массив слайдов (генерируется скиллом)
 *   brand-kit.json — цвета и шрифты (генерируется при онбординге)
 *   template.html — HTML-шаблон с плейсхолдерами
 * 
 * © Фабрика Контента | galson.pro
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DIR = __dirname;
const PARENT = path.dirname(DIR);

// Load brand kit
function loadBrandKit() {
  const kitPath = path.join(PARENT, 'references', 'brand-kit.json');
  if (fs.existsSync(kitPath)) {
    return JSON.parse(fs.readFileSync(kitPath, 'utf8'));
  }
  // Default dark theme
  return {
    handle: '@your_account',
    headingFont: 'Montserrat',
    codeFont: 'JetBrains Mono',
    bgGradient: 'linear-gradient(170deg, #111 0%, #0a0a0a 100%)',
    bgSolid: '#0a0a0a',
    bgOverlay: 'rgba(0,0,0,0.85)',
    bgOverlayFull: 'rgba(0,0,0,0.75)',
    textColor: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.75)',
    textMuted: 'rgba(255,255,255,0.25)',
    accentColor: '#d97734',
    accentGlow: 'rgba(217,119,52,0.15)',
    accentDim: 'rgba(217,119,52,0.5)',
    borderGlow: 'rgba(255,255,255,0.06)',
  };
}

// Apply brand kit to template
function applyBrand(html, kit) {
  return html
    .replace(/\{\{HEADING_FONT\}\}/g, kit.headingFont)
    .replace(/\{\{CODE_FONT\}\}/g, kit.codeFont)
    .replace(/\{\{BG_GRADIENT\}\}/g, kit.bgGradient)
    .replace(/\{\{BG_SOLID\}\}/g, kit.bgSolid)
    .replace(/\{\{BG_OVERLAY\}\}/g, kit.bgOverlay)
    .replace(/\{\{BG_OVERLAY_FULL\}\}/g, kit.bgOverlayFull)
    .replace(/\{\{TEXT_COLOR\}\}/g, kit.textColor)
    .replace(/\{\{TEXT_SECONDARY\}\}/g, kit.textSecondary)
    .replace(/\{\{TEXT_MUTED\}\}/g, kit.textMuted)
    .replace(/\{\{ACCENT_COLOR\}\}/g, kit.accentColor)
    .replace(/\{\{ACCENT_GLOW\}\}/g, kit.accentGlow)
    .replace(/\{\{ACCENT_DIM\}\}/g, kit.accentDim)
    .replace(/\{\{BORDER_GLOW\}\}/g, kit.borderGlow);
}

(async () => {
  const kit = loadBrandKit();
  
  // Load slides
  const slidesPath = path.join(PARENT, 'slides.json');
  if (!fs.existsSync(slidesPath)) {
    console.error('❌ slides.json not found. Generate slides first.');
    process.exit(1);
  }
  const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));
  
  // Prepare template
  let template = fs.readFileSync(path.join(DIR, 'template.html'), 'utf8');
  template = applyBrand(template, kit);
  
  // Write branded template
  const brandedPath = path.join(DIR, '_branded.html');
  fs.writeFileSync(brandedPath, template);
  
  // Create output dir
  const OUT = path.join(PARENT, 'final');
  fs.mkdirSync(OUT, { recursive: true });
  
  // Render
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  
  for (const slide of slides) {
    await page.goto('file://' + brandedPath);
    await page.waitForTimeout(500);
    
    // Replace handle
    let html = slide.html.replace(/\{\{HANDLE\}\}/g, kit.handle);
    
    // Resolve relative image paths
    html = html.replace(/src="(?!file:|http)(.*?)"/g, (match, p) => {
      return `src="file://${path.resolve(PARENT, p)}"`;
    });
    
    await page.evaluate((h) => {
      document.getElementById('slide').outerHTML = h;
    }, html);
    
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, slide.id + '.png'), type: 'png' });
    console.log(`✅ ${slide.id}`);
  }
  
  await browser.close();
  
  // List output
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.png'));
  console.log(`\n=== ${files.length} slides rendered to final/ ===`);
  files.forEach(f => {
    const sz = fs.statSync(path.join(OUT, f)).size;
    console.log(`  ${f}: ${(sz/1024).toFixed(0)}KB`);
  });
})();
