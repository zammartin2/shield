// ============================================
// FAB SHIELD — Главный класс (ИСПРАВЛЕННАЯ ВЕРСИЯ)
// ============================================

import { ConfigManager } from './ConfigManager'
import { HeadersModule } from '../modules/headers/HeadersModule'
import { CSPModule } from '../modules/csp/CSPModule'
import { AIModule } from '../modules/ai/AIModule'
import { PluginManager } from '../modules/plugins/PluginManager'
import { MetricsCollector } from '../modules/metrics/MetricsCollector'
import { RateLimiter } from '../modules/rate-limit/RateLimiter'
import { ContextManager } from './ContextManager'
import { ShieldConfig, Plugin, Threat } from '../types'
import { EventEmitter } from 'events'
// ✅ ИСПРАВЛЕНО: Убираем импорт logger, используем console напрямую
// import { logger } from '../utils/logger'  // ← УДАЛЕНО

export class FABShield extends EventEmitter {
  private config: ConfigManager
  private headers: HeadersModule
  private csp: CSPModule
  private ai: AIModule
  private plugins: PluginManager
  private metrics: MetricsCollector
  private contextManager: ContextManager
  private startTime: number
  private active: boolean = true
  private version: string = '1.1.0'
  private rateLimiter: RateLimiter | null = null
  private logger: any
  private static instance: FABShield | null = null

  constructor(config: Partial<ShieldConfig> = {}) {
    super()
    
    this.startTime = Date.now()
    this.config = new ConfigManager(config)
    this.contextManager = new ContextManager()
    
    this.headers = new HeadersModule(this.config)
    this.csp = new CSPModule(this.config)
    this.ai = new AIModule(this.config)
    this.plugins = new PluginManager(this.config)
    this.metrics = new MetricsCollector()
    
    this.setupRateLimiter()
    this.setupLogger()
    this.setupEventListeners()
    
    this.start()
    
    // Singleton pattern
    FABShield.instance = this
  }

  /**
   * Получить экземпляр FABShield (Singleton)
   */
  static getInstance(): FABShield | null {
    return FABShield.instance
  }

