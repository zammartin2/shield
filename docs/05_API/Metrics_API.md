# 📊 Metrics API — Документация API метрик

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Metrics API** предоставляет программный интерфейс для сбора, анализа и экспорта метрик FAB Shield. Эта документация описывает все методы для работы с метриками.

---

## 🏗️ Доступ к API метрик

### Через основной класс

```typescript
// Получение модуля метрик
const metricsModule = shield.metrics
// или напрямую
const metrics = shield.getMetrics()
📊 Основные методы
.getMetrics()
Возвращает текущие метрики.

typescript
shield.getMetrics(): Metrics
shield.getMetrics(type: string): Partial<Metrics>
Параметры:

type (опционально) — тип метрик: 'requests' | 'security' | 'performance' | 'ai' | 'business'

Пример:

typescript
// Все метрики
const allMetrics = shield.getMetrics()

// Только метрики безопасности
const securityMetrics = shield.getMetrics('security')

// Только метрики производительности
const perfMetrics = shield.getMetrics('performance')
.getMetricsHistory()
Возвращает историю метрик.

typescript
shield.getMetricsHistory(options?: HistoryOptions): Promise<MetricsHistory>
Параметры:

typescript
interface HistoryOptions {
    from?: Date          // Начало периода
    to?: Date            // Конец периода
    type?: string        // Тип метрик
    limit?: number       // Максимум записей
    interval?: number    // Интервал агрегации (секунды)
    aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count'
}
Пример:

typescript
// История за последние 7 дней
const history = await shield.getMetricsHistory({
    from: new Date(Date.now() - 7 * 86400000),
    to: new Date(),
    interval: 3600  // 1 час
})

// История по дням
const dailyHistory = await shield.getMetricsHistory({
    from: new Date('2026-06-01'),
    to: new Date('2026-07-01'),
    aggregate: 'sum'
})
.exportMetrics()
Экспортирует метрики в различных форматах.

typescript
shield.exportMetrics(format: 'prometheus' | 'json' | 'csv'): string | Promise<string>
Параметры:

format — формат экспорта

Пример:

typescript
// Prometheus
const prometheusMetrics = shield.exportMetrics('prometheus')
app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain')
    res.send(prometheusMetrics)
})

// JSON
const jsonMetrics = shield.exportMetrics('json')
fs.writeFileSync('metrics.json', jsonMetrics)

// CSV
const csvMetrics = shield.exportMetrics('csv')
fs.writeFileSync('metrics.csv', csvMetrics)
📈 Метрики безопасности
.getSecurityMetrics()
Возвращает метрики безопасности.

typescript
shield.getSecurityMetrics(): SecurityMetrics
Возвращает:

typescript
interface SecurityMetrics {
    // Обнаруженные угрозы
    threats: {
        total: number
        byType: Record<string, number>
        bySeverity: Record<string, number>
        bySource: Record<string, number>
        byPath: Record<string, number>
    }
    
    // Заблокированные запросы
    blocked: {
        total: number
        byRule: Record<string, number>
        byType: Record<string, number>
        byIP: Record<string, number>
    }
    
    // Аномалии
    anomalies: {
        total: number
        byType: Record<string, number>
        bySource: Record<string, number>
    }
    
    // Статистика
    stats: {
        avgThreatsPerDay: number
        avgBlockedPerDay: number
        falsePositiveRate: number
        detectionRate: number
        responseTime: {
            avg: number
            p95: number
            p99: number
        }
    }
}
⚡ Метрики производительности
.getPerformanceMetrics()
Возвращает метрики производительности.

typescript
shield.getPerformanceMetrics(): PerformanceMetrics
Возвращает:

typescript
interface PerformanceMetrics {
    // Системные метрики
    system: {
        cpu: {
            usage: number
            cores: number
            loadAvg: number[]
        }
        memory: {
            total: number
            used: number
            free: number
            heapUsed: number
            heapTotal: number
            external: number
            rss: number
        }
        uptime: number
        activeConnections: number
    }
    
    // Время ответа
    responseTime: {
        avg: number
        p50: number
        p95: number
        p99: number
        max: number
        min: number
    }
    
    // Пропускная способность
    throughput: {
        requestsPerSecond: number
        requestsPerMinute: number
        requestsPerHour: number
        dataPerSecond: number
        dataPerMinute: number
    }
    
    // Ошибки
    errors: {
        total: number
        byType: Record<string, number>
        byPath: Record<string, number>
        errorRate: number
    }
}
🤖 AI-метрики
.getAIMetrics()
Возвращает метрики AI-модуля.

typescript
shield.getAIMetrics(): AIMetrics
Возвращает:

typescript
interface AIMetrics {
    // Анализ
    analysis: {
        total: number
        byModel: Record<string, number>
        averageTime: number
        maxTime: number
        minTime: number
    }
    
    // Точность
    accuracy: {
        overall: number
        byType: Record<string, number>
        falsePositiveRate: number
        falseNegativeRate: number
        confusionMatrix: {
            truePositive: number
            trueNegative: number
            falsePositive: number
            falseNegative: number
        }
    }
    
    // Обучение
    training: {
        lastTraining: Date
        nextTraining: Date
        status: 'idle' | 'training' | 'completed' | 'failed'
        epoch: number
        loss: number
        accuracy: number
        samples: number
        duration: number
    }
    
    // Модели
    models: {
        active: string[]
        versions: Record<string, string>
        performance: Record<string, {
            accuracy: number
            speed: number
            memory: number
        }>
    }
}
📈 Бизнес-метрики
.getBusinessMetrics()
Возвращает бизнес-метрики.

typescript
shield.getBusinessMetrics(): BusinessMetrics
Возвращает:

typescript
interface BusinessMetrics {
    // Пользователи
    users: {
        total: number
        active: number
        new: number
        returning: number
        byRole: Record<string, number>
    }
    
    // Сессии
    sessions: {
        total: number
        active: number
        averageDuration: number
        bySource: Record<string, number>
    }
    
    // Операции
    operations: {
        total: number
        successful: number
        failed: number
        byType: Record<string, number>
        conversionRate: number
    }
    
    // Транзакции
    transactions: {
        total: number
        successful: number
        failed: number
        averageValue: number
        totalValue: number
    }
}
📊 Агрегация и анализ
.aggregateMetrics()
Агрегирует метрики по заданным параметрам.

typescript
shield.aggregateMetrics(options: AggregateOptions): Promise<AggregatedMetrics>
Параметры:

typescript
interface AggregateOptions {
    groupBy: 'minute' | 'hour' | 'day' | 'week' | 'month'
    metrics: string[]  // Какие метрики агрегировать
    from?: Date
    to?: Date
    filter?: Record<string, any>
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count'
}
Пример:

typescript
const aggregated = await shield.aggregateMetrics({
    groupBy: 'day',
    metrics: ['requests', 'threats', 'responseTime'],
    from: new Date('2026-06-01'),
    to: new Date('2026-07-01'),
    operation: 'avg'
})
📋 Отчеты по метрикам
.generateMetricsReport()
Генерирует отчет на основе метрик.

typescript
shield.generateMetricsReport(options?: ReportOptions): Promise<MetricsReport>
Параметры:

typescript
interface ReportOptions {
    type: 'summary' | 'detailed' | 'trends' | 'compliance'
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year'
    format?: 'json' | 'pdf' | 'html'
    sections?: string[]  // Какие секции включить
    includeCharts?: boolean
}
Пример:

typescript
const report = await shield.generateMetricsReport({
    type: 'summary',
    period: 'month',
    format: 'pdf',
    includeCharts: true
})
🔄 Стриминг метрик
.streamMetrics()
Создает поток метрик в реальном времени.

typescript
shield.streamMetrics(options: StreamOptions): EventEmitter
Параметры:

typescript
interface StreamOptions {
    interval?: number  // Интервал отправки (мс)
    metrics?: string[] // Какие метрики отправлять
    filter?: Record<string, any>
}
Пример:

typescript
const stream = shield.streamMetrics({
    interval: 1000,
    metrics: ['requests', 'threats', 'responseTime']
})

stream.on('data', (metrics) => {
    console.log('📊 Real-time metrics:', metrics)
})

stream.on('error', (error) => {
    console.error('❌ Stream error:', error)
})
📊 Визуализация
.createDashboard()
Создает дашборд для визуализации метрик.

typescript
shield.createDashboard(options: DashboardOptions): Dashboard
Параметры:

typescript
interface DashboardOptions {
    title: string
    refreshInterval?: number
    charts: ChartConfig[]
    layout?: 'grid' | 'flex' | 'auto'
    theme?: 'light' | 'dark'
}
Пример:

typescript
const dashboard = shield.createDashboard({
    title: 'Security Dashboard',
    refreshInterval: 5000,
    charts: [
        {
            type: 'line',
            title: 'Запросы в секунду',
            metric: 'requests_per_second',
            color: '#4CAF50'
        },
        {
            type: 'pie',
            title: 'Типы атак',
            metric: 'threats_by_type'
        }
    ]
})

app.get('/dashboard', (req, res) => {
    res.send(dashboard.render())
})
🚨 Алерты на основе метрик
.addAlertRule()
Добавляет правило для алертов на основе метрик.

typescript
shield.addAlertRule(rule: AlertRule): void
Параметры:

typescript
interface AlertRule {
    name: string
    metric: string
    condition: '>' | '<' | '>=' | '<=' | '==' | '!='
    threshold: number
    window?: number  // Время для анализа (секунды)
    severity: 'info' | 'warning' | 'error' | 'critical'
    actions: AlertAction[]
    enabled?: boolean
}
Пример:

typescript
shield.addAlertRule({
    name: 'High Threat Rate',
    metric: 'threats_per_minute',
    condition: '>',
    threshold: 10,
    window: 60,
    severity: 'critical',
    actions: [
        {
            type: 'email',
            to: 'security@company.com'
        },
        {
            type: 'webhook',
            url: 'https://hooks.slack.com/...'
        }
    ]
})
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Metrics API — это:

📊 Полный доступ ко всем метрикам

📈 Гибкий экспорт в разных форматах

🤖 Интеграция с AI для анализа

📋 Отчеты на основе данных

🚨 Алерты о критических событиях

Получите полный контроль над метриками! 📊

© 2026 ООО «Деворбит». Все права защищены.