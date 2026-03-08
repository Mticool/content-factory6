#!/usr/bin/env python3
"""
Ozon Reviews Scraper — парсинг отзывов с сортировкой по рейтингу
"""
import sys
import json
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

def scrape_ozon_reviews(url: str, limit: int = 50) -> list:
    """
    Извлекает отзывы с карточки товара Ozon.
    
    Args:
        url: Ссылка на товар
        limit: Максимум отзывов для парсинга
    
    Returns:
        list: Отзывы, отсортированные от плохих к отличным
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
        page.goto(url, wait_until='domcontentloaded', timeout=60000)
        page.wait_for_timeout(5000)
        
        # Прокрутка до отзывов
        print("📜 Прокручиваю до отзывов...")
        for i in range(5):
            page.evaluate('window.scrollBy(0, 800)')
            page.wait_for_timeout(1000)
        
        # Ищем кнопку "Все отзывы" или "Показать ещё"
        try:
            # Пробуем кликнуть на "Все отзывы"
            all_reviews_btn = page.query_selector('a[href*="reviews"], button:has-text("отзыв")')
            if all_reviews_btn:
                print("🖱️ Кликаю 'Все отзывы'...")
                all_reviews_btn.click()
                page.wait_for_timeout(3000)
        except:
            pass
        
        # Прокрутка для загрузки отзывов
        print("⏬ Загружаю отзывы...")
        for i in range(10):
            page.evaluate('window.scrollBy(0, 1000)')
            page.wait_for_timeout(1500)
        
        # Парсинг отзывов
        print("🔎 Извлекаю отзывы...")
        reviews = page.evaluate('''(limit) => {
            const results = [];
            
            // Ищем контейнеры с отзывами (разные селекторы)
            const reviewContainers = document.querySelectorAll(
                '[data-widget="reviewCard"], ' +
                '[class*="review"], ' +
                '[class*="Review"]'
            );
            
            reviewContainers.forEach((container, idx) => {
                if (idx >= limit) return;
                
                const review = {
                    rating: 0,
                    text: '',
                    author: '',
                    date: '',
                    pros: '',
                    cons: '',
                };
                
                // Рейтинг (звёзды)
                const ratingEl = container.querySelector('[class*="star"], [class*="rating"]');
                if (ratingEl) {
                    const filledStars = container.querySelectorAll('[class*="star"][class*="filled"]').length;
                    if (filledStars > 0) {
                        review.rating = filledStars;
                    } else {
                        // Пробуем из текста
                        const text = ratingEl.textContent;
                        const match = text.match(/([1-5])/);
                        if (match) review.rating = parseInt(match[1]);
                    }
                }
                
                // Текст отзыва
                const textEl = container.querySelector('[class*="text"], [class*="comment"], p');
                if (textEl) review.text = textEl.innerText.trim();
                
                // Автор
                const authorEl = container.querySelector('[class*="author"], [class*="user"], [class*="name"]');
                if (authorEl) review.author = authorEl.innerText.trim();
                
                // Дата
                const dateEl = container.querySelector('[class*="date"], time');
                if (dateEl) review.date = dateEl.innerText.trim();
                
                // Плюсы
                const prosEl = container.querySelector('[class*="advantage"], [class*="pro"]');
                if (prosEl) review.pros = prosEl.innerText.trim();
                
                // Минусы
                const consEl = container.querySelector('[class*="disadvantage"], [class*="con"]');
                if (consEl) review.cons = consEl.innerText.trim();
                
                // Добавляем только если есть рейтинг или текст
                if (review.rating > 0 || review.text) {
                    results.push(review);
                }
            });
            
            return results;
        }''', limit)
        
        browser.close()
        
        # Сортировка от плохих к отличным
        reviews.sort(key=lambda x: x['rating'])
        
        return reviews

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 ozon-reviews-scraper.py <OZON_URL> [limit]")
        sys.exit(1)
    
    url = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    
    reviews = scrape_ozon_reviews(url, limit)
    
    print(f"\n{'='*60}")
    print(f"📊 Найдено отзывов: {len(reviews)}")
    print(f"{'='*60}\n")
    
    # Группировка по рейтингу
    by_rating = {}
    for r in reviews:
        rating = r['rating']
        if rating not in by_rating:
            by_rating[rating] = []
        by_rating[rating].append(r)
    
    # Вывод статистики
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
        if review['author']:
            print(f"👤 {review['author']}")
        if review['date']:
            print(f"📅 {review['date']}")
        if review['text']:
            print(f"💬 {review['text'][:200]}...")
        if review['pros']:
            print(f"➕ {review['pros'][:100]}...")
        if review['cons']:
            print(f"➖ {review['cons'][:100]}...")
        print()
    
    # Сохранение в JSON
    output_file = '/tmp/ozon-reviews.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(reviews, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Полный список сохранён: {output_file}")
