// ============================================
// RATE LIMIT MIDDLEWARE - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

// ✅ ИСПОЛЬЗУЕМ ГЛОБАЛЬНЫЙ ОБЪЕКТ для хранения
const globalAny = global as any
if (!globalAny.__rateLimitStore) {
  globalAny.__rateLimitStore = new Map<string, { count: number; resetTime: number }>()
}
const store: Map<string, { count: number; resetTime: number }> = globalAny.__rateLimitStore

/**
 * Rate Limit Middleware
 */
export const rateLimitMiddleware = (config?: any) => {
  return (req: any, res: any, next: any) => {
    try {
      // Если конфиг не передан или отключен - пропускаем
      if (!config || config.enabled === false) {
        return next()
      }

      const max = config.max || 100
      const windowMs = config.windowMs || 60000
      const key = req.ip || 'unknown'
      const now = Date.now()
      
      // Получаем или создаем запись
      let record = store.get(key)
      
      // Если записи нет или окно истекло - создаем новую
      if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + windowMs }
        store.set(key, record)
      }
      
      // Увеличиваем счетчик
      record.count++
      store.set(key, record)
      
      // Устанавливаем заголовки
      res.setHeader('X-RateLimit-Limit', String(max))
      const remaining = Math.max(0, max - record.count)
      res.setHeader('X-RateLimit-Remaining', String(remaining))
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
      
      // Проверяем лимит
      if (record.count > max) {
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
          limit: max,
          remaining: 0
        })
      }
      
      // Пропускаем запрос
      next()
    } catch (error) {
      // В случае ошибки пропускаем запрос
      console.error('Rate limit error:', error)
      next()
    }
  }
}

/**
 * Очистка хранилища (для тестов)
 */
export const clearRateLimitStore = (): void => {
  store.clear()
}

export default rateLimitMiddleware