// ============================================
// LOGGER — Логирование
// ============================================

import { formatDate } from './date.util'

export class Logger {
  private level: string
  private format: 'json' | 'text'
  private transports: any[]
  private levelMap: Record<string, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  }

  constructor(options: { level?: string; format?: 'json' | 'text'; transports?: any[] } = {}) {
    this.level = options.level || 'info'
    this.format = options.format || 'json'
    this.transports = options.transports || [
      { type: 'console', enabled: true }
    ]
  }

  /**
   * Debug уровень
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  /**
   * Info уровень
   */
  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  /**
   * Warn уровень
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  /**
   * Error уровень
   */
  error(message: string, data?: any): void {
    this.log('error', message, data)
  }

  /**
   * Fatal уровень
   */
  fatal(message: string, data?: any): void {
    this.log('fatal', message, data)
  }

  /**
   * Основной метод логирования
   */
  private log(level: string, message: string, data?: any): void {
    // Проверяем уровень
    if (this.levelMap[level] < this.levelMap[this.level]) {
      return
    }

    const logEntry = this.formatLog(level, message, data)

    // Отправляем в транспорты
    for (const transport of this.transports) {
      if (!transport.enabled) continue

      switch (transport.type) {
        case 'console':
          this.sendToConsole(level, logEntry)
          break
        case 'file':
          this.sendToFile(level, logEntry)
          break
        case 'remote':
          this.sendToRemote(level, logEntry)
          break
      }
    }
  }

  /**
   * Форматирование лога
   */
  private formatLog(level: string, message: string, data?: any): any {
    const entry: any = {
      timestamp: new Date().toISOString(),
      level: level,
      message: message
    }

    if (data) {
      entry.data = data
    }

    if (this.format === 'json') {
      return entry
    }

    // Text format
    const timestamp = formatDate(new Date(), 'LOCALE')
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ' ' + JSON.stringify(data) : ''}`
  }

  /**
   * Отправка в консоль
   */
  private sendToConsole(level: string, entry: any): void {
    const formatted = this.format === 'json' 
      ? JSON.stringify(entry)
      : entry

    switch (level) {
      case 'debug':
        // ✅ ИСПРАВЛЕНО: debug всегда выводит в консоль через console.log
        console.log(`🔍 ${formatted}`)
        break
      case 'info':
        console.log(`ℹ️ ${formatted}`)
        break
      case 'warn':
        console.warn(`⚠️ ${formatted}`)
        break
      case 'error':
      case 'fatal':
        console.error(`❌ ${formatted}`)
        break
    }
  }

  /**
   * Отправка в файл
   */
  private sendToFile(_level: string, entry: any): void {
    // TODO: Реализовать запись в файл
    // Для простоты используем консоль
    console.log(`[FILE]`, entry)
  }

  /**
   * Отправка на удаленный сервер
   */
  private sendToRemote(_level: string, entry: any): void {
    // TODO: Реализовать отправку на удаленный сервер
    // Для простоты используем консоль
    console.log(`[REMOTE]`, entry)
  }

  /**
   * Создание дочернего логгера с дополнительными метаданными
   */
  child(metadata: Record<string, any>): Logger {
    const child = new Logger({
      level: this.level,
      format: this.format,
      transports: this.transports
    })

    // Обертка методов с добавлением метаданных
    const origLog = child.log.bind(child)
    child.log = (level: string, message: string, data?: any) => {
      origLog(level, message, { ...metadata, ...data })
    }

    return child
  }

  /**
   * Установка уровня логирования
   */
  setLevel(level: string): void {
    if (!this.levelMap[level]) {
      throw new Error(`Invalid log level: ${level}`)
    }
    this.level = level
  }

  /**
   * Получение текущего уровня
   */
  getLevel(): string {
    return this.level
  }
}

/**
 * Создание логгера по умолчанию
 */
export const defaultLogger = new Logger()