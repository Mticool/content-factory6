#!/usr/bin/env python3
"""
Batch Scraper — массовый парсинг товаров Ozon/WB с защитой от блокировки
"""
import sys
import json
import time
import random
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

# Пул User-Agent для ротации
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
]

def detect_marketplace(url: str) -> str:
    """Определяет маркетплейс по URL"""
    if 'ozon.ru' in url:
        return 'ozon'
    elif 'wildberries.ru' in url or 'wb.ru' in url:
        return 'wb'
    elif 'avito.ru' in url:
        return 'avito'
    else:
        return 'unknown'

def scrape_product(url: str, user_agent: str) -> dict:
    """
    Парсит один товар (Ozon или WB).
    """
    marketplace = detect_marketplace(url)
    
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
            user_agent=user_agent,
            locale='ru-RU',
            timezone_id='Europe/Moscow',
            geolocation={'latitude': 55.7558, 'longitude': 37.6173},
            permissions=['geolocation'],
        )
        
        page = context.new_page()
        Stealth().apply_stealth_sync(page)
        
        print(f"🔍 [{marketplace.upper()}] Открываю: {url[:60]}...")
        
        try:
            page.goto(url, wait_until='networkidle', timeout=90000)
            
            # Рандомная задержка (имитация чтения)
            read_delay = random.uniform(3, 7)
            print(f"👁️ Имитирую чтение ({read_delay:.1f}с)...")
            page.wait_for_timeout(int(read_delay * 1000))
            
            # Прокрутка страницы (как реальный пользователь)
            scroll_count = random.randint(3, 6)
            for i in range(scroll_count):
                scroll_amount = random.randint(400, 800)
                page.evaluate(f'window.scrollBy(0, {scroll_amount})')
                page.wait_for_timeout(random.randint(800, 1500))
            
            # Проверка блокировки
            content = page.content().lower()
            if 'доступ ограничен' in content or 'почти готово' in content:
                print("❌ БЛОКИРОВКА ОБНАРУЖЕНА!")
                browser.close()
                return {'error': 'blocked', 'url': url}
            
            # Парсинг данных
            data = page.evaluate('''() => {
                const result = {
                    title: '',
                    price: '',
                    old_price: '',
                    rating: '',
                    article: '',
                    seller: '',
                    description: '',
                    images: [],
                };
                
                const bodyText = document.body.innerText;
                
                // Название
                const h1 = document.querySelector('h1');
                if (h1) result.title = h1.innerText.trim();
                
                // Артикул
                const articleMatch = bodyText.match(/Артикул[:\\s]+(\\d+)/);
                if (articleMatch) result.article = articleMatch[1];
                
                // Цена
                const priceEl = document.querySelector('[class*="price"]');
                if (priceEl) {
                    const priceText = priceEl.innerText;
                    const priceMatch = priceText.match(/[\\d\\s]+₽/);
                    if (priceMatch) result.price = priceMatch[0].trim();
                }
                
                // Рейтинг
                if (bodyText.includes('Нет оценок')) {
                    result.rating = 'Нет оценок';
                } else {
                    const ratingMatch = bodyText.match(/(\\d+[,.]\\d+)/);
                    if (ratingMatch) result.rating = ratingMatch[1];
                }
                
                // Изображения (первые 5)
                const imgs = document.querySelectorAll('img');
                imgs.forEach(img => {
                    if (img.src && !img.src.includes('data:image') && result.images.length < 5) {
                        if (img.src.includes('ozon') || img.src.includes('wildberries') || img.src.includes('wbstatic')) {
                            result.images.push(img.src);
                        }
                    }
                });
                
                return result;
            }''')
            
            data['url'] = url
            data['marketplace'] = marketplace
            data['scraped_at'] = datetime.now().isoformat()
            
            browser.close()
            
            print(f"✅ Получено: {data['title'][:50]}...")
            return data
            
        except Exception as e:
            browser.close()
            print(f"❌ Ошибка: {str(e)[:100]}")
            return {'error': str(e), 'url': url}

def batch_scrape(urls: list, output_file: str = None):
    """
    Массовый парсинг списка товаров с защитой от блокировки.
    """
    if not output_file:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = f'/tmp/batch_scrape_{timestamp}.json'
    
    results = []
    total = len(urls)
    
    print(f"\n{'='*60}")
    print(f"🚀 Начинаю batch-парсинг: {total} товаров")
    print(f"⏱️ Примерное время: {total * 35 // 60} мин")
    print(f"{'='*60}\n")
    
    for idx, url in enumerate(urls, 1):
        print(f"\n[{idx}/{total}] {'='*50}")
        
        # Ротация User-Agent каждые 3-5 запросов
        if idx % random.randint(3, 5) == 0:
            user_agent = random.choice(USER_AGENTS)
            print(f"🔄 Меняю User-Agent")
        else:
            user_agent = USER_AGENTS[0]
        
        # Парсинг товара
        product = scrape_product(url, user_agent)
        results.append(product)
        
        # Проверка блокировки
        if product.get('error') == 'blocked':
            print("\n⚠️ КРИТИЧНО: Обнаружена блокировка!")
            print("⏸️ Увеличиваю задержку до 2 минут...")
            time.sleep(120)
        
        # Пауза между запросами
        if idx < total:
            # Рандомная задержка 20-45 секунд
            delay = random.uniform(20, 45)
            
            # Каждые 5 товаров — длинная пауза
            if idx % 5 == 0:
                delay = random.uniform(180, 300)  # 3-5 минут
                print(f"\n☕ Длинная пауза после {idx} товаров: {delay//60:.0f}м {delay%60:.0f}с")
            else:
                print(f"⏱️ Пауза: {delay:.0f}с до следующего товара...")
            
            time.sleep(delay)
    
    # Сохранение результатов
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # Статистика
    print(f"\n{'='*60}")
    print(f"✅ ЗАВЕРШЕНО!")
    print(f"{'='*60}")
    print(f"📊 Успешно: {len([r for r in results if 'error' not in r])}/{total}")
    print(f"❌ Ошибок: {len([r for r in results if 'error' in r])}")
    print(f"💾 Результат: {output_file}")
    print(f"{'='*60}\n")
    
    # Группировка по маркетплейсу
    by_mp = {}
    for r in results:
        if 'error' not in r:
            mp = r.get('marketplace', 'unknown')
            by_mp[mp] = by_mp.get(mp, 0) + 1
    
    print("📈 По маркетплейсам:")
    for mp, count in by_mp.items():
        print(f"  • {mp.upper()}: {count} товаров")
    
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 batch-scraper.py <urls_file.txt>")
        print("  python3 batch-scraper.py <url1> <url2> <url3> ...")
        print("\nПример urls_file.txt:")
        print("  https://ozon.ru/t/abc123")
        print("  https://www.wildberries.ru/catalog/12345/detail.aspx")
        sys.exit(1)
    
    # Если первый аргумент — файл
    if len(sys.argv) == 2 and Path(sys.argv[1]).exists():
        urls_file = sys.argv[1]
        print(f"📄 Читаю URL из файла: {urls_file}")
        with open(urls_file, 'r') as f:
            urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
    else:
        # URL переданы как аргументы
        urls = sys.argv[1:]
    
    if not urls:
        print("❌ Не найдено URL для парсинга")
        sys.exit(1)
    
    print(f"📋 Загружено {len(urls)} URL")
    
    # Запуск batch-парсинга
    batch_scrape(urls)
