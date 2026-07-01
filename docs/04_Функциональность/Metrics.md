# 📊 Metrics — Сбор и анализ метрик

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Metrics** — это система сбора, анализа и визуализации данных о работе FAB Shield. Она предоставляет полную картину происходящего в вашем приложении: от обычных запросов до обнаруженных угроз.

---

## 🎯 Что дают метрики

### Ключевые преимущества

| Преимущество | Описание |
|:---|:---|
| **Прозрачность** | Знаете, что происходит в системе |
| **Аналитика** | Понимаете тренды и угрозы |
| **Оптимизация** | Улучшаете производительность |
| **Безопасность** | Быстро реагируете на инциденты |
| **Отчетность** | Доказываете эффективность защиты |

---

## 📊 Типы метрик

### 1. Request Metrics (Метрики запросов)

**Что собирает:**
- Количество запросов
- Типы методов (GET, POST, etc.)
- Пути запросов
- Статусы ответов
- Время ответа
- Размер ответа

```typescript
interface RequestMetrics {
    total: number;
    byMethod: {
        GET: number;
        POST: number;
        PUT: number;
        DELETE: number;
        OTHER: number;
    };
    byStatus: {
        '1xx': number;
        '2xx': number;
        '3xx': number;
        '4xx': number;
        '5xx': number;
    };
    averageResponseTime: number;
    totalDataTransferred: number;
    requestsPerSecond: number;
}
2. Security Metrics (Метрики безопасности)
Что собирает:

Обнаруженные угрозы

Заблокированные запросы

Типы атак

Источники угроз

Аномалии

typescript
interface SecurityMetrics {
    threatsDetected: number;
    threatsBlocked: number;
    byType: {
        xss: number;
        sqlInjection: number;
        csrf: number;
        ddos: number;
        bruteForce: number;
        other: number;
    };
    bySource: {
        [ip: string]: number;
    };
    anomaliesDetected: number;
    falsePositives: number;
}
3. Performance Metrics (Метрики производительности)
Что собирает:

Использование CPU

Использование памяти

Время обработки

Пропускная способность

Задержки

typescript
interface PerformanceMetrics {
    cpuUsage: number;           // 0-100
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    processingTime: {
        average: number;        // ms
        p95: number;           // ms
        p99: number;           // ms
        max: number;           // ms
    };
    throughput: number;         // requests/sec
    activeConnections: number;
}
4. AI Metrics (Метрики AI)
Что собирает:

Количество анализов

Точность обнаружения

Ложные срабатывания

Время анализа

Обучение модели

typescript
interface AIMetrics {
    totalAnalyses: number;
    accuracy: number;           // 0-100
    falsePositives: number;
    falseNegatives: number;
    averageAnalysisTime: number; // ms
    modelVersion: string;
    lastTraining: Date;
    trainingStatus: 'idle' | 'training' | 'completed' | 'failed';
}
5. Business Metrics (Бизнес-метрики)
Что собирает:

Активные пользователи

Сессии

Успешные операции

Ошибки

Транзакции

typescript
interface BusinessMetrics {
    activeUsers: number;
    totalSessions: number;
    successfulOperations: number;
    failedOperations: number;
    transactionCount: number;
    conversionRate: number;     // %
    userRetention: number;      // %
}
🔧 Использование
Базовая конфигурация
typescript
const shield = new FABShield({
    metrics: {
        enabled: true
    }
})

// Получение метрик
const metrics = shield.getMetrics()
console.log(metrics)
Расширенная конфигурация
typescript
const shield = new FABShield({
    metrics: {
        enabled: true,
        
        // Какие метрики собирать
        collect: {
            requests: true,
            security: true,
            performance: true,
            ai: true,
            business: true
        },
        
        // Интервал сбора (секунды)
        interval: 60,
        
        // Хранение
        storage: {
            type: 'memory',  // 'memory' | 'redis' | 'database'
            retention: 86400, // 24 часа
            maxSize: 10000    // максимальное количество записей
        },
        
        // Экспорт
        export: {
            prometheus: {
                enabled: true,
                port: 9090,
                path: '/metrics'
            },
            json: {
                enabled: true,
                path: './metrics.json',
                interval: 3600  // экспорт каждый час
            },
            webhook: {
                enabled: false,
                url: 'https://monitoring.example.com/metrics',
                interval: 300
            }
        },
        
        // Алерты
        alerts: {
            enabled: true,
            rules: [
                {
                    metric: 'threats_blocked',
                    threshold: 10,
                    window: 60,
                    severity: 'high'
                },
                {
                    metric: 'response_time',
                    threshold: 1000,
                    window: 30,
                    severity: 'medium'
                }
            ]
        }
    }
})
📈 Доступ к метрикам
Через API
typescript
// Получить все метрики
const allMetrics = shield.getMetrics()

// Получить конкретную метрику
const security = shield.getMetrics('security')

// Получить метрики за период
const history = shield.getMetricsHistory({
    from: new Date('2026-06-01'),
    to: new Date('2026-07-01'),
    type: 'security'
})

// Получить агрегированные метрики
const aggregated = shield.getMetricsAggregated({
    groupBy: 'day',
    metrics: ['requests', 'threats']
})
Через Prometheus
typescript
// Эндпоинт для Prometheus
app.get('/metrics', async (req, res) => {
    const metrics = await shield.exportMetrics('prometheus')
    res.set('Content-Type', 'text/plain')
    res.send(metrics)
})
Через JSON
typescript
// Экспорт в JSON
const jsonMetrics = shield.exportMetrics('json')
fs.writeFileSync('metrics.json', jsonMetrics)

// Экспорт в CSV
const csvMetrics = shield.exportMetrics('csv')
fs.writeFileSync('metrics.csv', csvMetrics)
📊 Визуализация
Веб-дашборд
typescript
// Создаем дашборд
const dashboard = shield.createDashboard({
    refreshInterval: 5000,  // обновление каждые 5 секунд
    charts: [
        {
            type: 'line',
            title: 'Запросы в секунду',
            metric: 'requests_per_second',
            color: '#4CAF50'
        },
        {
            type: 'bar',
            title: 'Типы атак',
            metric: 'threats_by_type',
            color: '#F44336'
        },
        {
            type: 'gauge',
            title: 'CPU Usage',
            metric: 'cpu_usage',
            min: 0,
            max: 100,
            color: '#2196F3'
        },
        {
            type: 'table',
            title: 'Топ IP',
            metric: 'top_attackers',
            columns: ['ip', 'count', 'type']
        }
    ]
})

// Отображаем дашборд
app.get('/dashboard', (req, res) => {
    res.send(dashboard.render())
})
Графики
typescript
// Создаем график
const chart = shield.createChart({
    type: 'line',
    data: shield.getMetricsHistory(),
    options: {
        title: 'Угрозы по дням',
        xAxis: 'date',
        yAxis: 'count',
        legend: ['XSS', 'SQL', 'DDoS', 'Brute Force'],
        colors: ['#F44336', '#FF9800', '#2196F3', '#4CAF50']
    }
})

// Получаем HTML для вставки
const chartHTML = chart.renderHTML()
🚨 Алерты
Настройка алертов
typescript
const shield = new FABShield({
    metrics: {
        alerts: {
            enabled: true,
            rules: [
                {
                    name: 'High Threat Rate',
                    metric: 'threats_blocked',
                    condition: '>',
                    threshold: 50,
                    window: 60,  // проверять за 60 секунд
                    severity: 'critical',
                    actions: [
                        {
                            type: 'email',
                            to: 'security@company.com'
                        },
                        {
                            type: 'telegram',
                            chatId: '-123456789'
                        },
                        {
                            type: 'webhook',
                            url: 'https://hooks.slack.com/...'
                        }
                    ]
                },
                {
                    name: 'Performance Degradation',
                    metric: 'response_time',
                    condition: '>',
                    threshold: 2000,  // 2 секунды
                    window: 120,
                    severity: 'warning',
                    actions: [
                        {
                            type: 'webhook',
                            url: 'https://monitoring.example.com/alerts'
                        }
                    ]
                }
            ]
        }
    }
})
📊 Примеры использования
1. Мониторинг атак
typescript
setInterval(() => {
    const metrics = shield.getMetrics('security')
    if (metrics.threatsBlocked > 100) {
        console.log('🔴 Обнаружено много атак!')
        sendAlert('Massive attack detected', metrics)
    }
}, 60000)
2. Оптимизация производительности
typescript
const metrics = shield.getMetrics('performance')
if (metrics.responseTime.p95 > 500) {
    console.log('⚠️ Высокая задержка, нужно оптимизировать')
    analyzePerformance(metrics)
}
3. Анализ трендов
typescript
const history = shield.getMetricsHistory({
    from: new Date(Date.now() - 7 * 86400000),
    to: new Date()
})

const trends = analyzeTrends(history)
console.log('📈 Тренды:', {
    requests: trends.requests,
    threats: trends.threats,
    performance: trends.performance
})
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Metrics — это:

📊 Полная картина — всё о работе системы

📈 Тренды и аналитика — понимание происходящего

🚨 Быстрая реакция — алерты об угрозах

📉 Оптимизация — улучшение производительности

📋 Отчетность — доказательство эффективности

Знайте, что происходит в вашей системе! 📊

© 2026 ООО «Деворбит». Все права защищены.