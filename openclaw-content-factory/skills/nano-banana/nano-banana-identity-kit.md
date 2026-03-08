# Nano Banana Identity Kit Module

> © Фабрика Контента | OpenClaw Content Factory | Marat | https://t.me/Mticool | openclaw.ai

Модуль для создания AI-персонажей и виртуальных моделей. Активируется триггерами: `identity kit`, `создать персонажа`, `ai модель`, `виртуальный инфлюенсер`, `референсные фото`, `e-model`.

---

## Философия Identity Kit

> **Identity Kit = Один раз зафиксировать → Бесконечно использовать**

**Проблема:** При генерации AI лицо "плывёт" — каждая новая картинка даёт немного другого человека.

**Решение:** Сначала создать комплект качественных РЕФЕРЕНСНЫХ фотографий, которые фиксируют личность. Затем использовать этот комплект для ВСЕХ последующих генераций.

**Применение:**
- AI-аватары для HeyGen, Hedra, Sync Labs
- UGC-инфлюенсеры (E-модели)
- Виртуальные персонажи для контента
- Consistent character для серии видео/роликов

---

## Полный Workflow

### Этап 1: Концепция персонажа

**Определить:**

| Параметр | Что решить |
|----------|------------|
| Возраст | ~25, ~35, ~50+ |
| Пол | М / Ж |
| Этничность | European, Asian, Middle Eastern, etc. |
| Волосы | Цвет, стиль, длина, hairline |
| Борода/усы | Есть/нет, стиль |
| Особенности | Морщинки, веснушки, родинки, шрамы |
| Телосложение | Худой, средний, крупный |
| Стиль одежды | Деловой, casual, медицинский |

**Пример описания:**

```
Мужчина ~55-60 лет, South Asian / Middle Eastern.
Седые волосы (gray/silver), редеющие сверху, зачёсаны назад.
Короткая седая борода (salt-and-pepper), аккуратно подстрижена.
Карие глаза, тёплый добрый взгляд.
Характерный нос (slightly curved bridge).
Морщины улыбки вокруг глаз, выразительные брови.
Телосложение среднее.
```

---

### Этап 2: Исходные материалы

**Вариант A: Есть реальное фото**
- 2-4 фото с разных ракурсов
- Хорошее освещение
- Лицо чётко видно

**Вариант B: Генерируем с нуля**
- Описание из Этапа 1
- Первая генерация → "лотерея"
- Если понравилось → фиксируем как [Image1]

---

### Этап 3: Генерация РЕФЕРЕНСНЫХ фотографий

**КРИТИЧНО: Референсы НЕ художественные!**

Референсные фото — это ТЕХНИЧЕСКИЕ снимки для фиксации личности:
- **Формат 3:4** — НЕ вертикальный 9:16 (режет уши!)
- **Закрытая диафрагма (f/8)** — всё в фокусе
- **Нет художественного размытия** — каждый волосок виден
- **Максимальная детализация** — поры, морщинки, текстура
- **4K разрешение** — 2880x3840 минимум

### Параметры для референсов:

```
REFERENCE PHOTO TECHNICAL REQUIREMENTS:
- Aspect ratio: 3:4 (NOT 9:16 — vertical crops ears!)
- Resolution: 4K (2880x3840 pixels minimum)
- Aperture: f/8 (deep depth of field)
- EVERYTHING in sharp focus: face, ears, hair, shoulders
- NO bokeh, NO artistic blur, NO selective focus
- Maximum detail capture: every pore, every wrinkle, every hair
- Flat, even lighting — no dramatic shadows
- Neutral expression for clean baseline
- Camera: Phase One XF IQ4 150MP or similar high-resolution
- Technical reference style, NOT artistic portrait
```

---

### Этап 4: Состав Identity Kit

**Минимальный набор (3 фото):**
1. Фронтальный портрет, нейтральный
2. Улыбка с зубами
3. Поворот 3/4

**Расширенный набор (5-6 фото):**
1. Фронтальный нейтральный
2. Фронтальный с улыбкой (зубы)
3. 3/4 влево
4. 3/4 вправо
5. Профиль
6. (опционально) С разными эмоциями

---

## Промпты для генерации референсов

### 1. Нейтральный фронтальный портрет

