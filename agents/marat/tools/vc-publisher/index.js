#!/usr/bin/env node

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');
const { parseMarkdown } = require('./markdown-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Добавляем stealth plugin
chromium.use(StealthPlugin());

// Конфигурация
const CONFIG = {
  vcUrl: 'https://vc.ru',
  email: process.env.VC_EMAIL,
  password: process.env.VC_PASSWORD,
  headless: process.env.HEADLESS !== 'false',
  timeout: 60000,
  userDataDir: path.join(__dirname, '.browser-data')
};

// Утилита: задержка с случайностью
const delay = (min, max) => {
  const ms = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Утилита: логирование
const log = (msg, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✓',
    warn: '⚠',
    error: '✗',
    progress: '→'
  }[type] || 'ℹ';
  console.log(`[${timestamp}] ${prefix} ${msg}`);
};

// Класс для публикации на VC.ru
class VCPublisher {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
  }

  // Инициализация браузера
  async init() {
    log('Запуск браузера в stealth-режиме...');
    
    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--allow-running-insecure-content',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--start-maximized'
      ]
    });

    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'ru-RU',
      timezoneId: 'Europe/Moscow',
      acceptDownloads: true,
      hasTouch: false,
      isMobile: false,
      javaScriptEnabled: true,
      permissions: ['geolocation'],
      geolocation: { latitude: 55.7558, longitude: 37.6173 }, // Москва
      colorScheme: 'light',
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      }
    });

    this.page = await this.context.newPage();
    
    // Продвинутая маскировка автоматизации
    await this.page.addInitScript(() => {
      // Скрываем webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Добавляем chrome объект
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };

      // Переопределяем permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Добавляем плагины
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Язык
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ru-RU', 'ru', 'en-US', 'en'],
      });
    });

    log('Браузер запущен в stealth-режиме');
  }

  // Авторизация на VC.ru
  async login() {
    log('Авторизация на VC.ru...');
    
    try {
      // Прогреваем браузер на простой странице
      log('Инициализация сессии...');
      try {
        await this.page.goto('https://httpbin.org/get', { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        await delay(2000, 3000);
      } catch (e) {
        log('Предварительная загрузка не удалась, продолжаем...', 'warn');
      }

      // Сначала загружаем главную страницу (имитируем реального пользователя)
      log('Загрузка главной страницы VC.ru...');
      await this.page.goto(CONFIG.vcUrl, { 
        waitUntil: 'load',
        timeout: 90000 
      });
      
      // Ждём дополнительно для QRATOR
      log('Ожидание завершения проверок безопасности (15 сек)...');
      await delay(15000, 18000);

      // Скроллим немного (человекоподобное поведение)
      await this.page.evaluate(() => window.scrollBy(0, 300));
      await delay(2000, 3000);
      await this.page.evaluate(() => window.scrollBy(0, 300));
      await delay(1000, 2000);

      // Теперь переходим на страницу авторизации
      log('Переход на страницу авторизации...');
      await this.page.goto(`${CONFIG.vcUrl}/auth`, { 
        waitUntil: 'load',
        timeout: 90000 
      });
      
      // Даём QRATOR время на проверку auth страницы
      log('Ожидание проверки QRATOR на странице авторизации (10-15 сек)...');
      await delay(10000, 15000);

      // Проверяем, авторизованы ли уже
      const isLoggedIn = await this.page.$('.user-panel');
      if (isLoggedIn) {
        log('Уже авторизованы');
        return true;
      }

      // Ждём появления формы логина
      log('Ожидание формы входа...');
      await this.page.waitForSelector('input[name="login"], input[type="email"]', { 
        timeout: CONFIG.timeout,
        state: 'visible'
      });

      // Имитируем человека: клик в поле, задержка, печать с задержками
      const emailInput = await this.page.$('input[name="login"], input[type="email"]');
      await emailInput.click();
      await delay(500, 1000);
      
      // Печатаем email символ за символом
      for (const char of CONFIG.email) {
        await this.page.keyboard.type(char, { delay: Math.random() * 100 + 50 });
      }
      await delay(1000, 2000);

      // Переходим к паролю
      await this.page.keyboard.press('Tab');
      await delay(500, 1000);

      // Печатаем пароль
      for (const char of CONFIG.password) {
        await this.page.keyboard.type(char, { delay: Math.random() * 100 + 50 });
      }
      await delay(1500, 2500);

      // Нажимаем войти
      log('Отправка формы...');
      await this.page.click('button[type="submit"]');
      
      // Ждём навигации или сообщения об ошибке
      await Promise.race([
        this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: CONFIG.timeout }),
        this.page.waitForSelector('.user-panel', { timeout: CONFIG.timeout })
      ]);
      
      await delay(3000, 5000);

      // Проверяем успешность входа
      const loginSuccess = await this.page.$('.user-panel');
      if (!loginSuccess) {
        // Делаем скриншот для отладки
        await this.page.screenshot({ path: path.join(__dirname, 'login-error.png') });
        throw new Error('Не удалось войти - элемент .user-panel не найден');
      }
      
      log('✓ Авторизация успешна');
      return true;

    } catch (error) {
      log(`Ошибка авторизации: ${error.message}`, 'error');
      
      // Скриншот для отладки
      try {
        await this.page.screenshot({ path: path.join(__dirname, 'login-error.png') });
        log('Скриншот ошибки сохранён в login-error.png', 'warn');
      } catch {}
      
      throw error;
    }
  }

  // Создание новой статьи
  async createArticle() {
    log('Создание новой статьи...');
    
    try {
      await this.page.goto(`${CONFIG.vcUrl}/writing/articles/new`, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      await delay(3000, 5000);

      // Ждём загрузки редактора
      await this.page.waitForSelector('.editor', { timeout: CONFIG.timeout });
      
      log('Редактор загружен');
      return true;

    } catch (error) {
      log(`Ошибка создания статьи: ${error.message}`, 'error');
      throw error;
    }
  }

  // Заполнение заголовка
  async setTitle(title) {
    log(`Установка заголовка: "${title}"`);
    
    try {
      const titleSelector = '.editor__title input, input[placeholder*="Заголовок"]';
      await this.page.waitForSelector(titleSelector, { timeout: CONFIG.timeout });
      await this.page.fill(titleSelector, title);
      await delay(500, 1000);
      
      log('Заголовок установлен');

    } catch (error) {
      log(`Ошибка установки заголовка: ${error.message}`, 'error');
      throw error;
    }
  }

  // Добавление текстового блока
  async addTextBlock(text, format = 'p') {
    log(`Добавление блока: ${format}`, 'progress');
    
    try {
      // Фокус на редакторе
      await this.page.click('.editor__content');
      await delay(300, 600);

      // Вводим текст
      await this.page.keyboard.type(text, { delay: 10 });
      await delay(200, 400);

      // Применяем форматирование если нужно
      if (format === 'h2') {
        // Выделяем текст и делаем заголовком
        await this.page.keyboard.press('Control+A');
        await delay(200, 300);
        // Вызываем меню форматирования (обычно через кнопку или хоткей)
        // Это зависит от интерфейса VC, нужно будет доработать
      }

      // Переход на новую строку
      await this.page.keyboard.press('Enter');
      await delay(200, 400);

    } catch (error) {
      log(`Ошибка добавления блока: ${error.message}`, 'error');
      throw error;
    }
  }

  // Загрузка изображения
  async uploadImage(imagePath) {
    log(`Загрузка изображения: ${path.basename(imagePath)}`, 'progress');
    
    try {
      // Открываем меню вставки
      await this.page.click('.editor__content');
      await delay(300, 600);

      // Находим кнопку загрузки изображения
      const uploadButton = await this.page.$('button[aria-label*="Изображение"], button[title*="Изображение"]');
      
      if (!uploadButton) {
        // Альтернативный способ - через drag&drop или clipboard
        log('Кнопка загрузки не найдена, используем альтернативный метод', 'warn');
        return false;
      }

      // Устанавливаем файл для загрузки
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser'),
        uploadButton.click()
      ]);
      
      await fileChooser.setFiles(imagePath);
      await delay(2000, 3000);

      // Ждём загрузки
      await this.page.waitForSelector('img[src*="' + path.basename(imagePath).replace(path.extname(imagePath), '') + '"]', { 
        timeout: 30000,
        state: 'visible'
      });

      log('Изображение загружено');
      return true;

    } catch (error) {
      log(`Ошибка загрузки изображения: ${error.message}`, 'error');
      return false;
    }
  }

  // Публикация или сохранение как черновик
  async publish(isDraft = false) {
    log(isDraft ? 'Сохранение черновика...' : 'Публикация статьи...');
    
    try {
      const buttonSelector = isDraft 
        ? 'button:has-text("Сохранить"), button:has-text("Черновик")'
        : 'button:has-text("Опубликовать")';

      await this.page.click(buttonSelector);
      await delay(2000, 3000);

      log(isDraft ? 'Черновик сохранён' : 'Статья опубликована');
      return true;

    } catch (error) {
      log(`Ошибка публикации: ${error.message}`, 'error');
      throw error;
    }
  }

  // Закрытие браузера
  async close() {
    log('Закрытие браузера...');
    if (this.browser) {
      await this.browser.close();
    }
  }

  // Основной метод: публикация статьи
  async publishArticle(markdownPath, imagesDir, isDraft = false) {
    try {
      // Парсим markdown
      log(`Парсинг файла: ${markdownPath}`);
      const content = await fs.readFile(markdownPath, 'utf-8');
      const parsed = parseMarkdown(content);

      log(`Найдено блоков: ${parsed.blocks.length}`);

      // Инициализация
      await this.init();
      await this.login();
      await this.createArticle();

      // Заголовок
      if (parsed.title) {
        await this.setTitle(parsed.title);
      }

      // Обрабатываем блоки контента
      for (let i = 0; i < parsed.blocks.length; i++) {
        const block = parsed.blocks[i];
        log(`Блок ${i + 1}/${parsed.blocks.length}: ${block.type}`, 'progress');

        switch (block.type) {
          case 'heading':
            await this.addTextBlock(block.content, `h${block.level}`);
            break;
          
          case 'paragraph':
            await this.addTextBlock(block.content, 'p');
            break;
          
          case 'image':
            const imagePath = path.join(imagesDir, block.src);
            await this.uploadImage(imagePath);
            break;
          
          case 'code':
            // Добавим позже
            log('Code block - пока пропускаем', 'warn');
            break;
          
          default:
            log(`Неизвестный тип блока: ${block.type}`, 'warn');
        }

        await delay(500, 1000);
      }

      // Публикация
      await this.publish(isDraft);

      log('✓ Готово!');
      return true;

    } catch (error) {
      log(`Критическая ошибка: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.close();
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node index.js <article.md> <images-dir> [--draft]');
    process.exit(1);
  }

  const [markdownPath, imagesDir] = args;
  const isDraft = args.includes('--draft');

  // Проверка credentials
  if (!CONFIG.email || !CONFIG.password) {
    console.error('Ошибка: Не указаны VC_EMAIL и VC_PASSWORD в .env файле');
    process.exit(1);
  }

  const publisher = new VCPublisher();
  
  try {
    await publisher.publishArticle(markdownPath, imagesDir, isDraft);
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { VCPublisher };
