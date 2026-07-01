// ============================================
// METRICS COLLECTOR — Полная реализация
// ============================================

import { Threat } from '../../types'

export class MetricsCollector {
  private metrics: {
    totalRequests: number
    threatsBlocked: number
    avgResponseTime: number
    errors: number
    threats: Threat[]
    responseTimes: number[]
    startTime: Date
    byPath: Map<string, number>
    byMethod: Map<string, number>
    byStatus: Map<string, number>
    byType: Map<string, number>
  }

  constructor() {
    this.metrics = {
      totalRequests: 0,
      threatsBlocked: 0,
      avgResponseTime: 0,
      errors: 0,
      threats: [],
      responseTimes: [],
      startTime: new Date(),
      byPath: new Map(),
      byMethod: new Map(),
      byStatus: new Map(),
      byType: new Map()
    }
  }

  recordRequest(req: any, res: any, duration: number): void {
    this.metrics.totalRequests++
    this.metrics.responseTimes.push(duration)
    
    // Пути
    const path = req.path || req.url || 'unknown'
    this.metrics.byPath.set(path, (this.metrics.byPath.get(path) || 0) + 1)
    
    // Методы
    const method = req.method || 'UNKNOWN'
    this.metrics.byMethod.set(method, (this.metrics.byMethod.get(method) || 0) + 1)
    
    // Статусы
    const status = String(res.statusCode || 200)
    this.metrics.byStatus.set(status, (this.metrics.byStatus.get(status) || 0) + 1)
    
    // Обновляем среднее время
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.totalRequests - 1) + duration) 
      / this.metrics.totalRequests

    // Ограничиваем историю
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift()
    }
  }

  recordThreats(threats: Threat[]): void {
    this.metrics.threatsBlocked += threats.length
    
    for (const threat of threats) {
      this.metrics.threats.push(threat)
      const type = threat.type || 'unknown'
      this.metrics.byType.set(type, (this.metrics.byType.get(type) || 0) + 1)
    }
    
    // Ограничиваем историю угроз
    if (this.metrics.threats.length > 1000) {
      this.metrics.threats = this.metrics.threats.slice(-1000)
    }
  }

  recordError(_error: any): void {
    this.metrics.errors++
  }

  getMetrics(): any {
    const p95 = this.calculatePercentile(95)
    const p99 = this.calculatePercentile(99)
    
    return {
      totalRequests: this.metrics.totalRequests,
      threatsBlocked: this.metrics.threatsBlocked,
      avgResponseTime: Math.round(this.metrics.avgResponseTime),
      p95ResponseTime: p95,
      p99ResponseTime: p99,
      errors: this.metrics.errors,
      threats: this.metrics.threats.slice(-10),
      threatTypes: Array.from(this.metrics.byType.keys()),
      threatStats: Object.fromEntries(this.metrics.byType),
      byPath: Object.fromEntries(this.metrics.byPath),
      byMethod: Object.fromEntries(this.metrics.byMethod),
      byStatus: Object.fromEntries(this.metrics.byStatus),
      uptime: Date.now() - this.metrics.startTime.getTime(),
      timestamp: new Date()
    }
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      threatsBlocked: 0,
      avgResponseTime: 0,
      errors: 0,
      threats: [],
      responseTimes: [],
      startTime: new Date(),
      byPath: new Map(),
      byMethod: new Map(),
      byStatus: new Map(),
      byType: new Map()
    }
  }

  export(format: 'json' | 'prometheus' | 'csv' = 'json'): string {
    const data = this.getMetrics()
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    }
    
    if (format === 'prometheus') {
      let result = ''
      result += `# HELP total_requests Total requests processed\n`
      result += `# TYPE total_requests counter\n`
      result += `total_requests ${data.totalRequests}\n\n`
      
      result += `# HELP threats_blocked Total threats blocked\n`
      result += `# TYPE threats_blocked counter\n`
      result += `threats_blocked ${data.threatsBlocked}\n\n`
      
      result += `# HELP avg_response_time Average response time in ms\n`
      result += `# TYPE avg_response_time gauge\n`
      result += `avg_response_time ${data.avgResponseTime}\n\n`
      
      result += `# HELP p95_response_time 95th percentile response time\n`
      result += `# TYPE p95_response_time gauge\n`
      result += `p95_response_time ${data.p95ResponseTime || 0}\n\n`
      
      result += `# HELP errors_total Total errors\n`
      result += `# TYPE errors_total counter\n`
      result += `errors_total ${data.errors}\n\n`
      
      result += `# HELP uptime_seconds System uptime in seconds\n`
      result += `# TYPE uptime_seconds gauge\n`
      result += `uptime_seconds ${Math.floor(data.uptime / 1000)}\n`
      
      return result
    }
    
    if (format === 'csv') {
      const headers = ['totalRequests', 'threatsBlocked', 'avgResponseTime', 'p95ResponseTime', 'p99ResponseTime', 'errors']
      const values = [
        data.totalRequests,
        data.threatsBlocked,
        data.avgResponseTime,
        data.p95ResponseTime || 0,
        data.p99ResponseTime || 0,
        data.errors
      ]
      return headers.join(',') + '\n' + values.join(',')
    }
    
    return JSON.stringify(data)
  }

  private calculatePercentile(percentile: number): number {
    const times = this.metrics.responseTimes
    if (times.length === 0) return 0
    
    const sorted = [...times].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index] || 0
  }
}
