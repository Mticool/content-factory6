const marked = require('marked');

/**
 * Парсинг Markdown в структурированные блоки для VC.ru
 */
function parseMarkdown(markdown) {
  const tokens = marked.lexer(markdown);
  
  const result = {
    title: null,
    blocks: []
  };

  let firstHeading = true;

  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        // Первый H1 - это заголовок статьи
        if (token.depth === 1 && firstHeading) {
          result.title = token.text;
          firstHeading = false;
        } else {
          result.blocks.push({
            type: 'heading',
            level: token.depth,
            content: token.text
          });
        }
        break;

      case 'paragraph':
        result.blocks.push({
          type: 'paragraph',
          content: token.text
        });
        break;

      case 'blockquote':
        result.blocks.push({
          type: 'quote',
          content: extractText(token.tokens)
        });
        break;

      case 'code':
        result.blocks.push({
          type: 'code',
          lang: token.lang || 'text',
          content: token.text
        });
        break;

      case 'list':
        const items = token.items.map(item => extractText(item.tokens));
        result.blocks.push({
          type: token.ordered ? 'ordered-list' : 'unordered-list',
          items: items
        });
        break;

      case 'image':
        result.blocks.push({
          type: 'image',
          src: token.href,
          alt: token.text || '',
          title: token.title || ''
        });
        break;

      case 'html':
        // Обрабатываем специальные блоки (врезки, разделители)
        const htmlBlock = parseCustomHTML(token.text);
        if (htmlBlock) {
          result.blocks.push(htmlBlock);
        }
        break;

      case 'hr':
        result.blocks.push({
          type: 'separator'
        });
        break;
    }
  }

  return result;
}

/**
 * Извлечение текста из tokens
 */
function extractText(tokens) {
  if (!tokens) return '';
  
  return tokens.map(token => {
    if (token.type === 'text') {
      return token.text;
    } else if (token.type === 'strong') {
      return `**${token.text}**`;
    } else if (token.type === 'em') {
      return `*${token.text}*`;
    } else if (token.type === 'link') {
      return `[${token.text}](${token.href})`;
    } else if (token.type === 'code') {
      return `\`${token.text}\``;
    }
    return '';
  }).join('');
}

/**
 * Парсинг кастомных HTML блоков (врезки, callout и т.д.)
 */
function parseCustomHTML(html) {
  // Врезка
  if (html.includes('class="callout"') || html.includes('<!-- callout -->')) {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return {
      type: 'callout',
      content: text
    };
  }

  // Разделитель с текстом
  if (html.includes('---') && html.trim().length > 3) {
    return {
      type: 'separator',
      text: html.replace(/---/g, '').trim()
    };
  }

  return null;
}

/**
 * Добавление UTM-меток к ссылкам
 */
function addUTMToLinks(text, utmParams = {}) {
  const defaultUTM = {
    utm_source: 'vc.ru',
    utm_medium: 'article',
    utm_campaign: 'content',
    ...utmParams
  };

  const utmString = Object.entries(defaultUTM)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  // Заменяем ссылки на ozon-check.ru
  return text.replace(
    /(\[.*?\])\((https?:\/\/(?:www\.)?ozon-check\.ru[^\)]*)\)/g,
    (match, linkText, url) => {
      const separator = url.includes('?') ? '&' : '?';
      return `${linkText}(${url}${separator}${utmString})`;
    }
  );
}

module.exports = {
  parseMarkdown,
  addUTMToLinks
};
