#!/usr/bin/env python3
"""
Анализатор новостей маркетплейсов с AI
Извлекает инсайты и генерирует контент для канала
"""
import sys
import json
from datetime import datetime
from pathlib import Path

def analyze_news(html_file):
    """Базовый анализ HTML страницы новостей"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Простое извлечение заголовков (базовая версия)
        # TODO: использовать BeautifulSoup для полноценного парсинга
        
        headlines = []
        # Примерный поиск заголовков
        import re
        h2_pattern = r'<h2[^>]*>(.*?)</h2>'
        h3_pattern = r'<h3[^>]*>(.*?)</h3>'
        
        headlines.extend(re.findall(h2_pattern, content, re.DOTALL))
        headlines.extend(re.findall(h3_pattern, content, re.DOTALL))
        
        # Очистка от HTML тегов
        clean_headlines = []
        for h in headlines:
            clean = re.sub(r'<[^>]+>', '', h).strip()
            if clean and len(clean) > 10:
                clean_headlines.append(clean)
        
        return clean_headlines[:10]  # Топ-10
        
    except Exception as e:
        print(f"Error analyzing {html_file}: {e}", file=sys.stderr)
        return []

def detect_critical_changes(headlines):
    """Определяет критичные изменения по ключевым словам"""
    critical_keywords = [
        'комиссия', 'тариф', 'повышение', 'изменение', 
        'новые правила', 'обязательно', 'внимание',
        'срочно', 'важно', 'с 1', 'с 15'
    ]
    
    critical = []
    for headline in headlines:
        headline_lower = headline.lower()
        if any(kw in headline_lower for kw in critical_keywords):
            critical.append({
                'headline': headline,
                'priority': 'high',
                'detected_at': datetime.now().isoformat()
            })
    
    return critical

def generate_summary(ozon_headlines, wb_headlines):
    """Генерирует сводку за день"""
    today = datetime.now().strftime('%Y-%m-%d')
    
    summary = {
        'date': today,
        'ozon': {
            'total': len(ozon_headlines),
            'headlines': ozon_headlines,
            'critical': detect_critical_changes(ozon_headlines)
        },
        'wildberries': {
            'total': len(wb_headlines),
            'headlines': wb_headlines,
            'critical': detect_critical_changes(wb_headlines)
        }
    }
    
    return summary

def save_json_summary(summary, output_dir):
    """Сохраняет сводку в JSON"""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"summary-{summary['date']}.json"
    filepath = output_dir / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Summary saved: {filepath}")
    return filepath

def main():
    if len(sys.argv) < 3:
        print("Usage: marketplace-analyzer.py <ozon_html> <wb_html>")
        sys.exit(1)
    
    ozon_file = sys.argv[1]
    wb_file = sys.argv[2]
    output_dir = Path(__file__).parent.parent / 'monitoring' / 'marketplace-news'
    
    print("📊 Analyzing marketplace news...")
    
    ozon_headlines = analyze_news(ozon_file)
    wb_headlines = analyze_news(wb_file)
    
    summary = generate_summary(ozon_headlines, wb_headlines)
    
    # Сохраняем JSON
    save_json_summary(summary, output_dir)
    
    # Выводим критичные изменения
    critical_count = len(summary['ozon']['critical']) + len(summary['wildberries']['critical'])
    
    if critical_count > 0:
        print(f"\n🚨 Found {critical_count} critical changes:")
        for item in summary['ozon']['critical']:
            print(f"  [OZON] {item['headline']}")
        for item in summary['wildberries']['critical']:
            print(f"  [WB] {item['headline']}")
    else:
        print("\n✅ No critical changes detected")
    
    print(f"\n📦 Ozon: {summary['ozon']['total']} headlines")
    print(f"🟣 WB: {summary['wildberries']['total']} headlines")

if __name__ == '__main__':
    main()
