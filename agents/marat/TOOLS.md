# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Instagram-CLI + HikerAPI ✅

**Repo:** https://github.com/lupikovoleg/instagram-cli  
**Установлен:** 03.03.2026

### Команды
- **CLI:** `/root/.local/bin/instagram`
- **MCP сервер:** `/root/.local/bin/instagram-mcp`
- **Конфиг:** `/root/instagram-cli/.env`

### API ключ
- **HikerAPI Key:** c5ge160bzxwo31mzasb3jissau1xtc13 (Name: ****tc13)
- **Тариф:** Standard Plan — $0.001 за запрос
- **Экономика:** 20 reels (поиск + скачивание) ≈ $0.04 = 4₽

### Возможности
- ✅ Поиск по темам (многоязычный)
- ✅ Фильтр по свежести (сегодня, N дней назад)
- ✅ Статистика: профили, reels, комментарии, лайки, подписчики, stories
- ✅ Скачивание: reels, посты, аудио, stories, highlights
- ✅ Экспорт: CSV, JSON
- ✅ MCP-интеграция для автоматизации

### Notion база
📊 **Instagram SwipeFile** (как YouTube SwipeFile)  
🔗 https://notion.so/318b5965dec98162a52bf8a25f28d2cb  
**Database ID:** 318b5965-dec9-8162-a52b-f8a25f28d2cb

**Типы контента:**
- 🎬 **Reels** — с анализом монтажа, хуков, транскрипции
- 🎴 **Carousels** — с анализом слайдов, дизайна, прогрессии
- 🖼️ **Posts** — с анализом визуала, текста caption

**Структура страниц (адаптивная под тип):**
- 📋 Summary — основная мысль
- 🪝 Хуки / 🎴 Структура слайдов / 🖼️ Визуал (зависит от типа)
- 🧠 Триггеры
- 🎬 Техники / 🎨 Дизайн (зависит от типа)
- 🔓 Укради это — шаблоны
- 📝 Готовые черновики

**Метрики:**
- Просмотры, Лайки, Комментарии, Сохранения
- ER%, Viral Index, Статус вирусности
- Tags, Use For, Max's Attention

### Примеры использования

**Одна команда (рекомендуется):**
```bash
cd /root/instagram-cli
./search-to-notion.sh "ozon sellers" 10
./search-to-notion.sh "маркетплейсы" 20
```

**Ручной режим (через CLI):**
```bash
instagram
> search portugal creators
> profile lupikovoleg
> comments https://www.instagram.com/reel/XXX/ 20
> download media https://www.instagram.com/reel/XXX/
> export json /tmp/results.json
> exit

# Добавить в Notion
python3 /root/instagram-cli/notion-sync.py /tmp/results.json
```

**Быстрый старт:**
📄 `/root/instagram-cli/QUICK-START.md`

### Интеграция с Notion
```python
# Добавить reel в базу после анализа
import requests
NOTION_TOKEN = 'ntn_YOUR_NOTION_TOKEN'
DATABASE_ID = '318b5965-dec9-8149-ae92-e87d90ebdd3d'

# Код добавления через Notion API
```

---

## LaoZhang API (api.laozhang.ai)

**Конфиг:** `tools/laozhang-config.sh`
**API Key:** `sk-d8y33zJ9xfn2I9uXB109042aD3Dd45BdB2AeC11538041927`

### Nano Banana Pro — генерация изображений
- **Скрипт:** `tools/nano-banana-pro.sh`
- **Модель:** `gemini-3-pro-image-preview` (Gemini 3 Pro Image = Nano Banana Pro)
- **Цена:** ~$0.05/запрос
- **Возможности:** text-to-image, image editing, 4K, multi-image fusion
- **API:** OpenAI-совместимый `/v1/chat/completions`

**⚠️ ВАЖНО: Модель `nano-banana-pro` недоступна на текущем токене. Используй `gemini-3-pro-image-preview`!**

