// ============================================
// TYPES — Основные типы
// ============================================

// Экспортируем все типы из модулей
export type {
  ShieldConfig,
  HeaderConfig,
  HSTSConfig,
  XFrameConfig,
  ReferrerPolicyConfig,
  CrossOriginConfig,
  CSPConfig,
  AIConfig,
  RateLimitConfig,
  MonitoringConfig,
  ThreatDetectionConfig,
  IPReputationConfig,
  LoggingConfig,
  CacheConfig,
  PerformanceConfig,
  IntegrationConfig,
  WebhookConfig,
  EnvMapping,
  Environment,
  LogLevel
} from './config.types'

export type {
  Metrics,
  RequestMetrics,
  ThreatMetrics,
  MemoryUsage,
  PluginMetrics,
  AlertAction
} from './metrics.types'

export type {
  Plugin,
  PluginContext,
  PluginResult,
  PluginStorage
} from './plugin.types'

export type {
  Threat,
  ThreatSeverity,
  ThreatType,
  ThreatRule,
  ThreatException
} from './threat.types'

// Дефолтная конфигурация
export const defaultConfig = {
  env: 'development' as const,
  headers: {
    enabled: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  csp: {
    enabled: true,
    dynamic: true
  },
  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true
  },
  monitoring: {
    enabled: true,
    export: ['json']
  },
  rateLimit: {
    enabled: false,
    default: {
      max: 100,
      windowMs: 60000
    }
  },
  logging: {
    level: 'info' as const,
    format: 'json' as const
  }
}
