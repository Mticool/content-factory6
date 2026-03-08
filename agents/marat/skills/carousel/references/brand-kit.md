# Brand Kit — Настройка каруселей

> © Фабрика Контента | openclaw.ai

## Как заполнить

При первом запуске команды `карусель` агент задаст вопросы и заполнит этот файл + создаст `brand-kit.json`.

## Анкета

### 1. Аккаунт
- **Instagram:** @___
- **Prefix для ID каруселей:** ___ (например MYCRSL)

### 2. Стиль
- [ ] **Dark** — тёмный фон, светлый текст (tech, premium)
- [ ] **Light** — светлый фон, тёмный текст (lifestyle, education)
- [ ] **Brand** — свои цвета (укажи ниже)

### 3. Цвета
| Роль | Hex | Пример |
|------|-----|--------|
| Фон основной | #___ | |
| Текст основной | #___ | |
| Акцент | #___ | |
| Текст второстепенный | #___ | |

### 4. Шрифты (Google Fonts)
- **Заголовки:** Montserrat (default) / Inter / Roboto / ___
- **Код/URL:** JetBrains Mono (default) / Fira Code / ___

### 5. CTA-слайд
- [ ] Есть готовый (путь: ___)
- [ ] Нужно создать

### 6. Лого/аватар
- [ ] Есть (путь: ___)
- [ ] Не нужен

---

## Пресеты

### Dark Premium (по умолчанию)
```json
{
  "handle": "@your_account",
  "headingFont": "Montserrat",
  "codeFont": "JetBrains Mono",
  "bgGradient": "linear-gradient(170deg, #111 0%, #0a0a0a 100%)",
  "bgSolid": "#0a0a0a",
  "bgOverlay": "rgba(0,0,0,0.85)",
  "bgOverlayFull": "rgba(0,0,0,0.75)",
  "textColor": "#ffffff",
  "textSecondary": "rgba(255,255,255,0.75)",
  "textMuted": "rgba(255,255,255,0.25)",
  "accentColor": "#d97734",
  "accentGlow": "rgba(217,119,52,0.15)",
  "accentDim": "rgba(217,119,52,0.5)",
  "borderGlow": "rgba(255,255,255,0.06)"
}
```

### Light Clean
```json
{
  "handle": "@your_account",
  "headingFont": "Inter",
  "codeFont": "JetBrains Mono",
  "bgGradient": "linear-gradient(170deg, #fafafa 0%, #f0f0f0 100%)",
  "bgSolid": "#ffffff",
  "bgOverlay": "rgba(255,255,255,0.9)",
  "bgOverlayFull": "rgba(255,255,255,0.85)",
  "textColor": "#1a1a1a",
  "textSecondary": "rgba(0,0,0,0.6)",
  "textMuted": "rgba(0,0,0,0.25)",
  "accentColor": "#2563eb",
  "accentGlow": "rgba(37,99,235,0.1)",
  "accentDim": "rgba(37,99,235,0.4)",
  "borderGlow": "rgba(0,0,0,0.06)"
}
```

### Anthropic / Claude Code
```json
{
  "handle": "@your_account",
  "headingFont": "Montserrat",
  "codeFont": "JetBrains Mono",
  "bgGradient": "linear-gradient(165deg, #1a1107 0%, #0d0d0d 40%, #0a0a12 100%)",
  "bgSolid": "#0d0d0d",
  "bgOverlay": "rgba(0,0,0,0.85)",
  "bgOverlayFull": "rgba(0,0,0,0.75)",
  "textColor": "#ffffff",
  "textSecondary": "rgba(255,255,255,0.6)",
  "textMuted": "rgba(255,255,255,0.25)",
  "accentColor": "#d97734",
  "accentGlow": "rgba(217,119,52,0.15)",
  "accentDim": "rgba(217,119,52,0.5)",
  "borderGlow": "rgba(255,255,255,0.06)"
}
```
