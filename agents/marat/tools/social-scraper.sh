#!/bin/bash
# Универсальный скрейпер для YouTube, TikTok, Instagram, Twitter и др.
# Использует yt-dlp

set -euo pipefail

show_help() {
    cat << EOF
Универсальный скрейпер для соцсетей

Usage: 
  $0 <url> [options]

Platforms supported:
  - YouTube (videos, shorts, playlists)
  - TikTok (videos, user profiles)
  - Instagram (posts, reels, stories)
  - Twitter/X (videos)
  - Facebook (videos)
  - Reddit (videos)

Options:
  -m, --metadata-only    Получить только метаданные (без скачивания)
  -a, --audio-only       Скачать только аудио (MP3)
  -q, --quality <qual>   Качество: best, 1080p, 720p, 480p, 360p
  -o, --output <dir>     Директория для сохранения (default: ./downloads)
  -f, --format <fmt>     Формат: mp4, webm, mkv
  --thumbnail            Скачать превью/обложку
  --subtitles            Скачать субтитры
  -h, --help             Показать эту справку

Examples:
  # Метаданные TikTok видео
  $0 "https://tiktok.com/@user/video/123" --metadata-only

  # Скачать YouTube video в 720p
  $0 "https://youtube.com/watch?v=VIDEO_ID" -q 720p

  # Скачать Instagram reel (только аудио)
  $0 "https://instagram.com/reel/ABC123" --audio-only

  # Twitter видео с субтитрами
  $0 "https://twitter.com/user/status/123" --subtitles

EOF
}

# Defaults
METADATA_ONLY=0
AUDIO_ONLY=0
QUALITY="best"
OUTPUT_DIR="./downloads"
FORMAT="mp4"
THUMBNAIL=0
SUBTITLES=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--metadata-only)
            METADATA_ONLY=1
            shift
            ;;
        -a|--audio-only)
            AUDIO_ONLY=1
            shift
            ;;
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        --thumbnail)
            THUMBNAIL=1
            shift
            ;;
        --subtitles)
            SUBTITLES=1
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            URL="$1"
            shift
            ;;
    esac
done

if [ -z "${URL:-}" ]; then
    echo "❌ URL не указан"
    show_help
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "🔍 Обработка: $URL"
echo ""

# Metadata only
if [ $METADATA_ONLY -eq 1 ]; then
    echo "📊 Получение метаданных..."
    yt-dlp --dump-json "$URL" | jq '{
        title: .title,
        uploader: .uploader,
        duration: .duration,
        views: .view_count,
        likes: .like_count,
        upload_date: .upload_date,
        description: .description,
        thumbnail: .thumbnail,
        url: .webpage_url
    }'
    exit 0
fi

# Build yt-dlp command
CMD="yt-dlp"

# Audio only
if [ $AUDIO_ONLY -eq 1 ]; then
    CMD="$CMD -x --audio-format mp3"
else
    # Video quality
    case $QUALITY in
        best)
            CMD="$CMD -f 'bestvideo[ext=$FORMAT]+bestaudio/best[ext=$FORMAT]/best'"
            ;;
        1080p)
            CMD="$CMD -f 'bestvideo[height<=1080][ext=$FORMAT]+bestaudio/best[height<=1080]/best'"
            ;;
        720p)
            CMD="$CMD -f 'bestvideo[height<=720][ext=$FORMAT]+bestaudio/best[height<=720]/best'"
            ;;
        480p)
            CMD="$CMD -f 'bestvideo[height<=480][ext=$FORMAT]+bestaudio/best[height<=480]/best'"
            ;;
        360p)
            CMD="$CMD -f 'bestvideo[height<=360][ext=$FORMAT]+bestaudio/best[height<=360]/best'"
            ;;
    esac
fi

# Thumbnail
if [ $THUMBNAIL -eq 1 ]; then
    CMD="$CMD --write-thumbnail"
fi

# Subtitles
if [ $SUBTITLES -eq 1 ]; then
    CMD="$CMD --write-subs --write-auto-subs --sub-lang ru,en"
fi

# Output
CMD="$CMD -o '$OUTPUT_DIR/%(title)s.%(ext)s'"

# URL
CMD="$CMD '$URL'"

echo "🚀 Запуск скачивания..."
echo "📂 Директория: $OUTPUT_DIR"
echo ""

eval $CMD

echo ""
echo "✅ Готово!"
ls -lh "$OUTPUT_DIR" | tail -5
