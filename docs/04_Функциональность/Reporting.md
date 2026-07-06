# 📈 Reporting — Генерация отчетов о безопасности

---

**Версия:** 1.1.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Reporting** — это система генерации отчетов о безопасности, которая превращает сырые данные в понятные и информативные документы для разных аудиторий: от разработчиков до руководства.

---

## 🎯 Что дают отчеты

### Ключевые преимущества

| Преимущество | Описание |
|:---|:---|
| **Прозрачность** | Показывают состояние безопасности |
| **Аналитика** | Выявляют тренды и проблемы |
| **Комплаенс** | Соответствие регуляторным требованиям |
| **Принятие решений** | Данные для управления безопасностью |
| **Доказательство** | Подтверждение эффективности защиты |

---

## 📊 Типы отчетов

### 1. Executive Report (Для руководства)

**Цель:** Общее состояние безопасности

```typescript
interface ExecutiveReport {
    // Ключевые метрики
    summary: {
        totalThreats: number;
        blockedPercent: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        incidents: number;
    };

    // Тренды
    trends: {
        threats: Trend[];
        performance: Trend[];
        incidents: Trend[];
    };

    // Рекомендации
    recommendations: string[];

    // Бюджет и ресурсы
    resources: {
        saved: number;      // Сэкономлено (в часах)
        prevented: number;  // Предотвращено атак
        efficiency: number; // Эффективность защиты (%)
    };
}
```

### Пример Executive Report

```json
{
    "summary": {
        "totalThreats": 1567,
        "blockedPercent": 98.7,
        "riskLevel": "low",
        "incidents": 2
    },
    "trends": {
        "threats": {
            "direction": "decreasing",
            "change": -12.5,
            "description": "Угрозы снижаются"
        }
    },
    "recommendations": [
        "Включить 2FA для всех администраторов",
        "Обновить правила CSP",
        "Усилить мониторинг API"
    ],
    "resources": {
        "saved": 240,
        "prevented": 127,
        "efficiency": 95
    }
}
```

### 2. Security Report (Для команды безопасности)

**Цель:** Детальный анализ угроз

```typescript
interface SecurityReport {
    // Обнаруженные угрозы
    threats: {
        total: number;
        byType: ThreatDistribution;
        bySource: SourceDistribution;
        byTime: TimeDistribution;
    };

    // Заблокированные атаки
    blocks: {
        total: number;
        byRule: RuleDistribution;
        byIP: IPDistribution;
    };

    // Уязвимости
    vulnerabilities: {
        found: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        patched: number;
    };

    // Анализ
    analysis: {
        patterns: Pattern[];
        anomalies: Anomaly[];
        predictions: Prediction[];
    };
}
```

### 3. Technical Report (Для разработчиков)

**Цель:** Технические детали

```typescript
interface TechnicalReport {
    // Производительность
    performance: {
        avgResponseTime: number;
        p95ResponseTime: number;
        p99ResponseTime: number;
        requestsPerSecond: number;
        errorRate: number;
    };

    // Конфигурация
    config: {
        rules: Rule[];
        headers: Header[];
        csp: CSPConfig;
        rateLimits: RateLimitConfig[];
    };

    // Логи
    logs: {
        access: AccessLog[];
        security: SecurityLog[];
        errors: ErrorLog[];
    };

    // Рекомендации для разработчиков
    recommendations: DeveloperRecommendation[];
}
```

### 4. Compliance Report (Для аудита)

**Цель:** Соответствие стандартам

```typescript
interface ComplianceReport {
    // Соответствие
    compliance: {
        gdpr: {
            status: 'compliant' | 'non-compliant' | 'partial';
            issues: string[];
        };
        pci: {
            status: 'compliant' | 'non-compliant' | 'partial';
            issues: string[];
        };
        hipaa: {
            status: 'compliant' | 'non-compliant' | 'partial';
            issues: string[];
        };
        iso27001: {
            status: 'compliant' | 'non-compliant' | 'partial';
            issues: string[];
        };
    };

    // Аудит
    audit: {
        logs: AuditLog[];
        access: AccessRecord[];
        changes: ChangeRecord[];
    };

    // Доказательства
    evidence: {
        policies: Policy[];
        procedures: Procedure[];
        tests: TestResult[];
    };
}
```

---

## 🔧 Использование

### Базовая генерация

```typescript
const shield = new FABShield({
    reporting: {
        enabled: true
    }
})

// Генерация отчета
const report = await shield.reporting.generate({
    type: 'executive',
    period: 'month',
    format: 'json'
})

console.log(report)
```

### Расширенная конфигурация

```typescript
const shield = new FABShield({
    reporting: {
        enabled: true,

        // Типы отчетов
        types: {
            executive: {
                enabled: true,
                frequency: 'monthly',
                recipients: ['ceo@company.com', 'cso@company.com']
            },
            security: {
                enabled: true,
                frequency: 'weekly',
                recipients: ['security@company.com']
            },
            technical: {
                enabled: true,
                frequency: 'daily',
                recipients: ['dev@company.com']
            },
            compliance: {
                enabled: true,
                frequency: 'quarterly',
                recipients: ['audit@company.com']
            }
        },

        // Форматы
        formats: ['pdf', 'html', 'json', 'csv'],

        // Автоматическая отправка
        delivery: {
            email: {
                enabled: true,
                smtp: {
                    host: 'smtp.company.com',
                    port: 587,
                    user: 'reports@company.com',
                    password: process.env.SMTP_PASSWORD
                }
            },
            webhook: {
                enabled: true,
                url: 'https://monitoring.company.com/reports'
            },
            storage: {
                enabled: true,
                path: './reports',
                retention: 90 // дней
            }
        },

        // Шаблоны
        templates: {
            executive: './templates/executive.hbs',
            security: './templates/security.hbs',
            technical: './templates/technical.hbs'
        }
    }
})
```

