// ============================================
# HEADERS TESTS
// ============================================

import { HeadersModule } from '../../src/modules/headers/HeadersModule'

describe('HeadersModule', () => {
  let headers: HeadersModule

  beforeEach(() => {
    headers = new HeadersModule({ headers: { enabled: true } })
  })

  test('should add security headers', async () => {
    const req = {}
    const res = {
      setHeader: jest.fn(),
      removeHeader: jest.fn()
    }
    const context = {}

    await headers.apply(req, res, context)

    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By')
  })
})
