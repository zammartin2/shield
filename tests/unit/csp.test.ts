// ============================================
# CSP TESTS
// ============================================

import { CSPModule } from '../../src/modules/csp/CSPModule'

describe('CSPModule', () => {
  let csp: CSPModule

  beforeEach(() => {
    csp = new CSPModule({ csp: { enabled: true } })
  })

  test('should generate CSP header', async () => {
    const req = {}
    const res = {
      setHeader: jest.fn()
    }
    const context = {}

    await csp.apply(req, res, context)

    expect(res.setHeader).toHaveBeenCalled()
    const header = res.setHeader.mock.calls[0]
    expect(header[0]).toBe('Content-Security-Policy')
    expect(header[1]).toContain("default-src 'self'")
  })
})
