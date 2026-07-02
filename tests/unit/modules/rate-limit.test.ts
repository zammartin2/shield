import { RateLimiter } from '../../../src/modules/rate-limit/RateLimiter';
import { ConfigManager } from '../../../src/core/ConfigManager';

describe('RateLimiter', () => {
  let limiter: RateLimiter;
  let config: ConfigManager;

  beforeEach(() => {
    config = new ConfigManager({
      rateLimit: {
        enabled: true,
        default: {
          windowMs: 1000,
          max: 5
        }
      }
    });
    limiter = new RateLimiter(config);
  });

  test('should create instance', () => {
    expect(limiter).toBeDefined();
  });

  test('should check rate limit', async () => {
    const result = await limiter.check('test-key');
    expect(result).toBeDefined();
    // Исправлено: используем blocked вместо allowed
    expect(result).toHaveProperty('blocked');
    expect(result).toHaveProperty('remaining');
    expect(result).toHaveProperty('limit');
    expect(result.blocked).toBe(false);
  });

  test('should allow requests under limit', async () => {
    for (let i = 0; i < 5; i++) {
      const result = await limiter.check('test-key-2');
      expect(result.blocked).toBe(false);
    }
  });

  test('should block requests over limit', async () => {
    const key = 'test-key-3';
    for (let i = 0; i < 5; i++) {
      await limiter.check(key);
    }
    const result = await limiter.check(key);
    expect(result.blocked).toBe(true);
    expect(result.remaining).toBe(0);
  });

  test('should reset after window expires', async () => {
    const key = 'test-key-4';
    for (let i = 0; i < 5; i++) {
      await limiter.check(key);
    }
    await new Promise(resolve => setTimeout(resolve, 1100));
    const result = await limiter.check(key);
    expect(result.blocked).toBe(false);
  });
});
