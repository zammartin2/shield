// ============================================
// RATE LIMITER — Управление ограничением запросов
// ============================================

import { ConfigManager } from '../../core/ConfigManager'

export class RateLimiter {
  private config: ConfigManager
  private store: Map<string, { count: number; resetTime: number }> = new Map()
  private defaultLimit: number = 100
  private defaultWindow: number = 60000

  constructor(config: ConfigManager) {
    this.config = config
    const rateLimitConfig = this.config.getModule('rateLimit')
    
    if (rateLimitConfig?.default) {
      this.defaultLimit = (rateLimitConfig.default as any).max || 100
      this.defaultWindow = (rateLimitConfig.default as any).windowMs || 60000
    }
  }

  async check(req: any): Promise<any> {
    const key = this.getKey(req)
    const now = Date.now()
    const limit = this.getLimit(req)
    const windowMs = this.getWindow(req)
    
    const data = this.store.get(key)
    
    if (!data) {
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return {
        blocked: false,
        limit,
        remaining: limit - 1,
        reset: new Date(now + windowMs).toISOString()
      }
    }
    
    if (now > data.resetTime) {
      data.count = 1
      data.resetTime = now + windowMs
      return {
        blocked: false,
        limit,
        remaining: limit - 1,
        reset: new Date(now + windowMs).toISOString()
      }
    }
    
    if (data.count >= limit) {
      return {
        blocked: true,
        limit,
        remaining: 0,
        retryAfter: Math.ceil((data.resetTime - now) / 1000),
        windowMs,
        reset: new Date(data.resetTime).toISOString()
      }
    }
    
    data.count++
    return {
      blocked: false,
      limit,
      remaining: limit - data.count,
      reset: new Date(data.resetTime).toISOString()
    }
  }

  private getKey(req: any): string {
    const rateLimitConfig = this.config.getModule('rateLimit')
    if (rateLimitConfig?.keyGenerator) {
      return rateLimitConfig.keyGenerator(req)
    }
    return req.ip || 'unknown'
  }

  private getLimit(req: any): number {
    const rateLimitConfig = this.config.getModule('rateLimit')
    if (!rateLimitConfig) return this.defaultLimit
    
    const path = req.path || req.url || ''
    
    if (rateLimitConfig.paths) {
      for (const [pattern, rule] of Object.entries(rateLimitConfig.paths)) {
        if (path.match(new RegExp(pattern.replace(/\*/g, '.*')))) {
          return (rule as any).max || this.defaultLimit
        }
      }
    }
    
    if (rateLimitConfig.roles && req.user?.role) {
      const roleRule = rateLimitConfig.roles[req.user.role]
      if (roleRule) {
        return (roleRule as any).max || this.defaultLimit
      }
    }
    
    return this.defaultLimit
  }

  private getWindow(req: any): number {
    const rateLimitConfig = this.config.getModule('rateLimit')
    if (!rateLimitConfig) return this.defaultWindow
    
    const path = req.path || req.url || ''
    
    if (rateLimitConfig.paths) {
      for (const [pattern, rule] of Object.entries(rateLimitConfig.paths)) {
        if (path.match(new RegExp(pattern.replace(/\*/g, '.*')))) {
          return (rule as any).windowMs || this.defaultWindow
        }
      }
    }
    
    if (rateLimitConfig.roles && req.user?.role) {
      const roleRule = rateLimitConfig.roles[req.user.role]
      if (roleRule) {
        return (roleRule as any).windowMs || this.defaultWindow
      }
    }
    
    return this.defaultWindow
  }

  reset(key: string): void {
    this.store.delete(key)
  }

  resetAll(): void {
    this.store.clear()
  }

  getStats(): any {
    return {
      totalKeys: this.store.size,
      keys: Array.from(this.store.keys()),
      defaultLimit: this.defaultLimit,
      defaultWindow: this.defaultWindow
    }
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.store) {
      if (now > data.resetTime) {
        this.store.delete(key)
      }
    }
  }
}
