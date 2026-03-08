#!/usr/bin/env python3
"""
VC.ru Quick Publisher - минимальная версия
"""
import sys
import time
from playwright.sync_api import sync_playwright

VC_LOGIN = "mti2324@gmail.com"
VC_PASSWORD = "Mticool1!"

def main():
    if len(sys.argv) < 3:
        print("Usage: vc-quick-publish.py <title> <content.md>")
        sys.exit(1)
    
    title = sys.argv[1]
    with open(sys.argv[2], 'r') as f:
        content = f.read()
    
    print(f"📝 Публикация: {title}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Логин
        print("🔐 Авторизация...")
        page.goto("https://vc.ru/auth")
        time.sleep(2)
        
        try:
            page.fill('input[type="email"]', VC_LOGIN)
            time.sleep(1)
            page.fill('input[type="password"]', VC_PASSWORD)
            time.sleep(1)
            page.click('button[type="submit"]')
            page.wait_for_load_state("networkidle")
            time.sleep(3)
            print("✅ Авторизован")
        except Exception as e:
            print(f"⚠️ Логин: {e}")
        
        # Переход к редактору
        print("📝 Открываю редактор...")
        page.goto("https://vc.ru/editor")
        time.sleep(5)
        
        # Сохраняем скриншот для отладки
        page.screenshot(path="/tmp/vc-editor-debug.png")
        print("📸 Скриншот: /tmp/vc-editor-debug.png")
        
        # Пробуем найти поля
        print("🔍 Поиск полей...")
        
        # Проверяем все возможные селекторы заголовка
        title_selectors = [
            'textarea[placeholder*="Заголовок"]',
            'input[placeholder*="Заголовок"]',
            'textarea[placeholder*="Title"]',
            'input[placeholder*="Title"]',
            '[data-placeholder*="Заголовок"]',
            '[contenteditable="true"]',
            '.editor__title',
            '.title-input'
        ]
        
        title_filled = False
        for selector in title_selectors:
            try:
                if page.locator(selector).count() > 0:
                    print(f"✓ Найден: {selector}")
                    page.locator(selector).first.fill(title)
                    print(f"✅ Заголовок: {title}")
                    title_filled = True
                    break
            except:
                continue
        
        if not title_filled:
            print("❌ Заголовок: не найден")
            print("\nДоступные input элементы:")
            inputs = page.locator('input, textarea, [contenteditable]').all()
            for i, inp in enumerate(inputs[:5]):
                try:
                    print(f"  {i+1}. {inp.get_attribute('placeholder') or inp.get_attribute('class')}")
                except:
                    pass
        
        browser.close()
        
        if title_filled:
            print("\n✅ Частично успешно")
            print("⚠️ Дальнейшее заполнение требует ручного вмешательства")
        else:
            print("\n❌ Автоматизация не работает")
            print("💡 Рекомендую: скопировать текст и вставить вручную")

if __name__ == "__main__":
    main()