**Доступные модели для генерации изображений:**
| Модель | Описание |
|--------|----------|
| `gemini-3-pro-image-preview` | ✅ ОСНОВНАЯ — Gemini 3 Pro Image (лучшее качество) |
| `gemini-2.5-flash-image` | Быстрая генерация |
| `gpt-image-1` | GPT Image 1 |
| `gpt-image-1.5` | GPT Image 1.5 |
| `flux-kontext-pro` | Flux Kontext Pro |
| `grok-3-image` | Grok 3 Image |
| `dall-e-3` | DALL-E 3 |

```bash
# Генерация (по умолчанию gemini-3-pro-image-preview)
./tools/nano-banana-pro.sh "a cat astronaut in space" output.png

# Через другую модель
NANO_MODEL=gpt-image-1 ./tools/nano-banana-pro.sh "prompt" output.png

# Редактирование
./tools/nano-banana-pro.sh "make the background sunset" input.png output.png
```

### Veo 3.1 — генерация видео
- **Скрипт:** `tools/veo31.sh`
- **Модели:**
  - `veo-3.1` ($0.25) — стандарт
  - `veo-3.1-fast` ($0.15) — быстрый
  - `veo-3.1-landscape` ($0.25) — 16:9
  - `veo-3.1-landscape-fast` ($0.15) — 16:9 быстрый
  - `veo-3.1-fl` / `veo-3.1-fast-fl` — image-to-video
- **API:** OpenAI-совместимый `/v1/chat/completions`
```bash
# Text-to-video
./tools/veo31.sh "cinematic drone shot of mountains" veo-3.1-fast output.mp4
# Image-to-video
./tools/veo31.sh "animate this scene" veo-3.1-fast-fl output.mp4 input.png
```

### ⚠️ Важно
В консоли laozhang.ai нужно настроить billing mode для токена:
Token Settings → выбрать "Pay-per-use Priority" или "Pay-per-use"

## Scrapy (в резерве)

**Repo:** https://github.com/scrapy/scrapy

**Когда использовать:**
- Массовый парсинг категорий (100+ товаров)
- Мониторинг цен конкурентов в масштабе
- Сбор отзывов по всей категории
- Парсинг поисковых выдач

**Преимущества vs Playwright:**
- В 3-4 раза быстрее за счёт асинхронности
- Item Pipelines для автоматической обработки данных
- Middleware для прокси/UA ротации
- Авто-пагинация

**Статус:** Не настроен, используется по запросу для задач масштаба

## VC.ru Auto Publisher ⚠️

### Проблема: QRATOR Anti-Bot Protection
VC.ru использует защиту QRATOR, которая блокирует автоматизированные браузеры (включая Playwright + Stealth).

### Решения

#### ✅ CDP Publisher (Работает)
**Скрипт:** `tools/vc-cdp-publisher.sh`  
**Технология:** Chrome DevTools Protocol (подключение к реальному Chrome)

**Подготовка:**
```bash
# На компьютере с GUI запустить Chrome с CDP
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-dev

# Авторизоваться на vc.ru в этом Chrome
```

**Использование:**
```bash
# Локально
./tools/vc-cdp-publisher.sh article.md images/ --draft

# Удалённо (через SSH туннель)
ssh -L 9222:localhost:9222 user@your-computer
./tools/vc-cdp-publisher.sh article.md images/ --draft
```

**Преимущества:**
- ✅ Обходит QRATOR используя реальную сессию
- ✅ Стабильно работает
- ✅ Не требует прокси

**Недостатки:**
- ⚠️ Требует Chrome с GUI (не работает на headless серверах без туннеля)

#### ❌ Stealth Publisher (Не работает)
**Скрипт:** `tools/vc-auto-publisher.sh`  
**Технология:** Playwright + puppeteer-extra-plugin-stealth

