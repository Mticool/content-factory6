#!/usr/bin/env python3
"""
Ozon Stealth Scraper — обход anti-bot защиты для парсинга карточек товаров
"""
import sys
import json
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

def scrape_ozon_product(url: str) -> dict:
    """
    Извлекает данные карточки товара с Ozon с обходом блокировки.
    
    Args:
        url: Ссылка на товар Ozon (ozon.ru/t/xxx или ozon.ru/product/xxx)
    
    Returns:
        dict: Данные товара (название, цена, описание, рейтинг, отзывы)
    """
    with sync_playwright() as p:
        # Запускаем браузер с нормальными настройками (не headless!)
        browser = p.chromium.launch(
            headless=False,  # Важно: НЕ headless для обхода детекта
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
            ]
        )
        
        # Контекст с реалистичными параметрами
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='ru-RU',
            timezone_id='Europe/Moscow',
            geolocation={'latitude': 55.7558, 'longitude': 37.6173},  # Москва
            permissions=['geolocation'],
        )
        
        page = context.new_page()
        
        # Применяем stealth для обхода детекта ботов
        stealth_config = Stealth()
        stealth_config.apply_stealth_sync(page)
        
        print(f"🔍 Открываю: {url}")
        
        # Переходим на страницу
        page.goto(url, wait_until='domcontentloaded', timeout=60000)
        
        # Ждём загрузку контента
        page.wait_for_timeout(5000)
        
        # Прокрутим вниз для ленивой загрузки
        page.evaluate('window.scrollTo(0, document.body.scrollHeight / 2)')
        page.wait_for_timeout(2000)
        
        # Скриншот для отладки
        page.screenshot(path='/tmp/ozon-debug.png', full_page=False)
        print("📸 Скриншот сохранён: /tmp/ozon-debug.png")
        
        # Проверяем блокировку
        if 'Доступ ограничен' in page.content():
            print("❌ Ozon заблокировал доступ")
            browser.close()
            return {'error': 'blocked'}
        
        print("✅ Страница открылась успешно")
        
        # Извлекаем данные
        data = page.evaluate('''() => {
            const result = {
                title: '',
                price: '',
                old_price: '',
                rating: '',
                reviews_count: '',
                description: '',
                images: [],
                characteristics: {},
                seller: '',
            };
            
            // Название товара (множественные селекторы)
            const titleEl = document.querySelector('h1[data-widget="webProductHeading"], h1.tsHeadline550Medium, h1');
            if (titleEl) result.title = titleEl.innerText.trim();
            
            // Цена
            const priceEl = document.querySelector('[class*="Price_price"]');
            if (priceEl) {
                result.price = priceEl.innerText.trim();
            }
            
            // Старая цена
            const oldPriceEl = document.querySelector('[class*="Price_oldPrice"]');
            if (oldPriceEl) {
                result.old_price = oldPriceEl.innerText.trim();
            }
            
            // Рейтинг
            const ratingEl = document.querySelector('[class*="Rating_score"]');
            if (ratingEl) result.rating = ratingEl.innerText.trim();
            
            // Количество отзывов
            const reviewsEl = document.querySelector('[class*="Rating_count"]');
            if (reviewsEl) result.reviews_count = reviewsEl.innerText.trim();
            
            // Описание
            const descEl = document.querySelector('[data-widget="webDescription"]');
            if (descEl) result.description = descEl.innerText.trim();
            
            // Изображения
            const imgEls = document.querySelectorAll('[data-widget="webGallery"] img');
            imgEls.forEach(img => {
                if (img.src && !img.src.includes('data:image')) {
                    result.images.push(img.src);
                }
            });
            
            // Характеристики
            const charEls = document.querySelectorAll('[data-widget="webCharacteristics"] dl');
            charEls.forEach(dl => {
                const dt = dl.querySelector('dt');
                const dd = dl.querySelector('dd');
                if (dt && dd) {
                    result.characteristics[dt.innerText.trim()] = dd.innerText.trim();
                }
            });
            
            // Продавец
            const sellerEl = document.querySelector('[data-widget="webCurrentSeller"]');
            if (sellerEl) result.seller = sellerEl.innerText.trim();
            
            return result;
        }''')
        
        browser.close()
        
        return data

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 ozon-stealth-scraper.py <OZON_URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    result = scrape_ozon_product(url)
    
    print("\n" + "="*60)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("="*60)
