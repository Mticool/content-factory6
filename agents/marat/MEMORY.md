# MEMORY.md — Роутер памяти

## Файлы бренда
| Файл | Описание |
|------|----------|
| `brand/profile.md` | Профиль, УТП |
| `brand/voice-style.md` | Тон, стиль |
| `brand/audience.md` | ЦА, боли |
| `learning/corrections.md` | Правила (RULE) |
| `learning/approved-patterns.md` | Что работает |
| `learning/rejected-patterns.md` | Ошибки |

## Notion БД
| База | ID |
|------|----|
| Контент-план | `31bb5965-dec9-81f2-83c2-f4149b1093b6` |
| Threads | `31bb5965-dec9-8161-8e0a-cdc64662a4d6` |
| Telegram | `31bb5965-dec9-819f-8dea-e5ba1737269b` |
| Статьи | `31bb5965-dec9-811d-bea7-d7a1bb939db4` |
| YouTube | `31bb5965-dec9-81d8-b594-c3ad47858cb6` |
| Исследования | `31bb5965-dec9-8113-bb05-f2b770050cb7` |
| Конкуренты | `31bb5965-dec9-8149-9599-ce4fbe2eb3ae` |
| Идеи | `31bb5965-dec9-81e3-9404-cbf3f3babc99` |
| SwipeFile | `31bb5965-dec9-8115-bab7-eb78601e38be` |
| Learning Log | `31bb5965-dec9-81a2-853a-f5eca75df4f6` |
| Instagram SwipeFile | `318b5965-dec9-8162-a52b-f8a25f28d2cb` |

## Notion Workflow
- Статусы: 💡 Идея → 📝 Драфт → 👀 На проверке → ✅ Одобрен / 🔄 На доработку
- Поля: Комментарий, Итерация, ER%, Аналитика
- Cron `analyst-feedback-loop` каждые 6ч → corrections.md

## Команда (7 ботов, v1.21)
| Агент | Бот | Скиллы |
|-------|-----|--------|
| marat-m | @AssiLab_bot | все 10 (оркестратор) |
| alena | @alena_fc_bot | writing, seo |
| alex | @alex1_fc_bot | video-scripts, video-gen |
| sinsey | @sinsey1_bot | strategy, research |
| designer | @BobLife1_bot | carousel, image-gen |
| analyst | @KiDss1_bot | research |
| ozoncheck | @ozoncheck_ai_bot | эксперт МП, консультант |

Отключены: max, lena-fc, ai-models, bob-life, rezak

## OzonCheck бот
- Чат селлеров: OzonCheck Chat (-1001765145487)
- Модель: Sonnet 4.5
- Режим: по @mention
- База знаний: 20+ файлов в knowledge/
- Cron: ежедневный мониторинг 09:00 МСК

## LaoZhang API
- Ключ: sk-d8y33zJ9xfn2I9uXB109042aD3Dd45BdB2AeC11538041927
- Модель: gemini-3-pro-image-preview (НЕ nano-banana-pro)
- Скрипт: tools/nano-banana-pro.sh

## Blog API
- URL: `https://ozon-check.ru/api/blog`, Header: `X-Blog-Api-Key`
- Ключ: `e3cf337daf3fb8779ca937c9c67fb4785f62e1bc7b2e35f2b0476100ba9610ea`

## Cron (МСК)
03:00 Hygiene | 08:00 Ресёрч+Healthcheck | 10:00 Выжимка | 13:00 Тренды | 15:00 AI скан | 19:00 Notion review | 21:00 Память | Пн 09:00 Вирусный ресёрч

## ⚠️ ВАЖНО (07.03.2026)
- **Anthropic API баланс ПУСТ** — Claude модели недоступны, все дают 401
- **OzonCheck бот ✅** — работает в группе селлеров (-1001765145487), @ozoncheck_ai_bot
- **LaoZhang API ✅** — новый токен sk-d8y33zJ9xfn2I9uXB109042aD3Dd45BdB2AeC11538041927, модель gemini-3-pro-image-preview
- **Дизайнер ✅** — Nano Banana Pro генерирует через LaoZhang (tools/nano-banana-pro.sh)
- **Убраны:** max, ai-models, lena-fc (мёртвые токены), bob-life, rezak

## Ключевые правила
- Notion: ТОЛЬКО через API (curl + $NOTION_API_KEY), НИКОГДА web_fetch
- CTA в постах: мягкий, без цен и прямых продаж
- Парсинг vc.ru: regex JSON в HTML (API закрыт)
- **[image-gen]** — картинки ТОЛЬКО через LaoZhang API (nano-banana-pro.sh)
- Модели агентов: не трогать, Марат сам переключает по необходимости
