// ============================================
# BASIC TESTS
// ============================================

import { FABShield } from '../../src'

describe('FAB Shield', () => {
  test('should create instance', () => {
    const shield = new FABShield()
    expect(shield).toBeDefined()
    expect(shield.isActive()).toBe(true)
  })

  test('should return version', () => {
    const shield = new FABShield()
    expect(shield.getVersion()).toBe('1.0.0')
  })

  test('should get metrics', () => {
    const shield = new FABShield()
    const metrics = shield.getMetrics()
    expect(metrics).toBeDefined()
    expect(metrics.totalRequests).toBe(0)
  })
})