  /**
   * Основной middleware для Express/Fastify/Koa
   */
  middleware() {
    return async (req: any, res: any, next: any) => {
      const startTime = Date.now()
      const requestId = this.generateRequestId()
      
      req.id = requestId
      req.shieldStartTime = startTime

      if (!this.active) {
        return next()
      }

      try {
        this.logger?.debug(`📝 ${req.method} ${req.path} [${requestId}]`)

        // === RATE LIMITING ===
        const rateLimitConfig = this.config.get().rateLimit
        if (rateLimitConfig?.enabled && this.rateLimiter) {
          const rateResult = await this.rateLimiter.check(req)
          if (rateResult.blocked) {
            this.emit('rateLimit:exceeded', { req, requestId, ...rateResult })
            return res.status(429).json({
              error: 'Too many requests',
              requestId,
              retryAfter: rateResult.retryAfter,
              limit: rateResult.limit,
              remaining: 0,
              reset: rateResult.reset || new Date(Date.now() + rateResult.windowMs).toISOString()
            })
          }
        }
        
        // === HEADERS ===
        await this.headers.apply(req, res)
        
        // === CSP ===
        await this.csp.apply(req, res)
        
        // === AI ANALYSIS ===
        const analysis = await this.ai.analyze(req)
        
        if (analysis && analysis.threats && analysis.threats.length > 0) {
          this.metrics.recordThreats(analysis.threats)
          
          const critical = analysis.threats.filter((t: Threat) => 
            t.severity === 'critical' || t.severity === 'high'
          )
          
          if (critical.length > 0) {
            this.emit('threat:detected', { 
              threats: critical, 
              requestId,
              req: { method: req.method, path: req.path, ip: req.ip }
            })
            
            this.logger?.warn(`🚨 Threat blocked: ${critical.map((t: Threat) => t.type).join(', ')} [${requestId}]`)
            
            return res.status(403).json({
              error: 'Request blocked due to security threat',
              requestId,
              threatScore: analysis.threatScore || 0.9,
              threats: critical.map((t: Threat) => ({
                type: t.type,
                severity: t.severity,
                confidence: t.confidence || 0.9
              })),
              timestamp: new Date().toISOString()
            })
          }
        }
        
        // === PLUGINS ===
        const pluginContext = this.createPluginContext(req, res)
        await this.plugins.execute(req, res, pluginContext)
        
        // === METRICS ===
        const duration = Date.now() - startTime
        this.metrics.recordRequest(req, res, duration)
        
        // === RESPONSE HEADERS ===
        res.setHeader('X-Request-ID', requestId)
        res.setHeader('X-Shield-Version', this.version)
        res.setHeader('X-Shield-Status', 'active')
        
        this.emit('request:processed', { 
          req, 
          res, 
          duration, 
          requestId,
          threatsDetected: analysis?.threats?.length || 0
        })
        
        this.logger?.info(`✅ ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) [${requestId}]`)
        
        next()
        
      } catch (error: any) {
        this.emit('error', error, req, res)
        this.metrics.recordError(error)
        this.logger?.error(`❌ Error: ${error.message} [${requestId}]`, error)
        
        if (error.name === 'MiddlewareError') {
          next(error)
        } else {
          res.status(500).json({
            error: 'Internal server error',
            requestId,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
  }

  /**
   * Защита запроса (для Fastify)
   * ✅ ИСПРАВЛЕНО: Правильный Promise с void
   */
  async protect(req: any, res: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const middleware = this.middleware()
      middleware(req, res, (err?: any) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * Защита для Koa
   * ✅ ИСПРАВЛЕНО: Правильный Promise с void
   */
  async koa(ctx: any, next: any): Promise<void> {
    const req = ctx.request
    const res = ctx.response
    
    return new Promise<void>((resolve, reject) => {
      const middleware = this.middleware()
      middleware(req, res, (err?: any) => {
        if (err) reject(err)
        else resolve()
      })
    }).then(() => next()).catch((err) => next(err))
  }

  /**
   * Получение метрик
   */
  getMetrics(): any {
    return this.metrics.getMetrics()
  }

  /**
   * Получение конфигурации
   */
  getConfig(): ShieldConfig {
    return this.config.get()
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(config: Partial<ShieldConfig>): void {
    const oldConfig = this.config.get()
    this.config.update(config)
    this.setupRateLimiter()
    this.emit('config:updated', { old: oldConfig, new: this.config.get() })
    this.logger?.info('⚙️ Config updated')
  }

  /**
   * Получение версии
   */
  getVersion(): string {
    return this.version
  }

  /**
   * Проверка активности
   */
  isActive(): boolean {
    return this.active
  }

  /**
   * Запуск
   */
  start(): void {
    if (this.active) return
    this.active = true
    this.emit('started')
    this.logger?.info('🛡️ FAB Shield started')
  }

  /**
   * Остановка
   */
  stop(): void {
    if (!this.active) return
    this.active = false
    this.emit('stopped')
    this.logger?.info('🛑 FAB Shield stopped')
  }

  /**
   * Регистрация плагина
   */
  registerPlugin(plugin: Plugin): void {
    this.plugins.register(plugin)
    this.emit('plugin:registered', { name: plugin.name, version: plugin.version })
    this.logger?.info(`🔌 Plugin registered: ${plugin.name} v${plugin.version || '1.0.0'}`)
  }

  /**
   * Удаление плагина
   */
  unregisterPlugin(name: string): void {
    this.plugins.unregister(name)
    this.emit('plugin:unregistered', { name })
    this.logger?.info(`🗑️ Plugin unregistered: ${name}`)
  }

  /**
   * Экспорт метрик
   */
  exportMetrics(format: 'json' | 'prometheus' | 'csv' = 'json'): string {
    return this.metrics.export(format)
  }

  /**
   * Генерация отчета
   */
  async generateReport(options?: any): Promise<any> {
    const metrics = this.metrics.getMetrics()
    return {
      id: this.generateRequestId(),
      generatedAt: new Date().toISOString(),
      period: options?.period || {
        from: new Date(this.startTime).toISOString(),
        to: new Date().toISOString()
      },
      summary: {
        status: this.active ? 'active' : 'inactive',
        uptime: Date.now() - this.startTime,
        totalRequests: metrics.totalRequests || 0,
        threatsBlocked: metrics.threatsBlocked || 0,
        errors: metrics.errors || 0,
        avgResponseTime: Math.round(metrics.avgResponseTime || 0)
      },
      plugins: this.plugins.getPlugins().map((p: string) => ({
        name: p,
        version: '1.0.0',
        enabled: true
      }))
    }
  }

  /**
   * Получение статуса
   */
  getStatus(): any {
    const config = this.config.get()
    return {
      status: this.active ? 'ok' : 'inactive',
      version: this.version,
      uptime: Date.now() - this.startTime,
      active: this.active,
      modules: {
        headers: config.headers?.enabled !== false,
        csp: config.csp?.enabled !== false,
        ai: config.ai?.enabled !== false,
        rateLimit: config.rateLimit?.enabled !== false,
        monitoring: config.monitoring?.enabled !== false
      },
      plugins: this.plugins.getPlugins(),
      metrics: this.metrics.getMetrics()
    }
  }

  /**
   * Сброс метрик
   */
  reset(): void {
    this.metrics.reset()
    this.startTime = Date.now()
    this.emit('reset')
    this.logger?.info('🔄 FAB Shield reset')
  }

  /**
   * Получение контекстного менеджера
   */
  getContextManager(): ContextManager {
    return this.contextManager
  }

  /**
   * Получение плагин менеджера
   */
  getPluginManager(): PluginManager {
    return this.plugins
  }

  /**
   * Получение AI модуля
   */
  getAIModule(): AIModule {
    return this.ai
  }

  /**
   * Получение Rate Limiter
   */
  getRateLimiter(): RateLimiter | null {
    return this.rateLimiter
  }

  private createPluginContext(req: any, _res: any): any {
    return {
      getConfig: (name?: string) => {
        if (name) {
          const config = this.config.get()
          return (config as any)[name]
        }
        return this.config.get()
      },
      setConfig: (config: any) => {
        this.config.update(config)
      },
      getShield: () => this,
      getMetrics: () => this.metrics.getMetrics(),
      getServer: () => req.app || req.server,
      getLogger: () => this.logger || console,
      log: (level: string, message: string, data?: any) => {
        const logFn = this.logger?.[level] || console.log
        logFn(message, data || '')
      },
      getStorage: () => ({
        get: (key: string) => {
          const store = (req as any).__shield_store || new Map()
          return Promise.resolve(store.get(key))
        },
        set: (key: string, value: any) => {
          const store = (req as any).__shield_store || new Map()
          store.set(key, value)
          ;(req as any).__shield_store = store
          return Promise.resolve()
        },
        delete: (key: string) => {
          const store = (req as any).__shield_store || new Map()
          store.delete(key)
          return Promise.resolve()
        },
        clear: () => {
          ;(req as any).__shield_store = new Map()
          return Promise.resolve()
        },
        getAll: () => {
          const store = (req as any).__shield_store || new Map()
          return Promise.resolve(Object.fromEntries(store))
        }
      }),
      set: (key: string, value: any) => {
        (req as any)[key] = value
      },
      get: (key: string) => {
        return (req as any)[key]
      },
      delete: (key: string) => {
        delete (req as any)[key]
      },
      registerRoutes: (prefix: string, _router: any) => {
        if (req.app) {
          this.logger?.info(`📌 Routes registered at ${prefix}`)
        }
      },
      on: (event: string, handler: (...args: any[]) => void) => {
        this.on(event, handler)
      },
      emit: (event: string, data: any) => {
        this.emit(event, data)
      },
      getUtils: () => ({
        generateId: this.generateRequestId.bind(this),
        getTimestamp: () => new Date().toISOString(),
        isIP: (ip: string) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip),
        isURL: (url: string) => {
          try { new URL(url); return true } catch { return false }
        },
        isEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      }),
      getTimestamp: () => new Date(),
      generateId: this.generateRequestId.bind(this)
    }
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  private setupRateLimiter(): void {
    const config = this.config.get()
    if (config.rateLimit?.enabled) {
      this.rateLimiter = new RateLimiter(this.config)
      this.logger?.info('🚦 Rate Limiter initialized')
    } else {
      this.rateLimiter = null
      this.logger?.info('🚦 Rate Limiter disabled')
    }
  }

  private setupLogger(): void {
    const config = this.config.get().logging
    this.logger = {
      level: config?.level || 'info',
      debug: (msg: any, ...args: any[]) => {
        // Всегда выводим debug для тестов
        if (process.env.NODE_ENV === 'test' || this.logger?.level === 'debug') {
          console.debug('🔍', msg, ...args)
        }
      },
      info: (msg: any, ...args: any[]) => console.log('ℹ️', msg, ...args),
      warn: (msg: any, ...args: any[]) => console.warn('⚠️', msg, ...args),
      error: (msg: any, ...args: any[]) => console.error('❌', msg, ...args)
    }
  }

  private setupEventListeners(): void {
    this.on('error', (error: any) => {
      this.logger?.error(`FAB Shield error: ${error.message}`, error)
    })
    
    this.on('request:processed', ({ req, res, duration, requestId, threatsDetected }: any) => {
      const logLevel = threatsDetected > 0 ? 'warn' : 'debug'
      const logFn = this.logger?.[logLevel] || console.log
      logFn(
        `📊 ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) [${requestId}]${threatsDetected > 0 ? ` ⚠️ ${threatsDetected} threats` : ''}`
      )
    })
    
    this.on('threat:detected', ({ threats, requestId, req }: any) => {
      const threatTypes = threats.map((t: Threat) => t.type).join(', ')
      this.logger?.warn(`🚨 Threats detected: ${threatTypes} [${requestId}] from ${req.ip}`)
      this.emit('alert', {
        type: 'threat',
        severity: 'high',
        data: { threats, requestId, req },
        timestamp: new Date().toISOString()
      })
    })
    
    this.on('rateLimit:exceeded', ({ req, requestId, limit, retryAfter }: any) => {
      this.logger?.warn(`⚠️ Rate limit exceeded: ${req.ip} [${requestId}]`)
      this.emit('alert', {
        type: 'rateLimit',
        severity: 'medium',
        data: { ip: req.ip, path: req.path, limit, retryAfter },
        timestamp: new Date().toISOString()
      })
    })
    
    this.on('alert', (alert: any) => {
      this.logger?.info(`🔔 Alert: ${alert.type} - ${alert.severity}`)
    })
    
    this.on('config:updated', (_data: any) => {
      this.logger?.info(`⚙️ Config updated`)
    })
    
    this.on('plugin:registered', ({ name, version }: any) => {
      this.logger?.info(`🔌 Plugin registered: ${name} v${version || '1.0.0'}`)
    })
  }

  /**
   * Уничтожение экземпляра
   */
  destroy(): void {
    this.stop()
    this.removeAllListeners()
    this.metrics.reset()
    if (this.rateLimiter) {
      this.rateLimiter.resetAll()
    }
    FABShield.instance = null
    this.logger?.info('💀 FAB Shield destroyed')
  }

  /**
   * Получение статистики контекстов
   */
  getContextStats(): any {
    return this.contextManager.getStats()
  }
}

export default FABShield