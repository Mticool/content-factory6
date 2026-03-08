# Установка Content Factory + OpenClaw на Mac

> ⏱ 20-30 минут → бот в Telegram, который пишет контент в твоём стиле

---

## Что понадобится

| Что | Где взять | Стоимость |
|-----|-----------|-----------|
| Anthropic API ключ | [console.anthropic.com](https://console.anthropic.com) | ~$20-50/мес (по использованию) |
| Telegram бот | [[@BotFather](https://t.me/BotFather)](https://t.me/BotFather) | Бесплатно |
| Твой Telegram ID | [[@userinfobot](https://t.me/userinfobot)](https://t.me/userinfobot) | Бесплатно |

---

## Часть 1. Установка OpenClaw (10 мин)

### 1.1 Открой Терминал

Finder → Программы → Утилиты → **Терминал**

### 1.2 Установи Node.js (если нет)

```bash
node --version
```

Если показывает `v18.x.x` или выше — всё ок, переходи к 1.3.

Если нет — установи:
```bash
# Через Homebrew (рекомендуется)
brew install node

# Или скачай с nodejs.org (кнопка LTS)
```

> 💡 Нет Homebrew? Установи: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

### 1.3 Установи OpenClaw

```bash
npm install -g openclaw
```

Проверь:
```bash
openclaw --version
```

### 1.4 Запусти мастер настройки

```bash
openclaw onboard
```

Мастер спросит:
1. **Модель** → выбери Anthropic → вставь API ключ (`sk-ant-...`)
2. **Gateway** → Local mode
3. **Канал** → Telegram → вставь bot token

> 💡 Как получить bot token: открой [[@BotFather](https://t.me/BotFather)](https://t.me/BotFather) → `/newbot` → назови бота → скопируй токен

> 💡 Как узнать свой Telegram ID: напиши [@userinfobot](https://t.me/userinfobot) — он ответит числом (например `123456789`)

### 1.5 Проверь что работает

```bash
openclaw status
```

Должно показать: Gateway running, Telegram connected.

Напиши боту в Telegram `привет` — должен ответить.

---

## Часть 2. Установка Content Factory (10 мин)

### 2.1 Создай свою копию конструктора

1. Открой конструктор: https://github.com/Mticool/content-factory
2. Нажми зелёную кнопку **"Use this template"** → **"Create a new repository"**
3. Назови как хочешь (например `my-content-factory`), нажми **Create**
4. Склонируй СВОЮ копию:

```bash
cd ~
git clone https://github.com/ТВОЙ_ЮЗЕРНЕЙМ/my-content-factory.git
```

### 2.2 Скопируй workspace и скиллы

```bash
# Скопировать workspace
cp -r ~/my-content-factory/openclaw-content-factory/workspace/* ~/.openclaw/workspace/

# Скопировать скиллы
mkdir -p ~/.openclaw/workspace/skills
cp -r ~/my-content-factory/openclaw-content-factory/skills/* ~/.openclaw/workspace/skills/
```

### 2.3 Перезапусти OpenClaw

```bash
openclaw gateway restart
```

---

## Часть 3. Первый контент (5 мин)

### 3.1 Напиши боту в Telegram

```
начать
```

Бот задаст 3 вопроса:
1. **Кто ты?** → расскажи о себе, своей экспертизе
2. **Для кого пишешь?** → опиши аудиторию
3. **Как общаешься?** → на ты/Вы, тепло/строго

### 3.2 Получи первые посты

```
threads 5
```
→ 5 постов для Threads в твоём стиле

```
youtube script [тема]
```
→ Сценарий для YouTube

```
carousel [тема]
```
→ Карусель для Instagram

### 3.3 Проверь качество

✅ Посты звучат как ты?
✅ Есть хуки и структура?
✅ Правильный тон?

Если нет — скажи `интервью` для глубокой настройки голоса (20-30 мин).

---

## Часть 4. Дальнейшая настройка (по желанию)

### Notion для управления постами

В скилле threads есть ссылка на готовый Notion-шаблон. Дублируй его к себе — и управляй контентом как конвейером.

### Автопостинг в Threads

Если хочешь автоматическую публикацию — см. `tools/threads-scheduler/` в Claude Code версии конструктора.

### Обучение системы

После публикации давай обратную связь:
```
это сработало       → запомнит удачный формат
это не сработало    → запомнит что не работает
```

### Все доступные команды

| Команда | Что получишь |
|---------|-------------|
| `threads 5` | 5 постов для Threads |
| `youtube script [тема]` | Сценарий для YouTube |
| `carousel [тема]` | Карусель для Instagram |
| `reels [тема]` | Идея для Reels |
| `интервью` | Глубокая настройка голоса |
| `это сработало` | Запомнить удачный формат |
| `это не сработало` | Запомнить что не работает |

---

## Что-то не работает?

```bash
# Первым делом — диагностика
openclaw doctor

# Автоисправление
openclaw doctor --fix

# Если не помогло — перезапуск
openclaw gateway restart

# Посмотреть логи
openclaw gateway logs
```

| Проблема | Решение |
|----------|---------|
| Бот не отвечает | `openclaw doctor --fix` |
| "model not found" | Проверь API ключ: `openclaw doctor` |
| "not allowed" | Проверь Telegram ID в конфиге |
| Посты сырые / не по методике | Проверь что скиллы скопированы: `ls ~/.openclaw/workspace/skills/` |

**Поддержка:** [@Mticool](https://t.me/Mticool?start=support)

---

## Обновление

### Обновление конструктора

Конструктор обновляется через скачивание новой версии:
1. Скачай свежую версию: https://github.com/Mticool/content-factory → Code → Download ZIP
2. Распакуй и скопируй `skills/` поверх своих (brand/ и learning/ НЕ трогай)

```bash
cp -r путь-к-распакованному/openclaw-content-factory/skills/* ~/.openclaw/workspace/skills/
openclaw gateway restart
```

---

---

## Модели

| Модель | Для чего |
|--------|----------|
| **Opus 4.6** | Лучшее качество. Продающие тексты, стратегии, сложный контент |
| **Sonnet 4.6** | Баланс цена/качество. Ежедневная генерация постов |
| **Haiku 4.5** | Черновики, простые задачи, экономия бюджета |

Переключить в чате: `/model opus` или `/model sonnet`

> ⚠️ Не используйте Claude Sonnet 4 (старую) — может вызывать сбои.

---

*© Фабрика Контента | Marat | [openclaw.ai](https://openclaw.ai)*
