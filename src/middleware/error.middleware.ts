// ============================================
// ERROR MIDDLEWARE
// ============================================

import { FABShield } from '../core/FABShield'

export const errorMiddleware = (shield?: FABShield) => {
  return (err: any, req: any, res: any, _next: any) => {
    const requestId = req.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Логируем ошибку
    console.error(`❌ [${requestId}] Error:`, {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    })

    // Записываем в метрики
    if (shield) {
      const metrics = (shield as any).metrics
      if (metrics) {
        metrics.recordError(err)
      }
    }

    // Определяем статус
    const status = err.status || err.statusCode || 500
    const message = err.message || 'Internal server error'

    // Отправляем ответ
    res.status(status).json({
      error: message,
      status: status,
      requestId: requestId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err.details
      })
    })
  }
}