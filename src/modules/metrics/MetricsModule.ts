// ============================================
// METRICS MODULE — Обертка для MetricsCollector
// ============================================

import { MetricsCollector } from './MetricsCollector'
import { ConfigManager } from '../../core/ConfigManager'

export class MetricsModule {
  private collector: MetricsCollector
  private config: ConfigManager

  constructor(config: ConfigManager) {
    this.config = config
    this.collector = new MetricsCollector()
  }

  recordRequest(req: any, res: any, duration: number): void {
    const monitoringConfig = this.config.getModule('monitoring')
    if (!monitoringConfig?.enabled) return
    this.collector.recordRequest(req, res, duration)
  }

  recordThreats(threats: any[]): void {
    const monitoringConfig = this.config.getModule('monitoring')
    if (!monitoringConfig?.enabled) return
    this.collector.recordThreats(threats)
  }

  recordError(error: any): void {
    const monitoringConfig = this.config.getModule('monitoring')
    if (!monitoringConfig?.enabled) return
    this.collector.recordError(error)
  }

  /**
   * Получение метрик (для совместимости с тестами)
   */
  collect(): any {
    return this.collector.getMetrics()
  }

  getMetrics(): any {
    return this.collector.getMetrics()
  }

  reset(): void {
    this.collector.reset()
  }

  export(format: 'json' | 'prometheus' | 'csv' = 'json'): string {
    return this.collector.export(format)
  }
}