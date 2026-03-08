#!/bin/bash
# Nano Banana Pro — Image Generation via LaoZhang API
# Модель: gemini-3-pro-image-preview (Gemini 3 Pro Image)
# Использование:
#   ./nano-banana-pro.sh "prompt" output.png
#   ./nano-banana-pro.sh "edit prompt" input.png output.png

API_KEY="sk-d8y33zJ9xfn2I9uXB109042aD3Dd45BdB2AeC11538041927"
API_URL="https://api.laozhang.ai/v1/chat/completions"
MODEL="${NANO_MODEL:-gemini-3-pro-image-preview}"

PROMPT="$1"
if [ -z "$PROMPT" ]; then
    echo "Usage: $0 \"prompt\" [input.png] output.png"
    exit 1
fi

# Determine if it's text-to-image or image-to-image
if [ -n "$3" ]; then
    INPUT_IMAGE="$2"
    OUTPUT="$3"
    # Image-to-image: encode input as base64
    IMG_BASE64=$(base64 -w0 "$INPUT_IMAGE")
    MIME=$(file -b --mime-type "$INPUT_IMAGE")
    CONTENT="[{\"type\":\"text\",\"text\":\"$PROMPT\"},{\"type\":\"image_url\",\"image_url\":{\"url\":\"data:$MIME;base64,$IMG_BASE64\"}}]"
elif [ -n "$2" ]; then
    OUTPUT="$2"
    CONTENT="\"$PROMPT\""
else
    OUTPUT="output_$(date +%s).png"
    CONTENT="\"$PROMPT\""
fi

echo "🎨 Generating: $PROMPT"
echo "📦 Model: $MODEL"

RESPONSE=$(curl -s "$API_URL" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"model\": \"$MODEL\",
        \"messages\": [{\"role\": \"user\", \"content\": $CONTENT}]
    }")

# Extract image from response
IMAGE_DATA=$(echo "$RESPONSE" | jq -r '.choices[0].message.content' | grep -o 'data:image/[^;]*;base64,[^)]*' | head -1 | sed 's/data:image\/[^;]*;base64,//')

if [ -z "$IMAGE_DATA" ] || [ "$IMAGE_DATA" = "null" ]; then
    echo "❌ Error: No image in response"
    echo "$RESPONSE" | jq '.error // .choices[0].message.content' 2>/dev/null | head -5
    exit 1
fi

echo "$IMAGE_DATA" | base64 -d > "$OUTPUT"
SIZE=$(ls -la "$OUTPUT" | awk '{print $5}')
DIMS=$(identify "$OUTPUT" 2>/dev/null | awk '{print $3}' || file "$OUTPUT" | grep -o '[0-9]*x[0-9]*')
echo "✅ Saved: $OUTPUT ($SIZE bytes, $DIMS)"
