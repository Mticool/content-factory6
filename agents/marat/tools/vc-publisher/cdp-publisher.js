#!/usr/bin/env node

/**
 * VC.ru Publisher через CDP (Chrome DevTools Protocol)
 * 
 * Подключается к уже запущенному Chrome с флагом --remote-debugging-port=9222
 * Обходит QRATOR используя реальную сессию браузера пользователя
 * 
 * Запуск Chrome:
 * google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-dev
 * 
 * Использование:
 * node cdp-publisher.js <article.md> <images-dir> [--draft] [--port=9222]
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const { parseMarkdown } = require('./markdown-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Конфигурация
const CONFIG = {
  vcUrl: 'https://vc.ru',
  email: process.env.VC_EMAIL,
  password: process.env.VC_PASSWORD,
  timeout: 60000
};

// Утилита: задержка
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

class VCPublisherCDP {
  constructor(cdpPort = 9222) {
    this.cdpPort = cdpPort;
    this.browser = null;
    this.page = null;
  }

  // Подключение к Chrome через CDP
  async connect() {
    log(`Подключение к Chrome на порту ${this.cdpPort}...`);
    
    try {
      this.browser = await chromium.connectOverCDP(`http://localhost:${this.cdpPort}`);
      
      const contexts = this.browser.contexts();
      if (contexts.length === 0) {
        throw new Error('Нет доступных контекстов браузера');
      }

      const context = contexts[0];
      const pages = context.pages();
      
      if (pages.length > 0) {
        this.page = pages[0];
        log(`Используем существующую вкладку: ${await this.page.title()}`);
      } else {
        this.page = await context.newPage();
        log('Создана новая вкладка');
      }

      log('✓ Подключение к Chrome успешно');
      return true;

    } catch (error) {
      log(`Ошибка подключения: ${error.message}`, 'error');
      log('', 'warn');
      log('Убедитесь что Chrome запущен с флагом:', 'warn');
      log('google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-dev', 'warn');
      log('', 'warn');
      throw error;
    }
  }

  // Проверка авторизации
  async checkAuth() {
    log('Проверка авторизации на VC.ru...');
    
    try {
      await this.page.goto(CONFIG.vcUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.timeout 
      });
      await delay(2000, 3000);

      const isLoggedIn = await this.page.$('.user-panel, .user_panel');
      if (isLoggedIn) {
        log('✓ Пользователь авторизован');
        return true;
      }

      log('⚠ Пользователь НЕ авторизован', 'warn');
      log('Откройте VC.ru в Chrome и войдите вручную, затем повторите команду', 'warn');
      return false;

    } catch (error) {
      log(`Ошибка проверки авторизации: ${error.message}`, 'error');
      return false;
    }
  }

  // Создание новой статьи
  async createArticle() {
    log('Переход к созданию статьи...');
    
    try {
      await this.page.goto(`${CONFIG.vcUrl}/writing/articles/new`, { 
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.timeout 
      });
      await delay(3000, 5000);

      // Ждём загрузки редактора
      await this.page.waitForSelector('.editor, [contenteditable="true"]', { 
        timeout: CONFIG.timeout 
      });
      
      log('✓ Редактор загружен');
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
      // Ищем поле заголовка (разные варианты селекторов)
      const titleSelectors = [
        '.editor__title input',
        'input[placeholder*="Заголовок"]',
        'input[placeholder*="заголовок"]',
        '.title-input',
        '.article-title input'
      ];

      let titleInput = null;
      for (const selector of titleSelectors) {
        titleInput = await this.page.$(selector);
        if (titleInput) break;
      }

      if (!titleInput) {
        throw new Error('Поле заголовка не найдено');
      }

      await titleInput.fill(title);
      await delay(500, 1000);
      
      log('✓ Заголовок установлен');
      return true;

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
      const editor = await this.page.$('.editor__content, [contenteditable="true"]');
      if (!editor) {
        throw new Error('Редактор не найден');
      }

      await editor.click();
      await delay(300, 600);

      // Вводим текст
      await this.page.keyboard.type(text, { delay: 10 });
      await delay(200, 400);

      // Переход на новую строку
      await this.page.keyboard.press('Enter');
      await delay(200, 400);

      return true;

    } catch (error) {
      log(`Ошибка добавления блока: ${error.message}`, 'error');
      return false;
    }
  }

  // Публикация или сохранение как черновик
  async publish(isDraft = false) {
    log(isDraft ? 'Сохранение черновика...' : 'Публикация статьи...');
    
    try {
      // Ищем кнопку публикации/сохранения
      const buttonSelectors = isDraft 
        ? [
            'button:has-text("Сохранить")',
            'button:has-text("Черновик")',
            'button:has-text("В черновики")'
          ]
        : [
            'button:has-text("Опубликовать")',
            'button:has-text("Publish")'
          ];

      let publishButton = null;
      for (const selector of buttonSelectors) {
        try {
          publishButton = await this.page.$(selector);
          if (publishButton) break;
        } catch {}
      }

      if (!publishButton) {
        log('⚠ Кнопка публикации не найдена автоматически', 'warn');
        log('Завершите публикацию вручную в браузере', 'warn');
        return false;
      }

      await publishButton.click();
      await delay(3000, 5000);

      log(isDraft ? '✓ Черновик сохранён' : '✓ Статья опубликована');
      return true;

    } catch (error) {
      log(`Ошибка публикации: ${error.message}`, 'error');
      log('Завершите публикацию вручную в браузере', 'warn');
      return false;
    }
  }

  // Отключение
  async disconnect() {
    log('Отключение от браузера...');
    // Не закрываем браузер - он запущен пользователем
    // Просто отключаемся
  }

  // Основной метод: публикация статьи
  async publishArticle(markdownPath, imagesDir, isDraft = false) {
    try {
      // Парсим markdown
      log(`Парсинг файла: ${markdownPath}`);
      const content = await fs.readFile(markdownPath, 'utf-8');
      const parsed = parseMarkdown(content);

      log(`Найдено блоков: ${parsed.blocks.length}`);

      // Подключаемся к Chrome
      await this.connect();

      // Проверяем авторизацию
      const isAuthorized = await this.checkAuth();
      if (!isAuthorized) {
        throw new Error('Требуется авторизация на VC.ru');
      }

      // Создаём статью
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
          case 'paragraph':
            await this.addTextBlock(block.content);
            break;
          
          case 'image':
            log('⚠ Изображения пока не поддерживаются, добавьте вручную', 'warn');
            break;
          
          default:
            log(`Неизвестный тип блока: ${block.type}`, 'warn');
        }

        await delay(500, 1000);
      }

      // Публикация
      await this.publish(isDraft);

      log('');
      log('✓ Базовая структура статьи создана!');
      log('ℹ  Проверьте форматирование и добавьте изображения вручную', 'info');
      log('');

      return true;

    } catch (error) {
      log(`Критическая ошибка: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('');
    console.log('VC.ru CDP Publisher — публикация через реальный Chrome');
    console.log('');
    console.log('Использование:');
    console.log('  node cdp-publisher.js <article.md> <images-dir> [--draft] [--port=9222]');
    console.log('');
    console.log('Перед запуском откройте Chrome:');
    console.log('  google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-dev');
    console.log('');
    console.log('Затем авторизуйтесь на VC.ru в этом Chrome');
    console.log('');
    process.exit(1);
  }

  const markdownPath = args[0];
  const imagesDir = args[1];
  const isDraft = args.includes('--draft');
  
  // Извлекаем порт из аргументов
  let cdpPort = 9222;
  const portArg = args.find(arg => arg.startsWith('--port='));
  if (portArg) {
    cdpPort = parseInt(portArg.split('=')[1]);
  }

  const publisher = new VCPublisherCDP(cdpPort);
  
  try {
    await publisher.publishArticle(markdownPath, imagesDir, isDraft);
  } catch (error) {
    console.error('Ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { VCPublisherCDP };
