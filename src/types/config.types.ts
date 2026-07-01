// ============================================
// CONFIG TYPES
// ============================================

export type Environment = 'development' | 'production' | 'test'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface ShieldConfig {
  env?: Environment
  enabled?: boolean
  name?: string
  version?: string
  headers?: HeaderConfig
  csp?: CSPConfig
  ai?: AIConfig
  rateLimit?: RateLimitConfig
  monitoring?: MonitoringConfig
  threatDetection?: ThreatDetectionConfig
  ipReputation?: IPReputationConfig
  plugins?: any[]
  rules?: any[]
  logging?: LoggingConfig
  cache?: CacheConfig
  performance?: PerformanceConfig
  integrations?: IntegrationConfig
  webhooks?: WebhookConfig[]
}

export interface HeaderConfig {
  enabled?: boolean
  disabled?: string[]
  custom?: Record<string, string>
  hsts?: HSTSConfig
  xFrame?: XFrameConfig
  referrerPolicy?: ReferrerPolicyConfig
  crossOrigin?: CrossOriginConfig
  xContentTypeOptions?: boolean
  xXssProtection?: boolean
  xDnsPrefetchControl?: boolean
  xDownloadOptions?: boolean
  xPermittedCrossDomainPolicies?: boolean
  xPoweredBy?: boolean
}

export interface HSTSConfig {
  enabled?: boolean
  maxAge?: number
  includeSubDomains?: boolean
  preload?: boolean
}

export interface XFrameConfig {
  enabled?: boolean
  action?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM'
  allowedOrigins?: string[]
}

export interface ReferrerPolicyConfig {
  enabled?: boolean
  policy?: string
}

export interface CrossOriginConfig {
  embedder?: string
  opener?: string
  resource?: string
}

export interface CSPConfig {
  enabled?: boolean
  dynamic?: boolean
  reportOnly?: boolean
  strict?: boolean
  directives?: Record<string, string[]>
  trustedCDNs?: string[]
  trustedOrigins?: string[]
  nonceEnabled?: boolean
  nonceLength?: number
  reporting?: {
    enabled?: boolean
    uri?: string
    reportTo?: string
  }
  exceptions?: any[]
}

export interface AIConfig {
  enabled?: boolean
  anomalyDetection?: boolean
  threatPrediction?: boolean
  userBehaviorAnalysis?: boolean
  contentAnalysis?: boolean
  modules?: {
    xssProtection?: boolean
    sqlInjectionProtection?: boolean
    userAgentAnalysis?: boolean
    ipReputation?: boolean
    behavioralAnalysis?: boolean
    contentAnalysis?: boolean
  }
  thresholds?: {
    anomalyThreshold?: number
    threatThreshold?: number
    trustThreshold?: number
  }
  learning?: {
    enabled?: boolean
    mode?: 'continuous' | 'batch'
    interval?: number
    sampleSize?: number
    feedbackEnabled?: boolean
  }
  blocking?: {
    enabled?: boolean
    duration?: number
    maxAttempts?: number
  }
}

export interface RateLimitConfig {
  enabled?: boolean
  default?: {
    max?: number
    windowMs?: number
  }
  roles?: Record<string, { max: number; windowMs?: number }>
  paths?: Record<string, { max: number; windowMs?: number }>
  keyGenerator?: (req: any) => string
  whitelist?: {
    enabled?: boolean
    ips?: string[]
    users?: string[]
    apiKeys?: string[]
  }
}

export interface MonitoringConfig {
  enabled?: boolean
  export?: string[]
  interval?: number
  alerts?: {
    enabled?: boolean
    rules?: any[]
  }
}

export interface ThreatDetectionConfig {
  enabled?: boolean
  detectors?: Record<string, boolean>
  thresholds?: {
    low?: number
    medium?: number
    high?: number
    critical?: number
  }
  autoBlock?: {
    enabled?: boolean
    temporary?: {
      enabled?: boolean
      duration?: number
      threshold?: number
    }
    ipBlock?: {
      enabled?: boolean
      duration?: number
      threshold?: number
    }
  }
  exceptions?: any[]
}

export interface IPReputationConfig {
  enabled?: boolean
  thresholds?: {
    trusted?: number
    neutral?: number
    suspicious?: number
    malicious?: number
  }
  actions?: Record<string, string>
  sources?: {
    internal?: boolean
    external?: {
      abuseIPDB?: {
        enabled?: boolean
        apiKey?: string
        maxAge?: number
        confidenceThreshold?: number
      }
      virustotal?: {
        enabled?: boolean
        apiKey?: string
        minDetections?: number
      }
    }
  }
  cache?: {
    enabled?: boolean
    ttl?: number
    maxSize?: number
  }
  autoBlock?: {
    enabled?: boolean
    duration?: number
    threshold?: number
  }
  geoBlocking?: {
    enabled?: boolean
    blockedCountries?: string[]
    allowedCountries?: string[]
    mode?: 'block' | 'allow' | 'challenge'
  }
}

export interface LoggingConfig {
  level?: LogLevel
  format?: 'json' | 'text'
  transports?: Array<{
    type: 'console' | 'file' | 'remote'
    enabled?: boolean
    path?: string
    maxSize?: string
    maxFiles?: number
    url?: string
  }>
  include?: {
    requests?: boolean
    threats?: boolean
    errors?: boolean
    performance?: boolean
    metrics?: boolean
  }
  exclude?: {
    headers?: string[]
    body?: string[]
  }
}

export interface CacheConfig {
  enabled?: boolean
  ttl?: number
  maxSize?: number
  store?: 'memory' | 'redis'
}

export interface PerformanceConfig {
  lazyLoading?: boolean
  preloadModules?: string[]
  parallel?: {
    enabled?: boolean
    maxConcurrency?: number
  }
  maxMemory?: number
  timeout?: number
}

export interface IntegrationConfig {
  prometheus?: {
    enabled?: boolean
    port?: number
    path?: string
    metrics?: string[]
  }
  grafana?: {
    enabled?: boolean
    url?: string
    apiKey?: string
    dashboardId?: string
  }
  datadog?: {
    enabled?: boolean
    apiKey?: string
    appKey?: string
    site?: string
    service?: string
    interval?: number
    metrics?: string[]
  }
  slack?: {
    enabled?: boolean
    webhookUrl?: string
    channel?: string
    username?: string
    events?: string[]
  }
}

export interface WebhookConfig {
  name: string
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  events: string[]
  retryCount?: number
  retryDelay?: number
  timeout?: number
}

export interface EnvMapping {
  [key: string]: {
    path: string
    type?: 'string' | 'number' | 'boolean' | 'json'
    default?: any
    required?: boolean
    transform?: (value: string) => any
  }
}