```
Create a close-up portrait (3:4 aspect ratio, 2880x3840 pixels, 4K ultra-high resolution) based on the person from [Image1], [Image2], [Image3].

PURPOSE: Reference image for Identity Kit — neutral baseline. Maximum detail, NO artistic blur.

OUTPUT QUALITY:
- 4K resolution (2880x3840 pixels minimum)
- 8K detail level
- Ultra-sharp, razor-crisp EVERYWHERE
- Maximum possible resolution
- Every pore, every wrinkle, every hair visible
- EVERYTHING in sharp focus — face, ears, hair, shoulders

IDENTITY LOCK:
[INSERT FULL IDENTITY LOCK BLOCK]

EXPRESSION: Neutral, calm, mouth naturally closed. Ready-to-speak moment. Eyes looking directly at camera with confident, approachable gaze.

FRAMING: Tight close-up portrait. Face fills 60-70% of vertical frame. Top of head slightly cropped is OK. Shoulders visible at bottom.

BACKGROUND: Simple solid medium gray (#808080). Clean, no distractions.

LIGHTING:
- Flat, even studio lighting
- NO dramatic shadows
- NO Rembrandt, NO artistic patterns
- Soft fill from all directions
- Goal: capture maximum detail, not create mood

CAMERA: Phase One XF IQ4 150MP medium format with 120mm lens at f/8. Deep depth of field. EVERYTHING in sharp focus. NOT portrait photography — REFERENCE photography.

CRITICAL — NO ARTISTIC EFFECTS:
- NO shallow depth of field
- NO bokeh
- NO soft focus
- NO dreamy look
- This is TECHNICAL REFERENCE, not art
- Sharp focus on ALL elements: face, ears, hair, neck, shoulders

STYLE: Technical reference photography. Maximum detail capture. Photorealistic.
```

---

### 2. Улыбка с зубами

```
Create a close-up portrait (3:4, 2880x3840, 4K) based on person from [Image1], [Image2], [Image3].

PURPOSE: Reference image for Identity Kit — SMILE WITH TEETH capture.

[Same OUTPUT QUALITY and IDENTITY LOCK blocks]

EXPRESSION CAPTURE:
- Genuine warm smile showing teeth
- Natural tooth alignment and color (not Hollywood white)
- Authentic laugh lines fully activated
- Eyes genuinely smiling (crinkled corners)
- Crow's feet visible

FRAMING: Same tight close-up as neutral reference.

[Same BACKGROUND, LIGHTING, CAMERA, CRITICAL blocks]
```

---

### 3. Поворот 3/4

```
Create a close-up portrait (3:4, 2880x3840, 4K) based on person from [Image1], [Image2], [Image3].

PURPOSE: Reference image for Identity Kit — 3/4 angle capture.

[Same OUTPUT QUALITY and IDENTITY LOCK blocks]

POSE: Face turned 30-45 degrees to [LEFT/RIGHT]. Both eyes visible. Ear on far side visible. Nose profile clear.

EXPRESSION: Neutral, calm, slight hint of smile.

[Same BACKGROUND, LIGHTING, CAMERA, CRITICAL blocks]
```

---

## Использование Identity Kit

После создания Kit → исходные фото можно удалить.

**Для контентных генераций:**

```
Create [CONTENT DESCRIPTION] based on person from Identity Kit [ref1.png], [ref2.png], [ref3.png].

IDENTITY REQUIREMENT:
Use reference images to preserve EXACT identity. Person must be 100% recognizable.

[SCENE, CLOTHING, LIGHTING — as needed for content]
[МОЖНО использовать художественные эффекты, bokeh, драматичный свет]
```

---

## HeyGen Avatar Photos (КРИТИЧНО!)

> **HeyGen-аватар = фото, которое будет ОЖИВЛЯТЬСЯ**

Фото для HeyGen/Hedra/Sync Labs — это НЕ обычный портрет. Это стоп-кадр, который станет видео. Всё, что видно в кадре, будет анимироваться — поэтому **ВСЁ должно быть в фокусе**.

### Правило фокуса для HeyGen

| Элемент | Фокус | Почему |
|---------|-------|--------|
| Лицо | ✅ SHARP | Анимируется |
| Руки | ✅ SHARP | Видны в кадре, будут двигаться |
| Одежда | ✅ SHARP | Часть персонажа |
| Реквизит на столе | ✅ SHARP | Часть сцены |
| Фон (стена, bokeh) | 🔵 Можно blur | Не анимируется |

### Технические параметры для HeyGen

```
HEYGEN AVATAR TECHNICAL REQUIREMENTS:

FOCUS — CRITICAL:
- Aperture: f/5.6 to f/8 (NOT f/1.4-2.8!)
- Deep depth of field
- EVERYTHING in sharp focus: face, hands, arms, clothing, props on desk
- ONLY background can have bokeh
- If hands are visible — hands MUST be sharp
- If props are visible — props MUST be sharp

WHY: This image will be ANIMATED. Blurry hands/props look broken in video.

COMMON MISTAKE: Using f/1.8-2.0 for "cinematic look" — this blurs hands and ruins animation.
```

### Блок для вставки в промпты HeyGen

