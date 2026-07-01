// ============================================
// THREAT TYPES — Полная система типов угроз
// ============================================

// ============================================
// ОСНОВНЫЕ ТИПЫ
// ============================================

export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ThreatType = 
  | 'XSS'
  | 'SQL_INJECTION'
  | 'NOSQL_INJECTION'
  | 'CSRF'
  | 'DDOS'
  | 'BRUTE_FORCE'
  | 'PATH_TRAVERSAL'
  | 'COMMAND_INJECTION'
  | 'FILE_INCLUSION'
  | 'RCE'
  | 'SSRF'
  | 'XXE'
  | 'LDAP_INJECTION'
  | 'CUSTOM'

export type ThreatAction = 'allow' | 'block' | 'challenge' | 'log' | 'warn' | 'rate-limit'

// ============================================
// УГРОЗА
// ============================================

export interface Threat {
  id: string
  timestamp: Date
  type: ThreatType
  severity: ThreatSeverity
  confidence: number
  
  // Запрос
  request: ThreatRequest
  
  // Доказательства
  evidence: ThreatEvidence
  
  // Действие
  action: ThreatAction
  actionTaken: boolean
  
  // Рекомендации
  recommendations: string[]
  
  // Источник
  source?: {
    ip: string
    userAgent: string
    country?: string
    asn?: string
  }
  
  // Метаданные
  metadata?: Record<string, any>
  tags?: string[]
  
  // Статус
  status: 'detected' | 'analyzed' | 'blocked' | 'resolved' | 'false_positive'
  
  // Обработка
  processedAt?: Date
  resolvedAt?: Date
  resolvedBy?: string
  resolution?: string
}

// ============================================
// ЗАПРОС УГРОЗЫ
// ============================================

export interface ThreatRequest {
  method: string
  path: string
  ip: string
  userAgent: string
  headers: Record<string, string>
  body?: any
  query?: Record<string, any>
  params?: Record<string, any>
  cookies?: Record<string, string>
  referer?: string
  protocol?: string
  host?: string
  port?: number
  timestamp: Date
}

// ============================================
// ДОКАЗАТЕЛЬСТВА УГРОЗЫ
// ============================================

export interface ThreatEvidence {
  pattern: string
  matched: string
  location: string
  context: string
  confidence: number
  raw?: string
  decoded?: string
  encoded?: string
  payload?: string
  vector?: string
}

// ============================================
// РЕЗУЛЬТАТ ОБНАРУЖЕНИЯ
// ============================================

export interface ThreatDetectionResult {
  threats: Threat[]
  score: number
  confidence: number
  recommendations: string[]
  suggestedAction: ThreatAction
  analysisTime: number
  modelUsed: string[]
  timestamp: Date
}

// ============================================
// ДЕТЕКТОР УГРОЗ
// ============================================

export interface ThreatDetector {
  name: string
  version: string
  enabled: boolean
  priority: number
  
  detect(data: ThreatDetectionData): Promise<ThreatDetectionResult>
  analyze(threat: Threat): Promise<Threat>
  validate(threat: Threat): Promise<boolean>
  
  // Конфигурация
  config: ThreatDetectorConfig
  
  // Метрики
  metrics: ThreatDetectorMetrics
}

export interface ThreatDetectionData {
  req: any
  res: any
  context: any
  request: ThreatRequest
  body: any
  query: any
  params: any
  headers: Record<string, string>
  ip: string
  userAgent: string
}

// ============================================
// КОНФИГУРАЦИЯ ДЕТЕКТОРА
// ============================================

export interface ThreatDetectorConfig {
  enabled: boolean
  threshold: number
  sensitivity: number
  patterns: string[]
  exceptions: string[]
  customRules: ThreatRule[]
  aiEnabled: boolean
  learningMode: boolean
}

// ============================================
// МЕТРИКИ ДЕТЕКТОРА
// ============================================

export interface ThreatDetectorMetrics {
  totalDetections: number
  truePositives: number
  falsePositives: number
  trueNegatives: number
  falseNegatives: number
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  averageResponseTime: number
  lastDetection: Date
}

// ============================================
// ПРАВИЛА УГРОЗ
// ============================================

export interface ThreatRule {
  id: string
  name: string
  description?: string
  enabled: boolean
  priority: number
  severity: ThreatSeverity
  action: ThreatAction
  
  // Условия
  conditions: ThreatCondition[]
  
