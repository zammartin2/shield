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