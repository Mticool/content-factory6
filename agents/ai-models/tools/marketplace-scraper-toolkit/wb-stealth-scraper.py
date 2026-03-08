#!/usr/bin/env python3
"""
Wildberries Stealth Scraper — обход anti-bot защиты для парсинга карточек товаров
"""
import sys
import json
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

def scrape_wb_product(url: str) -> dict:
    """
    Извлекает данные карточки товара с Wildberries с обходом блокировки.
    
    Args:
        url: Ссылка на товар WB
    
    Returns:
        dict: Данные товара
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
            ]
        )
        
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='ru-RU',
            timezone_id='Europe/Moscow',
            geolocation={'latitude': 55.7558, 'longitude': 37.6173},
            permissions=['geolocation'],
        )
        
        page = context.new_page()
        
        stealth_config = Stealth()
        stealth_config.apply_stealth_sync(page)
        
        print(f"🔍 Открываю: {url}")
        
        page.goto(url, wait_until='networkidle', timeout=90000)
        page.wait_for_timeout(10000)
        
        # Прокрутка для триггера ленивой загрузки
        for i in range(3):
            page.evaluate('window.scrollBy(0, 500)')
            page.wait_for_timeout(1000)
        
        # Скриншот для отладки
        page.screenshot(path='/tmp/wb-debug.png', full_page=False)
        print("📸 Скриншот: /tmp/wb-debug.png")
        
        # Проверка блокировки
        content = page.content()
        if 'Почти готово' in content or 'Проверка браузера' in content:
            print("❌ Wildberries заблокировал доступ")
            browser.close()
            return {'error': 'blocked'}
        
        print("✅ Страница открылась")
        
        # Извлечение данных
        data = page.evaluate('''() => {
            const result = {
                title: '',
                brand: '',
                price: '',
                old_price: '',
                rating: '',
                reviews_count: '',
                description: '',
                images: [],
                characteristics: {},
                seller: '',
                article: '',
            };
            
            // Извлекаем весь текст для анализа
            const bodyText = document.body.innerText;
            
            // Название — ищем в тексте перед "Нет оценок" или "Артикул"
            const lines = bodyText.split('\\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('Нет оценок') || lines[i].includes('Артикул')) {
                    if (i > 0 && lines[i-1].trim()) {
                        result.title = lines[i-1].trim();
                        break;
                    }
                }
            }
            
            // Артикул
            if (bodyText.includes('Артикул')) {
                const idx = bodyText.indexOf('Артикул');
                const chunk = bodyText.substring(idx, idx + 100);
                const numMatch = chunk.match(/\\d{6,}/);
                if (numMatch) result.article = numMatch[0];
            }
            
            // Цена (финальная)
            const priceEl = document.querySelector('[class*="priceBlockFinalPrice"], [class*="finalPrice"]');
            if (priceEl) result.price = priceEl.innerText.trim();
            
            // Старая цена
            const oldPriceEl = document.querySelector('[class*="priceBlockOldPrice"], [class*="OldPrice"]');
            if (oldPriceEl) result.old_price = oldPriceEl.innerText.trim();
            
            // Рейтинг
            if (bodyText.includes('Нет оценок')) {
                result.rating = 'Нет оценок';
            } else {
                const starIdx = bodyText.indexOf('★');
                if (starIdx > 0) {
                    const chunk = bodyText.substring(starIdx-10, starIdx);
                    const rateMatch = chunk.match(/\\d+[,.]\\d+/);
                    if (rateMatch) result.rating = rateMatch[0] + ' ★';
                }
            }
            
            // Продавец
            if (bodyText.includes('склад продавца')) {
                const idx = bodyText.indexOf('склад продавца');
                const chunk = bodyText.substring(idx + 15, idx + 100);
                const nameMatch = chunk.match(/([A-Za-zА-Яа-я0-9\\s]+)/);
                if (nameMatch) result.seller = nameMatch[1].trim();
            }
            
            // Изображения
            const imgEls = document.querySelectorAll('img');
            imgEls.forEach(img => {
                if (img.src && (img.src.includes('wbstatic') || img.src.includes('wildberries'))) {
                    if (!result.images.includes(img.src)) {
                        result.images.push(img.src);
                    }
                }
            });
            
            // Описание (упрощённо)
            result.description = bodyText;
            
            return result;
        }''')
        
        browser.close()
        return data

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 wb-stealth-scraper.py <WB_URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    result = scrape_wb_product(url)
    
    print("\n" + "="*60)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("="*60)