  // Действия
  actions: ThreatAction[]
  
  // Исключения
  exceptions: ThreatException[]
  
  // Метаданные
  author?: string
  version?: string
  createdAt: Date
  updatedAt: Date
}

export interface ThreatCondition {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn'
  value: any
  caseSensitive?: boolean
}

export interface ThreatException {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex'
  value: any
  reason?: string
}

// ============================================
// АНАЛИЗ УГРОЗ
// ============================================

export interface ThreatAnalysis {
  // Анализ
  analysis: {
    pattern: string
    confidence: number
    matched: boolean
    score: number
  }
  
  // Риск
  risk: {
    level: ThreatSeverity
    score: number
    factors: string[]
  }
  
  // Рекомендации
  recommendations: {
    immediate: string[]
    longTerm: string[]
    prevention: string[]
  }
  
  // Влияние
  impact: {
    scope: string
    severity: number
    probability: number
    damage: string
  }
  
  timestamp: Date
}

// ============================================
// ИНЦИДЕНТ БЕЗОПАСНОСТИ
// ============================================

export interface SecurityIncident {
  id: string
  title: string
  description: string
  severity: ThreatSeverity
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed'
  
  // Угрозы
  threats: Threat[]
  
  // Временная шкала
  timeline: Array<{
    timestamp: Date
    event: string
    actor: string
    details: any
  }>
  
  // Действия
  actions: Array<{
    timestamp: Date
    action: string
    actor: string
    result: string
  }>
  
  // Данные
  data: {
    affectedSystems: string[]
    affectedUsers: string[]
    dataExposed: boolean
    dataType: string[]
  }
  
  // Обработка
  createdBy: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  closedAt?: Date
}

// ============================================
// ОТЧЕТ ОБ УГРОЗАХ
// ============================================

export interface ThreatReport {
  id: string
  generatedAt: Date
  period: {
    from: Date
    to: Date
  }
  
  // Статистика
  statistics: {
    totalThreats: number
    byType: Record<ThreatType, number>
    bySeverity: Record<ThreatSeverity, number>
    bySource: Record<string, number>
    byPath: Record<string, number>
  }
  
  // Тренды
  trends: {
    threats: Array<{ date: Date; count: number }>
    blocked: Array<{ date: Date; count: number }>
    types: Array<{ type: ThreatType; count: number; trend: number }>
  }
  
  // Топ угроз
  topThreats: Threat[]
  
  // Рекомендации
  recommendations: string[]
  
  // Прогнозы
  predictions: Array<{
    type: ThreatType
    probability: number
    timeframe: string
    action: string
  }>
}

// ============================================
// МОДЕЛЬ УГРОЗ
// ============================================

export interface ThreatModel {
  id: string
  name: string
  version: string
  description: string
  
  // Угрозы
  threats: Threat[]
  
  // Уязвимости
  vulnerabilities: Vulnerability[]
  
  // Контрмеры
  countermeasures: Countermeasure[]
  
  // Оценка рисков
  riskAssessment: RiskAssessment
  
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// ============================================
// УЯЗВИМОСТЬ
// ============================================

export interface Vulnerability {
  id: string
  name: string
  description: string
  severity: ThreatSeverity
  cve?: string
  cwe?: string
  cvss?: {
    score: number
    vector: string
    severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  }
  
  // Влияние
  impact: {
    confidentiality: 'none' | 'low' | 'medium' | 'high'
    integrity: 'none' | 'low' | 'medium' | 'high'
    availability: 'none' | 'low' | 'medium' | 'high'
  }
  
  // Эксплуатация
  exploitability: {
    complexity: 'low' | 'medium' | 'high'
    vector: 'network' | 'adjacent' | 'local' | 'physical'
    authentication: 'none' | 'low' | 'high'
  }
  
  // Статус
  status: 'new' | 'confirmed' | 'patched' | 'mitigated' | 'accepted'
  
  // Решения
  solutions: string[]
  patches: string[]
  workarounds: string[]
  
  createdAt: Date
  updatedAt: Date
  discoveredAt: Date
  patchedAt?: Date
}

// ============================================
// КОНТРМЕРЫ
// ============================================

export interface Countermeasure {
  id: string
  name: string
  description: string
  type: 'preventive' | 'detective' | 'corrective' | 'deterrent'
  effectiveness: number
  
