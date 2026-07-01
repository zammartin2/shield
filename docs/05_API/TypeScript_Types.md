# 📘 TypeScript Types — Полная система типов

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

FAB Shield полностью написан на TypeScript и предоставляет **полную систему типов**. Это обеспечивает безопасность типов, автодополнение и защиту от ошибок на этапе разработки.

---

## 🏗️ Основные типы

### FABShield

```typescript
// Основной класс
class FABShield {
    constructor(config?: ShieldConfig)
    
    middleware(): MiddlewareFunction
    getMetrics(): Metrics
    getSecurityMetrics(): SecurityMetrics
    getPerformanceMetrics(): PerformanceMetrics
    getAIMetrics(): AIMetrics
    getBusinessMetrics(): BusinessMetrics
    
    generateReport(options?: ReportOptions): Promise<Report>
    generateMetricsReport(options?: ReportOptions): Promise<MetricsReport>
    
    registerPlugin(plugin: Plugin): void
    
    getConfig(): ShieldConfig
    updateConfig(config: Partial<ShieldConfig>): void
    
    getVersion(): string
    isActive(): boolean
    getStatus(): SystemStatus
}
ShieldConfig
typescript
interface ShieldConfig {
    // Основные настройки
    enabled?: boolean
    env?: 'development' | 'production' | 'test'
    name?: string
    version?: string
    
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
    
    // Интеграции
    integrations?: IntegrationConfig
    webhooks?: WebhookConfig[]
}
🔒 Security Types
HeaderConfig
typescript
interface HeaderConfig {
    enabled?: boolean
    disabled?: string[]
    custom?: Record<string, string>
    
    // Конкретные заголовки
    csp?: CSPConfig
    hsts?: HSTSConfig
    xFrame?: XFrameConfig
    referrerPolicy?: ReferrerPolicyConfig
    crossOrigin?: CrossOriginConfig
    
    // Базовые заголовки
    xContentTypeOptions?: boolean
    xXssProtection?: boolean
    xDnsPrefetchControl?: boolean
    xDownloadOptions?: boolean
    xPermittedCrossDomainPolicies?: boolean
    xPoweredBy?: boolean
}

interface HSTSConfig {
    enabled?: boolean
    maxAge?: number
    includeSubDomains?: boolean
    preload?: boolean
}

interface XFrameConfig {
    enabled?: boolean
    action?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM'
    allowedOrigins?: string[]
}
CSPConfig
typescript
interface CSPConfig {
    enabled?: boolean
    dynamic?: boolean
    reportOnly?: boolean
    strict?: boolean
    
    // Директивы
    directives?: CSPDirectives
    dynamicDirectives?: DynamicCSPDirectives
    
    // Nonce
    nonceEnabled?: boolean
    nonceLength?: number
    nonceAlgorithm?: 'sha256' | 'sha384' | 'sha512'
    
    // Отчеты
    reporting?: {
        enabled?: boolean
        uri?: string
        reportTo?: string
    }
    
    // Доверенные источники
    trustedCDNs?: string[]
    trustedOrigins?: string[]
    
    // Исключения
    exceptions?: CSPException[]
}

interface CSPDirectives {
    'default-src'?: string[]
    'script-src'?: string[]
    'style-src'?: string[]
    'img-src'?: string[]
    'font-src'?: string[]
    'connect-src'?: string[]
    'frame-ancestors'?: string[]
    'base-uri'?: string[]
    'form-action'?: string[]
    'upgrade-insecure-requests'?: string[]
    'block-all-mixed-content'?: string[]
    'require-trusted-types-for'?: string[]
    'trusted-types'?: string[]
    [key: string]: string[] | undefined
}
🤖 AI Types
AIConfig
typescript
interface AIConfig {
    enabled?: boolean
    
    // Модули
    anomalyDetection?: boolean
    threatPrediction?: boolean
    userBehaviorAnalysis?: boolean
    contentAnalysis?: boolean
    
    // Модели
    models?: AIModelConfig[]
    modules?: AIModulesConfig
    
    // Обучение
    learning?: {
        enabled?: boolean
        mode?: 'continuous' | 'batch'
        interval?: number
        sampleSize?: number
        feedbackEnabled?: boolean
    }
    
    // Пороги
    thresholds?: {
        anomalyThreshold?: number
        threatThreshold?: number
        trustThreshold?: number
    }
    
    // Блокировка
    blocking?: {
        enabled?: boolean
        duration?: number
        maxAttempts?: number
    }
}

interface AIModulesConfig {
    xssProtection?: boolean
    sqlInjectionProtection?: boolean
    userAgentAnalysis?: boolean
    ipReputation?: boolean
    behavioralAnalysis?: boolean
    contentAnalysis?: boolean
}

interface AnalysisResult {
    isThreat: boolean
    threatScore: number
    confidence: number
    anomalies: Anomaly[]
    predictions: ThreatPrediction[]
    analysis: {
        userBehavior: UserBehaviorAnalysis
        contentAnalysis: ContentAnalysis
        patternAnalysis: PatternAnalysis
    }
    recommendations: Recommendation[]
    suggestedAction: 'block' | 'warn' | 'log' | 'allow'
    analysisTime: number
    modelUsed: string[]
    timestamp: Date
}
📊 Metrics Types
Metrics
typescript
interface Metrics {
    // Запросы
    totalRequests: number
    requestsPerSecond: number
    byMethod: Record<string, number>
    byStatus: Record<string, number>
    byPath: Record<string, number>
    byIP: Record<string, number>
    
    // Безопасность
    threatsDetected: number
    threatsBlocked: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    bySource: Record<string, number>
    
    // Производительность
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    maxResponseTime: number
    minResponseTime: number
    memoryUsage: MemoryUsage
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
    version: string
    environment: string
    timestamp: Date
}

interface MemoryUsage {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
    arrayBuffers: number
}
🔌 Plugin Types
Plugin
typescript
interface Plugin {
    // Метаданные
    name: string
    version: string
    description?: string
    author?: string
    license?: string
    homepage?: string
    repository?: string
    
    // Конфигурация
    config?: Record<string, any>
    enabled?: boolean
    
    // Жизненный цикл
    onInit?: (context: PluginContext) => Promise<void>
    onStart?: (context: PluginContext) => Promise<void>
    onStop?: (context: PluginContext) => Promise<void>
    onDestroy?: (context: PluginContext) => Promise<void>
    
    // Обработчики
    onRequest?: (req: Request, context: PluginContext) => Promise<PluginResult>
    onResponse?: (res: Response, context: PluginContext) => Promise<void>
    onError?: (error: Error, context: PluginContext) => Promise<void>
    
    // Middleware
    middleware?: MiddlewareFunction
    
    // API
    api?: {
        [key: string]: (context: PluginContext, ...args: any[]) => any
    }
}

interface PluginContext {
    getConfig(name?: string): any
    setConfig(config: any): void
    getShield(): FABShield
    getMetrics(): Metrics
    getServer(): Server
    getLogger(): Logger
    log(level: string, message: string, data?: any): void
    getStorage(): Storage
    set(key: string, value: any): void
    get(key: string): any
    delete(key: string): void
    registerRoutes(prefix: string, router: Router): void
    on(event: string, handler: Function): void
    emit(event: string, data: any): void
    getUtils(): Utils
    getTimestamp(): Date
    generateId(): string
}

interface PluginResult {
    block?: boolean
    status?: number
    message?: string
    reason?: string
    headers?: Record<string, string>
    data?: any
}
🚨 Threat Types
Threat
typescript
type ThreatType = 
    | 'xss'
    | 'sql_injection'
    | 'csrf'
    | 'ddos'
    | 'brute_force'
    | 'path_traversal'
    | 'command_injection'
    | 'file_inclusion'
    | 'rce'
    | 'ssrf'
    | 'xxe'
    | 'ldap_injection'
    | 'nosql_injection'
    | 'custom'

interface Threat {
    id: string
    timestamp: Date
    type: ThreatType
    severity: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    request: RequestInfo
    evidence: Evidence
    action: 'allow' | 'block' | 'challenge' | 'log' | 'warn'
    actionTaken: boolean
    recommendations: string[]
}

interface RequestInfo {
    method: string
    path: string
    ip: string
    userAgent: string
    headers: Record<string, string>
    body?: any
    query?: Record<string, any>
    params?: Record<string, any>
}

interface Evidence {
    pattern: string
    matched: string
    location: string
    context: string
}

interface DetectionResult {
    threat: Threat | null
    rulesMatched: string[]
    score: number
    details: Record<string, any>
}
📈 Report Types
Report
typescript
type ReportType = 'executive' | 'security' | 'technical' | 'compliance'
type ReportFormat = 'json' | 'pdf' | 'html' | 'csv'

interface Report {
    id: string
    type: ReportType
    format: ReportFormat
    generatedAt: Date
    period: ReportPeriod
    
    // Секции
    summary: ReportSummary
    trends: ReportTrends
    threats: ReportThreats
    performance: ReportPerformance
    recommendations: string[]
    
    // Данные
    data: Record<string, any>
    content: string | Buffer | object
    charts: Chart[]
}

interface ReportPeriod {
    from: Date
    to: Date
    duration: number
    label: string
}

interface ReportSummary {
    totalThreats: number
    blockedPercent: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    incidents: number
    uptime: number
    responseTime: number
}

interface ReportTrends {
    threats: Trend
    performance: Trend
    incidents: Trend
    predictions: Trend[]
}

interface Trend {
    direction: 'up' | 'down' | 'stable'
    change: number
    description: string
    data: Array<{ timestamp: Date; value: number }>
}
⚙️ Utility Types
Common Types
typescript
// Middleware
type MiddlewareFunction = (
    req: Request, 
    res: Response, 
    next: NextFunction
) => void

type MiddlewareResult = void | Promise<void>

// Status
interface SystemStatus {
    status: 'ok' | 'warning' | 'error'
    version: string
    uptime: number
    active: boolean
    modules: Record<string, boolean>
    plugins: Record<string, boolean>
}

// Error
interface ShieldError {
    code: string
    message: string
    details?: Record<string, any>
    stack?: string
    timestamp: Date
}

// Storage
interface Storage {
    get(key: string): Promise<any>
    set(key: string, value: any, ttl?: number): Promise<void>
    delete(key: string): Promise<void>
    clear(): Promise<void>
    getAll(): Promise<Record<string, any>>
}

// Logger
interface Logger {
    debug(message: string, data?: any): void
    info(message: string, data?: any): void
    warn(message: string, data?: any): void
    error(message: string, data?: any): void
    fatal(message: string, data?: any): void
    child(metadata: Record<string, any>): Logger
}
🔧 Integration Types
Integration
typescript
interface IntegrationConfig {
    prometheus?: PrometheusConfig
    grafana?: GrafanaConfig
    datadog?: DatadogConfig
    newrelic?: NewRelicConfig
    slack?: SlackConfig
    webhook?: WebhookConfig[]
}

interface PrometheusConfig {
    enabled?: boolean
    port?: number
    path?: string
    metrics?: string[]
}

interface GrafanaConfig {
    enabled?: boolean
    url?: string
    apiKey?: string
    dashboardId?: string
}

interface WebhookConfig {
    name: string
    url: string
    method?: 'GET' | 'POST' | 'PUT'
    headers?: Record<string, string>
    events: string[]
    retryCount?: number
    retryDelay?: number
}
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
TypeScript Types — это:

📘 Полная типизация — безопасность типов

🔍 Автодополнение — удобная разработка

🛡️ Защита от ошибок — на этапе компиляции

📚 Документация — типы как документация

🚀 Производительность — оптимизированный код

Разрабатывайте с полной типизацией! 📘

© 2026 ООО «Деворбит». Все права защищены.