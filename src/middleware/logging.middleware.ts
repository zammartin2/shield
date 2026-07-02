// ============================================
// LOGGING MIDDLEWARE - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

/**
 * Логирование запросов и ответов
 * @param options - Опции логирования
 * @param options.level - Уровень логирования ('debug' | 'info' | 'warn' | 'error')
 * @param options.logResponseBody - Логировать тело ответа при ошибках
 * @returns Middleware функция
 */
export const loggingMiddleware = (options?: { 
  level?: 'debug' | 'info' | 'warn' | 'error';
  logResponseBody?: boolean;
}) => {
  const level = options?.level || 'info'
  const logResponseBody = options?.logResponseBody || false
  
  return (req: any, res: any, next: any) => {
    const start = Date.now()
    const requestId = req.id || req.requestId || `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    req.id = requestId

    // 🟢 Определяем путь и метод безопасно
    const path = req.path || req.url || '/'
    const method = req.method || 'GET'
    // ✅ ИСПРАВЛЕНО: всегда заменяем на 'unknown' если нет ip
    const ip = req.ip || req.connection?.remoteAddress || req.connection?.remoteAddress || 'unknown'

    // ✅ Логируем входящий запрос с ip
    if (level === 'debug') {
      console.debug(`🔍 📝 ${method} ${path} [${requestId}] - ${ip}`)
    } else {
      console.log(`📝 ${method} ${path} [${requestId}] - ${ip}`)
    }

    // ✅ Сохраняем оригинальные методы
    const originalSend = res.send
    const originalJson = res.json
    let responseBody: any = null
    let isResponseSent = false
    let isFinished = false

    // ✅ Перехватываем send
    res.send = function(body: any) {
      if (!isResponseSent) {
        responseBody = body
        isResponseSent = true
      }
      return originalSend.call(this, body)
    }

    // ✅ Перехватываем json
    res.json = function(body: any) {
      if (!isResponseSent) {
        responseBody = body
        isResponseSent = true
      }
      return originalJson.call(this, body)
    }

    // ✅ Обработка завершения ответа с защитой от дублирования
    const handleFinish = () => {
      // ✅ Защита от повторного вызова
      if (isFinished) return
      isFinished = true

      const duration = Date.now() - start
      const status = res.statusCode || 500
      const logPath = req.path || req.url || '/'

      // Логируем ответ в зависимости от статуса
      if (status >= 500) {
        console.error(`❌ [${requestId}] ${method} ${logPath} - ${status} (${duration}ms)`)
        if (logResponseBody && responseBody !== null && responseBody !== undefined) {
          console.error(`❌ [${requestId}] Response body:`, responseBody)
        }
      } else if (status >= 400) {
        console.warn(`⚠️ [${requestId}] ${method} ${logPath} - ${status} (${duration}ms)`)
      } else if (level === 'debug') {
        console.debug(`📤 [${requestId}] ${method} ${logPath} - ${status} (${duration}ms)`)
      } else {
        console.log(`✅ [${requestId}] ${method} ${logPath} - ${status} (${duration}ms)`)
      }
    }

    // ✅ Добавляем обработчик finish если есть on
    if (res && typeof res.on === 'function') {
      if (typeof res.removeAllListeners === 'function') {
        res.removeAllListeners('finish')
      }
      res.on('finish', handleFinish)
    }

    // ✅ Всегда вызываем next()
    next()
  }
}

/**
 * Создание middleware для логирования с настройками по умолчанию
 */
export const createLoggingMiddleware = (options?: { 
  level?: 'debug' | 'info' | 'warn' | 'error';
  logResponseBody?: boolean;
}) => {
  return loggingMiddleware(options)
}

/**
 * Экспорт по умолчанию
 */
export default loggingMiddleware