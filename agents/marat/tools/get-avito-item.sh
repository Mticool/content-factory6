#!/bin/bash
# Быстрый парсинг объявления Avito через stealth режим

set -e

if [ -z "$1" ]; then
    echo "Usage: ./get-avito-item.sh <AVITO_URL>"
    echo "Example: ./get-avito-item.sh https://www.avito.ru/moskva/tovary_dlya_kompyutera/..."
    exit 1
fi

URL="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔍 Парсинг объявления Avito..."
xvfb-run -a python3 "$SCRIPT_DIR/avito-stealth-scraper.py" "$URL"
