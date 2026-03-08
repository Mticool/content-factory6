---
name: carousel
description: Генерация Instagram каруселей — от бренд-кита до готовых PNG слайдов с текстом
triggers:
  - carousel
  - карусель
  - карусели
metadata:
  {
    "openclaw": { "emoji": "🎠" }
  }
---

# Instagram Carousel Factory


> © Фабрика Контента | OpenClaw Content Factory | Marat | https://t.me/Mticool | openclaw.ai

Полный пайплайн: бренд-кит → контент → AI-визуалы → HTML-шаблон → Playwright рендер → готовые PNG.

**Формула:** ХУКА (слайд 1) → ТЕЛО (2-N) → CTA (последний)

## Первый запуск — Настройка

При первом использовании скилл запускает **онбординг**:

### Шаг 1: Бренд-кит

Спроси у пользователя и заполни `references/brand-kit.md`:

```
1. Название аккаунта Instagram: [@ваш_аккаунт]
2. Основной стиль:
   - Light (светлый фон, тёмный текст)
   - Dark (тёмный фон, светлый текст)
   - Custom (свои цвета)
3. Цвета:
   - Фон: [hex]
   - Текст: [hex]
   - Акцент: [hex]
4. Шрифт заголовков: [Montserrat / Inter / Roboto / свой] (Google Fonts)
5. Шрифт подписей: [JetBrains Mono / Fira Code / тот же] (Google Fonts)
6. Есть ли CTA-слайд? [да — путь к файлу / нет — сгенерируем]
7. Есть ли лого/аватар? [да — путь / нет]
```

### Шаг 2: Зависимости

Объясни пользователю и установи:

**LaoZhang API** — генерация AI-изображений (фоны, визуалы):
```bash
# Получи ключ: https://api.laozhang.ai (от $1 за 100+ картинок)
# Сохрани в .env или передавай при генерации
export LAOZHANG_API_KEY="sk-ваш-ключ"
```

**Playwright** — рендер HTML-шаблонов в PNG:
```bash
npm install playwright
npx playwright install chromium
```

> **Без LaoZhang:** скилл работает в режиме "только текст" (HTML-шаблоны без AI-фонов)
> **Без Playwright:** скилл генерирует только промпты для ручной сборки

### Шаг 3: Генерация шаблона

После заполнения бренд-кита скилл автоматически создаёт:
- `render/template.html` — HTML-шаблон под бренд
- `render/render.js` — скрипт рендера
- `references/brand-kit.md` — сохранённый бренд-кит

## Быстрый старт (после настройки)

```bash
# Стандартная карусель
"карусель [ТЕМА]"

# С типом
"expert карусель 7 способов экономить"
"viral карусель шокирующие факты об ИИ"

# Со скриншотами (для tech-контента)
"карусель со скриншотами: топ расширений для VS Code"
```

## Workflow

### 1. Сбор данных
```
├── ТЕМА: [о чём карусель]
├── ТИП: [auto/expert/minimalist/viral/screenshot/grid]
├── СЛАЙДЫ: [5-10, по умолчанию 7]
└── ЯЗЫК: [RU/EN]
```

### 2. Структура контента
1. **ХУКА** (слайд 1) — заголовок + интрига, останавливает скролл
2. **ТЕЛО** (слайды 2-N) — 1 идея = 1 слайд, max 20 слов
3. **CTA** (последний) — стандартный файл из бренд-кита

### 3. Генерация визуалов

**Режим A: AI-фоны + HTML-текст (рекомендуемый)**
1. LaoZhang API генерит чистые фоны (без текста) через `gemini-3-pro-image-preview`
2. HTML-шаблон накладывает текст (Montserrat, точная кириллица)
3. Playwright рендерит финальный PNG 1080×1350

```javascript
// Пример генерации фона
const response = await fetch(`${BASE_URL}/v1beta/models/gemini-3-pro-image-preview:generateContent`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "ПРОМПТ ФОНА (без текста)" }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "3:4", imageSize: "4K" }
    }
  })
});
```

**Режим B: Только HTML (без AI)**
- Цветной фон из бренд-кита
- Текст через HTML-шаблон
- Быстро, бесплатно, консистентно

**Режим C: Только промпты (без скриптов)**
- Генерация NanoBanana промптов с текстом внутри
- Для пользователей без Playwright

