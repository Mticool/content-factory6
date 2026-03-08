#!/usr/bin/env python3
"""
Telegram Channel Reader
Читает сообщения из Telegram каналов через Telethon
"""
import sys
import os
import asyncio
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto, MessageMediaDocument
import json
from datetime import datetime

# Путь для сохранения сессии
SESSION_DIR = os.path.expanduser('~/.openclaw/telegram-sessions')
os.makedirs(SESSION_DIR, exist_ok=True)

async def read_channel(api_id, api_hash, channel, limit=10, offset=0, phone=None):
    """Читает последние сообщения из канала"""
    session_file = os.path.join(SESSION_DIR, 'reader_session')
    
    client = TelegramClient(session_file, api_id, api_hash)
    
    # Если сессия не существует и phone не указан, запрашиваем интерактивно
    if phone:
        await client.start(phone=phone)
    else:
        await client.start()
    
    messages = []
    async for message in client.iter_messages(channel, limit=limit, offset_id=offset):
        msg_data = {
            'id': message.id,
            'date': message.date.isoformat(),
            'text': message.text or '',
            'views': message.views,
            'forwards': message.forwards,
        }
        
        # Добавляем информацию о медиа
        if message.media:
            if isinstance(message.media, MessageMediaPhoto):
                msg_data['media_type'] = 'photo'
            elif isinstance(message.media, MessageMediaDocument):
                msg_data['media_type'] = 'document'
            else:
                msg_data['media_type'] = str(type(message.media).__name__)
        
        messages.append(msg_data)
    
    await client.disconnect()
    return messages

async def monitor_channel(api_id, api_hash, channel, callback=None):
    """Мониторит новые сообщения (для будущего использования)"""
    session_file = os.path.join(SESSION_DIR, 'reader_session')
    client = TelegramClient(session_file, api_id, api_hash)
    await client.start()
    
    print(f"Мониторинг канала {channel}... (Ctrl+C для выхода)")
    
    @client.on(events.NewMessage(chats=channel))
    async def handler(event):
        if callback:
            await callback(event.message)
        else:
            print(f"[{event.message.date}] {event.message.text}")
    
    await client.run_until_disconnected()

def main():
    if len(sys.argv) < 4:
        print("Usage: telegram-reader.py <api_id> <api_hash> <channel> [limit] [offset] [phone]")
        print("\nПримеры:")
        print("  telegram-reader.py 12345 abcdef123 @ozoncheck")
        print("  telegram-reader.py 12345 abcdef123 https://t.me/ozoncheck 20")
        print("  telegram-reader.py 12345 abcdef123 ozoncheck 10 0 +79991234567")
        sys.exit(1)
    
    api_id = int(sys.argv[1])
    api_hash = sys.argv[2]
    channel = sys.argv[3]
    limit = int(sys.argv[4]) if len(sys.argv) > 4 else 10
    offset = int(sys.argv[5]) if len(sys.argv) > 5 else 0
    phone = sys.argv[6] if len(sys.argv) > 6 else None
    
    # Убираем https://t.me/ если есть
    if channel.startswith('https://t.me/'):
        channel = channel.replace('https://t.me/', '')
    if not channel.startswith('@'):
        channel = '@' + channel
    
    messages = asyncio.run(read_channel(api_id, api_hash, channel, limit, offset, phone))
    
    # Выводим в JSON для удобного парсинга
    print(json.dumps(messages, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
