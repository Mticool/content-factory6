# BOT ROLES & SKILLS (OzonCheck)

## Модель (для всех)
- `openai-codex/gpt-5.3-codex`

## Роли и зоны ответственности

| Бот | Роль | Основные скиллы | KPI зоны |
|---|---|---|---|
| marat-m | Оркестратор | routing, QA-checkpoint, handoff | скорость цикла, SLA задач |
| alena | Тексты (Threads/TG/Copy) | threads, telegram, copywriting, headlines, editing, storytelling | ER, CTR, сохранения |
| alex | Видео-поток | reels, youtube, storytelling, hooks | удержание, досмотры |
| sinsey | Стратегия/офферы | selling-meanings, customer-research, offer, launch | конверсия в лиды/заявки |
| designer | Визуал | nano-banana-pro-prompts, social-media-carousel, image-to-video | CTR обложек, swipe-rate |
| analyst | Критик+метрики | critique, learning loop, pattern tracking | рост метрик, качество гипотез |
| max | Инженерия/автоматизация | github, mcporter, healthcheck, docs/tooling | стабильность, uptime, скорость релизов |
| rezak | Нарезка/клипы | youtube-clipper, video-editor, video-frames | time-to-publish, output quality |
| ai-models | R&D AI-моделей | ai-image-generation, timelapse-creator, image-to-video | cost/quality на генерацию |
| bob-life | Личный ассистент | reminders, personal ops | SLA личных задач |

## Правила маршрутизации
1. Текстовые задачи -> `alena`
2. Видео/сценарии -> `alex`
3. Стратегия/оффер/кастдев -> `sinsey`
4. Визуал/карусели -> `designer`
5. Критика/метрики/learning -> `analyst`
6. Тех задачи/интеграции -> `max`
7. Нарезка/клипы -> `rezak`
8. R&D генерации -> `ai-models`

## Гейты
- Gate 1: brief/цель/аудитория
- Gate 2: draft + review (analyst)
- Gate 3: publish + metrics + learning update