### 4. Рендер

```bash
cd [папка-карусели]
node render.js
# → final/slide1.png ... slideN.png
```

### 5. Скриншоты (для tech-каруселей)

Для каруселей со скриншотами GitHub/сайтов:
1. Скачай OG-image: `curl -sL "https://github.com/REPO" | grep opengraph`
2. Или сделай скриншот через Playwright
3. Скриншот: по центру, закруглённые углы (16px), тень, "летящий" эффект

## Параметры

| Параметр | Значение | Описание |
|----------|----------|----------|
| Соотношение | 4:5 | Instagram оптимальный |
| Размер | 1080×1350px | Минимальное разрешение |
| Слайды | 5-10 (default 7) | Зависит от темы |
| Текст | Max 20 слов/слайд | Для читаемости |
| Шрифт заголовков | Из brand-kit | Google Fonts |
| AI-модель | gemini-3-pro-image-preview | LaoZhang API |

## Типы каруселей

| Тип | Когда | Особенности |
|-----|-------|-------------|
| **Expert** | Советы, инструкции | Фото эксперта + текст |
| **Minimalist** | Цитаты, мысли | Чистый фон + типографика |
| **Viral** | Хайп, новости | Контрастный фон, крупный текст |
| **Screenshot** | Tech, обзоры | Скриншот по центру + заголовок |
| **Grid** | Много пунктов | Карточная сетка |
| **Timeline** | По шагам/времени | Время + описание + визуал |

## Файлы скилла

| Файл | Содержание |
|------|-----------|
| `SKILL.md` | Этот файл — инструкция |
| `carousel-structure.md` | Формулы хуков и структур |
| `carousel-types.md` | Детали по каждому типу |
| `carousel-prompts.md` | Шаблоны NanoBanana промптов |
| `carousel-cta.md` | Варианты CTA |
| `references/brand-kit.md` | Бренд-кит пользователя (заполняется при онбординге) |
| `render/template.html` | HTML-шаблон (генерируется под бренд) |
| `render/render.js` | Playwright рендер-скрипт (генерируется) |

## HTML-шаблон — структура

Шаблон адаптируется под бренд-кит. Основные элементы:

```html
<!-- Слайд с AI-фоном -->
<div class="slide">
  <img class="bg" src="[AI-фон]">                    <!-- 100% cover -->
  <div class="overlay">                                <!-- gradient снизу -->
    <div class="title">[ЗАГОЛОВОК]</div>               <!-- brand font, bold -->
    <div class="desc">[ОПИСАНИЕ]</div>                 <!-- lighter weight -->
  </div>
  <div class="handle">@[аккаунт]</div>                <!-- мелко, прозрачный -->
</div>

<!-- Слайд со скриншотом -->
<div class="slide">
  <div class="top">
    <div class="title">[ЗАГОЛОВОК]</div>
  </div>
  <div class="screenshot-wrap">
    <img class="screenshot" src="[скриншот]">          <!-- rounded, shadow -->
  </div>
  <div class="bottom">
    <div class="url">[ссылка]</div>
    <div class="handle">@[аккаунт]</div>
  </div>
</div>
```

## Style Lock

Каждый промпт для AI-фона заканчивается:

```
=== STYLE LOCK ===
CANVAS: 3:4, full-bleed
BACKGROUND: [из brand-kit]
COLOR PALETTE: [из brand-kit]
TYPOGRAPHY: нет (текст через HTML)
RENDER: photorealistic, cinematic, 4K
NO TEXT ON IMAGE
=== END STYLE LOCK ===
```

## Identity Lock (для каруселей с персоной)

```
IDENTITY LOCK [Image1]:
- Сохранить ТОЧНЫЕ черты лица
- Сохранить тон кожи и текстуру
- БЕЗ украшательств
- 100% узнаваем
```

## Частые ошибки

❌ Много текста на слайде — max 20 слов
❌ Разные стили слайдов — Style Lock обязателен
❌ Слабый хук — не останавливает скролл
❌ Нет CTA — теряется конверсия
❌ Текст поверх лица — текст ТОЛЬКО внизу если есть человек
❌ Hex-коды в AI-промптах — Gemini рендерит их как текст
❌ AI генерит текст на кириллице — текст ТОЛЬКО через HTML-шаблон
