#!/usr/bin/env python3
"""
Avito Stealth Scraper — парсинг объявлений с обходом anti-bot
"""
import sys
import json
import re
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

def scrape_avito_product(url: str) -> dict:
    """
    Парсит объявление с Авито.
    
    Args:
        url: Ссылка на объявление Avito
    
    Returns:
        dict: Данные объявления
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
        
        print(f"🔍 Открываю Avito: {url[:60]}...")
        
        try:
            page.goto(url, wait_until='networkidle', timeout=90000)
            page.wait_for_timeout(7000)
            
            # Прокрутка для загрузки контента
            print("📜 Прокручиваю страницу...")
            for i in range(4):
                page.evaluate('window.scrollBy(0, 600)')
                page.wait_for_timeout(1500)
            
            # Скриншот для debug
            page.screenshot(path='/tmp/avito-debug.png', full_page=False)
            print("📸 Скриншот: /tmp/avito-debug.png")
            
            # Проверка капчи/блокировки
            content = page.content().lower()
            body_text = page.evaluate('() => document.body.innerText')
            
            if 'captcha' in content or 'проверка браузера' in body_text.lower():
                print("❌ Обнаружена капча/блокировка!")
                browser.close()
                return {'error': 'captcha', 'url': url}
            
            print("✅ Страница загружена")
            
            # Парсинг данных
            data = page.evaluate('''() => {
                const result = {
                    title: '',
                    price: '',
                    description: '',
                    seller: '',
                    location: '',
                    date: '',
                    views: '',
                    images: [],
                    params: {},
                    contacts: '',
                };
                
                // Название
                const titleEl = document.querySelector('h1, [data-marker="item-view/title-info"], [itemprop="name"]');
                if (titleEl) result.title = titleEl.innerText.trim();
                
                // Цена
                const priceEl = document.querySelector('[itemprop="price"], [data-marker="item-view/item-price"]');
                if (priceEl) {
                    result.price = priceEl.innerText.trim();
                } else {
                    // Ищем в тексте
                    const bodyText = document.body.innerText;
                    const priceMatch = bodyText.match(/([\\d\\s]+₽)/);
                    if (priceMatch) result.price = priceMatch[1].trim();
                }
                
                // Описание
                const descEl = document.querySelector('[itemprop="description"], [data-marker="item-view/item-description"]');
                if (descEl) result.description = descEl.innerText.trim();
                
                // Локация
                const locEl = document.querySelector('[itemprop="address"], [data-marker="item-view/location"]');
                if (locEl) result.location = locEl.innerText.trim();
                
                // Дата публикации
                const dateEl = document.querySelector('[data-marker="item-view/item-date"]');
                if (dateEl) result.date = dateEl.innerText.trim();
                
                // Просмотры
                const viewsEl = document.querySelector('[data-marker="item-view/total-views"]');
                if (viewsEl) result.views = viewsEl.innerText.trim();
                
                // Продавец
                const sellerEl = document.querySelector('[data-marker="seller-info/name"]');
                if (sellerEl) result.seller = sellerEl.innerText.trim();
                
                // Изображения
                const imgEls = document.querySelectorAll('[data-marker="image-frame/image-wrapper"] img, .gallery-img-wrapper img');
                imgEls.forEach(img => {
                    if (img.src && !img.src.includes('data:image')) {
                        result.images.push(img.src);
                    }
                });
                
                // Характеристики/параметры
                const paramEls = document.querySelectorAll('[data-marker="item-view/item-params"] li');
                paramEls.forEach(li => {
                    const text = li.innerText.trim();
                    const parts = text.split(':');
                    if (parts.length === 2) {
                        result.params[parts[0].trim()] = parts[1].trim();
                    }
                });
                
                return result;
            }''')
            
            # Дополнительно парсим через текст (если селекторы не сработали)
            if not data['title']:
                lines = body_text.split('\n')
                for i, line in enumerate(lines):
                    line = line.strip()
                    if len(line) > 10 and len(line) < 200 and i < 20:
                        # Первая длинная строка скорее всего название
                        if not any(skip in line.lower() for skip in ['авито', 'cookie', 'войти', 'объявлени']):
                            data['title'] = line
                            break
            
            data['url'] = url
            data['marketplace'] = 'avito'
            
            browser.close()
            
            print(f"✅ Получено: {data['title'][:50] if data['title'] else 'без названия'}...")
            return data
            
        except Exception as e:
            browser.close()
            print(f"❌ Ошибка: {str(e)[:100]}")
            return {'error': str(e), 'url': url}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 avito-stealth-scraper.py <AVITO_URL>")
        print("Example: python3 avito-stealth-scraper.py https://www.avito.ru/moskva/tovary_dlya_kompyutera/...")
        sys.exit(1)
    
    url = sys.argv[1]
    result = scrape_avito_product(url)
    
    print("\n" + "="*60)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("="*60)
