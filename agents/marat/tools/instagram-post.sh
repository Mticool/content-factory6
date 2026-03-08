#!/bin/bash
# Instagram Single Image/Video Poster via Composio API
# Usage: ./instagram-post.sh "Caption text" image.jpg

set -euo pipefail

API_KEY="${COMPOSIO_API_KEY:-ak_O8IILK1WO5L292EMQ08H}"
CONNECTION_ID="${COMPOSIO_INSTAGRAM_CONNECTION:-d4e4535b-7d43-4725-b4bc-0693c8c28184}"
API_BASE="https://backend.composio.dev/api/v2"

if [ $# -ne 2 ]; then
  echo "Usage: $0 \"Caption text\" image_or_video"
  echo "Media can be a URL or local file (will upload to imgur)"
  exit 1
fi

CAPTION="$1"
MEDIA="$2"

# Get Instagram user ID
echo "Getting Instagram user ID..."
IG_USER_ID=$(curl -s -X POST "$API_BASE/actions/INSTAGRAM_GET_USER_INFO/execute" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"connectedAccountId\": \"$CONNECTION_ID\", \"input\": {}}" | jq -r '.data.id')

if [ "$IG_USER_ID" = "null" ] || [ -z "$IG_USER_ID" ]; then
  echo "Error: Failed to get Instagram user ID"
  exit 1
fi

echo "Instagram user ID: $IG_USER_ID"

# If local file, upload to imgur first
if [ -f "$MEDIA" ]; then
  echo "Uploading $MEDIA to imgur..."
  MEDIA_URL=$(curl -s -X POST https://api.imgur.com/3/image \
    -H "Authorization: Client-ID 3e7a4deb7ac67da" \
    -F "image=@$MEDIA" | jq -r '.data.link')
else
  MEDIA_URL="$MEDIA"
fi

echo "Creating media container for $MEDIA_URL..."

# Detect if video or image by extension
if [[ "$MEDIA_URL" =~ \.(mp4|mov|avi)$ ]]; then
  MEDIA_TYPE="video_url"
else
  MEDIA_TYPE="image_url"
fi

CONTAINER_ID=$(curl -s -X POST "$API_BASE/actions/INSTAGRAM_CREATE_MEDIA_CONTAINER/execute" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"connectedAccountId\": \"$CONNECTION_ID\",
    \"input\": {
      \"ig_user_id\": \"$IG_USER_ID\",
      \"$MEDIA_TYPE\": \"$MEDIA_URL\",
      \"caption\": \"$CAPTION\"
    }
  }" | jq -r '.data.id')

if [ "$CONTAINER_ID" = "null" ] || [ -z "$CONTAINER_ID" ]; then
  echo "Error: Failed to create media container"
  exit 1
fi

echo "Media container created: $CONTAINER_ID"

# Publish the post
echo "Publishing post..."
POST_ID=$(curl -s -X POST "$API_BASE/actions/INSTAGRAM_CREATE_POST/execute" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"connectedAccountId\": \"$CONNECTION_ID\",
    \"input\": {
      \"ig_user_id\": \"$IG_USER_ID\",
      \"creation_id\": \"$CONTAINER_ID\"
    }
  }" | jq -r '.data.id')

if [ "$POST_ID" = "null" ] || [ -z "$POST_ID" ]; then
  echo "Error: Failed to publish post"
  exit 1
fi

echo "✅ Post published successfully!"
echo "Post ID: $POST_ID"
echo "View on Instagram: https://www.instagram.com/p/$POST_ID"
