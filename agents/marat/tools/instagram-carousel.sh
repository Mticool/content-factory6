#!/bin/bash
# Instagram Carousel Poster via Composio API
# Usage: ./instagram-carousel.sh "Caption text" image1.jpg image2.jpg image3.jpg

set -euo pipefail

API_KEY="${COMPOSIO_API_KEY:-ak_O8IILK1WO5L292EMQ08H}"
CONNECTION_ID="${COMPOSIO_INSTAGRAM_CONNECTION:-d4e4535b-7d43-4725-b4bc-0693c8c28184}"
API_BASE="https://backend.composio.dev/api/v2"

if [ $# -lt 3 ]; then
  echo "Usage: $0 \"Caption text\" image1 image2 [image3...]"
  echo "Images can be URLs or local files (will upload to imgur)"
  exit 1
fi

CAPTION="$1"
shift
IMAGES=("$@")

if [ ${#IMAGES[@]} -lt 2 ] || [ ${#IMAGES[@]} -gt 10 ]; then
  echo "Error: Instagram carousel requires 2-10 images"
  exit 1
fi

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

# Create media containers
CONTAINER_IDS=()
for IMAGE in "${IMAGES[@]}"; do
  # If local file, upload to imgur first
  if [ -f "$IMAGE" ]; then
    echo "Uploading $IMAGE to imgur..."
    IMAGE_URL=$(curl -s -X POST https://api.imgur.com/3/image \
      -H "Authorization: Client-ID 3e7a4deb7ac67da" \
      -F "image=@$IMAGE" | jq -r '.data.link')
  else
    IMAGE_URL="$IMAGE"
  fi
  
  echo "Creating media container for $IMAGE_URL..."
  CONTAINER_ID=$(curl -s -X POST "$API_BASE/actions/INSTAGRAM_CREATE_MEDIA_CONTAINER/execute" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d "{
      \"connectedAccountId\": \"$CONNECTION_ID\",
      \"input\": {
        \"ig_user_id\": \"$IG_USER_ID\",
        \"image_url\": \"$IMAGE_URL\",
        \"is_carousel_item\": true
      }
    }" | jq -r '.data.id')
  
  if [ "$CONTAINER_ID" = "null" ] || [ -z "$CONTAINER_ID" ]; then
    echo "Error: Failed to create media container for $IMAGE_URL"
    exit 1
  fi
  
  CONTAINER_IDS+=("$CONTAINER_ID")
  echo "Container created: $CONTAINER_ID"
done

# Build JSON array of container IDs
CHILDREN_JSON=$(printf '%s\n' "${CONTAINER_IDS[@]}" | jq -R . | jq -s .)

echo "Creating carousel container..."
CAROUSEL_ID=$(curl -s -X POST "$API_BASE/actions/INSTAGRAM_CREATE_CAROUSEL_CONTAINER/execute" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"connectedAccountId\": \"$CONNECTION_ID\",
    \"input\": {
      \"ig_user_id\": \"$IG_USER_ID\",
      \"children\": $CHILDREN_JSON,
      \"caption\": \"$CAPTION\"
    }
  }" | jq -r '.data.id')

if [ "$CAROUSEL_ID" = "null" ] || [ -z "$CAROUSEL_ID" ]; then
  echo "Error: Failed to create carousel container"
  exit 1
fi

echo "Carousel container created: $CAROUSEL_ID"

# Publish the carousel
echo "Publishing carousel..."
POST_ID=$(curl -s -X POST "$API_BASE/actions/INSTAGRAM_CREATE_POST/execute" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"connectedAccountId\": \"$CONNECTION_ID\",
    \"input\": {
      \"ig_user_id\": \"$IG_USER_ID\",
      \"creation_id\": \"$CAROUSEL_ID\"
    }
  }" | jq -r '.data.id')

if [ "$POST_ID" = "null" ] || [ -z "$POST_ID" ]; then
  echo "Error: Failed to publish carousel"
  exit 1
fi

echo "✅ Carousel published successfully!"
echo "Post ID: $POST_ID"
echo "View on Instagram: https://www.instagram.com/p/$POST_ID"
