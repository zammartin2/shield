// ============================================
// AI MODULE — Обертка для AIEngine
// ============================================

import { ConfigManager } from '../../core/ConfigManager'
import { AIEngine } from './AIEngine'

export class AIModule {
  private engine: AIEngine
  private config: ConfigManager

  constructor(config: ConfigManager) {
    this.config = config
    this.engine = new AIEngine(config)
  }

  async analyze(req: any, context?: any): Promise<any> {
    const aiConfig = this.config.getModule('ai')
    if (!aiConfig?.enabled) {
      return {
        threats: [],
        isThreat: false,
        threatScore: 0,
        confidence: 1,
        analysis: {
          userBehavior: { riskScore: 0 },
          contentAnalysis: { hasSQL: false, hasXSS: false },
          patternAnalysis: { score: 0 }
        },
        recommendations: []
      }
    }

    try {
      return await this.engine.analyze(req, context)
    } catch (error) {
      console.error('AI Analysis error:', error)
      return {
        threats: [],
        isThreat: false,
        threatScore: 0,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async train(data?: any): Promise<void> {
    const aiConfig = this.config.getModule('ai')
    if (!aiConfig?.enabled) return
    await this.engine.train(data)
  }

  getMetrics(): any {
    return {
      status: 'active',
      models: ['xss', 'sql_injection', 'anomaly'],
      accuracy: 0.95,
      analyses: 0
    }
  }
}
