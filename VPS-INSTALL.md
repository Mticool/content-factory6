# Установка Content Factory на VPS — От нуля до готовой системы

> Инструкция для прямого эфира: демонстрация полного процесса
> Время: ~30 минут

---

## Что получим в конце

✅ VPS сервер с OpenClaw  
✅ Telegram-бот, который пишет контент в твоём голосе  
✅ 15 скиллов (Threads, YouTube, Reels, карусели и др.)  
✅ Память между сессиями  
✅ Работает 24/7 без твоего компьютера  

---

## Требования

| Что нужно | Где взять | Стоимость |
|-----------|-----------|-----------|
| VPS сервер | Hetzner / Timeweb / любой | ~$4-7/мес |
| Anthropic API ключ (возможно, [подписка](https://openclaw.ai/guides/openclaw-telegram)) | [console.anthropic.com](https://console.anthropic.com) | ~$20-50/мес (по использованию) |
| OpenClaw | [Установка OpenClaw + Telegram](https://openclaw.ai/guides/openclaw-telegram) | Бесплатно |
| Telegram бот | [[@BotFather](https://t.me/BotFather)](https://t.me/BotFather) | Бесплатно |
| SSH клиент | Terminal (Mac/Linux) или PuTTY (Windows) | Бесплатно |

### Минимальные требования к VPS
- **ОС:** Ubuntu 22.04+ или Debian 12+
- **RAM:** 1 GB (минимум), 2 GB (рекомендуется)
- **Диск:** 10 GB
- **CPU:** 1 vCPU

---

## Часть 1. Подготовка (до эфира)

### 1.1 Создать VPS

Любой провайдер. Пример — Hetzner:
1. Зарегистрироваться на hetzner.com
2. Cloud → Add Server
3. Выбрать: Ubuntu 22.04, CX22 (2 vCPU, 4 GB RAM, €4.5/мес)
4. Добавить SSH ключ
5. Создать

Запомнить IP адрес сервера.

### 1.2 Создать Telegram бота

1. Открыть [[@BotFather](https://t.me/BotFather)](https://t.me/BotFather)
2. `/newbot`
3. Назвать: "Моя Фабрика Контента" (или как хочешь)
4. Получить токен: `123456:ABC-DEF...`
5. Запомнить свой Telegram ID (узнать: написать [@userinfobot](https://t.me/userinfobot))

### 1.3 Подключить модель Anthropic

**Вариант A: API ключ (оплата по использованию)**

1. Зайти на [console.anthropic.com](https://console.anthropic.com)
2. API Keys → Create Key
3. Скопировать ключ: `sk-ant-...`
4. Пополнить баланс (от $5)

**Вариант B: Подписка Claude Max ($100/мес)**

Если у тебя подписка Claude Max — можно использовать её вместо API ключа:

1. Зайти на [claude.ai](https://claude.ai) → Settings → API
2. Получить ключ подписки
3. Использовать его при настройке OpenClaw

> ⚠️ **Важно:** использование подписки через API может нарушать условия использования Anthropic. API ключ (Вариант A) — рекомендуемый и официальный способ.

---

## Часть 2. Установка OpenClaw (на эфире ~10 мин)

### 2.1 Подключиться к серверу

```bash
ssh root@ТВОЙ_IP_АДРЕС
```

### 2.2 Обновить систему

```bash
apt update && apt upgrade -y
```

### 2.3 Установить Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node --version   # должно быть v22.x.x
```

### 2.4 Установить OpenClaw

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard
```

### 2.5 Запустить мастер настройки

```bash
openclaw onboard --install-daemon
```

Мастер спросит:
1. **Модель:** Выбрать Anthropic → вставить API ключ
2. **Gateway:** Local mode, порт 18789
3. **Канал:** Telegram → вставить bot token

---

## Часть 3. Установка Content Factory (~10 мин)

### 3.1 Создай свою копию конструктора

1. Открой конструктор: https://github.com/Mticool/content-factory
2. Нажми зелёную кнопку **"Use this template"** → **"Create a new repository"**
3. Назови как хочешь (например `my-content-factory`), нажми **Create**
4. Склонируй СВОЮ копию на сервер:

```bash
cd ~
git clone https://github.com/ТВОЙ_ЮЗЕРНЕЙМ/my-content-factory.git
```

### 3.2 Скопировать workspace и скиллы

```bash
# Скопировать workspace файлы в OpenClaw
cp -r ~/my-content-factory/openclaw-content-factory/workspace/* ~/.openclaw/workspace/

# Скопировать скиллы
mkdir -p ~/.openclaw/workspace/skills
cp -r ~/my-content-factory/openclaw-content-factory/skills/* ~/.openclaw/workspace/skills/
```

### 3.3 Донастроить конфиг

> ⚠️ НЕ заменяй конфиг целиком — onboard уже создал рабочий. Только добавь нужные настройки.

```bash
# Открой конфиг
nano ~/.openclaw/openclaw.json
```

**Что проверить/изменить:**

1. **Модель** — найди `"primary"` и замени на:
```json
"primary": "anthropic/claude-opus-4-6"
```

2. **Память** — добавь в секцию `"defaults"` (если нет):
```json
"memorySearch": {
  "enabled": true,
  "sources": ["memory"]
},
"heartbeat": {
  "every": "30m"
},
"compaction": {
  "mode": "safeguard"
}
```

3. **Telegram** — должен быть уже настроен через onboard. Проверь что `botToken` и `allowFrom` заполнены.

> 💡 Не уверен что правильно? Запусти `openclaw doctor` — он покажет проблемы.

### 3.4 Перезапустить OpenClaw

```bash
openclaw gateway restart
```

### 3.5 Проверить

```bash
openclaw status
```

Должно показать: Gateway running, Telegram connected.

---

## Часть 4. Первый запуск (~10 мин)

### 4.1 Написать боту в Telegram

Открыть своего бота → написать:

```
начать
```

### 4.2 Пройти интервью

Бот задаст 3 вопроса:
1. Кто ты и чем занимаешься?
2. Для кого создаёшь контент?
3. Как пишешь — на ты или на Вы?

### 4.3 Получить первые посты

После интервью написать:

```
threads 5
```

→ Получишь 5 постов для Threads в своём стиле.

### 4.4 Попробовать другие форматы

```
youtube script [тема]     → сценарий для YouTube
carousel [тема]           → карусель для Instagram
reels [тема]              → идея для рилса
```

---

## Часть 5. Продвинутые настройки (после эфира)

### 5.1 Безопасность

```bash
# Сменить пароль root
passwd

# Создать обычного пользователя
adduser openclaw
usermod -aG sudo openclaw

# Настроить firewall
ufw allow ssh
ufw enable

# Отключить root SSH (опционально)
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd
```

### 5.2 Доступ через Control UI

С ноутбука (SSH туннель):

```bash
ssh -N -L 18789:127.0.0.1:18789 root@ТВОЙ_IP_АДРЕС
```

Открыть в браузере: `http://127.0.0.1:18789/`

### 5.3 Автозапуск при перезагрузке

OpenClaw daemon уже настроен при `onboard --install-daemon`.
Проверить:

```bash
openclaw gateway status
```

### 5.4 Бэкап

```bash
# Бэкап всего состояния
tar -czf openclaw-backup-$(date +%Y%m%d).tar.gz ~/.openclaw/
```

### 5.5 Обновление конструктора

Конструктор обновляется через скачивание новой версии:
1. Скачай свежую версию: https://github.com/Mticool/content-factory → Code → Download ZIP
2. Распакуй и скопируй `skills/` поверх своих (brand/ и learning/ НЕ трогай)

```bash
# Загрузи ZIP на сервер и распакуй, затем:
cp -r путь-к-распакованному/openclaw-content-factory/workspace/* ~/.openclaw/workspace/
cp -r путь-к-распакованному/openclaw-content-factory/skills/* ~/.openclaw/workspace/skills/
openclaw gateway restart
```

---

## Чеклист для эфира

### До эфира (подготовка)
- [ ] VPS создан и работает
- [ ] SSH доступ проверен
- [ ] Telegram бот создан, токен записан
- [ ] Anthropic API ключ получен
- [ ] Свой Telegram ID записан

### На эфире (демонстрация)
- [ ] Подключение к VPS (1 мин)
- [ ] Установка Node.js (2 мин)
- [ ] Установка OpenClaw (3 мин)
- [ ] Настройка (onboard) (3 мин)
- [ ] Скачивание Content Factory (1 мин)
- [ ] Копирование workspace + скиллов (1 мин)
- [ ] Настройка конфига (3 мин)
- [ ] Restart + проверка (1 мин)
- [ ] "Начать" в Telegram (2 мин)
- [ ] Интервью + первые посты (5 мин)
- [ ] Демо разных форматов (5 мин)

**Итого: ~25-30 минут**

---

## Troubleshooting

### Бот не отвечает
```bash
openclaw doctor                  # диагностика — покажет что не так
openclaw doctor --fix            # автоисправление найденных проблем
openclaw gateway restart         # если doctor не помог — перезапустить
journalctl -u openclaw -n 50     # посмотреть логи
```

> 💡 `openclaw doctor` — самая полезная команда. Проверяет конфиг, API ключи, подключение Telegram, состояние gateway. Начинай всегда с неё.

### Ошибка "model not found"
- Проверить API ключ: `openclaw doctor`
- Проверить баланс на console.anthropic.com

### Ошибка "not allowed"
- Проверить `allowFrom` в конфиге — должен быть ваш Telegram ID (числовой)
- Проверить `dmPolicy: "allowlist"`

### Мало памяти (RAM)
```bash
free -h                          # проверить RAM
# Если < 500 MB свободно — увеличить VPS или добавить swap:
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## Модели: какую выбрать

| Модель | Стоимость | Для чего | Рекомендация |
|--------|-----------|----------|--------------|
| **Claude Opus 4.6** | ~$5/$25 MTok | Лучшее качество контента, сложные стратегии, продающие тексты | ✅ Рекомендуем |
| **Claude Sonnet 4.6** | ~$3/$15 MTok | Хороший баланс цена/качество, ежедневная генерация | Оптимально по бюджету |
| **Claude Haiku 4.5** | ~$1/$5 MTok | Простые задачи, heartbeat, черновики | Для экономии |

**Рекомендация:** Opus 4.6 как основная. Sonnet 4.6 если нужна экономия. Haiku для heartbeat.

> ⚠️ **Не используйте Claude Sonnet 4** (старую версию) — она может вызывать сбои gateway в OpenClaw.

### Как переключить модель

В конфиге `~/.openclaw/openclaw.json`:
```json
"model": {
  "primary": "anthropic/claude-opus-4-6"
}
```

Или в чате с ботом: `/model opus` — переключит на Opus для текущей сессии.

Доступные алиасы: `opus`, `sonnet`, `haiku`.

---

*Content Factory × OpenClaw — Инструкция v1.0*
