#!/usr/bin/env python3
"""
VC.ru Publisher - автоматическая публикация статей
Использует Playwright для браузерной автоматизации
"""

import sys
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Конфиг
VC_LOGIN = "mti2324@gmail.com"
VC_PASSWORD = "Mticool1!"
COOKIES_FILE = Path.home() / ".config/vc-ru/cookies.json"

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
    page.goto("https://vc.ru/", wait_until="networkidle")
    time.sleep(2)
    
    # Найти кнопку входа
    try:
        # Попробовать найти кнопку "Войти"
        login_btn = page.locator('text="Войти"').first
        if login_btn.is_visible(timeout=3000):
            login_btn.click()
            time.sleep(2)
    except:
        # Если не нашли кнопку, может быть уже залогинены
        pass
    
    # Заполнить форму входа
    try:
        # Email
        email_input = page.locator('input[type="email"]').first
        if email_input.is_visible(timeout=5000):
            email_input.fill(VC_LOGIN)
            time.sleep(1)
            
            # Пароль
            password_input = page.locator('input[type="password"]').first
            password_input.fill(VC_PASSWORD)
            time.sleep(1)
            
            # Нажать кнопку входа
            submit_btn = page.locator('button[type="submit"]').first
            submit_btn.click()
            
            # Дождаться загрузки
            page.wait_for_load_state("networkidle")
            time.sleep(3)
            
            print("✅ Авторизация успешна")
            return True
    except Exception as e:
        print(f"⚠️ Ошибка авторизации: {e}")
        return False

def check_login(page):
    """Проверить, залогинены ли мы"""
    page.goto("https://vc.ru/", wait_until="networkidle")
    time.sleep(2)
    
    # Если есть кнопка "Написать", значит залогинены
    try:
        write_btn = page.locator('text="Написать"').first
        if write_btn.is_visible(timeout=3000):
            print("✅ Уже авторизованы")
            return True
    except:
        pass
    
    print("⚠️ Не авторизованы")
    return False

def create_article(page, title, content, tags=None, publish=False):
    """Создать и опубликовать статью"""
    print(f"📝 Создание статьи: {title}")
    
    # Открыть редактор
    page.goto("https://vc.ru/writing", wait_until="networkidle")
    time.sleep(3)
    
    # Заголовок
    try:
        title_input = page.locator('textarea[placeholder*="Заголовок"], input[placeholder*="Заголовок"]').first
        title_input.fill(title)
        time.sleep(1)
        print(f"✅ Заголовок: {title}")
    except Exception as e:
        print(f"❌ Ошибка заполнения заголовка: {e}")
        return False
    
    # Контент (редактор)
    try:
        # VC.ru использует contenteditable редактор
        editor = page.locator('[contenteditable="true"]').first
        editor.click()
        time.sleep(1)
        
        # Вставить HTML контент
        page.evaluate(f"""
            (content) => {{
                const editor = document.querySelector('[contenteditable="true"]');
                if (editor) {{
                    editor.innerHTML = content;
                }}
            }}
        """, content)
        
        time.sleep(2)
        print(f"✅ Контент добавлен ({len(content)} символов)")
    except Exception as e:
        print(f"❌ Ошибка заполнения контента: {e}")
        return False
    
    # Теги (если есть)
    if tags:
        try:
            tags_input = page.locator('input[placeholder*="теги"], input[placeholder*="Теги"]').first
            for tag in tags:
                tags_input.fill(tag)
                time.sleep(0.5)
                tags_input.press("Enter")
            print(f"✅ Теги: {', '.join(tags)}")
        except Exception as e:
            print(f"⚠️ Не удалось добавить теги: {e}")
    
    # Публикация или черновик
    if publish:
        try:
            publish_btn = page.locator('button:has-text("Опубликовать")').first
            publish_btn.click()
            time.sleep(3)
            print("✅ Статья опубликована")
        except Exception as e:
            print(f"⚠️ Не удалось опубликовать: {e}")
            print("💾 Статья сохранена как черновик")
    else:
        print("💾 Статья сохранена как черновик")
    
    # Получить URL
    try:
        url = page.url
        print(f"🔗 URL: {url}")
        return url
    except:
        return True

def main():
    """Главная функция"""
    
    with sync_playwright() as p:
        # Запустить браузер
        browser = p.chromium.launch(headless=True)  # headless mode для серверов без GUI
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        )
        
        # Загрузить сохраненные cookie (если есть)
        load_cookies(context)
        
        page = context.new_page()
        
        # Проверить логин
        if not check_login(page):
            # Если не залогинены - залогиниться
            if login(page):
                save_cookies(context)
            else:
                print("❌ Не удалось авторизоваться")
                browser.close()
                return 1
        
        # Тестовая статья
        test_title = "Тестовая статья от OzonCheck"
        test_content = """
        <h2>Это тестовая публикация</h2>
        <p>Проверяем автоматическую публикацию через Playwright.</p>
        <p><strong>Возможности:</strong></p>
        <ul>
            <li>Автоматический логин</li>
            <li>Создание статей</li>
            <li>Форматирование HTML</li>
            <li>Публикация или черновик</li>
        </ul>
        """
        
        # Создать статью (черновик)
        result = create_article(
            page, 
            title=test_title,
            content=test_content,
            tags=["тест", "автоматизация"],
            publish=False  # Не публиковать, только черновик
        )
        
        if result:
            print("\n✅ Готово! Проверьте черновики на VC.ru")
        else:
            print("\n❌ Что-то пошло не так")
        
        # Закрыть браузер
        browser.close()
        
        return 0 if result else 1

if __name__ == "__main__":
    sys.exit(main())
