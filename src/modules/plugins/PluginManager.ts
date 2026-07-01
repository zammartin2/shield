// ============================================
// PLUGIN MANAGER — Полная реализация
// ============================================

import { Plugin, PluginContext } from '../../types'
import { EventEmitter } from 'events'

export class PluginManager extends EventEmitter {
  private plugins: Map<string, Plugin> = new Map()
  private pluginStatus: Map<string, { enabled: boolean; lastRun: Date; errors: number }> = new Map()
  private config: any
  private _storage: Record<string, any> = {}

  constructor(config: any) {
    super()
    this.config = config
    this.loadPlugins()
  }

  private loadPlugins(): void {
    if (this.config.plugins && Array.isArray(this.config.plugins)) {
      for (const plugin of this.config.plugins) {
        try {
          this.register(plugin)
        } catch (error) {
          console.error(`❌ Failed to load plugin ${plugin.name}:`, error)
        }
      }
    }
  }

  register(plugin: Plugin): void {
    this.validate(plugin)

    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`)
    }

    this.plugins.set(plugin.name, plugin)
    this.pluginStatus.set(plugin.name, {
      enabled: plugin.enabled !== false,
      lastRun: new Date(),
      errors: 0
    })

    if (plugin.onInit) {
      const context = this.createContext(plugin)
      const result = plugin.onInit(context)
      if (result && typeof result.catch === 'function') {
        result.catch((error: Error) => {
          console.error(`❌ Plugin ${plugin.name} init error:`, error)
          this.emit('plugin:error', { plugin: plugin.name, error })
        })
      }
    }

    this.emit('plugin:registered', plugin)
    console.log(`✅ Plugin registered: ${plugin.name} v${plugin.version}`)
  }

  unregister(name: string): void {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`)
    }

    if (plugin.onDestroy) {
      const context = this.createContext(plugin)
      const result = plugin.onDestroy(context)
      if (result && typeof result.catch === 'function') {
        result.catch((error: Error) => {
          console.error(`❌ Plugin ${name} destroy error:`, error)
        })
      }
    }

    this.plugins.delete(name)
    this.pluginStatus.delete(name)
    this.emit('plugin:unregistered', { name })
    console.log(`🗑️ Plugin unregistered: ${name}`)
  }

  async execute(req: any, res: any, context: any): Promise<void> {
    for (const [name, plugin] of this.plugins) {
      const status = this.pluginStatus.get(name)
      if (!status || !status.enabled) continue

      try {
        if (plugin.onRequest) {
          const result = await plugin.onRequest(req, context)
          if (result && result.block) {
            res.status(result.status || 403).json({
              error: result.message || 'Request blocked by plugin',
              reason: result.reason,
              plugin: name
            })
            return
          }
        }

        if (plugin.middleware) {
          await new Promise<void>((resolve, reject) => {
            try {
              const middlewareFn = plugin.middleware
              if (middlewareFn) {
                middlewareFn(req, res, (err?: any) => {
                  if (err) reject(err)
                  else resolve()
                })
              } else {
                resolve()
              }
            } catch (error) {
              reject(error)
            }
          })
        }

        status.lastRun = new Date()
        status.errors = 0

      } catch (error) {
        status.errors++
        this.emit('plugin:error', { plugin: name, error })

        if (plugin.onError) {
          await plugin.onError(error as Error, context)
        }

        console.error(`❌ Plugin ${name} error:`, error)
      }
    }
  }

  enable(name: string): void {
    const status = this.pluginStatus.get(name)
    if (!status) {
      throw new Error(`Plugin ${name} not found`)
    }
    status.enabled = true
    this.emit('plugin:enabled', { name })
    console.log(`✅ Plugin enabled: ${name}`)
  }

  disable(name: string): void {
    const status = this.pluginStatus.get(name)
    if (!status) {
      throw new Error(`Plugin ${name} not found`)
    }
    status.enabled = false
    this.emit('plugin:disabled', { name })
    console.log(`⛔ Plugin disabled: ${name}`)
  }

  getStatus(name: string): { enabled: boolean; lastRun: Date; errors: number } | undefined {
    return this.pluginStatus.get(name)
  }

  getPlugins(): string[] {
    return Array.from(this.plugins.keys())
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  getActivePlugins(): string[] {
    const active: string[] = []
    for (const [name, status] of this.pluginStatus) {
      if (status.enabled) {
        active.push(name)
      }
    }
    return active
  }

  getMetrics(): any {
    const metrics = {
      total: this.plugins.size,
      active: 0,
      disabled: 0,
      errors: 0,
      plugins: {} as any
    }

    for (const [name, status] of this.pluginStatus) {
      if (status.enabled) {
        metrics.active++
      } else {
        metrics.disabled++
      }
      metrics.errors += status.errors
      metrics.plugins[name] = {
        enabled: status.enabled,
        errors: status.errors,
        lastRun: status.lastRun
      }
    }

    return metrics
  }

  private validate(plugin: Plugin): void {
    if (!plugin.name) {
      throw new Error('Plugin must have a name')
    }

    if (!plugin.version) {
      throw new Error('Plugin must have a version')
    }

    if (!/^[a-z0-9-]+$/.test(plugin.name)) {
      throw new Error('Plugin name must be in kebab-case')
    }

    if (!/^\d+\.\d+\.\d+$/.test(plugin.version)) {
      throw new Error('Plugin version must be in semver format')
    }

    if (!plugin.middleware && !plugin.onRequest && !plugin.onResponse) {
      throw new Error('Plugin must have at least one handler (middleware, onRequest, or onResponse)')
    }
  }

  private createContext(plugin: Plugin): PluginContext {
    return {
      getConfig: (name?: string) => {
        if (name) {
          return this.config[name] || plugin.config?.[name]
        }
        return plugin.config || {}
      },
      setConfig: (config: any) => {
        this.config = { ...this.config, ...config }
      },
      getShield: () => {
        return {
          getVersion: () => '1.0.0',
          isActive: () => true,
          getMetrics: () => ({}),
          getConfig: () => this.config
        }
      },
      getMetrics: () => ({}),
      getServer: () => ({}),
      getLogger: () => ({
        debug: (msg: string, data?: any) => console.debug(`[${plugin.name}]`, msg, data),
        info: (msg: string, data?: any) => console.log(`[${plugin.name}]`, msg, data),
        warn: (msg: string, data?: any) => console.warn(`[${plugin.name}]`, msg, data),
        error: (msg: string, data?: any) => console.error(`[${plugin.name}]`, msg, data)
      }),
      log: (_level: string, message: string, data?: any) => {
        console.log(`[${plugin.name}]`, message, data || '')
      },
      getStorage: () => ({
        get: async (key: string) => {
          return this._storage[key]
        },
        set: async (key: string, value: any) => {
          this._storage[key] = value
        },
        delete: async (key: string) => {
          delete this._storage[key]
        },
        clear: async () => {
          this._storage = {}
        },
        getAll: async () => {
          return { ...this._storage }
        }
      }),
      set: (key: string, value: any) => {
        this._storage[key] = value
      },
      get: (key: string) => {
        return this._storage[key]
      },
      delete: (key: string) => {
        delete this._storage[key]
      },
      registerRoutes: (prefix: string, _router: any) => {
        console.log(`📌 Routes registered at ${prefix}`)
      },
      on: (event: string, handler: (...args: any[]) => void) => {
        this.on(event, handler)
      },
      emit: (event: string, data: any) => {
        this.emit(event, data)
      },
      getUtils: () => ({
        generateId: () => `plugin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        getTimestamp: () => new Date().toISOString(),
        isIP: (ip: string) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip),
        isURL: (url: string) => {
          try { new URL(url); return true } catch { return false }
        }
      }),
      getTimestamp: () => new Date(),
      generateId: () => `plugin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
  }
}
