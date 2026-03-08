#!/usr/bin/env python3
"""Debug WB страницы"""
import sys
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

url = sys.argv[1] if len(sys.argv) > 1 else "https://www.wildberries.ru/catalog/845753059/detail.aspx"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, args=['--disable-blink-features=AutomationControlled'])
    context = browser.new_context(
        viewport={'width': 1920, 'height': 1080},
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        locale='ru-RU',
        timezone_id='Europe/Moscow',
    )
    page = context.new_page()
    Stealth().apply_stealth_sync(page)
    
    page.goto(url, wait_until='networkidle', timeout=90000)
    page.wait_for_timeout(10000)
    
    # Прокрутка для триггера ленивой загрузки
    for i in range(3):
        page.evaluate('window.scrollBy(0, 500)')
        page.wait_for_timeout(1000)
    
    # Сохраняем HTML
    html = page.content()
    with open('/tmp/wb-page.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("HTML сохранён: /tmp/wb-page.html")
    
    # Выводим весь текст
    text = page.evaluate('() => document.body.innerText')
    print("\n=== ТЕКСТ СТРАНИЦЫ (первые 3000 символов) ===")
    print(text[:3000])
    
    # Ищем все h1
    h1s = page.evaluate('() => Array.from(document.querySelectorAll("h1")).map(el => el.innerText)')
    print("\n=== Все H1 на странице ===")
    print(h1s)
    
    # Ищем цены
    prices = page.evaluate('''() => {
        const selectors = [
            'ins', '.price', '[class*="price"]', 
            '[class*="Price"]', 'span[class*="wallet"]'
        ];
        const results = [];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                const txt = el.innerText?.trim();
                if (txt && txt.match(/\d/)) results.push(txt);
            });
        });
        return results.slice(0, 20);
    }''')
    print("\n=== Возможные цены ===")
    print(prices)
    
    browser.close()
