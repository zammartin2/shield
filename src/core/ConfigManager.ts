// ============================================
// CONFIG MANAGER — Полная реализация
// ============================================

import { ShieldConfig, EnvMapping } from '../types/config.types'
import { defaultConfig } from '../types'
import { deepMerge, getByPath, setByPath, deleteByPath, hasByPath } from '../utils/object.util'
import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'

export class ConfigManager extends EventEmitter {
  private config: ShieldConfig
  private configPath?: string
  private watchers: Array<(config: ShieldConfig) => void> = []
  private envMapping: EnvMapping = {}
  private fileWatcher?: fs.FSWatcher

  constructor(config: Partial<ShieldConfig> = {}, options?: { configPath?: string; watch?: boolean }) {
    super()
    
    this.configPath = options?.configPath
    
    let fileConfig: Partial<ShieldConfig> = {}
    if (this.configPath && fs.existsSync(this.configPath)) {
      fileConfig = this.loadFromFile(this.configPath)
    }
    
    const envConfig = this.loadFromEnv()
    
    this.config = this.validate(
      deepMerge(defaultConfig, fileConfig, envConfig, config)
    )
    
    if (options?.watch && this.configPath) {
      this.watchFile()
    }
    
    this.emit('initialized', this.config)
  }

  get(): ShieldConfig {
    return this.config
  }

  getModule<T = any>(module: keyof ShieldConfig): T | undefined {
    return this.config[module] as T
  }

  getPath<T = any>(path: string, defaultValue?: T): T | undefined {
    const value = getByPath(this.config, path)
    return value !== undefined ? value : defaultValue
  }

  hasPath(path: string): boolean {
    return hasByPath(this.config, path)
  }

  isEnabled(module: keyof ShieldConfig): boolean {
    const mod = this.config[module]
    if (mod && typeof mod === 'object' && 'enabled' in mod) {
      return (mod as any).enabled === true
    }
    return false
  }

  isEnabledPath(path: string): boolean {
    const value = this.getPath(path)
    return value === true || value === 'true'
  }

  update(newConfig: Partial<ShieldConfig>): void {
    this.config = this.validate(
      deepMerge(this.config, newConfig)
    )
    this.emit('update', this.config)
    this.notifyWatchers()
    this.saveToFile()
  }

  updatePath(path: string, value: any): void {
    setByPath(this.config, path, value)
    this.emit('update', this.config)
    this.notifyWatchers()
    this.saveToFile()
  }

  deletePath(path: string): void {
    deleteByPath(this.config, path)
    this.emit('update', this.config)
    this.notifyWatchers()
    this.saveToFile()
  }

  reset(): void {
    this.config = this.validate({ ...defaultConfig })
    this.emit('reset', this.config)
    this.notifyWatchers()
    this.saveToFile()
  }

  onUpdate(callback: (config: ShieldConfig) => void): () => void {
    this.watchers.push(callback)
    return () => {
      const index = this.watchers.indexOf(callback)
      if (index !== -1) {
        this.watchers.splice(index, 1)
      }
    }
  }

  private notifyWatchers(): void {
    for (const watcher of this.watchers) {
      try {
        watcher(this.config)
      } catch (error) {
        console.error('Config watcher error:', error)
      }
    }
  }

  private loadFromFile(filePath: string): Partial<ShieldConfig> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const ext = path.extname(filePath)
      
      if (ext === '.json') {
        return JSON.parse(content)
      } else if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
        return require(path.resolve(filePath))
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load config from ${filePath}:`, error)
    }
    return {}
  }

  private saveToFile(): void {
    if (!this.configPath) return
    
    try {
      const ext = path.extname(this.configPath)
      let content: string
      
      if (ext === '.json') {
        content = JSON.stringify(this.config, null, 2)
      } else {
        content = `module.exports = ${JSON.stringify(this.config, null, 2)}`
      }
      
      fs.writeFileSync(this.configPath, content, 'utf-8')
    } catch (error) {
      console.warn(`⚠️ Failed to save config to ${this.configPath}:`, error)
    }
  }

  private watchFile(): void {
    if (!this.configPath) return
    
    try {
      this.fileWatcher = fs.watch(this.configPath, (event) => {
        if (event === 'change') {
          const fileConfig = this.loadFromFile(this.configPath!)
          this.config = this.validate(deepMerge(this.config, fileConfig))
          this.emit('update', this.config)
          this.notifyWatchers()
        }
      })
    } catch (error) {
      console.warn(`⚠️ Failed to watch config file:`, error)
    }
  }

  private loadFromEnv(): Partial<ShieldConfig> {
    const config: any = {}
    
    if (process.env.NODE_ENV) {
      config.env = process.env.NODE_ENV as any
    }
    
    if (process.env.SHIELD_HEADERS !== undefined) {
      config.headers = { enabled: process.env.SHIELD_HEADERS === 'true' }
    }
    
    if (process.env.HSTS_MAX_AGE) {
      config.headers = config.headers || {}
      config.headers.hsts = {
        maxAge: parseInt(process.env.HSTS_MAX_AGE),
        includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
        preload: process.env.HSTS_PRELOAD === 'true'
      }
    }
    
    if (process.env.SHIELD_CSP !== undefined) {
      config.csp = { enabled: process.env.SHIELD_CSP === 'true' }
    }
    
    if (process.env.SHIELD_AI !== undefined) {
      config.ai = { enabled: process.env.SHIELD_AI === 'true' }
    }
    
    if (process.env.RATE_LIMIT_MAX) {
      config.rateLimit = {
        enabled: true,
        default: {
          max: parseInt(process.env.RATE_LIMIT_MAX),
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000')
        }
      }
    }
    
    if (process.env.SHIELD_MONITORING !== undefined) {
      config.monitoring = { enabled: process.env.SHIELD_MONITORING === 'true' }
    }
    
    if (process.env.LOG_LEVEL) {
      config.logging = { 
        level: process.env.LOG_LEVEL as any,
        format: process.env.LOG_FORMAT as any || 'json'
      }
    }
    
    return config
  }

  registerEnvMapping(mapping: EnvMapping): void {
    this.envMapping = { ...this.envMapping, ...mapping }
  }

  toJSON(): ShieldConfig {
    return JSON.parse(JSON.stringify(this.config))
  }

  private validate(config: ShieldConfig): ShieldConfig {
    if (config.headers?.hsts?.maxAge !== undefined && config.headers.hsts.maxAge < 0) {
      throw new Error('HSTS maxAge must be a positive number')
    }
    
    if (config.rateLimit?.default?.max !== undefined && config.rateLimit.default.max < 1) {
      throw new Error('Rate limit max must be at least 1')
    }
    
    if (config.logging?.level) {
      const validLevels = ['debug', 'info', 'warn', 'error', 'fatal']
      if (!validLevels.includes(config.logging.level)) {
        throw new Error(`Invalid log level: ${config.logging.level}`)
      }
    }
    
    return config
  }

  getSchema(): Record<string, any> {
    return {
      type: 'object',
      properties: {
        env: { type: 'string', enum: ['development', 'production', 'test'] },
        headers: { type: 'object' },
        csp: { type: 'object' },
        ai: { type: 'object' },
        rateLimit: { type: 'object' },
        monitoring: { type: 'object' }
      }
    }
  }

  stopWatching(): void {
    if (this.fileWatcher) {
      this.fileWatcher.close()
      this.fileWatcher = undefined
    }
  }

  destroy(): void {
    this.stopWatching()
    this.removeAllListeners()
    this.watchers = []
  }
}
