// ============================================
// METRICS TYPES — Полная система типов метрик
// ============================================

import { Threat, ThreatType, ThreatSeverity } from './threat.types'

// ============================================
// ОСНОВНЫЕ МЕТРИКИ
// ============================================

export interface Metrics {
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
  bySeverity: Record<ThreatSeverity, number>
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

// ============================================
// МЕТРИКИ ЗАПРОСОВ
// ============================================

export interface RequestMetrics {
  method: string
  path: string
  status: number
  duration: number
  ip: string
  userAgent: string
  timestamp: Date
  requestId?: string
  userId?: string
  size?: number
}

export interface RequestMetricsSummary {
  total: number
  byMethod: Record<string, number>
  byStatus: Record<string, number>
  byPath: Record<string, number>
  byIP: Record<string, number>
  averageResponseTime: number
  totalDataTransferred: number
  requestsPerSecond: number
  timestamp: Date
}

// ============================================
// МЕТРИКИ БЕЗОПАСНОСТИ
// ============================================

export interface SecurityMetrics {
  threatsDetected: number
  threatsBlocked: number
  byType: Record<ThreatType, number>
  bySeverity: Record<ThreatSeverity, number>
  bySource: Record<string, number>
  anomaliesDetected: number
  falsePositives: number
  falseNegatives: number
  detectionRate: number
  timestamp: Date
}

export interface ThreatMetrics {
  type: ThreatType
  severity: ThreatSeverity
  count: number
  lastOccurrence: Date
  firstOccurrence: Date
  sources: string[]
  paths: string[]
}

// ============================================
// МЕТРИКИ ПРОИЗВОДИТЕЛЬНОСТИ
// ============================================

export interface PerformanceMetrics {
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
      arrayBuffers: number
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
    p999: number
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
  
  timestamp: Date
}

export interface MemoryUsage {
  heapUsed: number
  heapTotal: number
  external: number
  rss: number
  arrayBuffers: number
}

// ============================================
// AI МЕТРИКИ
// ============================================

export interface AIMetrics {
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
  
  timestamp: Date
}

// ============================================
// БИЗНЕС-МЕТРИКИ
// ============================================

export interface BusinessMetrics {
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
  
  timestamp: Date
}

// ============================================
// МЕТРИКИ СИСТЕМЫ
// ============================================

export interface SystemMetrics {
  // Сервер
  server: {
    hostname: string
    platform: string
    arch: string
    nodeVersion: string
    uptime: number
    pid: number
  }
  
  // Процесс
  process: {
    memory: MemoryUsage
    cpu: {
      user: number
      system: number
      total: number
    }
    handles: number
    requests: number
  }
  
  // События
  events: {
    total: number
    byType: Record<string, number>
    errors: number
    warnings: number
  }
  
  timestamp: Date
}

// ============================================
// МЕТРИКИ ПЛАГИНОВ
// ============================================

export interface PluginMetrics {
  total: number
  active: number
  disabled: number
  errors: number
  
  plugins: Record<string, {
    enabled: boolean
    errors: number
    lastRun: Date
    executionTime: number
    memoryUsage: number
  }>
  
  performance: {
    avgExecutionTime: number
    totalExecutionTime: number
    slowestPlugin: string
    fastestPlugin: string
  }
  
  timestamp: Date
}

// ============================================
// МЕТРИКИ RATE LIMITING
// ============================================

export interface RateLimitMetrics {
  totalRequests: number
  allowedRequests: number
  blockedRequests: number
  
  byKey: Record<string, {
    requests: number
    blocked: number
    limit: number
    windowMs: number
  }>
  
  topBlocked: Array<{
    key: string
    count: number
    reason: string
  }>
  
  activeLimits: number
  timestamp: Date
}

// ============================================
// МЕТРИКИ В РЕАЛЬНОМ ВРЕМЕНИ
// ============================================

export interface RealTimeMetrics {
  timestamp: Date
  requests: {
    total: number
    perSecond: number
    byStatus: Record<string, number>
  }
  threats: {
    detected: number
    blocked: number
    byType: Record<string, number>
  }
  performance: {
    responseTime: number
    memory: number
    cpu: number
  }
  connections: {
    active: number
    total: number
  }
}

// ============================================
// АГРЕГИРОВАННЫЕ МЕТРИКИ
// ============================================

export interface AggregatedMetrics {
  period: {
    from: Date
    to: Date
    duration: number
    label: string
  }
  
  summary: {
    totalRequests: number
    averageRequestsPerSecond: number
    totalThreats: number
    blockedPercent: number
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    errorRate: number
    uptime: number
  }
  
  trends: {
    requests: Trend
    threats: Trend
    performance: Trend
    errors: Trend
  }
  
  distribution: {
    byMethod: Record<string, number>
    byStatus: Record<string, number>
    byType: Record<string, number>
    bySeverity: Record<string, number>
  }
  