```
CAMERA FOR HEYGEN AVATAR:
- Aperture: f/5.6 (deep depth of field)
- Sharp focus on ALL visible elements: face, hands, arms, clothing, desk, props
- ONLY background wall can be soft/bokeh
- This image will be ANIMATED — blurry elements look broken in video
- NOT a portrait photo — this is a VIDEO FRAME
```

### Пример промпта HeyGen-аватара

```
Create an image (9:16, 1080x1920) based on person from [Image1], [Image2], [Image3], [Image4].

[IDENTITY LOCK block]

SCENE: [описание сцены]

CAMERA FOR HEYGEN AVATAR:
- Aperture: f/5.6 (deep depth of field)
- Sharp focus on ALL visible elements: face, hands, arms, clothing, desk, props
- ONLY background wall can be soft/bokeh
- This image will be ANIMATED — blurry elements look broken in video

ANIMATION-READY:
- Face 100% visible
- Hands NOT near face
- Mouth closed, ready to speak
- Eyes at camera

STYLE: Photorealistic.
```

### Чеклист HeyGen-аватара

- [ ] Диафрагма f/5.6-f/8 (НЕ f/1.4-2.8)
- [ ] Руки в фокусе (если видны)
- [ ] Реквизит в фокусе (если виден)
- [ ] Только фон размыт
- [ ] Animation-ready поза (руки не у лица, рот закрыт)

---

## Identity Lock Templates

### Базовый (всегда вставлять):

```
IDENTITY LOCK — use ALL reference images to extract and preserve:

FACE STRUCTURE:
- Exact bone structure, forehead shape, jawline contour
- Nose shape and size (distinctive features)
- Eye spacing, eye shape, brow ridge
- Ear shape and position

SKIN & TEXTURE:
- Natural skin tone and complexion
- Visible pores, fine lines, age spots
- Wrinkles: crow's feet, forehead lines, nasolabial folds
- NO beautification, NO smoothing, NO airbrushing

HAIR:
- Hair color, texture, style
- Hairline pattern
- Facial hair shape and density

CRITICAL: Person must be 100% recognizable as the SAME individual. Not "similar" — IDENTICAL.
```

### Усиленный (если лицо плывёт):

```
CRITICAL IDENTITY REQUIREMENT:
Person must look EXACTLY like themselves — not "similar", not "inspired by", but IDENTICAL.
Same face, same skin, same features. No AI interpretation.
Treat reference images as a photo ID that must match perfectly.
If you cannot preserve identity exactly, DO NOT generate.
```

---

## Хранение Identity Kit

```
project/
├── avatars/
│   └── [character-name]/
│       ├── identity-kit/
│       │   ├── 01-neutral.png
│       │   ├── 02-smile-teeth.png
│       │   ├── 03-quarter-left.png
│       │   └── 04-quarter-right.png
│       └── [character-name].md    # Описание + Identity Lock
```

---

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| Лицо "плывёт" | Усилить Identity Lock + использовать все 3-5 референсов |
| Референс получился размытым | Проверить f/8, убрать bokeh, добавить "sharp focus on ALL" |
| Слишком гламурно/smooth | Добавить "NO beautification, natural pores, NOT airbrushed" |
| Возраст изменился | Явно указать "preserve exact age ~XX years" |
| Уши/волосы размыты | Закрыть диафрагму f/8, убрать все blur |
| Недостаточно деталей | Увеличить разрешение до 4K, добавить "8K detail level" |

---

## Quick Actions

| Команда | Действие |
|---------|----------|
| `identity kit: [описание]` | Создать концепцию персонажа |
| `референс нейтральный` | Промпт для нейтрального портрета |
| `референс улыбка` | Промпт для улыбки с зубами |
| `референс 3/4` | Промпт для поворота |
| `контент [сцена]` | Контентный кадр с Identity Kit |

---

## Чеклист создания Identity Kit

### Перед началом:
- [ ] Концепция персонажа описана
- [ ] Исходные материалы готовы (фото или описание)

### Генерация референсов:
- [ ] Нейтральный портрет — 4K, f/8, всё в фокусе
- [ ] Улыбка с зубами — 4K, f/8, всё в фокусе
- [ ] Поворот 3/4 — 4K, f/8, всё в фокусе

### Проверка качества:
- [ ] Лицо узнаваемо на ВСЕХ референсах (один человек)
- [ ] Уши, волосы, плечи в фокусе (не размыты)
- [ ] Поры и морщины видны (не заглажено)
- [ ] Разрешение достаточное (минимум 2880x3840)

### Финализация:
- [ ] Файл персонажа создан (.md с описанием и Identity Lock)
- [ ] Референсы сохранены в identity-kit/
- [ ] Исходные временные фото удалены

---

*Version: 1.0*
*Created: 2026-01-19*
