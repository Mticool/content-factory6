# GitHub Nomenclature & Templates (под источники)

## 1) Нейминг репозиториев
Формат:
`cf6-{brand}-{source}-{purpose}`

Примеры:
- `cf6-ozoncheck-threads-content`
- `cf6-ozoncheck-telegram-content`
- `cf6-ozoncheck-youtube-production`
- `cf6-ozoncheck-reels-production`
- `cf6-ozoncheck-shared-assets`

## 2) Ветки
- `main` — прод
- `dev` — интеграция
- `feat/<source>-<topic>`
- `fix/<source>-<issue>`
- `ops/<infra-change>`

## 3) Папки (единый шаблон)
```
/content
  /ideas
  /briefs
  /drafts
  /approved
  /published
  /archive
/metrics
/learning
/templates
/automation
```

## 4) Шаблоны Issues
- `content-brief.md`
- `content-review.md`
- `repurpose-task.md`
- `bug-automation.md`

## 5) Шаблоны PR
- `PR_CONTENT.md` (цель, аудитория, хук, CTA, метрика)
- `PR_AUTOMATION.md` (risk, rollback, logs)

## 6) Labels
- Source: `src:threads`, `src:telegram`, `src:youtube`, `src:reels`, `src:vc`
- Stage: `stage:idea`, `stage:brief`, `stage:draft`, `stage:review`, `stage:published`
- Type: `type:content`, `type:automation`, `type:research`, `type:design`
- Priority: `p0`, `p1`, `p2`

## 7) Projects (GitHub Project)
Одна доска `OzonCheck Content Factory` с колонками:
Backlog -> Brief -> In Progress -> Review -> Approved -> Published -> Learnings

## 8) Источники (обязательные шаблоны)
- Threads: короткий хук + 1 мысль + CTA
- Telegram: экспертный пост + практический блок + CTA
- YouTube: сценарий + таймкоды + обложка
- Reels: 15–45s хук + монтажный план + субтитры
- VC: SEO заголовок + структура + UTM
