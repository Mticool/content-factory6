#!/bin/bash
# Мониторинг новостей Ozon и Wildberries

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/../monitoring/marketplace-news"
mkdir -p "$OUTPUT_DIR"

TODAY=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# Функция для скрапинга Ozon Seller новостей
fetch_ozon_news() {
    echo "📦 Fetching Ozon Seller news..."
    
    curl -s "https://seller.ozon.ru/news" \
        -H "User-Agent: Mozilla/5.0" \
        > "$OUTPUT_DIR/ozon-news-${TIMESTAMP}.html"
    
    # Извлекаем заголовки и ссылки (базовый парсинг)
    grep -oP '(?<=<h2>).*?(?=</h2>)|(?<=<h3>).*?(?=</h3>)' \
        "$OUTPUT_DIR/ozon-news-${TIMESTAMP}.html" \
        > "$OUTPUT_DIR/ozon-headlines-${TODAY}.txt" 2>/dev/null || echo "No headlines found"
    
    echo "✅ Ozon news saved to $OUTPUT_DIR/ozon-headlines-${TODAY}.txt"
}

# Функция для скрапинга Wildberries новостей
fetch_wb_news() {
    echo "🟣 Fetching Wildberries Seller news..."
    
    curl -s "https://seller.wildberries.ru/" \
        -H "User-Agent: Mozilla/5.0" \
        > "$OUTPUT_DIR/wb-news-${TIMESTAMP}.html"
    
    grep -oP '(?<=<h2>).*?(?=</h2>)|(?<=<h3>).*?(?=</h3>)' \
        "$OUTPUT_DIR/wb-news-${TIMESTAMP}.html" \
        > "$OUTPUT_DIR/wb-headlines-${TODAY}.txt" 2>/dev/null || echo "No headlines found"
    
    echo "✅ WB news saved to $OUTPUT_DIR/wb-headlines-${TODAY}.txt"
}

# Функция для проверки изменений в тарифах
check_tariffs() {
    echo "💰 Checking tariff changes..."
    
    # Ozon тарифы
    curl -s "https://seller.ozon.ru/tariffs" \
        -H "User-Agent: Mozilla/5.0" \
        > "$OUTPUT_DIR/ozon-tariffs-${TIMESTAMP}.html"
    
    # WB тарифы (конструктор тарифов)
    curl -s "https://seller.wildberries.ru/tariffs" \
        -H "User-Agent: Mozilla/5.0" \
        > "$OUTPUT_DIR/wb-tariffs-${TIMESTAMP}.html"
    
    echo "✅ Tariff pages saved"
}

# Создаём сводку за день
generate_summary() {
    cat > "$OUTPUT_DIR/summary-${TODAY}.md" << EOF
# Marketplace News Summary — ${TODAY}

## Ozon
$(cat "$OUTPUT_DIR/ozon-headlines-${TODAY}.txt" 2>/dev/null || echo "No news captured")

## Wildberries
$(cat "$OUTPUT_DIR/wb-headlines-${TODAY}.txt" 2>/dev/null || echo "No news captured")

## Источники
- Ozon Seller: https://seller.ozon.ru/news
- WB Seller: https://seller.wildberries.ru

---
Сгенерировано: ${TIMESTAMP}
EOF

    echo "📋 Summary created: $OUTPUT_DIR/summary-${TODAY}.md"
}

# Основной workflow
case "${1:-all}" in
    ozon)
        fetch_ozon_news
        ;;
    wb)
        fetch_wb_news
        ;;
    tariffs)
        check_tariffs
        ;;
    all)
        fetch_ozon_news
        fetch_wb_news
        check_tariffs
        generate_summary
        ;;
    *)
        echo "Usage: $0 {ozon|wb|tariffs|all}"
        exit 1
        ;;
esac
