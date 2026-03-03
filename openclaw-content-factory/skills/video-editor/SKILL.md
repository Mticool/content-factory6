---
name: video-editor
description: "Автоматизация видео-продакшна: субтитры, монтаж, сборка проектов для Final Cut Pro. Активируется на: 'субтитры', 'subtitles', 'монтаж', 'видео', 'auto-subs', 'auto-cut', 'auto-assemble', 'FCPXML', 'Final Cut', 'footage', 'футажи'."
---

# Video Editor — автоматизация видео для Final Cut Pro

## Что умеет

### 1. auto-subs — Автосубтитры
Видео → Whisper транскрипция → FCPXML субтитры + SRT файл

```bash
auto-subs video.mp4                          # → video.fcpxml + video.srt
auto-subs video.mp4 --mode words             # по словам
auto-subs video.mp4 --font "Montserrat" --size 80 --color "#FFD700"
```

**Опции:**
- `--font <name>` — шрифт (default: Arial Bold)
- `--size <n>` — размер (default: 72)
- `--color <hex>` — цвет текста (#FFFFFF)
- `--stroke <hex>` — обводка (#000000)
- `--position <pos>` — top/center/bottom (default: bottom)
- `--mode <mode>` — words/phrases (default: phrases)
- `--max-words <n>` — макс слов в фразе (default: 8)
- `--lang <code>` — язык Whisper (default: ru)
- `--model <name>` — модель Whisper: tiny/base/small/medium/large (default: small)

### 2. auto-cut — Автомонтаж
Папка футажей + аудиодорожка → FCPXML timeline с умным подбором

```bash
auto-cut --footage ./footage/ --audio voice.m4a -o timeline.fcpxml
auto-cut --footage ./footage/ --audio voice.m4a --manual   # без LLM
```

**Футажи:** видеофайлы + `footage.md` с описаниями:
```markdown
## 001.mp4
Макс за компьютером, печатает код

## 002.mp4
Общий план офиса, камера панорамирует
```

LLM подбирает футажи по смыслу аудио. `--manual` — round-robin.

### 3. auto-assemble — Полная сборка
Всё вместе: футажи + аудио + субтитры → один FCPXML

```bash
auto-assemble --footage ./footage/ --audio voice.m4a -o project.fcpxml
auto-assemble --footage ./f/ --audio v.m4a --no-subs --manual
auto-assemble --footage ./f/ --audio v.m4a --font "Montserrat" --font-size 64 --font-color "#FFD700"
```

**5 шагов внутри:**
1. Сканирует футажи + читает footage.md
2. Транскрибирует аудио через Whisper
3. LLM подбирает футажи по смыслу текста
4. Генерирует субтитры + SRT
5. Собирает FCPXML: видео на spine, аудио lane -1, субтитры lane 1

**Структура таймлайна:**
```
Spine (main):  [footage1] [footage3] [footage2] ...
Lane -1:       [========== аудиодорожка ===========]
Lane 1:        [sub1] [sub2] [sub3] [sub4] ...
```

## Установка

```bash
# Зависимости (macOS)
brew install ffmpeg
pip install openai-whisper

# Video Factory CLI
cd video-factory && npm link

# Проверка
auto-subs --help
auto-assemble --help
```

## Workflow для агента

### Просят "сделай субтитры":
1. Спроси файл/путь к видео
2. `auto-subs <файл>`
3. Отдай .fcpxml + .srt

### Просят "собери видео":
1. Спроси папку футажей и аудио
2. Проверь footage.md (если нет — помоги создать)
3. `auto-assemble --footage <папка> --audio <файл>`
4. Отдай project.fcpxml + .srt

### Просят описать футажи (footage.md):
```markdown
## filename.mp4
Краткое описание: кто, что делает, план (крупный/общий)
```

## Требования
- Node.js 18+
- Whisper CLI (OpenAI)
- ffmpeg / ffprobe
- Final Cut Pro 10.8+ (FCPXML 1.11)
- OpenClaw (опционально, для LLM-подбора)
