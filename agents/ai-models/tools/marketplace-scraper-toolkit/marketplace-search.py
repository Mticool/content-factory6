#!/usr/bin/env python3
"""
Marketplace Search — поиск товаров на Avito, Ozon, Wildberries
Возвращает список ссылок с краткой информацией
"""
import sys
import json
import time
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

def search_avito(query: str, limit: int = 20) -> list:
    """Поиск на Avito"""
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            locale='ru-RU',
            timezone_id='Europe/Moscow',
            geolocation={'latitude': 55.7558, 'longitude': 37.6173},
        )
        
        page = context.new_page()
        Stealth().apply_stealth_sync(page)
        
        print(f"🔍 [AVITO] Ищу: {query}")
        
        # Открываем главную Авито
        page.goto('https://www.avito.ru/', wait_until='domcontentloaded', timeout=60000)
        page.wait_for_timeout(3000)
        
        # Ищем поле поиска и вводим запрос
        search_input = page.query_selector('input[data-marker="search-form/suggest"]')
        if search_input:
            search_input.fill(query)
            page.wait_for_timeout(1000)
            search_input.press('Enter')
        else:
            # Альтернативный способ — прямой URL
            search_url = f'https://www.avito.ru/moskva?q={query.replace(" ", "+")}'
            page.goto(search_url, wait_until='domcontentloaded', timeout=60000)
        
        page.wait_for_timeout(5000)
        
        # Прокрутка для загрузки результатов
        for i in range(3):
            page.evaluate('window.scrollBy(0, 800)')
            page.wait_for_timeout(1500)
        
        # Парсинг результатов
        results = page.evaluate('''(limit) => {
            const items = [];
            const cards = document.querySelectorAll('[data-marker="item"]');
            
            cards.forEach((card, idx) => {
                if (idx >= limit) return;
                
                const item = {
                    title: '',
                    price: '',
                    url: '',
                    location: '',
                    date: '',
                    image: '',
                };
                
                // Ссылка
                const linkEl = card.querySelector('a[itemprop="url"]');
                if (linkEl) item.url = linkEl.href;
                
                // Название
                const titleEl = card.querySelector('[itemprop="name"]');
                if (titleEl) item.title = titleEl.innerText.trim();
                
                // Цена
                const priceEl = card.querySelector('[itemprop="price"]');
                if (priceEl) item.price = priceEl.getAttribute('content') || priceEl.innerText.trim();
                
                // Локация
                const locEl = card.querySelector('[data-marker="item-address"]');
                if (locEl) item.location = locEl.innerText.trim();
                
                // Дата
                const dateEl = card.querySelector('[data-marker="item-date"]');
                if (dateEl) item.date = dateEl.innerText.trim();
                
                // Изображение
                const imgEl = card.querySelector('img[itemprop="image"]');
                if (imgEl) item.image = imgEl.src;
                
                if (item.url) items.push(item);
            });
            
            return items;
        }''', limit)
        
        browser.close()
        
        print(f"✅ Найдено: {len(results)} объявлений")
        return results

def search_ozon(query: str, limit: int = 20) -> list:
    """Поиск на Ozon"""
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            locale='ru-RU',
            timezone_id='Europe/Moscow',
        )
        
        page = context.new_page()
        Stealth().apply_stealth_sync(page)
        
        print(f"🔍 [OZON] Ищу: {query}")
        
        # Прямой URL поиска
        search_url = f'https://www.ozon.ru/search/?text={query.replace(" ", "+")}'
        page.goto(search_url, wait_until='domcontentloaded', timeout=60000)
        page.wait_for_timeout(5000)
        
        # Прокрутка
        for i in range(3):
            page.evaluate('window.scrollBy(0, 800)')
            page.wait_for_timeout(1500)
        
        # Парсинг
        results = page.evaluate('''(limit) => {
            const items = [];
            const cards = document.querySelectorAll('[data-widget="searchResultsV2"] > div > div');
            
            cards.forEach((card, idx) => {
                if (idx >= limit) return;
                
                const item = {
                    title: '',
                    price: '',
                    url: '',
                    rating: '',
                    image: '',
                };
                
                // Ссылка
                const linkEl = card.querySelector('a[href*="/product/"]');
                if (linkEl) item.url = 'https://www.ozon.ru' + linkEl.getAttribute('href');
                
                // Название
                const titleEl = card.querySelector('a[href*="/product/"] span');
                if (titleEl) item.title = titleEl.innerText.trim();
                
                // Цена
                const priceEl = card.querySelector('[class*="price"]');
                if (priceEl) item.price = priceEl.innerText.trim();
                
                // Рейтинг
                const ratingEl = card.querySelector('[class*="rating"]');
                if (ratingEl) item.rating = ratingEl.innerText.trim();
                
                // Изображение
                const imgEl = card.querySelector('img');
                if (imgEl) item.image = imgEl.src;
                
                if (item.url) items.push(item);
            });
            
            return items;
        }''', limit)
        
        browser.close()
        
        print(f"✅ Найдено: {len(results)} товаров")
        return results