**Статус:** ❌ **QRATOR блокирует** — Timeout 90+ секунд при загрузке страницы

**Попытки обхода:**
- ✅ playwright-extra + stealth plugin
- ✅ Реалистичные User-Agent и fingerprints
- ✅ Человекоподобное поведение (задержки, скролл, прогрев сессии)
- ❌ **Результат:** Всё равно timeout даже на главной странице

### Возможности (CDP Mode)
- ✅ Автоматическая авторизация (через реальную сессию Chrome)
- ✅ Markdown → VC-форматирование
- ⚠️ Загрузка изображений (частично, лучше добавлять вручную)
- ✅ Автоматические UTM-метки
- ✅ Режим черновика для проверки

### Время работы
- **CDP:** 10-15 минут на статью
- **Stealth:** N/A (не работает)
- **Экономия:** ~30-35 минут ручной верстки

### Документация
`tools/vc-publisher/README.md` — полное описание проблемы и решений

## Threads Auto Publisher ✅

### Автопостинг в Threads через MoreLogin

**Путь:** `~/openclaw-ai/projects/fabrika-kontenta/products/constructor-additions/tools/threads-publisher/`  
**Технология:** MoreLogin + Puppeteer (управление реальным браузером)

### Что это?
Автоматическая публикация постов в Threads (Meta) с текстом и изображениями через MoreLogin браузер.

### Возможности
- ✅ Публикация текстовых постов
- ✅ Загрузка изображений (до 10 шт)
- ✅ Карусели (несколько фото)
- ✅ Скриншоты для подтверждения
- ✅ Использует реальную сессию браузера (не блокируется)

### Быстрый старт

**1. Установка (уже сделано):**
```bash
cd ~/openclaw-ai/projects/fabrika-kontenta/products/constructor-additions/tools/threads-publisher
npm install  # ✅ уже установлено
```

**2. Настройка:**
- Скачать MoreLogin: https://www.morelogin.com/
- Создать профиль для Threads
- Авторизоваться в threads.net в этом профиле
- Скопировать Profile ID
- Отредактировать `config.json`:
```json
{
  "morelogin": {
    "profile_id": "ТВОЙ_PROFILE_ID"
  }
}
```

**3. Тест подключения:**
```bash
node test.js
```

**4. Первый пост:**
```bash
node index.js "Привет из автопостера! 🚀"
```

### Использование

**Текст:**
```bash
node index.js "Мой пост в Threads"
```

**С фото:**
```bash
node index.js "Смотрите фото!" image.jpg
```

**Карусель:**
```bash
node index.js "3 слайда" img1.jpg img2.jpg img3.jpg
```

### Интеграция с Notion

```javascript
const { publishToThreads } = require('./index.js');

// Получить из Threads SwipeFile базы
const post = await getFromNotion('318b5965-dec9-818b-bc26-ee5a59353d0a');

// Опубликовать
await publishToThreads(post.text, post.images);
```

### Как работает

1. Подключается к MoreLogin через HTTP API (порт 58888)
2. Запускает браузер профиля через WebSocket
3. Управляет браузером через Puppeteer
4. Открывает threads.net (уже авторизован)
5. Создаёт пост (текст + изображения)
6. Публикует
7. Делает скриншот (`success.png`)

### Преимущества
- ✅ Использует реальную сессию браузера (не блокируется)
- ✅ Поддержка изображений и каруселей
- ✅ Скриншоты для подтверждения
- ✅ Простая интеграция с Notion

### Требования
- MoreLogin запущен
- Профиль создан и авторизован в Threads
- Node.js 16+

### Документация
- `SUMMARY.md` — краткий обзор
- `README.md` — полная документация
- `SETUP.md` — быстрая настройка
- `test.js` — проверка подключения

### Статус
- ✅ Создан (03.03.2026)
- ✅ Зависимости установлены
- ⏳ Требует настройки config.json
- ⏳ Требует MoreLogin на компьютере
