// ============================================
// ТЕСТ: RATE LIMIT MIDDLEWARE (EXTRA COVERAGE)
// ============================================

import { rateLimitMiddleware, clearRateLimitStore } from '../../../src/middleware/rate-limit.middleware'

describe('Rate Limit Middleware - Extra Coverage', () => {
  let req: any
  let res: any
  let next: jest.Mock

  beforeEach(() => {
    clearRateLimitStore()

    req = {
      ip: '10.77.0.1',
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
    clearRateLimitStore()
  })

  test('should default max to 100 when config is an empty object', () => {
    const middleware = rateLimitMiddleware({})
    middleware(req, res, next)

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100')
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '99')
    expect(next).toHaveBeenCalled()
  })

  test('should default max to 100 when only enabled is set', () => {
    const middleware = rateLimitMiddleware({ enabled: true })
    middleware({ ...req, ip: '10.77.0.2' }, res, next)

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100')
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '99')
    expect(next).toHaveBeenCalled()
  })

  test('should default windowMs to 60000 for the reset header', () => {
    const fixedNow = 1700000000000
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow)

    const middleware = rateLimitMiddleware({})
    middleware({ ...req, ip: '10.77.0.3' }, res, next)

    expect(res.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Reset',
      new Date(fixedNow + 60000).toISOString()
    )
  })

  test('should restart the window after the default 60000ms', () => {
    const fixedNow = 1700000000000
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(fixedNow)

    const middleware = rateLimitMiddleware({})
    middleware({ ...req, ip: '10.77.0.4' }, res, next)
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '99')

    dateNowSpy.mockReturnValue(fixedNow + 60001)

    const resAfter = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
    const nextAfter = jest.fn()
    middleware({ ...req, ip: '10.77.0.4' }, resAfter, nextAfter)

    expect(resAfter.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '99')
    expect(nextAfter).toHaveBeenCalled()
  })

  test('should count requests per IP with default config', () => {
    const middleware = rateLimitMiddleware({})
    middleware({ ...req, ip: '10.77.0.5' }, res, next)

    const resOther = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
    const nextOther = jest.fn()
    middleware({ ...req, ip: '10.77.0.6' }, resOther, nextOther)

    expect(next).toHaveBeenCalled()
    expect(nextOther).toHaveBeenCalled()
    expect(resOther.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '99')
  })

  test('should fail open when res.setHeader throws', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const badRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(() => {
        throw new Error('header boom')
      })
    }

    const middleware = rateLimitMiddleware({ max: 5 })
    middleware({ ...req, ip: '10.77.0.7' }, badRes, next)

    expect(consoleSpy).toHaveBeenCalledWith('Rate limit error:', expect.any(Error))
    expect(next).toHaveBeenCalled()
  })

  test('should return full 429 body on second request over max of 1', () => {
    const fixedNow = 1700000000000
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow)

    const middleware = rateLimitMiddleware({ max: 1, windowMs: 10000 })
    middleware({ ...req, ip: '10.77.0.8' }, res, next)
    expect(next).toHaveBeenCalledTimes(1)

    const resBlocked = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
    const nextBlocked = jest.fn()
    middleware({ ...req, ip: '10.77.0.8' }, resBlocked, nextBlocked)

    expect(resBlocked.status).toHaveBeenCalledWith(429)
    expect(resBlocked.json).toHaveBeenCalledWith({
      error: 'Too many requests',
      message: 'Rate limit exceeded',
      retryAfter: 10,
      limit: 1,
      remaining: 0
    })
    expect(nextBlocked).not.toHaveBeenCalled()
  })

  test('should report remaining 0 on the request that reaches max of 2', () => {
    const middleware = rateLimitMiddleware({ max: 2, windowMs: 10000 })
    middleware({ ...req, ip: '10.77.0.9' }, res, next)

    const resSecond = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
    const nextSecond = jest.fn()
    middleware({ ...req, ip: '10.77.0.9' }, resSecond, nextSecond)

    expect(resSecond.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '2')
    expect(resSecond.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '0')
    expect(nextSecond).toHaveBeenCalledTimes(1)
  })
})
