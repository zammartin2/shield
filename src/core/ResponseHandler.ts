// ============================================
// RESPONSE HANDLER — Обработка ответов
// ============================================

export class ResponseHandler {
  /**
   * Отправка успешного ответа
   */
  success(res: any, data: any, status: number = 200): void {
    res.status(status).json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Отправка ошибки
   */
  error(res: any, error: any, status: number = 500): void {
    const message = error.message || 'Internal server error'
    const code = error.code || 'INTERNAL_ERROR'

    res.status(status).json({
      success: false,
      error: {
        message: message,
        code: code,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          details: error.details
        })
      },
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Отправка валидационной ошибки
   */
  validationError(res: any, errors: string[], status: number = 400): void {
    res.status(status).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        errors: errors
      },
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Отправка Not Found
   */
  notFound(res: any, resource?: string): void {
    res.status(404).json({
      success: false,
      error: {
        message: resource ? `${resource} not found` : 'Not found',
        code: 'NOT_FOUND'
      },
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Отправка Forbidden
   */
  forbidden(res: any, message: string = 'Access denied'): void {
    res.status(403).json({
      success: false,
      error: {
        message: message,
        code: 'FORBIDDEN'
      },
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Отправка Unauthorized
   */
  unauthorized(res: any, message: string = 'Authentication required'): void {
    res.status(401).json({
      success: false,
      error: {
        message: message,
        code: 'UNAUTHORIZED'
      },
      timestamp: new Date().toISOString()
    })
  }
}