  // Имплементация
  implementation: {
    cost: 'low' | 'medium' | 'high'
    complexity: 'low' | 'medium' | 'high'
    time: string
  }
  
  // Угрозы
  mitigates: string[] // ID угроз
  
  // Статус
  status: 'planned' | 'implemented' | 'tested' | 'failed'
  
  createdAt: Date
  updatedAt: Date
}

// ============================================
// ОЦЕНКА РИСКА
// ============================================

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  scores: {
    inherent: number
    residual: number
    target: number
  }
  
  // Факторы
  factors: {
    likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain'
    impact: 'insignificant' | 'minor' | 'moderate' | 'major' | 'catastrophic'
    vulnerability: number
    threat: number
  }
  
  // Детали
  risks: Array<{
    threatId: string
    vulnerabilityId: string
    likelihood: number
    impact: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    mitigation: string
  }>
  
  createdAt: Date
  updatedAt: Date
}

// ============================================
// КОНСТАНТЫ УГРОЗ
// ============================================

export const THREAT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const

export const THREAT_TYPES_LIST = [
  'XSS',
  'SQL_INJECTION',
  'NOSQL_INJECTION',
  'CSRF',
  'DDOS',
  'BRUTE_FORCE',
  'PATH_TRAVERSAL',
  'COMMAND_INJECTION',
  'FILE_INCLUSION',
  'RCE',
  'SSRF',
  'XXE',
  'LDAP_INJECTION',
  'CUSTOM'
] as const

export const THREAT_ACTIONS = {
  ALLOW: 'allow',
  BLOCK: 'block',
  CHALLENGE: 'challenge',
  LOG: 'log',
  WARN: 'warn',
  RATE_LIMIT: 'rate-limit'
} as const

export const THREAT_STATUSES = {
  DETECTED: 'detected',
  ANALYZED: 'analyzed',
  BLOCKED: 'blocked',
  RESOLVED: 'resolved',
  FALSE_POSITIVE: 'false_positive'
} as const

// ============================================
// ОБНАРУЖЕНИЕ УГРОЗ
// ============================================

export interface ThreatDetection {
  detect(data: ThreatDetectionData): Promise<ThreatDetectionResult>
  analyze(threat: Threat): Promise<Threat>
  validate(threat: Threat): Promise<boolean>
  getMetrics(): ThreatDetectorMetrics
  addRule(rule: ThreatRule): void
  removeRule(id: string): void
  updateRule(rule: ThreatRule): void
  getRules(): ThreatRule[]
  enableRule(id: string): void
  disableRule(id: string): void
}

// ============================================
// ПРОГНОЗИРОВАНИЕ УГРОЗ
// ============================================

export interface ThreatPrediction {
  id: string
  type: ThreatType
  probability: number
  confidence: number
  timeframe: 'immediate' | 'soon' | 'later'
  severity: ThreatSeverity
  
  // Индикаторы
  indicators: string[]
  
  // Рекомендации
  recommendations: string[]
  
  // Действия
  suggestedAction: ThreatAction
  
  timestamp: Date
  expiresAt: Date
}

export interface ThreatPredictor {
  predict(data: ThreatDetectionData): Promise<ThreatPrediction[]>
  train(data: any[]): Promise<void>
  getAccuracy(): number
  getConfidence(): number
  updateModel(): Promise<void>
}

// ============================================
// БАЗА ЗНАНИЙ УГРОЗ
// ============================================

export interface ThreatKnowledgeBase {
  threats: Map<string, ThreatDefinition>
  patterns: Map<string, ThreatPattern>
  rules: Map<string, ThreatRule>
  
  addDefinition(def: ThreatDefinition): void
  getDefinition(id: string): ThreatDefinition | undefined
  addPattern(pattern: ThreatPattern): void
  getPattern(id: string): ThreatPattern | undefined
  addRule(rule: ThreatRule): void
  getRule(id: string): ThreatRule | undefined
  findThreat(data: any): ThreatDefinition | undefined
  findAllThreats(data: any): ThreatDefinition[]
  update(): Promise<void>
  refresh(): Promise<void>
}

export interface ThreatDefinition {
  id: string
  type: ThreatType
  name: string
  description: string
  severity: ThreatSeverity
  patterns: string[]
  conditions: ThreatCondition[]
  remediation: string
  references: string[]
}

export interface ThreatPattern {
  id: string
  name: string
  pattern: string
  flags?: string
  confidence: number
  type: ThreatType
  examples: string[]
}