# SwipeFile Формат v3.2

## Notion DB
- SwipeFile DB: `30d6ad1a-cb59-80ad-bf8f-d51927ad886a`

## Properties (ОБЯЗАТЕЛЬНО при создании страницы)
| Property | Type | Notion ID | Значения |
|----------|------|-----------|----------|
| Name | title | title | «Автор — Название видео» |
| Tags | multi_select | J%3BjW | OpenClaw, ClaudeCode, AI Agents, Automation, Content, Vibe Coding, Productivity, Memory, Туториал и др. |
| Source | url | XV%3F~ | URL видео |
| Source Type | select | YZrP | YouTube, Article, Thread, Tweet |
| Use For | multi_select | d%3AxD | Threads, Telegram, YouTube, Reels |
| Max's Attention | select | rFqk | High, Implement |
| How to use | rich_text | Nese | Краткое описание применения |

⚠️ Property "Max's Attention" содержит фигурный апостроф — использовать через ID `rFqk`.

## 16 секций контента

1. **📺 Callout** — автор, канал, ссылка, тема, длительность
2. **📋 Summary** — 10 тезисов (numbered_list)
3. **🏗️ Структура видео** — арка повествования
4. **🪝 Хуки** — 7 формулировок
5. **🧠 Триггеры** — 5-6 психологических
6. **✨ Фишки автора** — 7 приёмов
7. **🔓 Укради это** — 5 готовых шаблонов/формул
8. **🎯 Техники для Макса и ФК** — оценка применимости
9. **📝 Готовые черновики** — 5 Threads + 3 YouTube + 3 Telegram
10. **⏱️ Таймкоды** — 5-7 золотых моментов (MM:SS — описание)
11. **🛠️ Сервисы** — все упомянутые инструменты
12. **💡 Лайфхаки** — решения + маршрутизация в ФК
13. **💬 Quotes** — 7-8 цитат НА РУССКОМ
14. **🔗 Кросс-связи** — похожие приёмы + Notion ссылки на авторов
15. **🧠 Внедрить в ФК** — конкретные действия
16. **💎 Главные инсайты** — 5 callout блоков

## Размеры
- Видео 5-30 мин: ~115-125 блоков
- Лайвы 30+ мин: ~75-85 блоков
- Короткие <5 мин: ~60-70 блоков

## Технические правила
- Python subprocess+curl для Notion API
- 4-5 батчей по ~25 блоков
- Эталон: Бабушкин (3066ad1a-cb59-8140-a510-dd3fddd01a0a)
