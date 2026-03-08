# Интеграции

> Как подключить Notion, n8n и другие инструменты к Content Factory

---

## Notion Integration

### Что даёт

- Хранение контента в базе данных Notion
- Статусы: Draft → Review → Published
- История всех постов
- Командная работа

### Как подключить

**1. Создать интеграцию в Notion**

1. Открой [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Нажми "New integration"
3. Назови "Content Factory"
4. Скопируй токен (начинается с `secret_`)

**2. Создать базу данных**

Создай базу со столбцами:
- **Title** (title) — заголовок поста
- **Content** (text) — текст поста
- **Status** (select) — Draft / Review / Published
- **Platform** (select) — Threads / YouTube / Carousel
- **Created** (date) — дата создания

**3. Подключить к Claude Code**

Создай файл `.mcp.json` в папке Content Factory:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/claude-mcp-server-notion"],
      "env": {
        "NOTION_API_KEY": "secret_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

**4. Расшарить базу**

В Notion: база данных → Share → пригласить интеграцию "Content Factory"

### Команды

После подключения:

```
/notion save [пост]     → Сохранить пост в базу
/notion drafts          → Показать черновики
/notion publish [id]    → Изменить статус на Published
```

---

## n8n Integration

### Что даёт

- Автоматическая публикация по расписанию
- Уведомления в Telegram
- Аналитика постов
- Цепочки автоматизации

### Как подключить

**1. Установить n8n**

```bash
npm install -g n8n
n8n start
```

Или использовать [n8n.cloud](https://n8n.cloud)

**2. Импортировать workflow**

В папке `templates/` есть готовые workflows:
- `n8n-threads-workflow-template.json` — базовый
- `n8n-threads-workflow-template-v2.json` — с кнопками в Telegram

Импорт: n8n → Import from File → выбрать JSON

**3. Настроить credentials**

- Notion API (токен интеграции)
- Telegram Bot (получить у [@BotFather](https://t.me/BotFather))

### Workflow: Content → Telegram → Publish

```
Notion Database Trigger
    ↓ (новый пост со статусом "Review")
Send to Telegram Bot
    ↓ (предпросмотр + кнопки 👍/👎)
Wait for Reaction
    ↓
If 👍 → Change status to "Published"
If 👎 → Send back to "Draft"
```

---

## Telegram Bot

### Что даёт

- Превью постов перед публикацией
- Одобрение/отклонение одной кнопкой
- Уведомления о новом контенте
- Быстрый доступ с телефона

### Как создать

**1. Получить токен**

1. Открой [[@BotFather](https://t.me/BotFather)](https://t.me/BotFather)
2. Напиши `/newbot`
3. Назови бота
4. Скопируй токен

**2. Подключить к n8n**

В n8n: Credentials → Add New → Telegram API
Вставить токен

**3. Узнать Chat ID**

1. Напиши что-нибудь боту
2. Открой `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Найди `chat.id`

---

## Perplexity (Research)

### Что даёт

- Исследование тем перед написанием
- Факт-чекинг
- Анализ конкурентов
- Свежая информация

### Как подключить

**1. Получить API ключ**

1. Зарегистрируйся на [perplexity.ai](https://perplexity.ai)
2. Перейди в Settings → API
3. Создай ключ

**2. Добавить в .mcp.json**

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/claude-mcp-server-perplexity"],
      "env": {
        "PERPLEXITY_API_KEY": "pplx-YOUR_KEY_HERE"
      }
    }
  }
}
```

### Команды

```
/research [тема]    → Исследование темы
/factcheck [факт]   → Проверка факта
/trends [ниша]      → Тренды в нише
```

---

## Полный .mcp.json

Пример с несколькими интеграциями:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/claude-mcp-server-notion"],
      "env": {
        "NOTION_API_KEY": "secret_xxx"
      }
    },
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/claude-mcp-server-perplexity"],
      "env": {
        "PERPLEXITY_API_KEY": "pplx-xxx"
      }
    }
  }
}
```

---

## Без интеграций

Content Factory работает и без интеграций:
- Генерация контента → копируй в буфер → вставляй куда нужно
- Хранение → в папке `content/`
- Аналитика → вручную добавляй в `learning/`

Интеграции — это удобство, не необходимость.

---

## FAQ

**Q: Какая интеграция самая важная?**
A: Notion — для хранения и статусов. Остальное опционально.

**Q: Можно ли обойтись без n8n?**
A: Да, просто копируй посты вручную.

**Q: Бесплатные альтернативы?**
A: Google Sheets вместо Notion, Zapier Free вместо n8n.

---

## OpenClaw: улучшение памяти агентов

> Если ты используешь конструктор через OpenClaw (Telegram-режим), эти настройки сделают агентов умнее — они будут помнить контекст между задачами.

### Проблема

По умолчанию суб-агенты (фоновые задачи) живут **60 минут** и потом забывают всё. Если ты дал агенту задачу, ушёл на час, а потом вернулся — он уже не помнит что делал.

### Решение: `archiveAfterMinutes`

Эта настройка определяет, сколько минут суб-агент держит сессию живой после последней активности.

**Где:** `agents.defaults.subagents.archiveAfterMinutes`

**Как настроить:**
1. Напиши в чат с любым агентом: `/config`
2. Или отредактируй `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "subagents": {
        "archiveAfterMinutes": 480
      }
    }
  }
}
```

**Рекомендуемые значения:**
| Сценарий | Значение | Когда использовать |
|----------|----------|--------------------|
| По умолчанию | 60 | Короткие задачи, экономия контекста |
| Рабочий день | 480 (8ч) | Агент работает весь день над проектом |
| Длинный проект | 1440 (24ч) | Многодневные задачи с сохранением контекста |

### Бонус: вложенные суб-агенты (`maxSpawnDepth`)

По умолчанию агент может запускать помощников, но помощники НЕ могут запускать своих. Это ограничивает сложные цепочки.

```json
{
  "agents": {
    "defaults": {
      "subagents": {
        "maxSpawnDepth": 5,
        "maxConcurrent": 8,
        "archiveAfterMinutes": 480
      }
    }
  }
}
```

**Что это даёт:** копирайтер может сам дёрнуть дизайнера за картинкой, а дизайнер — базу знаний за фактами. Без ручного управления.

> 💡 **Совет:** начни с `archiveAfterMinutes: 480` и `maxSpawnDepth: 3`. Увеличивай по необходимости.

---

*Фабрика Контента v2.0*
*Marat • [openclaw.ai](https://openclaw.ai)*
