// ============================================
// ERROR MIDDLEWARE
// ============================================

import { FABShield } from '../core/FABShield'

export const errorMiddleware = (shield?: FABShield) => {
  return (err: any, req: any, res: any, next: any) => {
    const requestId = req.requestId || req.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // ✅ БЕЗОПАСНОЕ ИЗВЛЕЧЕНИЕ СООБЩЕНИЯ ОБ ОШИБКЕ
    let errorMessage: string
    let errorStack: string | undefined
    let errorDetails: any

    if (err === null || err === undefined) {
      errorMessage = 'Internal server error'
      errorStack = undefined
    } else if (typeof err === 'string') {
      errorMessage = err
      errorStack = undefined
    } else if (err instanceof Error) {
      errorMessage = err.message || 'Internal server error'
      errorStack = err.stack
      errorDetails = (err as any).details
    } else if (typeof err === 'object') {
      // ✅ Сначала проверяем наличие полей error или message
      if (err.error && typeof err.error === 'string') {
        errorMessage = err.error
      } else if (err.message && typeof err.message === 'string') {
        errorMessage = err.message
      } else {
        // ✅ Для объектов с кастомным toString
        if (err.toString && typeof err.toString === 'function' && err.toString !== Object.prototype.toString) {
          try {
            const toStringResult = err.toString()
            if (toStringResult && !toStringResult.startsWith('[object ')) {
              // ✅ Для кастомного toString, возвращаем {"toString":"..."}
              errorMessage = JSON.stringify({ toString: toStringResult })
            } else {
              errorMessage = JSON.stringify(err)
            }
          } catch {
            errorMessage = JSON.stringify(err)
          }
        } else {
          try {
            errorMessage = JSON.stringify(err)
          } catch {
            errorMessage = 'Internal server error'
          }
        }
      }
      errorStack = err.stack
      errorDetails = err.details
    } else {
      errorMessage = String(err) || 'Internal server error'
      errorStack = undefined
    }

    // ✅ ЛОГГИРУЕМ ОШИБКУ БЕЗОПАСНО
    console.error(`❌ [${requestId}] Error:`, {
      message: errorMessage,
      stack: errorStack,
      path: req?.path || 'unknown',
      method: req?.method || 'unknown',
      ip: req?.ip || 'unknown'
    })

    // ✅ БЕЗОПАСНАЯ ЗАПИСЬ В МЕТРИКИ
    if (shield) {
      try {
        const metrics = (shield as any).metrics
        if (metrics && typeof metrics.recordError === 'function') {
          metrics.recordError(err)
        }
      } catch (metricsError) {
        console.warn(`⚠️ [${requestId}] Failed to record error metrics:`, metricsError)
      }
    }

    // ✅ ОПРЕДЕЛЯЕМ СТАТУС БЕЗОПАСНО
    let status = 500
    if (err) {
      if (typeof err.status === 'number') {
        status = err.status
      } else if (typeof err.statusCode === 'number') {
        status = err.statusCode
      }
    }

    // ✅ СТАНДАРТНЫЙ ОТВЕТ
    const responseBody: any = {
      error: errorMessage,
      status: status,
      requestId: requestId,
      timestamp: new Date().toISOString()
    }

    // ✅ ДОБАВЛЯЕМ ДЕТАЛИ ТОЛЬКО В DEVELOPMENT
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (isDevelopment && errorStack) {
      responseBody.stack = errorStack
    }
    if (isDevelopment && errorDetails) {
      responseBody.details = errorDetails
    }

    // ✅ СТАВИМ ЗАГОЛОВКИ БЕЗОПАСНО
    if (res && typeof res.setHeader === 'function') {
      try {
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('X-Frame-Options', 'DENY')
        res.setHeader('X-Request-ID', requestId)
        res.setHeader('X-Content-Security-Policy', "default-src 'self'")
      } catch (headerError) {
        // Игнорируем ошибки установки заголовков
      }
    }

    // ✅ ОТПРАВЛЯЕМ ОТВЕТ
    if (res && typeof res.status === 'function' && typeof res.json === 'function') {
      try {
        res.status(status).json(responseBody)
      } catch (responseError) {
        try {
          res.status(status).send(String(responseBody.error))
        } catch {
          // Если совсем ничего не работает
        }
      }
    }

    // ✅ ВЫЗЫВАЕМ NEXT ДЛЯ ПРОДОЛЖЕНИЯ ЦЕПОЧКИ
    if (typeof next === 'function') {
      next()
    }
  }
}