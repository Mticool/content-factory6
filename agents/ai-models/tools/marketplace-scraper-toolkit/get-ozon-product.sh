#!/bin/bash
# Быстрый парсинг карточки Ozon через stealth режим

set -e

if [ -z "$1" ]; then
    echo "Usage: ./get-ozon-product.sh <OZON_URL>"
    echo "Example: ./get-ozon-product.sh https://ozon.ru/t/jQWorAz"
    exit 1
fi

URL="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔍 Парсинг карточки Ozon..."
xvfb-run -a python3 "$SCRIPT_DIR/ozon-stealth-scraper.py" "$URL"
