# Настройка памяти — 3 слоя

Добавь эти настройки в свой `openclaw.json` (или `~/.openclaw/openclaw.json`).

## Слой 1: Memory Flush + Compaction

В секцию `agents.defaults` добавь:

```json
"compaction": {
  "mode": "safeguard",
  "reserveTokensFloor": 20000,
  "memoryFlush": {
    "enabled": true,
    "softThresholdTokens": 6000,
    "prompt": "Запиши важные решения и контекст в memory/ файлы. Если нечего — ответь NO_REPLY.",
    "systemPrompt": "Сессия близка к компакции. Запиши ВСЕ важные решения, предпочтения и рабочий контекст в memory/YYYY-MM-DD.md. Постоянные факты — в MEMORY.md."
  }
}
```

**Что это делает:** перед тем как OpenClaw сожмёт длинный диалог, агент автоматически сохранит важное в файлы. Ничего не потеряется.

## Слой 2: Session Memory (поиск по старым сеансам)

В секцию `hooks.internal.entries` добавь:

```json
"session-memory": {
  "enabled": true
}
```

А в секцию `memory` добавь:

```json
"memory": {
  "backend": "qmd",
  "qmd": {
    "includeDefaultMemory": true,
    "sessions": {
      "enabled": true,
      "retentionDays": 30
    },
    "update": {
      "interval": "5m"
    },
    "limits": {
      "maxResults": 8,
      "timeoutMs": 4000
    }
  }
}
```

**Что это делает:** агент может искать по прошлым сеансам (до 30 дней), не только по текущему разговору.

## Слой 3: Learning Loop

Уже встроен в AGENTS.md конструктора. Работает автоматически:
- Перед задачей → проверяет `learning/corrections.md`
- После фидбека → сохраняет правило
- Каждая коррекция = RULE на будущее

## Минимальный конфиг (копипаста)

Если хочешь добавить всё сразу, вот готовый блок для `openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "mode": "safeguard",
        "reserveTokensFloor": 20000,
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 6000
        }
      }
    }
  },
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "session-memory": {
          "enabled": true
        }
      }
    }
  },
  "memory": {
    "backend": "qmd",
    "qmd": {
      "includeDefaultMemory": true,
      "sessions": {
        "enabled": true,
        "retentionDays": 30
      }
    }
  }
}
```
