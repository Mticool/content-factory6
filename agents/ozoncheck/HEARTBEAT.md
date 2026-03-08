# HEARTBEAT.md — OzonCheck Ассистент

## Проверки каждые 6 часов

### 1. Сбор FAQ
- Проверить memory/unanswered-questions.md
- Если есть неотвеченные вопросы → найти ответы через web_search → добавить в knowledge/faq.md
- Обновить BOOTSTRAP.md секцию FAQ если появились новые частые вопросы

### 2. Обновление знаний
- Если в чате обсуждались новые правила Ozon/WB → записать в knowledge/
- Если были ошибки в ответах → записать в learning/corrections.md

### 3. Контроль контекста
```javascript
if (context_usage > 80%) {
  // Сохранить собранные вопросы в knowledge/faq.md
  // Очистить memory/unanswered-questions.md
}
```

## Метрики
- Сколько вопросов получено
- Сколько ответов дано
- Какие темы чаще всего спрашивают