  timestamp: Date
}

export interface Trend {
  direction: 'up' | 'down' | 'stable'
  change: number
  description: string
  data: Array<{ timestamp: Date; value: number }>
}

// ============================================
// ИСТОРИЯ МЕТРИК
// ============================================

export interface MetricsHistory {
  metrics: Metrics[]
  from: Date
  to: Date
  total: number
  interval: number
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count'
}

export interface MetricsHistoryOptions {
  from?: Date
  to?: Date
  type?: string
  limit?: number
  interval?: number
  aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count'
  filter?: Record<string, any>
}

// ============================================
// ОТЧЕТЫ ПО МЕТРИКАМ
// ============================================

export interface MetricsReport {
  id: string
  type: 'summary' | 'detailed' | 'trends' | 'compliance'
  period: {
    from: Date
    to: Date
  }
  generatedAt: Date
  format: 'json' | 'pdf' | 'html' | 'csv'
  
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

export interface ReportSummary {
  totalRequests: number
  totalThreats: number
  blockedPercent: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  incidents: number
  uptime: number
  responseTime: number
  errorRate: number
}

export interface ReportTrends {
  requests: Trend
  threats: Trend
  performance: Trend
  incidents: Trend
  predictions: Trend[]
}

export interface ReportThreats {
  total: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  bySource: Record<string, number>
  topAttacks: Threat[]
  timeline: Array<{ timestamp: Date; count: number }>
}

export interface ReportPerformance {
  avgResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestsPerSecond: number
  errorRate: number
  memoryUsage: MemoryUsage
  cpuUsage: number
  uptime: number
}

export interface Chart {
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'table' | 'area'
  title: string
  data: any
  options?: ChartOptions
}

export interface ChartOptions {
  xAxis?: string
  yAxis?: string
  legend?: string[]
  colors?: string[]
  min?: number
  max?: number
  stacked?: boolean
  percentage?: boolean
}

// ============================================
// АЛЕРТЫ
// ============================================

export interface Alert {
  id: string
  name: string
  metric: string
  condition: string
  threshold: number
  currentValue: number
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: Date
  status: 'active' | 'resolved' | 'acknowledged'
  message: string
  actions: AlertAction[]
}

export interface AlertAction {
  type: 'email' | 'telegram' | 'webhook' | 'slack' | 'log'
  config: Record<string, any>
  status: 'pending' | 'sent' | 'failed'
  timestamp?: Date
  error?: string
}

// ============================================
// ДАШБОРДЫ
// ============================================

export interface Dashboard {
  id: string
  title: string
  refreshInterval?: number
  charts: DashboardChart[]
  layout?: 'grid' | 'flex' | 'auto'
  theme?: 'light' | 'dark'
  createdAt: Date
  updatedAt: Date
}

export interface DashboardChart {
  id: string
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'table' | 'area'
  title: string
  metric: string
  query?: Record<string, any>
  options?: ChartOptions
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
}

// ============================================
// ЭКСПОРТ МЕТРИК
// ============================================

export interface MetricsExporter {
  format: 'json' | 'prometheus' | 'csv' | 'influxdb'
  data: any
  options?: {
    includeHeaders?: boolean
    includeTimestamps?: boolean
    separator?: string
    pretty?: boolean
  }
}

// ============================================
// КОЛЛЕКТОР МЕТРИК
// ============================================

export interface MetricsCollector {
  collect(): Metrics
  collectRequest(req: any, res: any, duration: number): void
  collectThreat(threat: Threat): void
  collectError(error: Error): void
  collectAI(analysis: any): void
  getMetrics(): Metrics
  getHistory(options?: MetricsHistoryOptions): MetricsHistory
  reset(): void
}

// ============================================
// ПРОВАЙДЕР МЕТРИК
// ============================================

export interface MetricsProvider {
  getMetrics(): Promise<Metrics>
  getHistory(options?: MetricsHistoryOptions): Promise<MetricsHistory>
  getAggregated(options?: any): Promise<AggregatedMetrics>
  export(format: string, options?: any): Promise<string>
  reset(): Promise<void>
}

// ============================================
// СТРИМЕР МЕТРИК
// ============================================

export interface MetricsStream {
  onData: (callback: (metrics: RealTimeMetrics) => void) => void
  onError: (callback: (error: Error) => void) => void
  onEnd: (callback: () => void) => void
  start(): void
  stop(): void
}

export interface MetricsStreamOptions {
  interval?: number
  metrics?: string[]
  filter?: Record<string, any>
  transform?: (data: any) => any
}

// ============================================
// ТИПЫ ДЛЯ ПРОМИССА
// ============================================

export interface PrometheusMetrics {
  [key: string]: {
    type: 'counter' | 'gauge' | 'histogram' | 'summary'
    help: string
    values: Array<{
      labels: Record<string, string>
      value: number
      timestamp?: number
    }>
  }
}

// ============================================
// ТИПЫ ДЛЯ JSON
// ============================================

export interface JSONMetrics {
  metadata: {
    version: string
    timestamp: string
    environment: string
  }
  metrics: Metrics
  history?: Metrics[]
  aggregated?: AggregatedMetrics
}

// ============================================
// ТИПЫ ДЛЯ CSV
// ============================================

export interface CSVMetrics {
  headers: string[]
  rows: Array<Record<string, any>>
}

// ============================================
// КОНСТАНТЫ МЕТРИК
// ============================================

export const METRIC_TYPES = {
  REQUEST: 'request',
  THREAT: 'threat',
  PERFORMANCE: 'performance',
  AI: 'ai',
  BUSINESS: 'business',
  SYSTEM: 'system',
  PLUGIN: 'plugin',
  RATE_LIMIT: 'rate_limit'
} as const

export const METRIC_AGGREGATIONS = {
  SUM: 'sum',
  AVG: 'avg',
  MIN: 'min',
  MAX: 'max',
  COUNT: 'count',
  LAST: 'last',
  FIRST: 'first'
} as const

export const METRIC_INTERVALS = {
  SECOND: 1000,
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000,
  WEEK: 604800000,
  MONTH: 2592000000
} as const