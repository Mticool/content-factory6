#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
TOKEN=$(cat ".factory-token" 2>/dev/null)
if [ -z "$TOKEN" ]; then echo "❌ Токен не найден. Переустанови."; exit 1; fi
VARIANT=${1:-openclaw}
echo "🔄 Проверяю обновления..."
REMOTE=$(curl -sf "https://bot.galson.pro/api/factory/version" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
LOCAL=$(cat VERSION 2>/dev/null || echo "0")
if [ "$REMOTE" = "$LOCAL" ]; then echo "✅ Актуальная версия: $LOCAL"; exit 0; fi
echo "📥 Обновляю $LOCAL → $REMOTE..."
TMPFILE="/tmp/factory-update-$$.tar.gz"
curl -sf "https://bot.galson.pro/api/factory/download?token=$TOKEN&variant=$VARIANT" -o "$TMPFILE"
if [ ! -s "$TMPFILE" ]; then echo "❌ Ошибка. Проверь токен."; exit 1; fi
cp -r skills skills.backup.$(date +%Y%m%d) 2>/dev/null || true
STRIP="${VARIANT}-content-factory"
tar -xzf "$TMPFILE" --strip-components=1 "$STRIP/skills/" "$STRIP/VERSION" "$STRIP/CHANGELOG.md" "$STRIP/MEMORY-SETUP.md" 2>/dev/null || true
rm "$TMPFILE"
echo "✅ Обновлено до v$REMOTE"
