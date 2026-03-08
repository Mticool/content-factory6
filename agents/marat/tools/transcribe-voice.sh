#!/bin/bash
# Транскрибация голосового сообщения из Telegram

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <audio-file> [--language ru|en]"
  exit 1
fi

AUDIO="$1"
LANG="${2:-ru}"

if [ ! -f "$AUDIO" ]; then
  echo "❌ Файл не найден: $AUDIO"
  exit 1
fi

echo "🎙️ Транскрибация: $AUDIO"
echo "📝 Язык: $LANG"
echo ""

/usr/lib/node_modules/openclaw/skills/openai-whisper-api/scripts/transcribe.sh \
  "$AUDIO" \
  --language "$LANG" \
  --out /tmp/transcript.txt

echo ""
echo "✅ Готово!"
cat /tmp/transcript.txt
