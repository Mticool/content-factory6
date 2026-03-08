#!/bin/bash
# Veo 3.1 — генерация видео через laozhang.ai
# OpenAI-совместимый формат (Chat Completions + streaming)
# Модели: veo-3.1 ($0.25), veo-3.1-fast ($0.15), veo-3.1-landscape ($0.25), etc.
# Поддержка image-to-video через модели с суффиксом -fl
#
# Использование:
#   ./veo31.sh "prompt текст" [model] [output.mp4]
#   ./veo31.sh "prompt текст" veo-3.1-fast output.mp4
#   ./veo31.sh "animate this" veo-3.1-fast-fl output.mp4 input_image.png

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/laozhang-config.sh"

PROMPT="${1:?Укажи промпт}"
MODEL="${2:-veo-3.1-fast}"
OUTPUT="${3:-$(date +%Y%m%d_%H%M%S)_veo.mp4}"
INPUT_IMAGE="${4:-}"

# Build content
if [[ -n "$INPUT_IMAGE" && -f "$INPUT_IMAGE" ]]; then
    MIME=$(file --mime-type -b "$INPUT_IMAGE")
    B64=$(base64 -w0 "$INPUT_IMAGE")
    CONTENT=$(cat <<JSONEOF
[
  {"type": "text", "text": "$PROMPT"},
  {"type": "image_url", "image_url": {"url": "data:${MIME};base64,${B64}"}}
]
JSONEOF
)
else
    CONTENT="\"$PROMPT\""
fi

echo "🎬 Generating video with $MODEL..."
echo "   Prompt: $PROMPT"
echo "   This may take 1-5 minutes..."

RESPONSE=$(curl -s --max-time 600 "$LAOZHANG_BASE_URL/chat/completions" \
  -H "Authorization: Bearer $LAOZHANG_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"messages\": [{\"role\": \"user\", \"content\": $CONTENT}],
    \"stream\": false
  }")

# Check for error
ERROR=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',{}).get('message',''))" 2>/dev/null || true)
if [[ -n "$ERROR" ]]; then
    echo "❌ Ошибка API: $ERROR"
    exit 1
fi

# Extract video URL from response
echo "$RESPONSE" | python3 -c "
import sys, json, re, urllib.request
data = json.load(sys.stdin)
choices = data.get('choices', [])
if not choices:
    print('❌ Нет результата')
    sys.exit(1)
content = choices[0].get('message', {}).get('content', '')

# Find video URL
urls = re.findall(r'https?://[^\s\"\)]+\.mp4[^\s\"\)]*', content)
if not urls:
    urls = re.findall(r'https?://[^\s\"\)]+(?:video|mp4|media)[^\s\"\)]*', content)
if urls:
    url = urls[0]
    print(f'📥 Downloading: {url[:80]}...')
    import subprocess
    subprocess.run(['curl', '-sL', '-o', '$OUTPUT', '-H', 'User-Agent: Mozilla/5.0', url], check=True)
    import os
    size = os.path.getsize('$OUTPUT')
    print(f'✅ Сохранено: $OUTPUT ({size/1024/1024:.1f} MB)')
else:
    print('Ответ:', content[:500])
"
