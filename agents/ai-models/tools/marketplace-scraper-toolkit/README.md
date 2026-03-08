# Marketplace Scraper Toolkit

Полный набор инструментов для парсинга маркетплейсов (Ozon, Wildberries, Avito) с обходом anti-bot защиты.

## Возможности

✅ **Поиск товаров** — автоматический поиск с получением ссылок  
✅ **Парсинг одиночных товаров** — подробные данные карточки  
✅ **Массовый парсинг** — 10-15 товаров с защитой от блокировки  
✅ **Парсинг отзывов** — сортировка от плохих к отличным  
✅ **Обход блокировок** — Playwright Stealth + anti-bot техники  

## Поддерживаемые платформы

- 🟢 **Ozon** — полная поддержка
- 🟢 **Wildberries** — полная поддержка  
- 🟢 **Avito** — полная поддержка

## Установка

### 1. Зависимости системы

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y xvfb python3 python3-pip

# Playwright browsers
pip3 install playwright
playwright install chromium
```

### 2. Python пакеты

```bash
pip3 install playwright playwright-stealth
```

### 3. Распаковка toolkit

```bash
tar -xzf marketplace-scraper-toolkit.tar.gz
cd marketplace-scraper-toolkit
chmod +x *.sh
```

## Быстрый старт

### Поиск товаров

```bash
# Avito
./search-products.sh avito 'игрушки трансформеры' 10

# Ozon
./search-products.sh ozon 'чехол iphone' 20

# Wildberries
./search-products.sh wb 'наушники' 15
```

**Результат:** JSON + TXT файл с URL

### Парсинг одного товара

```bash
# Ozon
./get-ozon-product.sh "https://ozon.ru/t/abc123"

# Wildberries
xvfb-run -a python3 wb-stealth-scraper.py "https://www.wildberries.ru/catalog/12345/detail.aspx"

# Avito
./get-avito-item.sh "https://www.avito.ru/moskva/..."
```

### Массовый парсинг (10-15 товаров)

```bash
# Создать файл с URL
cat > urls.txt << EOF
https://ozon.ru/t/abc123
https://www.wildberries.ru/catalog/12345/detail.aspx
https://www.avito.ru/moskva/...
EOF

# Запустить batch-парсинг
./batch-scrape.sh urls.txt
```

**Время:** ~8-12 минут на 10 товаров

### Парсинг отзывов

```bash
# Ozon
xvfb-run -a python3 ozon-reviews-scraper.py "https://ozon.ru/t/abc123" 50

# Wildberries
xvfb-run -a python3 wb-reviews-scraper.py "https://www.wildberries.ru/catalog/12345/detail.aspx" 50
```

**Результат:** Отзывы от 1★ к 5★

## Структура файлов

```
marketplace-scraper-toolkit/
├── README.md                      # Это файл
├── SEARCH_README.md              # Документация по поиску
├── BATCH_SCRAPER_README.md       # Документация по batch-парсингу
│
├── search-products.sh            # Поиск товаров (обёртка)
├── marketplace-search.py         # Поиск товаров (основной скрипт)
│
├── get-ozon-product.sh           # Парсинг одного товара Ozon
├── ozon-stealth-scraper.py       # Ozon парсер
│
├── wb-stealth-scraper.py         # Wildberries парсер
│
├── get-avito-item.sh             # Парсинг одного объявления Avito
├── avito-stealth-scraper.py      # Avito парсер
│
├── batch-scrape.sh               # Массовый парсинг (обёртка)
├── batch-scraper.py              # Массовый парсинг (основной скрипт)
│
├── ozon-reviews-scraper.py       # Парсинг отзывов Ozon
├── wb-reviews-scraper.py         # Парсинг отзывов Wildberries
│
└── example-urls.txt              # Пример файла с URL
```

## Защита от блокировки

### Автоматические меры

- ✅ **Задержки:** 20-45 сек между запросами
- ✅ **Длинные паузы:** 3-5 минут каждые 5 товаров
- ✅ **Ротация User-Agent:** автоматическая смена
- ✅ **Имитация пользователя:** прокрутка, клики, "чтение"
- ✅ **Stealth режим:** маскировка автоматизации
- ✅ **Мониторинг блокировки:** автоматическая реакция

### Рекомендации

**Безопасно:**
- До 15 товаров за раз
- 1-2 запуска в день
- Паузы между сессиями 2-4 часа

**Рискованно:**
- 20+ товаров подряд
- Частые запуски (каждый час)
- Игнорирование пауз

## Примеры использования

### Мониторинг конкурентов

```bash
# 1. Поиск похожих товаров
./search-products.sh ozon 'power bank 20000' 15