---

## 📝 Генерация отчетов

### По запросу

```typescript
// Генерация отчета за период
const report = await shield.reporting.generate({
    type: 'security',
    period: {
        from: new Date('2026-06-01'),
        to: new Date('2026-07-01')
    },
    format: 'pdf'
})

// Сохранение отчета
await report.save('./reports/security-2026-06.pdf')
```

### Автоматическая генерация

```typescript
// Настройка автоматической генерации
shield.reporting.schedule({
    type: 'executive',
    schedule: '0 9 1 * *',  // 1-го числа каждого месяца в 9:00
    format: 'pdf',
    action: 'email'         // отправить по email
})

// Еженедельный отчет
shield.reporting.schedule({
    type: 'security',
    schedule: '0 9 * * 1',  // Каждый понедельник в 9:00
    format: 'html',
    action: 'webhook'
})

// Ежедневный технический отчет
shield.reporting.schedule({
    type: 'technical',
    schedule: '0 18 * * *',  // Каждый день в 18:00
    format: 'json',
    action: 'storage'
})
```

---

## 📊 Кастомизация отчетов

### Создание шаблона

```handlebars
<!-- templates/executive.hbs -->
<!DOCTYPE html>
<html>
<head>
    <title>Executive Security Report</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { background: #1a237e; color: white; padding: 20px; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .metric { background: #f5f5f5; padding: 15px; border-radius: 8px; }
        .value { font-size: 24px; font-weight: bold; }
        .trend-up { color: #4CAF50; }
        .trend-down { color: #F44336; }
    </style>
</head>
<body>
    <div class="header">
        <h1>FAB Shield — Executive Report</h1>
        <p>Generated: {{generatedAt}}</p>
        <p>Period: {{period.from}} — {{period.to}}</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <div>Всего угроз</div>
            <div class="value">{{summary.totalThreats}}</div>
        </div>
        <div class="metric">
            <div>Заблокировано</div>
            <div class="value">{{summary.blockedPercent}}%</div>
        </div>
        <div class="metric">
            <div>Уровень риска</div>
            <div class="value">{{summary.riskLevel}}</div>
        </div>
        <div class="metric">
            <div>Инцидентов</div>
            <div class="value">{{summary.incidents}}</div>
        </div>
    </div>

    <div class="trends">
        <h2>Тренды</h2>
        {{#each trends}}
        <div>
            <span>{{this.name}}:</span>
            <span class="trend-{{this.direction}}">{{this.change}}%</span>
        </div>
        {{/each}}
    </div>
</body>
</html>
```

### Добавление кастомных данных

```typescript
// Добавление кастомных данных в отчет
shield.reporting.registerDataProvider('custom', async () => {
    return {
        customMetrics: await getCustomMetrics(),
        customAnalysis: await analyzeCustomData()
    }
})

// Использование в отчете
const report = await shield.reporting.generate({
    type: 'executive',
    include: ['custom']
})
```

---

## 📤 Экспорт отчетов

### PDF

```typescript
// Экспорт в PDF
const pdf = await shield.reporting.exportPDF(report)
fs.writeFileSync('report.pdf', pdf)

// Опции PDF
const pdfOptions = {
    format: 'A4',
    landscape: true,
    margin: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
    },
    header: {
        text: 'FAB Shield Report',
        fontSize: 10
    },
    footer: {
        text: 'Page {page} of {pages}',
        fontSize: 8
    }
}
```

### HTML

```typescript
// Экспорт в HTML
const html = await shield.reporting.exportHTML(report)
fs.writeFileSync('report.html', html)
```

### JSON

```typescript
// Экспорт в JSON
const json = await shield.reporting.exportJSON(report)
fs.writeFileSync('report.json', JSON.stringify(json, null, 2))
```

### CSV

```typescript
// Экспорт в CSV
const csv = await shield.reporting.exportCSV(report)
fs.writeFileSync('report.csv', csv)
```

---

## 📊 Визуализация

### Графики и диаграммы

```typescript
// Добавление графиков в отчет
const report = await shield.reporting.generate({
    type: 'executive',
    charts: [
        {
            type: 'line',
            title: 'Угрозы по дням',
            data: threatsByDay,
            xAxis: 'date',
            yAxis: 'count'
        },
        {
            type: 'pie',
            title: 'Типы атак',
            data: threatsByType
        },
        {
            type: 'bar',
            title: 'Топ 10 атакующих IP',
            data: topAttackers
        }
    ]
})
```

---

## 📞 Контакты

| | |
|:---|:---|
| **Автор** | Фабрициус Владимир Николаевич |
| **Компания** | ООО «Деворбит» (DEVORBIT LLC) |
| **Email** | [derector@devorbit.ru](mailto:derector@devorbit.ru) |
| **Реестр** | [fab.devorbit.ru](https://fab.devorbit.ru) |

---

## 🏆 Итог

**Reporting** — это:

- 📊 Прозрачность — видимость состояния безопасности
- 📈 Аналитика — понимание трендов
- 📋 Комплаенс — соответствие требованиям
- 🎯 Решения — данные для управления
- 📤 Гибкость — разные форматы и шаблоны

Принимайте решения на основе данных! 📊

---

© 2026 ООО «Деворбит». Все права защищены.
