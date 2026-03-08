# Карусели со скриншотами — Полный гайд

> © Фабрика Контента | OpenClaw Content Factory | openclaw.ai

## Когда использовать

Скриншотные карусели — для tech-контента: обзоры инструментов, расширений, приложений, GitHub-репозиториев. Каждый слайд = скриншот продукта + заголовок + описание.

## 3 способа получить скриншот

### Способ 1: GitHub OG Image (самый быстрый)

GitHub генерирует красивую карточку для каждого репозитория (Open Graph image). Содержит название, описание, звёзды, форки.

```bash
# Извлечь OG image URL из страницы репозитория
OG_URL=$(curl -sL "https://github.com/OWNER/REPO" | grep -o 'https://opengraph.githubassets.com/[^"]*' | head -1)

# Скачать
curl -sL "$OG_URL" -o screenshot.png
```

**Плюсы:** быстро, красиво, всегда есть
**Минусы:** стандартный формат GitHub, нет кастомного UI

### Способ 2: Playwright скриншот (полный контроль)

Открываем страницу в браузере и делаем скриншот нужной области.

```javascript
const { chromium } = require('playwright');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto('https://github.com/OWNER/REPO', { 
  waitUntil: 'networkidle', 
  timeout: 30000 
});
await page.waitForTimeout(2000); // дождаться рендера

// Вариант A: Скриншот всего видимого
await page.screenshot({ 
  path: 'screenshot-full.png',
  clip: { x: 0, y: 0, width: 1280, height: 900 }
});

// Вариант B: Скриншот конкретного элемента (README)
const readme = await page.$('article');
if (readme) {
  await readme.screenshot({ path: 'screenshot-readme.png' });
}

// Вариант C: Скриншот первого изображения из README
const img = await page.$('article img');
if (img) {
  await img.screenshot({ path: 'screenshot-img.png' });
}

await browser.close();
```

**Плюсы:** любая страница, любой элемент, точный контроль
**Минусы:** нужен Playwright, медленнее

### Способ 3: Ручной скриншот

Пользователь делает скриншот сам и кладёт в папку `screenshots/`.

**Плюсы:** максимальный контроль
**Минусы:** ручная работа

## Приоритет выбора

```
1. Есть скриншот в README репозитория? → Способ 2 (img из article)
2. Нет? → Способ 1 (OG image)
3. Не GitHub? → Способ 2 (полный скриншот страницы)
4. Нет Playwright? → Способ 3 (ручной)
```

## CSS-рецепт "летящего" скриншота

Скриншот должен выглядеть как "парящая" карточка на тёмном фоне:

```css
.screenshot {
  max-width: 100%;
  max-height: 100%;
  border-radius: 16px;                          /* закруглённые углы */
  box-shadow: 
    0 20px 60px rgba(0,0,0,0.6),               /* основная тень — глубина */
    0 8px 24px rgba(0,0,0,0.4),                /* средняя тень — объём */
    0 0 0 1px rgba(255,255,255,0.06);          /* тонкая обводка — контур */
  object-fit: contain;
  transform: perspective(1000px) rotateX(0deg); /* можно добавить лёгкий наклон */
}

/* Контейнер — центрирование с отступами */
.screenshot-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 60px 30px;                     /* отступы от краёв слайда */
}
```

### Параметры тени по типу фона

| Фон | box-shadow |
|-----|-----------|
| Тёмный (#0a0a0a) | `0 20px 60px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)` |
| Светлый (#ffffff) | `0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.08)` |
| Цветной | `0 20px 60px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)` |

### Размеры скриншота внутри слайда

```
┌──────────────────────────────┐  1080px
│  padding-top: 50px           │
│  ┌─ TOP ───────────────────┐ │
│  │ 🧠 ЗАГОЛОВОК            │ │  ~25% высоты
│  │ ⭐ stars                 │ │
│  │ Описание текст...       │ │
│  └─────────────────────────┘ │
│  padding: 20px 60px          │
│  ┌─────────────────────────┐ │
│  │                         │ │
│  │     📸 СКРИНШОТ         │ │  ~55% высоты
│  │     border-radius: 16px │ │
│  │     box-shadow: ...     │ │
│  │                         │ │
│  └─────────────────────────┘ │
│  padding-bottom: 30px        │
│  ┌─ BOTTOM ────────────────┐ │
│  │ github.com/...  @handle │ │  ~5% высоты
│  └─────────────────────────┘ │
└──────────────────────────────┘  1350px
```

## Структура слайда в slides.json

```json
{
  "id": "slide2",
  "html": "<div class=\"content-ss\"><div class=\"top\"><div class=\"emoji-badge\">🧠</div><div class=\"skill-name\">OBSIDIAN SKILLS</div><div class=\"stars\">⭐ 7K+ stars</div><div class=\"desc\">Claude Code + Obsidian = <strong>AI-powered второй мозг</strong>.</div></div><div class=\"screenshot-wrap\"><img class=\"screenshot\" src=\"screenshots/obsidian-og.png\"></div><div class=\"bottom\"><div class=\"url\">github.com/kepano/obsidian-skills</div><div class=\"handle\">{{HANDLE}}</div></div></div>"
}
```

## Полный пример slides.json

```json
[
  {
    "id": "slide1",
    "html": "<div class=\"cover\"><div class=\"title\">ТОП СКИЛЛЫ<br>ДЛЯ <span class=\"accent\">CLAUDE CODE</span></div><div class=\"subtitle\">7 расширений, которые прокачают агента</div><div class=\"terminal\">$ claude --skill install</div><div class=\"handle\">{{HANDLE}}</div></div>"
  },
  {
    "id": "slide2",
    "html": "<div class=\"content-ss\"><div class=\"top\"><div class=\"emoji-badge\">🧠</div><div class=\"skill-name\">OBSIDIAN SKILLS</div><div class=\"stars\">⭐ 7K+ stars</div><div class=\"desc\">Claude Code + Obsidian = <strong>AI-powered второй мозг</strong>.</div></div><div class=\"screenshot-wrap\"><img class=\"screenshot\" src=\"screenshots/obsidian-og.png\"></div><div class=\"bottom\"><div class=\"url\">github.com/kepano/obsidian-skills</div><div class=\"handle\">{{HANDLE}}</div></div></div>"
  }
]
```

## Скрипт массового захвата скриншотов

См. `render/grab-screenshots.js` — принимает список репозиториев и скачивает OG images + README screenshots.

## Чеклист качества

- [ ] Скриншот не растянут и не обрезан (object-fit: contain)
- [ ] border-radius: 16px
- [ ] box-shadow: 3-слойная тень
- [ ] Отступы от краёв минимум 60px по бокам
- [ ] Скриншот занимает ~55% высоты слайда
- [ ] Заголовок и описание НЕ перекрывают скриншот
- [ ] URL репозитория внизу моноширинным шрифтом
- [ ] @handle в правом нижнем углу
