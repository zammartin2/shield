// ============================================
// FAB SHIELD — Упрощенная версия для сборки
// ============================================

// Экспортируем только основной класс
export { FABShield } from './core/FABShield'

// Экспортируем базовые типы
export type {
  ShieldConfig,
  HeaderConfig,
  CSPConfig,
  AIConfig,
  MonitoringConfig,
  RateLimitConfig,
  LoggingConfig
} from './types/config.types'

export type { Plugin, PluginContext } from './types/plugin.types'
export type { Threat, ThreatSeverity, ThreatType } from './types/threat.types'
