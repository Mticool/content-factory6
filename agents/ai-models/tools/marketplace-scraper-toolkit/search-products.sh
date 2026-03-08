#!/bin/bash
# Поиск товаров на маркетплейсах с выводом ссылок

set -e

if [ $# -lt 2 ]; then
    echo "Использование:"
    echo "  ./search-products.sh <маркетплейс> <запрос> [количество]"
    echo ""
    echo "Маркетплейсы:"
    echo "  avito - Авито"
    echo "  ozon - Озон"
    echo "  wb - Wildberries"
    echo ""
    echo "Примеры:"
    echo "  ./search-products.sh avito 'игрушки трансформеры' 10"
    echo "  ./search-products.sh ozon 'чехол iphone' 20"
    echo "  ./search-products.sh wb 'наушники bluetooth' 15"
    exit 1
fi

MARKETPLACE="$1"
QUERY="$2"
LIMIT="${3:-20}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔍 Поиск на ${MARKETPLACE^^}: $QUERY (топ-${LIMIT})"
echo ""

xvfb-run -a python3 "$SCRIPT_DIR/marketplace-search.py" "$MARKETPLACE" "$QUERY" "$LIMIT"
