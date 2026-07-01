// ============================================
// LOGGING MIDDLEWARE
// ============================================

export const loggingMiddleware = (options?: { level?: 'debug' | 'info' | 'warn' | 'error' }) => {
  const level = options?.level || 'info'
  
  return (req: any, res: any, next: any) => {
    const start = Date.now()
    const requestId = req.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    req.id = requestId

    // Логируем входящий запрос
    if (level === 'debug' || level === 'info') {
      console.log(`📝 [${requestId}] ${req.method} ${req.path} - ${req.ip || 'unknown'}`)
    }

    // Перехватываем ответ
    const originalSend = res.send
    const originalJson = res.json
    let responseBody: any = null

    res.send = function(body: any) {
      responseBody = body
      return originalSend.call(this, body)
    }

    res.json = function(body: any) {
      responseBody = body
      return originalJson.call(this, body)
    }

    res.on('finish', () => {
      const duration = Date.now() - start
      const status = res.statusCode || 500

      // Логируем ответ
      if (status >= 400) {
        console.error(`❌ [${requestId}] ${req.method} ${req.path} - ${status} (${duration}ms)`)
      } else if (level === 'debug') {
        console.log(`📤 [${requestId}] ${req.method} ${req.path} - ${status} (${duration}ms)`)
      } else {
        console.log(`📤 [${requestId}] ${req.method} ${req.path} - ${status} (${duration}ms)`)
      }

      // Логируем ошибки подробно
      if (status >= 500 && responseBody) {
        console.error(`❌ [${requestId}] Response body:`, responseBody)
      }
    })

    next()
  }
}