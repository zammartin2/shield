// ============================================
// HEADERS MIDDLEWARE
// ============================================

import { FABShield } from '../core/FABShield'

export const headersMiddleware = (shield: FABShield) => {
  return async (req: any, res: any, next: any) => {
    try {
      const headersModule = (shield as any).headers
      if (headersModule) {
        await headersModule.apply(req, res)
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}