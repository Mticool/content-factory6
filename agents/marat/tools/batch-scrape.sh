#!/bin/bash
# Обёртка для batch-парсинга с xvfb

set -e

if [ $# -eq 0 ]; then
    echo "Использование:"
    echo "  ./batch-scrape.sh urls.txt"
    echo "  ./batch-scrape.sh <url1> <url2> <url3> ..."
    echo ""
    echo "Файл urls.txt (каждый URL на новой строке):"
    echo "  https://ozon.ru/t/abc123"
    echo "  https://www.wildberries.ru/catalog/12345/detail.aspx"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Запускаю batch-парсинг..."
xvfb-run -a python3 "$SCRIPT_DIR/batch-scraper.py" "$@"
