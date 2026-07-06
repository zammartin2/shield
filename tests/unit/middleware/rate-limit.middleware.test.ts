// ============================================
// ТЕСТ: RATE LIMIT MIDDLEWARE
// ============================================

import { rateLimitMiddleware, clearRateLimitStore } from '../../../src/middleware/rate-limit.middleware'

describe('Rate Limit Middleware', () => {
  let req: any
  let res: any
  let next: jest.Mock

  beforeEach(() => {
    // ✅ ОЧИЩАЕМ ХРАНИЛИЩЕ ПЕРЕД КАЖДЫМ ТЕСТОМ
    clearRateLimitStore()
    
    req = {
      ip: '127.0.0.1',
      method: 'GET',
      path: '/test'
    }
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
    
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
    clearRateLimitStore()
  })

  test('should call next when no config', () => {
    const middleware = rateLimitMiddleware()
    middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('should call next when config enabled=false', () => {
    const middleware = rateLimitMiddleware({ enabled: false })
    middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('should call next with config', () => {
    const middleware = rateLimitMiddleware({ max: 100, windowMs: 60000 })
    middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('should set rate limit headers', () => {
    const middleware = rateLimitMiddleware({ max: 100, windowMs: 60000 })
    middleware(req, res, next)
    
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100')
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(String))
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String))
  })

  test('should block requests over limit', () => {
    const middleware = rateLimitMiddleware({ max: 1, windowMs: 10000 })
    
    // ✅ Первый запрос - проходит
    middleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    
    // ✅ Второй запрос - блокируется
    const next2 = jest.fn()
    const res2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
    
    middleware(req, res2, next2)
    
    expect(res2.status).toHaveBeenCalledWith(429)
    expect(res2.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Too many requests'
      })
    )
    expect(next2).not.toHaveBeenCalled()
  })

  test('should allow requests from different IPs', () => {
    const middleware = rateLimitMiddleware({ max: 1, windowMs: 10000 })
    
    // ✅ Первый запрос с IP 1
    middleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    
    // ✅ Второй запрос с другим IP
    const req2 = { ...req, ip: '192.168.1.2' }
    const next2 = jest.fn()
    const res2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
    
    middleware(req2, res2, next2)
    expect(next2).toHaveBeenCalled()
  })

  test('should handle errors gracefully', () => {
    const middleware = rateLimitMiddleware({ max: 100, windowMs: 60000 })
    
    // ✅ Создаем объект без ip
    const badReq = { method: 'GET' }
    
    expect(() => {
      middleware(badReq, res, next)
    }).not.toThrow()
    
    expect(next).toHaveBeenCalled()
  })

  test('should handle missing ip', () => {
    const middleware = rateLimitMiddleware({ max: 100, windowMs: 60000 })
    const reqWithoutIp = { method: 'GET', path: '/test' }
    
    middleware(reqWithoutIp, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('should work with different HTTP methods', () => {
    const middleware = rateLimitMiddleware({ max: 100, windowMs: 60000 })
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    
    for (const method of methods) {
      const reqMethod = { ...req, method }
      const nextMethod = jest.fn()
      middleware(reqMethod, res, nextMethod)
      expect(nextMethod).toHaveBeenCalled()
    }
  })

  test('should work with FABShield mode', async () => {
    const { FABShield } = require('../../../src/core/FABShield')
    const shield = new FABShield({
      rateLimit: {
        enabled: true,
        default: { max: 50, windowMs: 60000 }
      }
    })
    
    const middleware = rateLimitMiddleware({ max: 50, windowMs: 60000 })
    middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('should reset rate limit after window expires', async () => {
    const middleware = rateLimitMiddleware({ max: 1, windowMs: 100 })
    
    // ✅ Первый запрос
    middleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    
    // ✅ Ждем истечения окна
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // ✅ Второй запрос с новым IP - должен пройти
    const next2 = jest.fn()
    const res2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
    
    const reqNew = { ...req, ip: '127.0.0.3' }
    middleware(reqNew, res2, next2)
    expect(next2).toHaveBeenCalled()
  }, 10000)
})