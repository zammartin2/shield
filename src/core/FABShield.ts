// ============================================
// FAB SHIELD — Main class
// ============================================

import { ConfigManager } from './ConfigManager'
import { HeadersModule } from '../modules/headers/HeadersModule'
import { CSPModule } from '../modules/csp/CSPModule'
import { AIModule } from '../modules/ai/AIModule'
import { PluginManager } from '../modules/plugins/PluginManager'
import { MetricsCollector } from '../modules/metrics/MetricsCollector'
import { RateLimiter } from '../modules/rate-limit/RateLimiter'
import { ContextManager } from './ContextManager'
import { ShieldConfig, Plugin } from '../types'
import { EventEmitter } from 'events'

/**
 * Package version — must match package.json.
 * Kept as a constant because reading it at runtime breaks under ESM bundling
 * (no __dirname) and can be stripped by rollup.
 */
const SHIELD_VERSION = '1.4.0'

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
  private version: string = SHIELD_VERSION
  private rateLimiter: RateLimiter | null = null
  private logger: {
    level: string
    debug: (msg: any, ...args: any[]) => void
    info: (msg: any, ...args: any[]) => void
    warn: (msg: any, ...args: any[]) => void
    error: (msg: any, ...args: any[]) => void
  }

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

    this.logger = this.createLogger()
    this.setupRateLimiter()
    this.setupEventListeners()

    // Singleton: only claim the slot if it's empty.
    // Overwriting every time is a footgun — two instances would silently
    // steal each other's getInstance() and break test isolation.
    if (!FABShield.instance) {
      FABShield.instance = this
    }
  }

  /**
   * Returns the first-created FABShield instance, or null.
   * Prefer passing the instance explicitly — singletons hurt testability.
   */
  static getInstance(): FABShield | null {
    return FABShield.instance
  }

  /**
   * Main middleware for Express / Fastify / Koa (Express-style).
   */
  middleware() {
    return async (req: any, res: any, next: any) => {
      const startTime = Date.now()
      const requestId = this.generateRequestId()

      req.id = requestId
      req.shieldStartTime = startTime

      // Disabled shield must not touch the response at all.
      if (!this.active) {
        return next()
      }

      // Active shield: attach correlation headers before any early return
      // (429/403/500), so clients can always log-match.
      if (!res.headersSent) {
        res.setHeader('X-Request-ID', requestId)
        res.setHeader('X-Shield-Version', this.version)
        res.setHeader('X-Shield-Status', 'active')
      }

      try {
        this.logger.debug(`📝 ${req.method} ${req.path} [${requestId}]`)

        // === RATE LIMITING ===
        const rateLimitConfig = this.config.get().rateLimit
        if (rateLimitConfig?.enabled && this.rateLimiter) {
          const rateResult = await this.rateLimiter.check(req)
          if (rateResult.blocked) {
            this.emit('rateLimit:exceeded', { req, requestId, ...rateResult })
            if (!res.headersSent) {
              return res.status(429).json({
                error: 'Too many requests',
                requestId,
                retryAfter: rateResult.retryAfter,
                limit: rateResult.limit,
                remaining: 0,
                reset:
                  rateResult.reset ||
                  new Date(Date.now() + rateResult.windowMs).toISOString(),
              })
            }
            return
          }
        }

        // === SECURITY HEADERS ===
        await this.headers.apply(req, res)

        // === CSP ===
        await this.csp.apply(req, res)

        // === AI / PATTERN ANALYSIS ===
        const analysis = await this.ai.analyze(req)

        if (analysis && Array.isArray(analysis.threats) && analysis.threats.length > 0) {
          this.metrics.recordThreats(analysis.threats)

          const critical = analysis.threats.filter(
            (t: any) => t.severity === 'critical' || t.severity === 'high'
          )

          if (critical.length > 0) {
            this.emit('threat:detected', {
              threats: critical,
              requestId,
              req: { method: req.method, path: req.path, ip: req.ip },
            })

            this.logger.warn(
              `🚨 Threat blocked: ${critical
                .map((t: any) => t.type)
                .join(', ')} [${requestId}]`
            )

            if (!res.headersSent) {
              return res.status(403).json({
                error: 'Request blocked due to security threat',
                requestId,
                threatScore: analysis.threatScore || 0.9,
                threats: critical.map((t: any) => ({
                  type: t.type,
                  severity: t.severity,
                  confidence: t.confidence || 0.9,
                })),
                timestamp: new Date().toISOString(),
              })
            }
            return
          }
        }

        // === PLUGINS ===
        const pluginContext = this.createPluginContext(req)
        await this.plugins.execute(req, res, pluginContext)

        // Plugins may have already answered the request; don't keep going.
        if (res.headersSent) {
          return
        }

        // === METRICS ===
        const duration = Date.now() - startTime
        this.metrics.recordRequest(req, res, duration)

        this.emit('request:processed', {
          req,
          res,
          duration,
          requestId,
          threatsDetected: analysis?.threats?.length || 0,
        })

        this.logger.info(
          `✅ ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) [${requestId}]`
        )

        next()
      } catch (error: any) {
        this.emit('error', error, req, res)
        this.metrics.recordError(error)
        this.logger.error(`❌ Error: ${error?.message || error} [${requestId}]`, error)

        // If headers were already sent by a downstream handler, let
        // Express handle it — we must not write a second response.
        if (res.headersSent) {
          return next(error)
        }

        if (error?.name === 'MiddlewareError') {
          return next(error)
        }

        return res.status(500).json({
          error: 'Internal server error',
          requestId,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  /**
   * Guard for Fastify hooks — resolves when middleware calls next().
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
   * Guard for Koa.
   */
  async koa(ctx: any, next: any): Promise<void> {
    const req = ctx.request
    const res = ctx.response

    try {
      await new Promise<void>((resolve, reject) => {
        const middleware = this.middleware()
        middleware(req, res, (err?: any) => {
          if (err) reject(err)
          else resolve()
        })
      })
      await next()
    } catch (err) {
      await next(err)
    }
  }

  getMetrics(): any {
    return this.metrics.getMetrics()
  }

  getConfig(): ShieldConfig {
    return this.config.get()
  }

  /**
   * Update config at runtime.
   * Rate-limiter store is preserved — only toggling enabled creates/destroys it.
   */
  updateConfig(config: Partial<ShieldConfig>): void {
    const oldConfig = this.config.get()
    this.config.update(config)
    this.setupRateLimiter()
    this.emit('config:updated', { old: oldConfig, new: this.config.get() })
    this.logger.info('⚙️ Config updated')
  }

  getVersion(): string {
    return this.version
  }

  isActive(): boolean {
    return this.active
  }

  start(): void {
    if (this.active) return
    this.active = true
    this.emit('started')
    this.logger.info('🛡️ FAB Shield started')
  }

  stop(): void {
    if (!this.active) return
    this.active = false
    this.emit('stopped')
    this.logger.info('🛑 FAB Shield stopped')
  }

  registerPlugin(plugin: Plugin): void {
    this.plugins.register(plugin)
    this.emit('plugin:registered', { name: plugin.name, version: plugin.version })
    this.logger.info(`🔌 Plugin registered: ${plugin.name} v${plugin.version || '1.0.0'}`)
  }

  unregisterPlugin(name: string): void {
    this.plugins.unregister(name)
    this.emit('plugin:unregistered', { name })
    this.logger.info(`🗑️ Plugin unregistered: ${name}`)
  }

  exportMetrics(format: 'json' | 'prometheus' | 'csv' = 'json'): string {
    return this.metrics.export(format)
  }

  async generateReport(options?: any): Promise<any> {
    const metrics = this.metrics.getMetrics()
    return {
      id: this.generateRequestId(),
      generatedAt: new Date().toISOString(),
      period: options?.period || {
        from: new Date(this.startTime).toISOString(),
        to: new Date().toISOString(),
      },
      summary: {
        status: this.active ? 'active' : 'inactive',
        uptime: Date.now() - this.startTime,
        totalRequests: metrics.totalRequests || 0,
        threatsBlocked: metrics.threatsBlocked || 0,
        errors: metrics.errors || 0,
        avgResponseTime: Math.round(metrics.avgResponseTime || 0),
      },
      plugins: this.plugins.getPlugins().map((name: string) => {
        const p = this.plugins.getPlugin(name)
        return {
          name,
          version: p?.version || '0.0.0',
          enabled: true,
        }
      }),
    }
  }

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
        monitoring: config.monitoring?.enabled !== false,
      },
      plugins: this.plugins.getPlugins(),
      metrics: this.metrics.getMetrics(),
    }
  }

  reset(): void {
    this.metrics.reset()
    this.startTime = Date.now()
    this.emit('reset')
    this.logger.info('🔄 FAB Shield reset')
  }

  getContextManager(): ContextManager {
    return this.contextManager
  }

  getPluginManager(): PluginManager {
    return this.plugins
  }

  getAIModule(): AIModule {
    return this.ai
  }

  getRateLimiter(): RateLimiter | null {
    return this.rateLimiter
  }

  /**
   * Public access to the headers module.
   * Used by `middleware/headers.middleware.ts`.
   */
  getHeadersModule(): HeadersModule {
    return this.headers
  }

  /**
   * Public access to the CSP module.
   */
  getCSPModule(): CSPModule {
    return this.csp
  }

  destroy(): void {
    this.stop()
    this.removeAllListeners()
    this.metrics.reset()
    if (this.rateLimiter) {
      this.rateLimiter.resetAll()
      this.rateLimiter = null
    }
    if (FABShield.instance === this) {
      FABShield.instance = null
    }
    this.logger.info('💀 FAB Shield destroyed')
  }

  getContextStats(): any {
    return this.contextManager.getStats()
  }

  // ============================================
  // PRIVATE
  // ============================================

  private createPluginContext(req: any): any {
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
      getLogger: () => this.logger,
      log: (level: string, message: string, data?: any) => {
        const logFn = (this.logger as any)[level] || this.logger.info
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
          (req as any).__shield_store = new Map()
          return Promise.resolve()
        },
        getAll: () => {
          const store = (req as any).__shield_store || new Map()
          return Promise.resolve(Object.fromEntries(store))
        },
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
          this.logger.info(`📌 Routes registered at ${prefix}`)
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
          try {
            new URL(url)
            return true
          } catch {
            return false
          }
        },
        isEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      }),
      getTimestamp: () => new Date(),
      generateId: this.generateRequestId.bind(this),
    }
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  private setupRateLimiter(): void {
    const enabled = this.config.get().rateLimit?.enabled === true

    if (enabled && !this.rateLimiter) {
      this.rateLimiter = new RateLimiter(this.config)
      this.logger.info('🚦 Rate Limiter initialized')
    } else if (!enabled && this.rateLimiter) {
      this.rateLimiter.resetAll()
      this.rateLimiter = null
      this.logger.info('🚦 Rate Limiter disabled')
    }
    // enabled && this.rateLimiter → keep the same instance so the store survives.
  }

  private createLogger(): FABShield['logger'] {
    const config = this.config.get().logging
    const level = config?.level || 'info'
    const debugEnabled = level === 'debug' || process.env.NODE_ENV === 'test'

    return {
      level,
      debug: (msg: any, ...args: any[]) => {
        if (debugEnabled) console.debug('🔍', msg, ...args)
      },
      info: (msg: any, ...args: any[]) => console.log('ℹ️', msg, ...args),
      warn: (msg: any, ...args: any[]) => console.warn('⚠️', msg, ...args),
      error: (msg: any, ...args: any[]) => console.error('❌', msg, ...args),
    }
  }

  private setupEventListeners(): void {
    this.on('error', (error: any) => {
      this.logger.error(`FAB Shield error: ${error?.message || error}`, error)
    })

    this.on(
      'request:processed',
      ({ req, res, duration, requestId, threatsDetected }: any) => {
        const level = threatsDetected > 0 ? 'warn' : 'debug'
        const logFn = (this.logger as any)[level] || this.logger.info
        logFn(
          `📊 ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) [${requestId}]` +
            (threatsDetected > 0 ? ` ⚠️ ${threatsDetected} threats` : '')
        )
      }
    )

    this.on('threat:detected', ({ threats, requestId, req }: any) => {
      const threatTypes = threats.map((t: any) => t.type).join(', ')
      this.logger.warn(
        `🚨 Threats detected: ${threatTypes} [${requestId}] from ${req.ip}`
      )
      this.emit('alert', {
        type: 'threat',
        severity: 'high',
        data: { threats, requestId, req },
        timestamp: new Date().toISOString(),
      })
    })

    this.on('rateLimit:exceeded', ({ req, requestId, limit, retryAfter }: any) => {
      this.logger.warn(`⚠️ Rate limit exceeded: ${req.ip} [${requestId}]`)
      this.emit('alert', {
        type: 'rateLimit',
        severity: 'medium',
        data: { ip: req.ip, path: req.path, limit, retryAfter },
        timestamp: new Date().toISOString(),
      })
    })

    this.on('alert', (alert: any) => {
      this.logger.info(`🔔 Alert: ${alert.type} - ${alert.severity}`)
    })

    this.on('config:updated', () => {
      this.logger.info('⚙️ Config updated')
    })

    // NOTE: PluginManager emits its own plugin:registered.
    // Listeners here are for user-facing hooks only.
    this.on('plugin:registered', ({ name, version }: any) => {
      this.logger.info(`🔌 Plugin registered: ${name} v${version || '1.0.0'}`)
    })
  }
}

export default FABShield