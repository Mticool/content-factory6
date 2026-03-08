#!/usr/bin/env python3
"""
Wildberries Reviews Scraper — парсинг отзывов с сортировкой
"""
import sys
import json
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

def scrape_wb_reviews(url: str, limit: int = 50) -> list:
    """Парсинг отзывов WB"""
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
        
        print(f"🔍 Открываю: {url}")
        page.goto(url, wait_until='networkidle', timeout=90000)
        page.wait_for_timeout(8000)
        
        # Прокрутка до отзывов
        print("📜 Прокручиваю до отзывов...")
        for i in range(8):
            page.evaluate('window.scrollBy(0, 800)')
            page.wait_for_timeout(1500)
        
        # Кликаем "Все отзывы" если есть
        try:
            reviews_link = page.query_selector('a:has-text("отзыв"), button:has-text("отзыв")')
            if reviews_link:
                print("🖱️ Кликаю 'Отзывы'...")
                reviews_link.click()
                page.wait_for_timeout(5000)
                
                # Прокрутка на странице отзывов
                for i in range(15):
                    page.evaluate('window.scrollBy(0, 1000)')
                    page.wait_for_timeout(1500)
        except Exception as e:
            print(f"⚠️ Не удалось кликнуть отзывы: {e}")
        
        print("🔎 Извлекаю отзывы...")
        
        # Сохраним HTML для debug
        html = page.content()
        with open('/tmp/wb-reviews-debug.html', 'w', encoding='utf-8') as f:
            f.write(html)
        
        # Парсинг через текст (более надёжно для WB)
        body_text = page.evaluate('() => document.body.innerText')
        
        # Простой подход: ищем паттерны отзывов в тексте
        reviews = []
        lines = body_text.split('\n')
        
        current_review = None
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Ищем рейтинг (звёзды или цифры)
            if '★' in line or (line.isdigit() and 1 <= int(line) <= 5):
                if current_review:
                    reviews.append(current_review)
                
                rating = 0
                if '★' in line:
                    rating = line.count('★')
                elif line.isdigit():
                    rating = int(line)
                
                current_review = {
                    'rating': rating,
                    'text': '',
                    'author': '',
                    'date': '',
                }
            
            # Собираем текст отзыва
            elif current_review and len(line) > 20 and not line.startswith('Оценки'):
                if not current_review['text']:
                    current_review['text'] = line
                elif len(current_review['text']) < 500:
                    current_review['text'] += ' ' + line
        
        if current_review:
            reviews.append(current_review)
        
        # Фильтруем пустые
        reviews = [r for r in reviews if r['text'] or r['rating'] > 0]
        
        browser.close()
        
        # Сортировка от плохих к отличным
        reviews.sort(key=lambda x: x['rating'])
        
        return reviews[:limit]

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 wb-reviews-scraper.py <WB_URL> [limit]")
        sys.exit(1)
    
    url = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    
    reviews = scrape_wb_reviews(url, limit)
    
    print(f"\n{'='*60}")
    print(f"📊 Найдено отзывов: {len(reviews)}")
    print(f"{'='*60}\n")
    
    # Группировка
    by_rating = {}
    for r in reviews:
        rating = r['rating']
        if rating not in by_rating:
            by_rating[rating] = []
        by_rating[rating].append(r)
    
    for rating in sorted(by_rating.keys()):
        count = len(by_rating[rating])
        stars = '⭐' * rating if rating > 0 else '❓'
        print(f"{stars} ({rating}/5): {count} отзывов")
    
    print(f"\n{'='*60}")
    print("ОТЗЫВЫ (от плохих к отличным):")
    print(f"{'='*60}\n")
    
    for idx, review in enumerate(reviews, 1):
        stars = '⭐' * review['rating'] if review['rating'] > 0 else '❓'
        print(f"#{idx} | {stars} {review['rating']}/5")
        if review['text']:
            print(f"💬 {review['text'][:300]}...")
        print()
    
    # Сохранение
    with open('/tmp/wb-reviews.json', 'w', encoding='utf-8') as f:
        json.dump(reviews, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Сохранено: /tmp/wb-reviews.json")
