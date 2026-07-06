// ============================================
// REQUEST HANDLER — Обработка запросов
// ============================================

import { ContextManager } from './ContextManager'
import { HeadersModule } from '../modules/headers/HeadersModule'
import { CSPModule } from '../modules/csp/CSPModule'
import { AIModule } from '../modules/ai/AIModule'
import { PluginManager } from '../modules/plugins/PluginManager'
import { MetricsCollector } from '../modules/metrics/MetricsCollector'

export class RequestHandler {
  private contextManager: ContextManager
  private headers: HeadersModule
  private csp: CSPModule
  private ai: AIModule
  private plugins: PluginManager
  private metrics: MetricsCollector

  constructor(
    contextManager: ContextManager,
    headers: HeadersModule,
    csp: CSPModule,
    ai: AIModule,
    plugins: PluginManager,
    metrics: MetricsCollector
  ) {
    this.contextManager = contextManager
    this.headers = headers
    this.csp = csp
    this.ai = ai
    this.plugins = plugins
    this.metrics = metrics
  }

  async handle(req: any, res: any, next: any): Promise<void> {
    const startTime = Date.now()
    const context = this.contextManager.create(req)

    try {
      await this.headers.apply(req, res)
      await this.csp.apply(req, res)
      
      const analysis = await this.ai.analyze(req, context)

      if (analysis && analysis.threats && analysis.threats.length > 0) {
        this.metrics.recordThreats(analysis.threats)
        
        const critical = analysis.threats.filter((t: any) => 
          t.severity === 'critical' || t.severity === 'high'
        )
        
        if (critical.length > 0) {
          res.status(403).json({
            error: 'Request blocked due to security threat',
            threats: critical.map((t: any) => ({
              type: t.type,
              severity: t.severity,
              confidence: t.confidence
            })),
            timestamp: new Date().toISOString()
          })
          return
        }
      }

      await this.plugins.execute(req, res, context)

      const duration = Date.now() - startTime
      this.metrics.recordRequest(req, res, duration)

      next()
    } catch (error) {
      this.metrics.recordError(error)
      next(error)
    }
  }
}
