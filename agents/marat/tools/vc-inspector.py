#!/usr/bin/env python3
"""
VC.ru Inspector - изучение структуры редактора
Делает скриншоты и сохраняет HTML для анализа
"""

import sys
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

# Конфиг
VC_LOGIN = "mti2324@gmail.com"
VC_PASSWORD = "Mticool1!"
COOKIES_FILE = Path.home() / ".config/vc-ru/cookies.json"
OUTPUT_DIR = Path("debug/vc-ru")

def save_cookies(context):
    """Сохранить cookie сессии"""
    COOKIES_FILE.parent.mkdir(parents=True, exist_ok=True)
    cookies = context.cookies()
    COOKIES_FILE.write_text(json.dumps(cookies, indent=2))
    print(f"✅ Сессия сохранена: {COOKIES_FILE}")

def load_cookies(context):
    """Загрузить cookie сессии"""
    if COOKIES_FILE.exists():
        cookies = json.loads(COOKIES_FILE.read_text())
        context.add_cookies(cookies)
        print(f"✅ Сессия загружена: {COOKIES_FILE}")
        return True
    return False

def login(page):
    """Авторизация на VC.ru"""
    print("🔐 Авторизация на VC.ru...")
    
    # Открыть главную страницу
    page.goto("https://vc.ru/", wait_until="networkidle", timeout=60000)
    time.sleep(3)
    
    # Найти и нажать кнопку входа
    try:
        # Попробовать разные варианты кнопки входа
        login_btn = page.locator('a:has-text("Войти"), button:has-text("Войти"), a[href*="auth"]').first
        if login_btn.is_visible(timeout=5000):
            print("✅ Кнопка входа найдена")
            login_btn.click()
            time.sleep(3)
    except Exception as e:
        print(f"⚠️ Не удалось найти кнопку входа: {e}")
        # Попробовать прямой переход
        page.goto("https://vc.ru/auth", wait_until="networkidle")
        time.sleep(3)
    
    # Заполнить форму
    try:
        # Email
        email_field = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Email"]').first
        email_field.fill(VC_LOGIN)
        time.sleep(1)
        print(f"✅ Email введён")
        
        # Пароль
        password_field = page.locator('input[type="password"], input[name="password"]').first
        password_field.fill(VC_PASSWORD)
        time.sleep(1)
        print("✅ Пароль введён")
        
        # Нажать кнопку входа
        submit_btn = page.locator('button[type="submit"], button:has-text("Войти"), button:has-text("Продолжить")').first
        submit_btn.click()
        print("✅ Форма отправлена")
        
        # Дождаться редиректа
        page.wait_for_load_state("networkidle", timeout=30000)
        time.sleep(5)
        
        save_cookies(context)
        print("✅ Авторизация выполнена")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка авторизации: {e}")
        # Сохранить скриншот ошибки
        page.screenshot(path=str(OUTPUT_DIR / "login-error.png"))
        return False

def inspect_editor(page, output_dir):
    """Изучить редактор и сохранить артефакты"""
    print("🔍 Изучение редактора VC.ru...")
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Перейти на страницу создания поста НАПРЯМУЮ
    print("📝 Переход к созданию поста...")
    page.goto("https://vc.ru/writing/new", wait_until="networkidle", timeout=60000)
    time.sleep(5)
    
    # Скриншот редактора
    screenshot_path = output_dir / "editor-screenshot.png"
    page.screenshot(path=str(screenshot_path), full_page=True)
    print(f"📸 Скриншот: {screenshot_path}")
    
    # HTML редактора
    html_path = output_dir / "editor-page.html"
    html_content = page.content()
    html_path.write_text(html_content)
    print(f"📄 HTML: {html_path} ({len(html_content)} символов)")
    
    # Попробовать найти элементы редактора
    print("\n🔎 Поиск элементов редактора:")
    
    elements_to_find = {
        "Заголовок (textarea)": 'textarea[placeholder*="Заголовок"]',
        "Заголовок (input)": 'input[placeholder*="Заголовок"]',
        "Заголовок (h1)": 'h1[contenteditable]',
        "Редактор (contenteditable)": '[contenteditable="true"]',
        "Редактор (div.editor)": 'div.editor',
        "Кнопка 'Опубликовать'": 'button:has-text("Опубликовать")',
        "Кнопка 'Сохранить'": 'button:has-text("Сохранить")',
        "Теги (input)": 'input[placeholder*="теги"], input[placeholder*="Теги"]'
    }
    
    for name, selector in elements_to_find.items():
        try:
            element = page.locator(selector).first
            if element.is_visible(timeout=3000):
                print(f"  ✅ {name}: найден")
                # Попробовать получить HTML
                try:
                    el_html = element.evaluate("el => el.outerHTML")
                    print(f"     {el_html[:150]}...")
                except:
                    pass
            else:
                print(f"  ⚠️ {name}: не виден")
        except:
            print(f"  ❌ {name}: не найден")
    
    # Сохранить список всех input/textarea
    print("\n📋 Все поля ввода:")
    all_inputs = page.locator('input, textarea, [contenteditable="true"]').all()
    inputs_info = []
    for idx, inp in enumerate(all_inputs[:20]):  # Первые 20
        try:
            info = {
                'index': idx,
                'tag': inp.evaluate("el => el.tagName"),
                'type': inp.get_attribute("type") or "N/A",
                'placeholder': inp.get_attribute("placeholder") or "N/A",
                'class': inp.get_attribute("class") or "N/A"
            }
            inputs_info.append(info)
            print(f"  [{idx}] {info['tag']} type={info['type']} placeholder={info['placeholder'][:50]}")
        except:
            pass
    
    # Сохранить в JSON
    inputs_json_path = output_dir / "editor-inputs.json"
    inputs_json_path.write_text(json.dumps(inputs_info, indent=2, ensure_ascii=False))
    print(f"\n💾 Данные сохранены: {inputs_json_path}")
    
    return True

def main():
    """Главная функция"""
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        )
        
        # Загрузить cookie
        load_cookies(context)
        
        page = context.new_page()
        
        # Проверить авторизацию
        page.goto("https://vc.ru/", wait_until="networkidle")
        time.sleep(3)
        
        # Проверить залогинены ли
        try:
            is_logged = page.locator('a:has-text("Написать"), button:has-text("Написать")').first.is_visible(timeout=5000)
        except:
            is_logged = False
        
        if not is_logged:
            print("🔐 Требуется авторизация")
            if not login(page):
                print("❌ Не удалось авторизоваться")
                browser.close()
                return 1
        else:
            print("✅ Уже авторизованы")
        
        # Изучить редактор
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        result = inspect_editor(page, OUTPUT_DIR)
        
        browser.close()
        
        if result:
            print(f"\n✅ Готово! Проверьте файлы в {OUTPUT_DIR}/")
        
        return 0 if result else 1

if __name__ == "__main__":
    sys.exit(main())
