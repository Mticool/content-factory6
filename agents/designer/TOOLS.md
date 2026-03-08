# TOOLS.md - Local Notes

## 🎨 ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ — Nano Banana Pro (ОБЯЗАТЕЛЬНО!)

### ⚠️ ВСЕГДА используй этот метод для генерации картинок:

**Скрипт:** `tools/nano-banana-pro.sh`
**Модель:** `gemini-3-pro-image-preview` (Gemini 3 Pro Image)
**API:** LaoZhang (api.laozhang.ai)
**Ключ:** `sk-d8y33zJ9xfn2I9uXB109042aD3Dd45BdB2AeC11538041927`

```bash
# Генерация изображения
./tools/nano-banana-pro.sh "detailed prompt here" output.png

# Редактирование существующего
./tools/nano-banana-pro.sh "edit instruction" input.png output.png

# Через другую модель
NANO_MODEL=gpt-image-1 ./tools/nano-banana-pro.sh "prompt" output.png
```

**Доступные модели:**
- `gemini-3-pro-image-preview` ← ОСНОВНАЯ (лучшее качество)
- `gpt-image-1` — GPT Image
- `flux-kontext-pro` — Flux
- `grok-3-image` — Grok
- `dall-e-3` — DALL-E

**Или напрямую через curl:**
```bash
curl -s "https://api.laozhang.ai/v1/chat/completions" \
  -H "Authorization: Bearer sk-d8y33zJ9xfn2I9uXB109042aD3Dd45BdB2AeC11538041927" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3-pro-image-preview",
    "messages": [{"role": "user", "content": "your prompt here"}]
  }'
```

---

## ⚠️ NOTION API — ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ

### Как работать с Notion

**НИКОГДА** не открывай Notion через web_fetch или браузер. Используй ТОЛЬКО API через curl.

**Переменная окружения:** `$NOTION_API_KEY` (уже настроена)

### Чтение страницы (получить контент)
```bash
# Получить блоки контента страницы
curl -s "https://api.notion.com/v1/blocks/PAGE_ID/children?page_size=100" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

### Чтение свойств страницы
```bash
curl -s "https://api.notion.com/v1/pages/PAGE_ID" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

### Поиск записей в базе данных
```bash
curl -s -X POST "https://api.notion.com/v1/databases/DATABASE_ID/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"filter":{"property":"Статус","select":{"equals":"💡 Идея"}}}'
```

### Создание страницы в базе
```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "DATABASE_ID"},
    "properties": {
      "Идея": {"title": [{"text": {"content": "Заголовок"}}]},
      "Статус": {"select": {"name": "📝 Драфт"}}
    },
    "children": [
      {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"text":{"content":"Текст контента"}}]}}
    ]
  }'
```

### Добавление блоков на существующую страницу
```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/PAGE_ID/children" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {"object":"block","type":"heading_2","heading_2":{"rich_text":[{"text":{"content":"Заголовок раздела"}}]}},
      {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"text":{"content":"Текст"}}]}},
      {"object":"block","type":"bulleted_list_item","bulleted_list_item":{"rich_text":[{"text":{"content":"Пункт списка"}}]}},
      {"object":"block","type":"quote","quote":{"rich_text":[{"text":{"content":"Цитата или хук"}}]}}
    ]
  }'
```

### Обновление свойств страницы
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/PAGE_ID" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Статус": {"select": {"name": "👀 На проверке"}}
    }
  }'
```

### Наши базы данных (ID)
| База | ID |
|------|----|
| Контент-план | `31bb5965-dec9-81f2-83c2-f4149b1093b6` |
| Threads | `31bb5965-dec9-8161-8e0a-cdc64662a4d6` |
| Telegram | `31bb5965-dec9-819f-8dea-e5ba1737269b` |
| Статьи | `31bb5965-dec9-811d-bea7-d7a1bb939db4` |
| YouTube | `31bb5965-dec9-81d8-b594-c3ad47858cb6` |
| Идеи | `31bb5965-dec9-81e3-9404-cbf3f3babc99` |

### Статусы контента
- `💡 Идея` → `📝 Драфт` → `👀 На проверке` → `✅ Одобрен` / `🔄 На доработку`

### Типы блоков
- `paragraph` — обычный текст
- `heading_2` — заголовок H2
- `heading_3` — заголовок H3
- `bulleted_list_item` — пункт списка
- `numbered_list_item` — нумерованный список
- `quote` — цитата
- `callout` — выделенный блок
- `divider` — разделитель
- `toggle` — раскрывающийся блок

---

---


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
