#!/usr/bin/env python3
"""
Получить транскрипт YouTube видео через youtube-transcript-api.
Usage: python3 get_transcript.py <youtube_url> <output_file>
Пробует: ru → en → любой доступный.
"""
import sys, re
from youtube_transcript_api import YouTubeTranscriptApi

def extract_video_id(url):
    m = re.search(r'(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})', url)
    return m.group(1) if m else url

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 get_transcript.py <youtube_url> <output_file>")
        sys.exit(1)

    url, out_file = sys.argv[1], sys.argv[2]
    video_id = extract_video_id(url)
    api = YouTubeTranscriptApi()

    transcript = None
    lang = None
    for try_lang in ['ru', 'en']:
        try:
            transcript = api.fetch(video_id, languages=[try_lang])
            lang = try_lang
            break
        except Exception:
            continue

    if transcript is None:
        try:
            transcript = api.fetch(video_id)
            lang = 'auto'
        except Exception as e:
            print(f"ERROR: {e}")
            sys.exit(1)

    lines = [entry.text for entry in transcript]
    text = '\n'.join(lines)

    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(text)

    print(f"LANG={lang}")
    print(f"OK: {len(lines)} lines → {out_file}")

if __name__ == '__main__':
    main()
