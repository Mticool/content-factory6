/**
 * Screenshot Grabber for Carousel Slides
 * 
 * Скачивает скриншоты с GitHub репозиториев для использования в каруселях.
 * 3 стратегии: OG Image → README Image → Full Page Screenshot.
 * 
 * Использование:
 *   node grab-screenshots.js repos.json
 * 
 * repos.json формат:
 *   [
 *     { "name": "obsidian-skills", "url": "https://github.com/kepano/obsidian-skills" },
 *     { "name": "superpowers", "url": "https://github.com/obra/superpowers" }
 *   ]
 * 
 * Или прямо из CLI:
 *   node grab-screenshots.js --repo "https://github.com/kepano/obsidian-skills"
 * 
 * Результат: screenshots/{name}-og.png, {name}-readme.png, или {name}-page.png
 * 
 * Требования: npm install playwright && npx playwright install chromium
 * 
 * © Фабрика Контента | galson.pro
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const DIR = path.dirname(__dirname); // carousel skill root
const OUT = path.join(DIR, 'screenshots');

// Download file from URL
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

// Extract OG image URL from GitHub page HTML
function extractOgImage(html) {
  const match = html.match(/https:\/\/opengraph\.githubassets\.com\/[^"']*/);
  return match ? match[0] : null;
}

async function grabScreenshots(repos) {
  fs.mkdirSync(OUT, { recursive: true });
  
  const results = [];
  let browser = null;
  
  for (const repo of repos) {
    const name = repo.name;
    console.log(`\n📸 ${name} (${repo.url})`);
    
    // Strategy 1: OG Image
    try {
      const response = await fetch(repo.url);
      const html = await response.text();
      const ogUrl = extractOgImage(html);
      
      if (ogUrl) {
        const ogPath = path.join(OUT, `${name}-og.png`);
        await download(ogUrl, ogPath);
        const size = fs.statSync(ogPath).size;
        if (size > 1000) {
          console.log(`  ✅ OG image (${(size/1024).toFixed(0)}KB)`);
          results.push({ name, file: `${name}-og.png`, method: 'og' });
          continue; // OG found, skip other strategies
        }
      }
    } catch (e) {
      console.log(`  ⚠️ OG failed: ${e.message}`);
    }
    
    // Strategy 2 & 3: Playwright (README image or full page)
    if (!browser) {
      browser = await chromium.launch();
    }
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    
    try {
      await page.goto(repo.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Strategy 2: README image
      const img = await page.$('article img');
      if (img) {
        const imgPath = path.join(OUT, `${name}-readme.png`);
        await img.screenshot({ path: imgPath });
        const size = fs.statSync(imgPath).size;
        if (size > 1000) {
          console.log(`  ✅ README image (${(size/1024).toFixed(0)}KB)`);
          results.push({ name, file: `${name}-readme.png`, method: 'readme' });
          await page.close();
          continue;
        }
      }
      
      // Strategy 3: Full page screenshot
      const pagePath = path.join(OUT, `${name}-page.png`);
      await page.screenshot({ 
        path: pagePath,
        clip: { x: 0, y: 0, width: 1280, height: 900 }
      });
      console.log(`  ✅ Full page screenshot`);
      results.push({ name, file: `${name}-page.png`, method: 'page' });
      
    } catch (e) {
      console.log(`  ❌ Failed: ${e.message}`);
    }
    
    await page.close();
  }
  
  if (browser) await browser.close();
  
  // Summary
  console.log('\n=== RESULTS ===');
  results.forEach(r => console.log(`  ${r.name}: ${r.file} (${r.method})`));
  
  // Save manifest
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(results, null, 2));
  console.log(`\n${results.length}/${repos.length} screenshots saved to screenshots/`);
  
  return results;
}

// CLI
(async () => {
  const args = process.argv.slice(2);
  
  if (args[0] === '--repo') {
    // Single repo mode
    const url = args[1];
    const name = url.split('/').pop();
    await grabScreenshots([{ name, url }]);
  } else if (args[0] && fs.existsSync(args[0])) {
    // JSON file mode
    const repos = JSON.parse(fs.readFileSync(args[0], 'utf8'));
    await grabScreenshots(repos);
  } else {
    console.log(`
Screenshot Grabber for Carousel Slides
© Фабрика Контента | galson.pro

Использование:
  node grab-screenshots.js repos.json      # массовый захват из JSON
  node grab-screenshots.js --repo URL      # один репозиторий

repos.json формат:
  [
    { "name": "obsidian-skills", "url": "https://github.com/kepano/obsidian-skills" },
    { "name": "superpowers", "url": "https://github.com/obra/superpowers" }
  ]

Стратегия захвата (по приоритету):
  1. GitHub OG Image (быстро, всегда есть)
  2. Первое изображение из README
  3. Скриншот всей страницы

Результат: screenshots/{name}-og.png или {name}-readme.png или {name}-page.png
    `);
  }
})();
