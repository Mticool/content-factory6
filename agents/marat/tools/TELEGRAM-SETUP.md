# Telegram Channel Reader — Настройка

## 1. Сохрани API credentials

Создай файл с твоими данными от my.telegram.org:

```bash
nano ~/.openclaw/telegram-credentials
```

Содержимое:
```bash
API_ID=твой_api_id
API_HASH=твой_api_hash
```

Сохрани (Ctrl+O, Enter, Ctrl+X)

## 2. Первый запуск (авторизация)

При первом запуске Telegram попросит авторизоваться:

```bash
./tools/tg-read @ozoncheck 5
```

Telegram отправит код в твой аккаунт → введи его → готово!

Сессия сохранится в `~/.openclaw/telegram-sessions/` — больше логиниться не нужно.

## 3. Использование

### Прочитать последние 10 сообщений
```bash
./tools/tg-read @ozoncheck
```

### Прочитать 20 сообщений
```bash
./tools/tg-read @ozoncheck 20
```

### С offset (пропустить первые N)
```bash
./tools/tg-read @ozoncheck 10 50
```

### Разные форматы канала
```bash
./tools/tg-read @ozoncheck
./tools/tg-read ozoncheck
./tools/tg-read https://t.me/ozoncheck
```

## 4. Вывод — JSON

Скрипт возвращает JSON с полями:
- `id` — ID сообщения
- `date` — дата/время (ISO)
- `text` — текст сообщения
- `views` — количество просмотров
- `forwards` — количество пересылок
- `media_type` — тип медиа (photo/document), если есть

## 5. Использование из кода

```python
import subprocess
import json

result = subprocess.run(
    ['./tools/tg-read', '@ozoncheck', '5'],
    capture_output=True,
    text=True
)

messages = json.loads(result.stdout)
for msg in messages:
    print(f"{msg['date']}: {msg['text'][:50]}...")
```

## Troubleshooting

### "Phone number invalid"
- Используй формат: +79991234567

### "Session file corrupted"
```bash
rm -rf ~/.openclaw/telegram-sessions/
```
Потом запусти снова — переавторизуется.

### "API ID/HASH not found"
- Проверь файл `~/.openclaw/telegram-credentials`
- Убедись, что нет пробелов: `API_ID=123` (не `API_ID = 123`)
