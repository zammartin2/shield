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
  private readonly validLogLevels = ['debug', 'info', 'warn', 'error', 'fatal'] as const
  private readonly validEnvironments = ['development', 'production', 'test'] as const

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

  /**
   * Получение полной конфигурации
   */
  get(): ShieldConfig {
    return this.config
  }

  /**
   * Получение модуля конфигурации
   */
  getModule<T = any>(module: keyof ShieldConfig): T | undefined {
    return this.config[module] as T
  }

  /**
   * Получение значения по пути
   */
  getPath<T = any>(path: string, defaultValue?: T): T | undefined {
    const value = getByPath(this.config, path)
    return value !== undefined ? value : defaultValue
  }

  /**
   * Проверка наличия пути
   */
  hasPath(path: string): boolean {
    return hasByPath(this.config, path)
  }

  /**
   * Проверка включен ли модуль
   */
  isEnabled(module: keyof ShieldConfig): boolean {
    const mod = this.config[module]
    if (mod && typeof mod === 'object' && 'enabled' in mod) {
      return (mod as any).enabled === true
    }
    return false
  }

  /**
   * Проверка включен ли путь
   */
  isEnabledPath(path: string): boolean {
    const value = this.getPath(path)
    return value === true || value === 'true'
  }

  /**
   * Обновление конфигурации
   */
  update(newConfig: Partial<ShieldConfig>): void {
    const oldConfig = { ...this.config }
    this.config = this.validate(
      deepMerge(this.config, newConfig)
    )
    this.emit('update', { old: oldConfig, new: this.config })
    this.notifyWatchers()
    this.saveToFile()
  }

  /**
   * Обновление значения по пути
   */
  updatePath(path: string, value: any): void {
    const oldValue = getByPath(this.config, path)
    setByPath(this.config, path, value)
    this.emit('updatePath', { path, oldValue, newValue: value })
    this.notifyWatchers()
    this.saveToFile()
  }

  /**
   * Удаление значения по пути
   */
  deletePath(path: string): void {
    const oldValue = getByPath(this.config, path)
    deleteByPath(this.config, path)
    this.emit('deletePath', { path, oldValue })
    this.notifyWatchers()
    this.saveToFile()
  }

  /**
   * Сброс конфигурации к значениям по умолчанию
   */
  reset(): void {
    this.config = this.validate({ ...defaultConfig })
    this.emit('reset', this.config)
    this.notifyWatchers()
    this.saveToFile()
  }

  /**
   * Подписка на обновления конфигурации
   */
  onUpdate(callback: (config: ShieldConfig) => void): () => void {
    this.watchers.push(callback)
    return () => {
      const index = this.watchers.indexOf(callback)
      if (index !== -1) {
        this.watchers.splice(index, 1)
      }
    }
  }

  /**
   * Уведомление подписчиков
   */
  private notifyWatchers(): void {
    for (const watcher of this.watchers) {
      try {
        watcher(this.config)
      } catch (error) {
        console.error('Config watcher error:', error)
      }
    }
  }

  /**
   * Загрузка конфигурации из файла
   */
  private loadFromFile(filePath: string): Partial<ShieldConfig> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const ext = path.extname(filePath)
      
      if (ext === '.json') {
        return JSON.parse(content)
      } else if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
        // Используем require для JS файлов
        const module = require(path.resolve(filePath))
        return module.default || module
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load config from ${filePath}:`, error)
    }
    return {}
  }

  /**
   * Сохранение конфигурации в файл
   */
  private saveToFile(): void {
    if (!this.configPath) return
    
    try {
      const ext = path.extname(this.configPath)
      let content: string
      
      if (ext === '.json') {
        content = JSON.stringify(this.config, null, 2)
      } else if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
        content = `module.exports = ${JSON.stringify(this.config, null, 2)}`
      } else {
        // По умолчанию сохраняем как JSON
        content = JSON.stringify(this.config, null, 2)
      }
      
      fs.writeFileSync(this.configPath, content, 'utf-8')
    } catch (error) {
      console.warn(`⚠️ Failed to save config to ${this.configPath}:`, error)
    }
  }

  /**
   * Наблюдение за изменениями файла
   */
  private watchFile(): void {
    if (!this.configPath) return
    
    try {
      this.fileWatcher = fs.watch(this.configPath, (event) => {
        if (event === 'change') {
          const fileConfig = this.loadFromFile(this.configPath!)
          if (Object.keys(fileConfig).length > 0) {
            this.config = this.validate(deepMerge(this.config, fileConfig))
            this.emit('update', { source: 'file', config: this.config })
            this.notifyWatchers()
          }
        }
      })
    } catch (error) {
      console.warn(`⚠️ Failed to watch config file:`, error)
    }
  }

  /**
   * Загрузка конфигурации из переменных окружения
   */
  private loadFromEnv(): Partial<ShieldConfig> {
    const config: any = {}
    
    if (process.env.NODE_ENV) {
      config.env = process.env.NODE_ENV as any
    }
    
    if (process.env.SHIELD_ENABLED !== undefined) {
      config.enabled = process.env.SHIELD_ENABLED === 'true'
    }
    
    if (process.env.SHIELD_HEADERS !== undefined) {
      config.headers = { enabled: process.env.SHIELD_HEADERS === 'true' }
    }
    
    if (process.env.HSTS_MAX_AGE) {
      config.headers = config.headers || {}
      config.headers.hsts = {
        maxAge: parseInt(process.env.HSTS_MAX_AGE, 10),
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
        enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
        default: {
          max: parseInt(process.env.RATE_LIMIT_MAX, 10),
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10)
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
    
    if (process.env.SHIELD_NAME) {
      config.name = process.env.SHIELD_NAME
    }
    
    return config
  }

  /**
   * Регистрация маппинга переменных окружения
   */
  registerEnvMapping(mapping: EnvMapping): void {
    this.envMapping = { ...this.envMapping, ...mapping }
    // Применяем маппинг
    for (const [envKey, mappingConfig] of Object.entries(this.envMapping)) {
      const value = process.env[envKey]
      if (value !== undefined) {
        let parsedValue: any = value
        if (mappingConfig.type === 'number') {
          parsedValue = parseInt(value, 10)
        } else if (mappingConfig.type === 'boolean') {
          parsedValue = value === 'true'
        } else if (mappingConfig.type === 'json') {
          try {
            parsedValue = JSON.parse(value)
          } catch {
            parsedValue = value
          }
        }
        if (mappingConfig.transform) {
          parsedValue = mappingConfig.transform(value)
        }
        this.updatePath(mappingConfig.path, parsedValue)
      } else if (mappingConfig.default !== undefined) {
        this.updatePath(mappingConfig.path, mappingConfig.default)
      }
    }
  }

  /**
   * Преобразование в JSON
   */
  toJSON(): ShieldConfig {
    return JSON.parse(JSON.stringify(this.config))
  }

  /**
   * Валидация конфигурации
   */
  private validate(config: ShieldConfig): ShieldConfig {
    // Валидация HSTS
    if (config.headers?.hsts?.maxAge !== undefined && config.headers.hsts.maxAge < 0) {
      throw new Error('HSTS maxAge must be a positive number')
    }
    
    // Валидация Rate Limit
    if (config.rateLimit?.default?.max !== undefined && config.rateLimit.default.max < 1) {
      throw new Error('Rate limit max must be at least 1')
    }
    
    if (config.rateLimit?.default?.windowMs !== undefined && config.rateLimit.default.windowMs < 1000) {
      throw new Error('Rate limit windowMs must be at least 1000ms')
    }
    
    // Валидация Log Level
    if (config.logging?.level) {
      if (!this.validLogLevels.includes(config.logging.level as any)) {
        throw new Error(`Invalid log level: ${config.logging.level}`)
      }
    }
    
    // Валидация Environment
    if (config.env) {
      if (!this.validEnvironments.includes(config.env as any)) {
        throw new Error(`Invalid environment: ${config.env}`)
      }
    }
    
    return config
  }

  /**
   * Получение схемы конфигурации
   */
  getSchema(): Record<string, any> {
    return {
      type: 'object',
      properties: {
        env: { 
          type: 'string', 
          enum: ['development', 'production', 'test'] 
        },
        enabled: { type: 'boolean' },
        name: { type: 'string' },
        version: { type: 'string' },
        headers: { 
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            hsts: {
              type: 'object',
              properties: {
                maxAge: { type: 'number', minimum: 0 },
                includeSubDomains: { type: 'boolean' },
                preload: { type: 'boolean' }
              }
            }
          }
        },
        csp: { 
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            directives: { type: 'object' }
          }
        },
        ai: { 
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            anomalyDetection: { type: 'boolean' },
            threatPrediction: { type: 'boolean' }
          }
        },
        rateLimit: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            default: {
              type: 'object',
              properties: {
                max: { type: 'number', minimum: 1 },
                windowMs: { type: 'number', minimum: 1000 }
              }
            }
          }
        },
        monitoring: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' }
          }
        },
        logging: {
          type: 'object',
          properties: {
            level: { 
              type: 'string', 
              enum: ['debug', 'info', 'warn', 'error', 'fatal'] 
            },
            format: { 
              type: 'string', 
              enum: ['json', 'text'] 
            }
          }
        }
      }
    }
  }

  /**
   * Остановка наблюдения за файлом
   */
  stopWatching(): void {
    if (this.fileWatcher) {
      this.fileWatcher.close()
      this.fileWatcher = undefined
    }
  }

  /**
   * Уничтожение менеджера
   */
  destroy(): void {
    this.stopWatching()
    this.removeAllListeners()
    this.watchers = []
  }

  /**
   * Клонирование конфигурации
   */
  clone(): ShieldConfig {
    return JSON.parse(JSON.stringify(this.config))
  }

  /**
   * Получение всех ключей конфигурации
   */
  getKeys(): string[] {
    return Object.keys(this.config)
  }

  /**
   * Проверка на наличие модуля
   */
  hasModule(module: keyof ShieldConfig): boolean {
    return !!this.config[module]
  }
}

/**
 * Экспорт по умолчанию
 */
export default ConfigManager