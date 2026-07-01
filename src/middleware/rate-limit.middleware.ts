// ============================================
// RATE LIMIT MIDDLEWARE
// ============================================

import { FABShield } from '../core/FABShield'

export const rateLimitMiddleware = (shield: FABShield) => {
  return async (req: any, res: any, next: any) => {
    try {
      const rateLimiter = (shield as any).rateLimiter
      if (!rateLimiter) {
        next()
        return
      }

      const result = await rateLimiter.check(req)
      
      if (!result.allowed) {
        const { limit, windowMs } = result.info
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000),
          limit: limit,
          timestamp: new Date().toISOString()
        })
        return
      }

      next()
    } catch (error) {
      // В случае ошибки пропускаем запрос
      console.error('Rate limit error:', error)
      next()
    }
  }
}