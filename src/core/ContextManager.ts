// ============================================
// CONTEXT MANAGER — Управление контекстом
// ============================================

import { CryptoUtils } from '../utils/crypto'

export class ContextManager {
  private contexts: Map<string, any> = new Map()
  private crypto: CryptoUtils
  private maxContexts: number = 10000

  constructor() {
    this.crypto = new CryptoUtils()
  }

  /**
   * Создание контекста для запроса
   */
  create(req: any): any {
    const context = {
      id: this.generateId(),
      timestamp: new Date(),
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      method: req.method || 'GET',
      path: req.path || '/',
      headers: req.headers || {},
      user: req.user || null,
      session: req.session || null,
      data: {},
      startTime: Date.now(),
      parentId: req.parentId || null
    }

    this.contexts.set(context.id, context)

    // Очищаем старые контексты
    if (this.contexts.size > this.maxContexts) {
      this.cleanup()
    }

    return context
  }

  /**
   * Создание контекста по ID (для совместимости с тестами)
   */
  createContext(id: string, data?: any): any {
    if (this.contexts.has(id)) {
      throw new Error(`Context with id ${id} already exists`)
    }

    const context = {
      id,
      data: data || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      timestamp: new Date(),
      startTime: Date.now()
    }

    this.contexts.set(id, context)
    return context
  }

  /**
   * Получение контекста по ID (для совместимости с тестами)
   */
  getContext(id: string): any {
    return this.contexts.get(id)
  }

  /**
   * Обновление контекста (для совместимости с тестами)
   */
  updateContext(id: string, data: any): any {
    const context = this.contexts.get(id)
    if (!context) return undefined

    context.data = { ...context.data, ...data }
    context.updatedAt = new Date()
    this.contexts.set(id, context)
    return context
  }

  /**
   * Удаление контекста (для совместимости с тестами)
   * ✅ ИСПРАВЛЕНО: Возвращаем undefined вместо false
   */
  deleteContext(id: string): boolean | undefined {
    if (!this.contexts.has(id)) {
      return undefined
    }
    return this.contexts.delete(id)
  }

  /**
   * Получение всех контекстов (для совместимости с тестами)
   */
  getAllContexts(): any[] {
    return Array.from(this.contexts.values())
  }

  /**
   * Установка данных контекста (для совместимости с тестами)
   */
  setContextData(id: string, key: string, value: any): void {
    const context = this.contexts.get(id)
    if (context) {
      context.data[key] = value
      context.updatedAt = new Date()
      this.contexts.set(id, context)
    }
  }

  /**
   * Получение данных контекста (для совместимости с тестами)
   */
  getContextData(id: string, key: string): any {
    const context = this.contexts.get(id)
    return context ? context.data[key] : undefined
  }

  /**
   * Получение контекста по ID
   */
  get(id: string): any {
    return this.contexts.get(id)
  }

  /**
   * Обновление контекста
   */
  update(id: string, data: any): void {
    const context = this.contexts.get(id)
    if (context) {
      this.contexts.set(id, { ...context, ...data, updatedAt: new Date() })
    }
  }

  /**
   * Удаление контекста
   */
  destroy(id: string): void {
    this.contexts.delete(id)
  }

  /**
   * Получение всех контекстов
   */
  getAll(): any[] {
    return Array.from(this.contexts.values())
  }

  /**
   * Получение активных контекстов (за последние 5 минут)
   */
  getActive(): any[] {
    const now = Date.now()
    const active: any[] = []

    for (const context of this.contexts.values()) {
      if (now - context.startTime < 300000) { // 5 минут
        active.push(context)
      }
    }

    return active
  }

  /**
   * Очистка старых контекстов
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [id, context] of this.contexts) {
      // Удаляем контексты старше 1 часа
      if (now - context.startTime > 3600000) {
        keysToDelete.push(id)
      }
    }

    for (const id of keysToDelete) {
      this.contexts.delete(id)
    }
  }

  /**
   * Генерация ID
   */
  private generateId(): string {
    return `ctx-${this.crypto.generateId()}`
  }

  /**
   * Очистка всех контекстов
   */
  clear(): void {
    this.contexts.clear()
  }

  /**
   * Получение статистики
   */
  getStats(): any {
    return {
      total: this.contexts.size,
      active: this.getActive().length,
      max: this.maxContexts
    }
  }
}