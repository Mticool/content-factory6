#!/bin/bash
# Публикация статьи "Юнит-экономика 2026"
# Использование: ./tools/publish-article-3.sh YOUR_API_KEY

set -euo pipefail

API_KEY="${1:-}"
if [ -z "$API_KEY" ]; then
    echo "❌ Ошибка: не указан API ключ"
    echo "Использование: $0 YOUR_API_KEY"
    exit 1
fi

BLOG_API="https://ozon-check.ru/api/blog/articles"

echo "📝 Подготовка статьи..."

# Заголовок и метаданные
TITLE="Селлер 2026: выживут только те, кто считает. 3 столпа прибыли"
SLUG="seller-2026-vyzhivut-tolko-schitayuschie"
DESCRIPTION="Как селлеру увеличить прибыль, а не просто оборот в 2026 году? Три главных принципа: диверсификация, юнит-экономика и автоматизация."

# Конвертация изображений в base64
echo "🎨 Конвертация изображений..."

IMAGE1=$(base64 -w 0 images/unit-economics-seller-crisis.png)
IMAGE2=$(base64 -w 0 images/unit-economics-three-pillars.png)
IMAGE3=$(base64 -w 0 images/unit-economics-sku-traffic-light.png)
IMAGE4=$(base64 -w 0 images/unit-economics-ozoncheck-interface.png)

# Формирование HTML с встроенными изображениями
HTML=$(cat <<EOF
<img src="data:image/png;base64,$IMAGE1" alt="Селлер в кризисной ситуации" style="width:100%;max-width:800px;height:auto;margin:20px 0;">

<h2>Оборот — это ещё не прибыль</h2>
<p>Главная ошибка селлеров в 2026 году — пытаться расти только оборотом. Продаж больше, денег меньше. Знакомо?</p>
<p>Оборот без маржи — это иллюзия бизнеса. Если вы не растете в прибыли — завтра вашу долю рынка заберет конкурент.</p>

<h2>Три столпа прибыли в 2026</h2>

<img src="data:image/png;base64,$IMAGE2" alt="3 столпа юнит-экономики" style="width:100%;max-width:800px;height:auto;margin:20px 0;">

<h3>1. Диверсификация каналов</h3>
<p>Если вы работаете только с одной площадкой — вы зависимы. Распределяйте продажи между Ozon, Wildberries, Яндекс Маркетом, своим интернет-магазином.</p>
<p><strong>Плюсы:</strong></p>
<ul>
<li>Диверсификация рисков</li>
<li>Больше точек продаж</li>
<li>Гибкость в управлении ценой</li>
</ul>

<h3>2. Строгая юнит-экономика</h3>
<p>Вы должны знать прибыль по каждому товару. Комиссии меняются, СПП съедает маржу — если не считать цифры, вы работаете вслепую.</p>
<p><strong>Что включать в расчёт:</strong></p>
<ul>
<li>Себестоимость товара</li>
<li>Комиссию маркетплейса</li>
<li>Логистику и хранение</li>
<li>СПП и скидки</li>
<li>Рекламные расходы</li>
<li>Возвраты</li>
</ul>

<img src="data:image/png;base64,$IMAGE3" alt="SKU светофор - красный/жёлтый/зелёный" style="width:100%;max-width:800px;height:auto;margin:20px 0;">

<h3>3. Автоматизация процессов</h3>
<p>Меньше рутины — быстрее масштаб. Тратить 10 часов в неделю на таблицы — это прошлый век.</p>

<h2>Что убивает прибыль</h2>
<ul>
<li><strong>Рост комиссий</strong> — с 14,5% до 47% за год</li>
<li><strong>СПП</strong> — маржа падает в 2-3 раза</li>
<li><strong>Реклама</strong> — ставки растут</li>
<li><strong>Алгоритмы</strong> — непредсказуемость</li>
</ul>

<h2>Формула успеха</h2>
<p><strong>Рост прибыли = диверсификация + юнит-экономика + автоматизация</strong></p>

<img src="data:image/png;base64,$IMAGE4" alt="OzonCheck интерфейс" style="width:100%;max-width:800px;height:auto;margin:20px 0;">

<h2>Как OzonCheck помогает</h2>
<p>Мы создали инструмент, который считает юнит-экономику за 30 секунд. Загружаете отчёт — получаете P&L с прибылью по каждому товару.</p>
<p>Без Excel. Без формул. Без подключения API.</p>
<p>Просто загружаете — и видите цифры.</p>

<p><strong><a href="https://ozon-check.ru" style="color:#007bff;text-decoration:none;">→ Попробовать OzonCheck бесплатно</a></strong></p>
EOF
)

# Отправка на сервер
echo "🚀 Публикация..."

RESPONSE=$(curl -s -X POST "$BLOG_API" \
  -H "X-Blog-Api-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg title "$TITLE" \
    --arg slug "$SLUG" \
    --arg description "$DESCRIPTION" \
    --arg content "$HTML" \
    '{
      title: $title,
      slug: $slug,
      description: $description,
      content: $content,
      published: true
    }'
  )")

# Проверка результата
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    ARTICLE_ID=$(echo "$RESPONSE" | jq -r '.id')
    ARTICLE_URL=$(echo "$RESPONSE" | jq -r '.url // "https://ozon-check.ru/blog/\($slug)"')
    
    echo ""
    echo "✅ Статья опубликована!"
    echo "📄 ID: $ARTICLE_ID"
    echo "🔗 URL: $ARTICLE_URL"
    echo ""
    echo "📊 Размер изображений:"
    echo "   - Изображение 1: $(ls -lh images/unit-economics-seller-crisis.png | awk '{print $5}')"
    echo "   - Изображение 2: $(ls -lh images/unit-economics-three-pillars.png | awk '{print $5}')"
    echo "   - Изображение 3: $(ls -lh images/unit-economics-sku-traffic-light.png | awk '{print $5}')"
    echo "   - Изображение 4: $(ls -lh images/unit-economics-ozoncheck-interface.png | awk '{print $5}')"
else
    echo "❌ Ошибка публикации:"
    echo "$RESPONSE" | jq .
    exit 1
fi