def search_wildberries(query: str, limit: int = 20) -> list:
    """Поиск на Wildberries"""
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            locale='ru-RU',
            timezone_id='Europe/Moscow',
        )
        
        page = context.new_page()
        Stealth().apply_stealth_sync(page)
        
        print(f"🔍 [WB] Ищу: {query}")
        
        # Прямой URL поиска
        search_url = f'https://www.wildberries.ru/catalog/0/search.aspx?search={query.replace(" ", "+")}'
        page.goto(search_url, wait_until='networkidle', timeout=90000)
        page.wait_for_timeout(7000)
        
        # Прокрутка
        for i in range(3):
            page.evaluate('window.scrollBy(0, 800)')
            page.wait_for_timeout(2000)
        
        # Парсинг (через текст — селекторы WB сложные)
        body_text = page.evaluate('() => document.body.innerText')
        html = page.content()
        
        # Простой парсинг: ищем ссылки на товары
        results = page.evaluate('''(limit) => {
            const items = [];
            const links = document.querySelectorAll('a[href*="/catalog/"]');
            
            links.forEach((link, idx) => {
                if (idx >= limit) return;
                
                const href = link.href;
                if (href.includes('/catalog/') && href.match(/\\d{8,}/)) {
                    const item = {
                        title: link.innerText.trim() || 'Товар WB',
                        url: href,
                        price: '',
                        image: '',
                    };
                    
                    // Ищем цену рядом
                    const parent = link.closest('article, div');
                    if (parent) {
                        const priceEl = parent.querySelector('[class*="price"]');
                        if (priceEl) item.price = priceEl.innerText.trim();
                        
                        const imgEl = parent.querySelector('img');
                        if (imgEl) item.image = imgEl.src;
                    }
                    
                    items.push(item);
                }
            });
            
            // Убираем дубли
            const unique = [];
            const seen = new Set();
            items.forEach(item => {
                if (!seen.has(item.url)) {
                    seen.add(item.url);
                    unique.push(item);
                }
            });
            
            return unique.slice(0, limit);
        }''', limit)
        
        browser.close()
        
        print(f"✅ Найдено: {len(results)} товаров")
        return results

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 marketplace-search.py <marketplace> <query> [limit]")
        print("\nMarketplaces: avito, ozon, wb")
        print("\nExamples:")
        print("  python3 marketplace-search.py avito 'игрушки трансформеры' 10")
        print("  python3 marketplace-search.py ozon 'чехол iphone' 20")
        print("  python3 marketplace-search.py wb 'наушники' 15")
        sys.exit(1)
    
    marketplace = sys.argv[1].lower()
    query = sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 20
    
    results = []
    
    if marketplace == 'avito':
        results = search_avito(query, limit)
    elif marketplace == 'ozon':
        results = search_ozon(query, limit)
    elif marketplace in ['wb', 'wildberries']:
        results = search_wildberries(query, limit)
    else:
        print(f"❌ Неизвестный маркетплейс: {marketplace}")
        print("Доступны: avito, ozon, wb")
        sys.exit(1)
    
    # Вывод результатов
    print(f"\n{'='*60}")
    print(f"📋 РЕЗУЛЬТАТЫ ПОИСКА: {query}")
    print(f"{'='*60}\n")
    
    for idx, item in enumerate(results, 1):
        print(f"#{idx}")
        print(f"  📦 {item.get('title', 'Без названия')[:70]}")
        print(f"  💰 {item.get('price', 'Цена не указана')}")
        if item.get('rating'):
            print(f"  ⭐ {item['rating']}")
        if item.get('location'):
            print(f"  📍 {item['location']}")
        print(f"  🔗 {item['url']}")
        print()
    
    # Сохранение в JSON
    output_file = f'/tmp/search_{marketplace}_{query.replace(" ", "_")}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Сохранено: {output_file}")
    
    # Сохранение только URL в текстовый файл
    urls_file = f'/tmp/search_{marketplace}_{query.replace(" ", "_")}_urls.txt'
    with open(urls_file, 'w', encoding='utf-8') as f:
        for item in results:
            f.write(item['url'] + '\n')
    
    print(f"🔗 Список URL: {urls_file}")