# 2. Парсинг всех найденных
./batch-scrape.sh /tmp/search_ozon_power_bank_20000_urls.txt
```

### Анализ ниши

```bash
# Поиск топ-20 товаров
./search-products.sh wb 'органайзер для обуви' 20

# Детальный парсинг топ-10
head -10 /tmp/search_wb_органайзер_для_обуви_urls.txt > top10.txt
./batch-scrape.sh top10.txt
```

### Поиск поставщиков на Avito

```bash
./search-products.sh avito 'оптом игрушки' 20
```

## Результаты парсинга

### JSON формат

```json
{
  "url": "https://ozon.ru/t/abc123",
  "marketplace": "ozon",
  "title": "Power Bank 20000 mAh",
  "price": "1 234 ₽",
  "old_price": "2 468 ₽",
  "rating": "4.5",
  "article": "123456789",
  "seller": "Продавец ООО",
  "description": "Полное описание товара...",
  "images": ["https://..."],
  "characteristics": {
    "Ёмкость": "20000 mAh",
    "Цвет": "Чёрный"
  },
  "scraped_at": "2026-02-27T14:30:00"
}
```

## Troubleshooting

### Ошибка: "БЛОКИРОВКА ОБНАРУЖЕНА"

**Решение:**
1. Увеличить задержки между запросами (60-90 сек)
2. Уменьшить количество товаров (5-7 за раз)
3. Подождать 1-2 часа и повторить

### Ошибка: "xvfb command not found"

**Решение:**
```bash
sudo apt-get install xvfb
```

### Ошибка: "playwright not found"

**Решение:**
```bash
pip3 install playwright playwright-stealth
playwright install chromium
```

### Парсинг не возвращает данные

**Причины:**
- Селекторы устарели (маркетплейсы меняют вёрстку)
- Блокировка (проверь скриншот в `/tmp/`)
- Товар удалён/недоступен

**Решение:**
- Проверь скриншот: `/tmp/ozon-debug.png`, `/tmp/wb-debug.png`, `/tmp/avito-debug.png`
- Попробуй другой товар
- Обнови селекторы в Python скриптах

## Интеграция в бота

### 1. Скопируй файлы в workspace бота

```bash
cp -r marketplace-scraper-toolkit/* /path/to/bot/tools/
```

### 2. Добавь в MEMORY.md бота

```markdown
### Парсинг маркетплейсов
**Поиск:** `tools/search-products.sh <avito|ozon|wb> 'запрос' [лимит]`
**Парсинг:** `tools/batch-scrape.sh urls.txt`
**Отзывы:** `tools/ozon-reviews-scraper.py <URL>`
```

### 3. Добавь в TOOLS.md бота

```markdown
## Парсинг маркетплейсов
- Поиск товаров: Avito, Ozon, Wildberries
- Массовый парсинг с защитой от блокировки
- Парсинг отзывов с сортировкой
```

### 4. Тестирование

```bash
cd /path/to/bot/tools/
./search-products.sh ozon 'test' 5
```

## Лицензия

Для личного и коммерческого использования.

## Поддержка

При проблемах:
1. Проверь скриншоты в `/tmp/`
2. Увеличь задержки
3. Уменьши количество запросов

---

**Версия:** 1.0  
**Дата:** 2026-02-27  
**Автор:** Content Factory AI  
