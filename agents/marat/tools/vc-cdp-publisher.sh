#!/bin/bash

#
# VC.ru CDP Publisher Wrapper
# Публикация статей через подключение к реальному Chrome
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLISHER_DIR="$SCRIPT_DIR/vc-publisher"
CDP_SCRIPT="$PUBLISHER_DIR/cdp-publisher.js"

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции логирования
log_info() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_step() {
  echo -e "${BLUE}→${NC} $1"
}

# Проверка аргументов
if [ $# -lt 2 ]; then
  echo ""
  echo "VC.ru CDP Publisher"
  echo ""
  echo "Использование:"
  echo "  $0 <article.md> <images-dir> [--draft] [--port=9222]"
  echo ""
  echo "Параметры:"
  echo "  article.md   - Путь к статье в формате Markdown"
  echo "  images-dir   - Директория с изображениями"
  echo "  --draft      - Сохранить как черновик (опционально)"
  echo "  --port=9222  - Порт CDP (по умолчанию 9222)"
  echo ""
  echo "Подготовка:"
  echo "  1. Откройте Chrome с удалённой отладкой:"
  echo "     google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-dev"
  echo ""
  echo "  2. Авторизуйтесь на vc.ru в этом Chrome"
  echo ""
  echo "  3. Запустите скрипт"
  echo ""
  exit 1
fi

ARTICLE_PATH="$1"
IMAGES_DIR="$2"
shift 2
EXTRA_ARGS="$@"

# Проверка файлов
if [ ! -f "$ARTICLE_PATH" ]; then
  log_error "Файл статьи не найден: $ARTICLE_PATH"
  exit 1
fi

if [ ! -d "$IMAGES_DIR" ]; then
  log_warn "Папка с изображениями не найдена: $IMAGES_DIR"
  log_warn "Продолжаем без изображений..."
fi

# Проверка CDP Publisher
if [ ! -f "$CDP_SCRIPT" ]; then
  log_error "CDP Publisher не найден: $CDP_SCRIPT"
  exit 1
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
  log_error "Node.js не установлен"
  exit 1
fi

# Вывод информации
log_info "Запуск CDP автопостинга на VC.ru..."
log_info "Статья: $ARTICLE_PATH"
log_info "Изображения: $IMAGES_DIR"

if echo "$EXTRA_ARGS" | grep -q "\--draft"; then
  log_info "Режим: Черновик"
else
  log_info "Режим: Публикация"
fi

echo ""
log_step "Убедитесь что Chrome запущен с флагом --remote-debugging-port=9222"
log_step "и вы авторизованы на VC.ru"
echo ""

# Запуск публикации
cd "$PUBLISHER_DIR"
node "$CDP_SCRIPT" "$ARTICLE_PATH" "$IMAGES_DIR" $EXTRA_ARGS

# Результат
if [ $? -eq 0 ]; then
  echo ""
  log_info "Готово! Проверьте результат в Chrome"
  echo ""
else
  echo ""
  log_error "Ошибка при публикации"
  echo ""
  exit 1
fi
