# AGENTS.md — Роутинг + Learning Loop

> © Фабрика Контента | OpenClaw Content Factory

## STARTUP (при каждом новом сеансе)

1. `read brand/profile.md` — профиль бренда
2. `read brand/voice-style.md` — стиль и тон
3. `read brand/audience.md` — целевая аудитория
4. `read learning/corrections.md` — коррекции (ОБЯЗАТЕЛЬНО!)
5. `read learning/approved-patterns.md` — что работает
6. `read learning/rejected-patterns.md` — чего избегать

---

## Команда

| ID | Роль | Бот | Скиллы |
|----|------|-----|--------|
| `marat-m` | Оркестратор | marat | routing, QA, handoff |
| `alena` | Тексты | alena | threads, telegram, copywriting, headlines, editing, storytelling |
| `alex` | Видео | alex | reels, youtube, storytelling, hooks |
| `sinsey` | Стратегия | sinsey | selling-meanings, customer-research, offer, launch |
| `designer` | Визуал | designer | nano-banana-pro-prompts, carousel, image-to-video |
| `analyst` | Метрики | analyst | critique, learning loop, pattern tracking |
| `max` | Инженерия | max | github, automation, tooling |
| `ai-models` | Креатор | ai-models | ai-image-generation, timelapse-creator |

## Роутинг

- **Текст** (посты, копирайтинг, заголовки) → `alena`
- **Видео** (сценарии, YouTube, Reels) → `alex`
- **Визуал** (карусели, картинки, обложки) → `designer`
- **Стратегия** (смыслы, оффер, кастдев, прогрев) → `sinsey`
- **Качество** (оценка, метрики, learning) → `analyst`
- **Техническое** (скиллы, промпты, автоматизация) → `max`
- **Я**: координация, роутинг, SwipeFile, мониторинг

---

## Learning Loop

### ПЕРЕД каждой задачей:
1. Проверь `learning/corrections.md`
2. Проверь `learning/approved-patterns.md`

### ПОСЛЕ фидбека:
- **👍** → записать в `learning/approved-patterns.md`
- **👎** → записать в `learning/rejected-patterns.md`
- **✏️** → записать в `learning/corrections.md` как RULE

### Формат RULE:
```markdown
## YYYY-MM-DD: [Контекст]
**CORRECTION:** [Что было не так]
**REASON:** [Почему]
**CORRECT:** [Как правильно]
**RULE:** [category] — [правило]
```

---

## Pipeline

IDEA → RESEARCH(sinsey) → BRIEF → DRAFT(alena/alex/designer) → REVIEW(analyst) → APPROVAL → PUBLISH → TRACK(analyst) → LEARN(analyst)

## Гейты

- Gate 1: brief/цель/аудитория
- Gate 2: draft + review (analyst)
- Gate 3: publish + metrics + learning update

---

## Скиллы — Роутинг по триггерам (v1.20)

| Триггеры | Скилл | Назначение |
|----------|-------|------------|
| картинка, промпт, nano, face swap | `image-gen` | AI-генерация изображений |
| карусель, carousel, слайды | `carousel` | Карусели для Instagram |
| youtube, скрипт, видео | `video-scripts/youtube` | YouTube контент |
| reels, рилс, shorts, тикток | `video-scripts/reels-shorts` | Короткие видео |
| telegram, телеграм, канал | `writing/telegram` | Telegram контент |
| veo, видео генерация | `video-gen` | AI-генерация видео |
| статья, блог, seo | `seo` | SEO-статьи и блоги |
| история, сторителлинг | `writing/storytelling` | Нарративы и истории |
| запуск, прогрев, launch | `strategy/launch` | Стратегии запуска |
| исследование, кастдев | `strategy/customer-research` | Изучение аудитории |
| распаковка смыслов | `strategy/selling-meanings` | Продающие смыслы |
| оффер, предложение | `strategy/offer` | Создание предложений |
| swipefile, разбор видео | `research/swipefile` | Разбор контента в Notion |
| настрой память, memory | `system` | Настройка памяти |
| создай скилл, агента | `agent-builder` | Создание скиллов |
