#!/bin/bash

# VC.ru Auto Publisher
# Автоматическая публикация статей на VC.ru

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VC_DIR="$SCRIPT_DIR/vc-publisher"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции вывода
info() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Проверка аргументов
if [ $# -lt 2 ]; then
    echo "Usage: $0 <article.md> <images-dir> [--draft]"
    echo ""
    echo "Arguments:"
    echo "  article.md   - Markdown файл со статьёй"
    echo "  images-dir   - Папка с изображениями"
    echo "  --draft      - Сохранить как черновик (опционально)"
    echo ""
    echo "Example:"
    echo "  $0 articles/my-article.md images/ --draft"
    exit 1
fi

ARTICLE="$1"
IMAGES_DIR="$2"
DRAFT_FLAG=""

if [ "$3" = "--draft" ]; then
    DRAFT_FLAG="--draft"
fi

# Проверка файлов
[ ! -f "$ARTICLE" ] && error "Файл статьи не найден: $ARTICLE"
[ ! -d "$IMAGES_DIR" ] && error "Папка с изображениями не найдена: $IMAGES_DIR"

# Проверка .env
if [ ! -f "$VC_DIR/.env" ]; then
    warn ".env файл не найден. Создаём из шаблона..."
    cat > "$VC_DIR/.env" << 'EOF'
# VC.ru credentials
VC_EMAIL=your-email@example.com
VC_PASSWORD=your-password

# Опции
HEADLESS=true
EOF
    error "Настройте credentials в файле: $VC_DIR/.env"
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
    error "Node.js не установлен. Установите: apt install nodejs npm"
fi

# Установка зависимостей
if [ ! -d "$VC_DIR/node_modules" ]; then
    info "Установка зависимостей..."
    cd "$VC_DIR"
    npm install --silent
    npx playwright install chromium
    cd - > /dev/null
fi

# Запуск публикации
info "Запуск автопостинга на VC.ru..."
info "Статья: $ARTICLE"
info "Изображения: $IMAGES_DIR"
[ -n "$DRAFT_FLAG" ] && info "Режим: Черновик" || info "Режим: Публикация"

cd "$VC_DIR"
node index.js "$ARTICLE" "$IMAGES_DIR" $DRAFT_FLAG

if [ $? -eq 0 ]; then
    info "Готово!"
else
    error "Ошибка публикации"
fi
