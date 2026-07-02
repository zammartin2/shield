// ============================================
// PLUGINS MODULE — Обертка для PluginManager
// ============================================

import { PluginManager } from './PluginManager'
import { ConfigManager } from '../../core/ConfigManager'
import { Plugin } from '../../types'

/**
 * Модуль управления плагинами
 * Предоставляет высокоуровневый API для работы с плагинами
 */
export class PluginsModule {
  private manager: PluginManager
  private config: ConfigManager

  constructor(config: ConfigManager) {
    this.config = config
    this.manager = new PluginManager(config.get())
  }

  /**
   * Регистрация плагина
   * @param plugin - Плагин для регистрации
   * @throws {Error} Если плагин уже зарегистрирован
   */
  register(plugin: Plugin): void {
    if (!plugin) {
      throw new Error('Plugin cannot be null or undefined')
    }
    this.manager.register(plugin)
  }

  /**
   * Удаление плагина
   * @param name - Имя плагина
   * @throws {Error} Если плагин не найден
   */
  unregister(name: string): void {
    if (!name) {
      throw new Error('Plugin name cannot be empty')
    }
    this.manager.unregister(name)
  }

  /**
   * Выполнение плагинов
   * @param req - Request объект
   * @param res - Response объект
   * @param context - Контекст выполнения
   */
  async execute(req: any, res: any, context: any): Promise<void> {
    if (!req || !res) {
      throw new Error('Request and Response are required')
    }
    await this.manager.execute(req, res, context)
  }

  /**
   * Получение списка всех плагинов
   */
  getPlugins(): string[] {
    return this.manager.getPlugins()
  }

  /**
   * Получение плагина по имени
   * @param name - Имя плагина
   * @returns Плагин или undefined
   */
  getPlugin(name: string): Plugin | undefined {
    if (!name) {
      return undefined
    }
    return this.manager.getPlugin(name)
  }

  /**
   * Получение метрик плагинов
   */
  getMetrics(): any {
    return this.manager.getMetrics()
  }

  /**
   * Включение плагина
   * @param name - Имя плагина
   * @throws {Error} Если плагин не найден
   */
  enable(name: string): void {
    if (!name) {
      throw new Error('Plugin name cannot be empty')
    }
    this.manager.enable(name)
  }

  /**
   * Отключение плагина
   * @param name - Имя плагина
   * @throws {Error} Если плагин не найден
   */
  disable(name: string): void {
    if (!name) {
      throw new Error('Plugin name cannot be empty')
    }
    this.manager.disable(name)
  }

  /**
   * Получение статуса плагина
   * @param name - Имя плагина
   * @returns Статус плагина или undefined
   */
  getStatus(name: string): any {
    if (!name) {
      return undefined
    }
    return this.manager.getStatus(name)
  }

  /**
   * Получение количества плагинов
   */
  getCount(): number {
    return this.manager.getPlugins().length
  }

  /**
   * Получение активных плагинов
   */
  getActivePlugins(): string[] {
    const plugins = this.manager.getPlugins()
    const active: string[] = []
    for (const name of plugins) {
      const status = this.manager.getStatus(name)
      if (status?.enabled) {
        active.push(name)
      }
    }
    return active
  }

  /**
   * Получение отключенных плагинов
   */
  getDisabledPlugins(): string[] {
    const plugins = this.manager.getPlugins()
    const disabled: string[] = []
    for (const name of plugins) {
      const status = this.manager.getStatus(name)
      if (status && !status.enabled) {
        disabled.push(name)
      }
    }
    return disabled
  }

  /**
   * Очистка всех плагинов
   */
  clear(): void {
    const plugins = this.manager.getPlugins()
    for (const name of plugins) {
      try {
        this.manager.unregister(name)
      } catch {
        // Игнорируем ошибки при очистке
      }
    }
  }

  /**
   * Проверка существования плагина
   */
  hasPlugin(name: string): boolean {
    return !!this.getPlugin(name)
  }

  /**
   * Получение экземпляра PluginManager
   */
  getManager(): PluginManager {
    return this.manager
  }
}

export default PluginsModule