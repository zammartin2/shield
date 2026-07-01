# 📚 API Reference — Полная документация API

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

Это полная документация API FAB Shield. Здесь описаны все классы, методы, свойства и типы, доступные для использования в вашем коде.

---

## 🏗️ Основной класс: FABShield

### Конструктор

```typescript
new FABShield(config?: ShieldConfig)
Параметры:

config (опционально) — объект конфигурации

Пример:

typescript
const shield = new FABShield({
    ai: { enabled: true },
    monitoring: { enabled: true }
})
Основные методы
.middleware()
Возвращает middleware для Express/Fastify/Koa.

typescript
shield.middleware(): MiddlewareFunction
Пример:

typescript
app.use(shield.middleware())
.getMetrics()
Возвращает текущие метрики.

typescript
shield.getMetrics(): Metrics
Пример:

typescript
const metrics = shield.getMetrics()
console.log(metrics.totalRequests)
.generateReport()
Генерирует отчет о безопасности.

typescript
shield.generateReport(options?: ReportOptions): Promise<Report>
Параметры:

typescript
interface ReportOptions {
    type?: 'executive' | 'security' | 'technical' | 'compliance'
    period?: {
        from: Date
        to: Date
    }
    format?: 'json' | 'pdf' | 'html' | 'csv'
}
Пример:

typescript
const report = await shield.generateReport({
    type: 'executive',
    period: {
        from: new Date('2026-06-01'),
        to: new Date('2026-07-01')
    }
})
.registerPlugin()
Регистрирует плагин.

typescript
shield.registerPlugin(plugin: Plugin): void
Пример:

typescript
shield.registerPlugin({
    name: 'custom-plugin',
    middleware: (req, res, next) => {
        // Ваша логика
        next()
    }
})
.getConfig()
Возвращает текущую конфигурацию.

typescript
shield.getConfig(): ShieldConfig
.updateConfig()
Обновляет конфигурацию.

typescript
shield.updateConfig(config: Partial<ShieldConfig>): void
🧩 Модули
HeadersModule
typescript
import { HeadersModule } from '@fab-registry/shield/headers'
Методы:
.apply()

typescript
headersModule.apply(req: Request, res: Response): void
.setHeader()

typescript
headersModule.setHeader(name: string, value: string): void
.getHeaders()

typescript
headersModule.getHeaders(): Record<string, string>
CSPModule
typescript
import { CSPModule } from '@fab-registry/shield/csp'
Методы:
.generate()

typescript
cspModule.generate(req: Request, res: Response): string
.setDirective()

typescript
cspModule.setDirective(name: string, value: string[]): void
.getDirective()

typescript
cspModule.getDirective(name: string): string[]
AIModule
typescript
import { AIModule } from '@fab-registry/shield/ai'
Методы:
.analyze()

typescript
aiModule.analyze(req: Request): Promise<AnalysisResult>
.detectAnomaly()

typescript
aiModule.detectAnomaly(data: any): Promise<AnomalyResult>
.train()

typescript
aiModule.train(options?: TrainingOptions): Promise<void>
MetricsModule
typescript
import { MetricsModule } from '@fab-registry/shield/metrics'
Методы:
.collect()

typescript
metricsModule.collect(): Metrics
.export()

typescript
metricsModule.export(format: 'json' | 'csv' | 'prometheus'): string
.getHistory()

typescript
metricsModule.getHistory(limit?: number): Metrics[]
PluginsModule
typescript
import { PluginsModule } from '@fab-registry/shield/plugins'
Методы:
.register()

typescript
pluginsModule.register(plugin: Plugin): void
.unregister()

typescript
pluginsModule.unregister(name: string): void
.getPlugins()

typescript
pluginsModule.getPlugins(): Plugin[]
📝 Типы и интерфейсы
ShieldConfig
typescript
interface ShieldConfig {
    // Основные настройки
    enabled?: boolean
    env?: 'development' | 'production' | 'test'
    
    // Модули
    headers?: HeaderConfig
    csp?: CSPConfig
    ai?: AIConfig
    monitoring?: MonitoringConfig
    rateLimit?: RateLimitConfig
    threatDetection?: ThreatDetectionConfig
    ipReputation?: IPReputationConfig
    
    // Система
    plugins?: Plugin[]
    rules?: Rule[]
    logging?: LoggingConfig
    cache?: CacheConfig
    performance?: PerformanceConfig
}
Plugin
typescript
interface Plugin {
    // Метаданные
    name: string
    version?: string
    description?: string
    author?: string
    
    // Жизненный цикл
    onInit?: (context: PluginContext) => Promise<void>
    onStart?: (context: PluginContext) => Promise<void>
    onRequest?: (req: Request, context: PluginContext) => Promise<PluginResult>
    onResponse?: (res: Response, context: PluginContext) => Promise<void>
    onError?: (error: Error, context: PluginContext) => Promise<void>
    onStop?: (context: PluginContext) => Promise<void>
    onDestroy?: (context: PluginContext) => Promise<void>
    
    // Middleware
    middleware?: (req: Request, res: Response, next: NextFunction) => void
    
    // Конфигурация
    config?: Record<string, any>
}
Metrics
typescript
interface Metrics {
    // Запросы
    totalRequests: number
    requestsPerSecond: number
    byMethod: Record<string, number>
    byStatus: Record<string, number>
    
    // Безопасность
    threatsDetected: number
    threatsBlocked: number
    byType: Record<string, number>
    bySource: Record<string, number>
    
    // Производительность
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    maxResponseTime: number
    memoryUsage: {
        heapUsed: number
        heapTotal: number
        external: number
        rss: number
    }
    cpuUsage: number
    
    // AI
    aiAnalyses: number
    aiAccuracy: number
    aiFalsePositives: number
    aiFalseNegatives: number
    
    // Rate Limiting
    blockedByRateLimit: number
    activeRateLimits: number
    
    // Система
    uptime: number
    activeConnections: number
}
Report
typescript
interface Report {
    // Основная информация
    id: string
    type: 'executive' | 'security' | 'technical' | 'compliance'
    generatedAt: Date
    period: {
        from: Date
        to: Date
    }
    
    // Содержание
    summary: {
        totalThreats: number
        blockedPercent: number
        riskLevel: 'low' | 'medium' | 'high' | 'critical'
        incidents: number
    }
    trends: {
        threats: Trend
        performance: Trend
        incidents: Trend
    }
    recommendations: string[]
    details: Record<string, any>
    
    // Формат
    format: 'json' | 'pdf' | 'html' | 'csv'
    content: string | Buffer | object
}
Threat
typescript
interface Threat {
    id: string
    timestamp: Date
    type: ThreatType
    severity: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    
    request: {
        method: string
        path: string
        ip: string
        userAgent: string
        headers: Record<string, string>
        body?: any
        query?: Record<string, any>
    }
    
    evidence: {
        pattern: string
        matched: string
        location: string
        context: string
    }
    
    action: 'allow' | 'block' | 'challenge' | 'log' | 'warn'
    actionTaken: boolean
    recommendations: string[]
}
🚀 Примеры использования
Полная настройка
typescript
import { FABShield } from '@fab-registry/shield'

const shield = new FABShield({
    env: 'production',
    
    headers: {
        enabled: true,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true
        }
    },
    
    csp: {
        enabled: true,
        dynamic: true,
        trustedCDNs: ['https://cdn.jsdelivr.net']
    },
    
    ai: {
        enabled: true,
        anomalyDetection: true,
        threatPrediction: true
    },
    
    monitoring: {
        enabled: true,
        export: ['prometheus']
    },
    
    rateLimit: {
        enabled: true,
        windowMs: 60000,
        max: 100
    },
    
    threatDetection: {
        enabled: true,
        detectors: {
            xss: true,
            sqlInjection: true
        }
    },
    
    plugins: [
        {
            name: 'custom-security',
            middleware: (req, res, next) => {
                // Кастомная логика
                next()
            }
        }
    ]
})

app.use(shield.middleware())

// Эндпоинт для метрик
app.get('/metrics', (req, res) => {
    const metrics = shield.getMetrics()
    res.json(metrics)
})

// Эндпоинт для отчетов
app.get('/report', async (req, res) => {
    const report = await shield.generateReport({
        type: 'executive'
    })
    res.json(report)
})
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
© 2026 ООО «Деворбит». Все права защищены.