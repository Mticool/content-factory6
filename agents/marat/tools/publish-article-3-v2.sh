#!/bin/bash
# Публикация статьи "Юнит-экономика 2026" (v2 - через файлы)

set -euo pipefail

API_KEY="${1:-e3cf337daf3fb8779ca937c9c67fb4785f62e1bc7b2e35f2b0476100ba9610ea}"
BLOG_API="https://ozon-check.ru/api/blog/articles"
TEMP_DIR=$(mktemp -d)

echo "📝 Подготовка статьи..."

# Заголовок и метаданные
TITLE="Селлер 2026: выживут только те, кто считает. 3 столпа прибыли"
SLUG="seller-2026-vyzhivut-tolko-schitayuschie"
DESCRIPTION="Как селлеру увеличить прибыль, а не просто оборот в 2026 году? Три главных принципа: диверсификация, юнит-экономика и автоматизация."

# Конвертация изображений в base64
echo "🎨 Конвертация изображений..."

base64 -w 0 images/unit-economics-seller-crisis.png > "$TEMP_DIR/img1.b64"
base64 -w 0 images/unit-economics-three-pillars.png > "$TEMP_DIR/img2.b64"
base64 -w 0 images/unit-economics-sku-traffic-light.png > "$TEMP_DIR/img3.b64"
base64 -w 0 images/unit-economics-ozoncheck-interface.png > "$TEMP_DIR/img4.b64"

# Формирование HTML с встроенными изображениями
cat > "$TEMP_DIR/content.html" <<'HTMLEND'
<img src="data:image/png;base64,HTMLEND
cat "$TEMP_DIR/img1.b64" >> "$TEMP_DIR/content.html"
cat >> "$TEMP_DIR/content.html" <<'HTMLEND'
" alt="Селлер в кризисной ситуации" style="width:100%;max-width:800px;height:auto;margin:20px 0;">

<h2>Оборот — это ещё не прибыль</h2>
<p>Главная ошибка селлеров в 2026 году — пытаться расти только оборотом. Продаж больше, денег меньше. Знакомо?</p>
<p>Оборот без маржи — это иллюзия бизнеса. Если вы не растете в прибыли — завтра вашу долю рынка заберет конкурент.</p>

<h2>Три столпа прибыли в 2026</h2>

<img src="data:image/png;base64,HTMLEND
cat "$TEMP_DIR/img2.b64" >> "$TEMP_DIR/content.html"
cat >> "$TEMP_DIR/content.html" <<'HTMLEND'
" alt="3 столпа юнит-экономики" style="width:100%;max-width:800px;height:auto;margin:20px 0;">

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

<img src="data:image/png;base64,HTMLEND
cat "$TEMP_DIR/img3.b64" >> "$TEMP_DIR/content.html"
cat >> "$TEMP_DIR/content.html" <<'HTMLEND'
" alt="SKU светофор" style="width:100%;max-width:800px;height:auto;margin:20px 0;">

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

<img src="data:image/png;base64,HTMLEND
cat "$TEMP_DIR/img4.b64" >> "$TEMP_DIR/content.html"
cat >> "$TEMP_DIR/content.html" <<'HTMLEND'
" alt="OzonCheck интерфейс" style="width:100%;max-width:800px;height:auto;margin:20px 0;">

<h2>Как OzonCheck помогает</h2>
<p>Мы создали инструмент, который считает юнит-экономику за 30 секунд. Загружаете отчёт — получаете P&L с прибылью по каждому товару.</p>
<p>Без Excel. Без формул. Без подключения API.</p>
<p>Просто загружаете — и видите цифры.</p>

<p><strong><a href="https://ozon-check.ru" style="color:#007bff;text-decoration:none;">→ Попробовать OzonCheck бесплатно</a></strong></p>
HTMLEND

# Формирование JSON payload
echo "📦 Формирование запроса..."

CONTENT=$(cat "$TEMP_DIR/content.html")

cat > "$TEMP_DIR/payload.json" <<EOF
{
  "title": "$TITLE",
  "slug": "$SLUG",
  "description": "$DESCRIPTION",
  "content": $(jq -Rs . <<< "$CONTENT"),
  "status": "published",
  "author": "OzonCheck"
}
EOF

# Отправка на сервер
echo "🚀 Публикация..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BLOG_API" \
  -H "X-Blog-Api-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d @"$TEMP_DIR/payload.json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

# Очистка
rm -rf "$TEMP_DIR"

# Проверка результата
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    if echo "$BODY" | jq -e '.id' > /dev/null 2>&1; then
        ARTICLE_ID=$(echo "$BODY" | jq -r '.id')
        ARTICLE_URL=$(echo "$BODY" | jq -r '.url // "https://ozon-check.ru/blog/'$SLUG'"')
        
        echo ""
        echo "✅ Статья опубликована!"
        echo "📄 ID: $ARTICLE_ID"
        echo "🔗 URL: $ARTICLE_URL"
        echo ""
        echo "📊 Размер изображений:"
        ls -lh images/unit-economics-*.png | awk '{print "   -", $9, ":", $5}'
    else
        echo "✅ HTTP $HTTP_CODE"
        echo "$BODY" | jq .
    fi
else
    echo "❌ Ошибка публикации (HTTP $HTTP_CODE):"
    echo "$BODY" | jq .
    exit 1
fi
