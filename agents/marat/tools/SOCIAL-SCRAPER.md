# Social Media Scraper — Универсальный скрейпер

> Скачивание видео, аудио, метаданных из YouTube, TikTok, Instagram, Twitter и др.

---

## 🎯 Поддерживаемые платформы

✅ **Полная поддержка:**
- **YouTube** — videos, shorts, playlists
- **TikTok** — videos, user profiles
- **Instagram** — posts, reels, stories
- **Twitter/X** — videos
- **Facebook** — videos
- **Reddit** — videos

⚠️ **Частичная поддержка:**
- Instagram user/tag (может не работать без авторизации)
- TikTok effect/sound (deprecated)

---

## 🛠️ Инструменты

### 1. yt-dlp (универсальный)
**Версия:** 2026.02.04 (latest)  
**Поддержка:** 1000+ сайтов

### 2. instaloader (Instagram)
**Версия:** 4.15  
**Специализация:** Instagram profiles, posts, stories, highlights

### 3. social-scraper.sh (wrapper)
**Удобный CLI** для yt-dlp с preset'ами

---

## 📖 Использование

### Быстрый старт

```bash
# Метаданные (без скачивания)
./tools/social-scraper.sh "https://tiktok.com/@user/video/123" --metadata-only

# Скачать видео
./tools/social-scraper.sh "https://youtube.com/watch?v=VIDEO_ID"

# Только аудио (MP3)
./tools/social-scraper.sh "https://youtube.com/watch?v=VIDEO_ID" --audio-only
```

### Опции

| Параметр | Описание |
|----------|----------|
| `-m, --metadata-only` | Только метаданные (title, views, likes, description) |
| `-a, --audio-only` | Скачать только аудио (MP3) |
| `-q, --quality <qual>` | Качество: `best`, `1080p`, `720p`, `480p`, `360p` |
| `-o, --output <dir>` | Директория сохранения (default: `./downloads`) |
| `-f, --format <fmt>` | Формат видео: `mp4`, `webm`, `mkv` |
| `--thumbnail` | Скачать превью/обложку |
| `--subtitles` | Скачать субтитры (ru, en) |

---

## 💡 Примеры

### YouTube

```bash
# Скачать видео в 720p
./tools/social-scraper.sh "https://youtube.com/watch?v=dQw4w9WgXcQ" -q 720p

# Только аудио
./tools/social-scraper.sh "https://youtube.com/watch?v=dQw4w9WgXcQ" -a

# С субтитрами
./tools/social-scraper.sh "https://youtube.com/watch?v=dQw4w9WgXcQ" --subtitles

# Метаданные
./tools/social-scraper.sh "https://youtube.com/watch?v=dQw4w9WgXcQ" -m
```

### TikTok

```bash
# Скачать TikTok видео
./tools/social-scraper.sh "https://tiktok.com/@username/video/1234567890"

# Метаданные TikTok
./tools/social-scraper.sh "https://tiktok.com/@username/video/1234567890" -m

# Все видео пользователя (через yt-dlp напрямую)
yt-dlp "https://tiktok.com/@username" -o "downloads/%(uploader)s/%(title)s.%(ext)s"
```

### Instagram

```bash
# Скачать Instagram reel
./tools/social-scraper.sh "https://instagram.com/reel/ABC123DEF456"

# Только аудио из reel
./tools/social-scraper.sh "https://instagram.com/reel/ABC123DEF456" -a

# Instagram post (через instaloader)
instaloader --post-shortcode ABC123DEF456 --dirname-pattern downloads/
```

### Twitter/X

```bash
# Скачать Twitter видео
./tools/social-scraper.sh "https://twitter.com/username/status/1234567890"

# С субтитрами (если есть)
./tools/social-scraper.sh "https://twitter.com/username/status/1234567890" --subtitles
```

---

## 🔍 Получение метаданных

### JSON структура

```bash
./tools/social-scraper.sh "URL" -m
```

**Вывод:**
```json
{
  "title": "Название видео",
  "uploader": "Автор канала",
  "duration": 123,
  "views": 1000000,
  "likes": 50000,
  "upload_date": "20260222",
  "description": "Описание видео...",
  "thumbnail": "https://...",
  "url": "https://..."
}
```

### Использование в скриптах

```bash
# Получить заголовок
TITLE=$(./tools/social-scraper.sh "URL" -m | jq -r '.title')

# Получить количество просмотров
VIEWS=$(./tools/social-scraper.sh "URL" -m | jq -r '.views')

# Проверить длительность
DURATION=$(./tools/social-scraper.sh "URL" -m | jq -r '.duration')
```

---

## 📊 Мониторинг трендов

### YouTube

```bash
# Топ видео по запросу
yt-dlp "ytsearch10:ozon селлер 2026" --dump-json | jq -r '.title, .view_count'

# Статистика канала
yt-dlp "https://youtube.com/@channel" --flat-playlist --dump-json
```

### TikTok

```bash
# Популярные видео по тегу
yt-dlp "https://tiktok.com/tag/маркетплейсы" --playlist-end 10 --dump-json
```

---

## ⚙️ Продвинутое использование

### Скачать весь канал YouTube

```bash
yt-dlp "https://youtube.com/@channel/videos" \
  -f "bestvideo[height<=720]+bestaudio" \
  -o "downloads/%(uploader)s/%(upload_date)s - %(title)s.%(ext)s" \
  --dateafter 20260101
```

### Instagram профиль (instaloader)

```bash
# Все посты + stories
instaloader --login YOUR_USERNAME profile_username

# Только reels
instaloader --login YOUR_USERNAME --reels profile_username
```

### Batch скачивание

```bash
# Из файла со списком URL
while read url; do
    ./tools/social-scraper.sh "$url" -q 720p
done < urls.txt
```

---

## 🚨 Важные замечания

### Ограничения платформ

1. **Instagram:** Требует авторизацию для приватных аккаунтов
2. **TikTok:** Некоторые функции (sound, effect) deprecated
3. **YouTube:** Rate limiting при массовом скачивании

### Рекомендации

- Используйте `-m` для предварительной проверки (не скачивает файл)
- Для Instagram используйте `instaloader` (стабильнее чем yt-dlp)
- Храните учетные данные в безопасности (не коммитьте в git)

### Стоимость

- **yt-dlp:** бесплатно, open source
- **instaloader:** бесплатно, open source
- **API платформ:** не используются (скрейпинг HTML/API)

---

## 📝 Кейсы использования для OzonCheck

### 1. Мониторинг конкурентов

```bash
# Скачать топ-10 видео конкурента
yt-dlp "https://youtube.com/@competitor/videos" --playlist-end 10 -m
```

### 2. Сбор контента для SwipeFile

```bash
# Метаданные + превью для анализа
./tools/social-scraper.sh "URL" -m --thumbnail
```

### 3. Анализ трендов

```bash
# Популярные видео по нише
yt-dlp "ytsearch20:маркетплейсы 2026" --dump-json > trends.json
```

---

*Ready to scrape! Попробуй на любом URL.*
