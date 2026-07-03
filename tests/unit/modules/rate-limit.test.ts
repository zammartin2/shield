import { RateLimiter } from '../../../src/modules/rate-limit/RateLimiter';
import { ConfigManager } from '../../../src/core/ConfigManager';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let mockConfig: ConfigManager;

  beforeEach(() => {
    mockConfig = {
      getModule: jest.fn()
    } as any;

    rateLimiter = new RateLimiter(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
    rateLimiter.resetAll();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================

  describe('constructor', () => {
    it('should create instance with default config', () => {
      mockConfig.getModule.mockReturnValue(null);
      
      const limiter = new RateLimiter(mockConfig);
      
      expect(limiter).toBeInstanceOf(RateLimiter);
      expect((limiter as any).defaultLimit).toBe(100);
      expect((limiter as any).defaultWindow).toBe(60000);
    });

    it('should load config from rateLimit module', () => {
      mockConfig.getModule.mockReturnValue({
        default: { max: 200, windowMs: 120000 }
      });
      
      const limiter = new RateLimiter(mockConfig);
      
      expect((limiter as any).defaultLimit).toBe(200);
      expect((limiter as any).defaultWindow).toBe(120000);
    });

    it('should use defaults when config missing fields', () => {
      mockConfig.getModule.mockReturnValue({
        default: { max: 150 }
      });
      
      const limiter = new RateLimiter(mockConfig);
      
      expect((limiter as any).defaultLimit).toBe(150);
      expect((limiter as any).defaultWindow).toBe(60000);
    });

    it('should handle null rateLimit config', () => {
      mockConfig.getModule.mockReturnValue(null);
      
      const limiter = new RateLimiter(mockConfig);
      
      expect((limiter as any).defaultLimit).toBe(100);
      expect((limiter as any).defaultWindow).toBe(60000);
    });
  });

  // ============================================
  // CHECK
  // ============================================

  describe('check', () => {
    const mockReq = {
      ip: '127.0.0.1',
      path: '/test',
      method: 'GET',
      user: { role: 'user' }
    };

    it('should allow first request', async () => {
      const result = await rateLimiter.check(mockReq);
      
      expect(result).toEqual({
        blocked: false,
        limit: 100,
        remaining: 99,
        reset: expect.any(String)
      });
      expect((rateLimiter as any).store.size).toBe(1);
    });

    it('should allow requests under limit', async () => {
      for (let i = 0; i < 50; i++) {
        const result = await rateLimiter.check(mockReq);
        expect(result.blocked).toBe(false);
        expect(result.remaining).toBe(100 - i - 1);
      }
    });

    it('should block requests over limit', async () => {
      // Создаем 100 запросов
      for (let i = 0; i < 100; i++) {
        await rateLimiter.check(mockReq);
      }
      
      // 101-й запрос должен быть заблокирован
      const result = await rateLimiter.check(mockReq);
      
      expect(result.blocked).toBe(true);
      expect(result.limit).toBe(100);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
      expect(result.windowMs).toBe(60000);
      expect(result.reset).toBeDefined();
    });

    it('should reset after window expires', async () => {
      // Создаем запрос
      await rateLimiter.check(mockReq);
      
      // Мокаем время
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 70000);
      
      // Следующий запрос должен сбросить счетчик
      const result = await rateLimiter.check(mockReq);
      
      expect(result.blocked).toBe(false);
      expect(result.remaining).toBe(99);
      
      Date.now = originalNow;
    });

    it('should handle different IPs separately', async () => {
      const req1 = { ip: '192.168.1.1', path: '/test' };
      const req2 = { ip: '192.168.1.2', path: '/test' };
      
      // Делаем 101 запрос с первого IP
      for (let i = 0; i < 101; i++) {
        await rateLimiter.check(req1);
      }
      
      // Второй IP должен иметь свой счетчик
      const result = await rateLimiter.check(req2);
      expect(result.blocked).toBe(false);
      expect(result.remaining).toBe(99);
    });
  });

  // ============================================
  // GET KEY
  // ============================================

  describe('getKey', () => {
    it('should use IP as key by default', () => {
      const req = { ip: '192.168.1.1' };
      const key = (rateLimiter as any).getKey(req);
      expect(key).toBe('192.168.1.1');
    });

    it('should use custom keyGenerator if provided', () => {
      const customKeyGenerator = jest.fn(() => 'custom-key');
      mockConfig.getModule.mockReturnValue({
        keyGenerator: customKeyGenerator
      });
      
      rateLimiter = new RateLimiter(mockConfig);
      const req = { ip: '192.168.1.1' };
      
      const key = (rateLimiter as any).getKey(req);
      
      expect(customKeyGenerator).toHaveBeenCalledWith(req);
      expect(key).toBe('custom-key');
    });

    it('should use "unknown" when IP is missing', () => {
      const req = {};
      const key = (rateLimiter as any).getKey(req);
      expect(key).toBe('unknown');
    });
  });

  // ============================================
  // GET LIMIT
  // ============================================

  describe('getLimit', () => {
    it('should return default limit when no config', () => {
      mockConfig.getModule.mockReturnValue(null);
      rateLimiter = new RateLimiter(mockConfig);
      
      const limit = (rateLimiter as any).getLimit({});
      expect(limit).toBe(100);
    });

    it('should return default limit when no path matches', () => {
      const req = { path: '/other' };
      const limit = (rateLimiter as any).getLimit(req);
      expect(limit).toBe(100);
    });

    it('should return custom limit for matching path', () => {
      mockConfig.getModule.mockReturnValue({
        paths: {
          '/api/*': { max: 50 }
        }
      });
      rateLimiter = new RateLimiter(mockConfig);
      
      const req = { path: '/api/test' };
      const limit = (rateLimiter as any).getLimit(req);
      expect(limit).toBe(50);
    });

    it('should return custom limit for matching role', () => {
      mockConfig.getModule.mockReturnValue({
        roles: {
          admin: { max: 200 }
        }
      });
      rateLimiter = new RateLimiter(mockConfig);
      
      const req = { user: { role: 'admin' }, path: '/' };
      const limit = (rateLimiter as any).getLimit(req);
      expect(limit).toBe(200);
    });

    it('should prefer path rule over role rule', () => {
      mockConfig.getModule.mockReturnValue({
        paths: {
          '/api/*': { max: 30 }
        },
        roles: {
          admin: { max: 200 }
        }
      });
      rateLimiter = new RateLimiter(mockConfig);
      
      const req = { 
        user: { role: 'admin' }, 
        path: '/api/test' 
      };
      const limit = (rateLimiter as any).getLimit(req);
      expect(limit).toBe(30);
    });

    it('should handle missing user role', () => {
      const req = { path: '/' };
      const limit = (rateLimiter as any).getLimit(req);
      expect(limit).toBe(100);
    });

    it('should handle empty user object', () => {
      const req = { path: '/', user: {} };
      const limit = (rateLimiter as any).getLimit(req);
      expect(limit).toBe(100);
    });
  });

  // ============================================
  // GET WINDOW
  // ============================================

  describe('getWindow', () => {
    it('should return default window when no config', () => {
      mockConfig.getModule.mockReturnValue(null);
      rateLimiter = new RateLimiter(mockConfig);
      
      const windowMs = (rateLimiter as any).getWindow({});
      expect(windowMs).toBe(60000);
    });

    it('should return custom window for matching path', () => {
      mockConfig.getModule.mockReturnValue({
        paths: {
          '/api/*': { windowMs: 30000 }
        }
      });
      rateLimiter = new RateLimiter(mockConfig);
      
      const req = { path: '/api/test' };
      const windowMs = (rateLimiter as any).getWindow(req);
      expect(windowMs).toBe(30000);
    });

    it('should return custom window for matching role', () => {
      mockConfig.getModule.mockReturnValue({
        roles: {
          admin: { windowMs: 120000 }
        }
      });
      rateLimiter = new RateLimiter(mockConfig);
      
      const req = { user: { role: 'admin' }, path: '/' };
      const windowMs = (rateLimiter as any).getWindow(req);
      expect(windowMs).toBe(120000);
    });

    it('should prefer path window over role window', () => {
      mockConfig.getModule.mockReturnValue({
        paths: {
          '/api/*': { windowMs: 30000 }
        },
        roles: {
          admin: { windowMs: 120000 }
        }
      });
      rateLimiter = new RateLimiter(mockConfig);
      
      const req = { 
        user: { role: 'admin' }, 
        path: '/api/test' 
      };
      const windowMs = (rateLimiter as any).getWindow(req);
      expect(windowMs).toBe(30000);
    });

    it('should handle missing path in req', () => {
      const req = {};
      const windowMs = (rateLimiter as any).getWindow(req);
      expect(windowMs).toBe(60000);
    });
  });

  // ============================================
  // RESET
  // ============================================

  describe('reset', () => {
    it('should reset specific key', async () => {
      await rateLimiter.check({ ip: '192.168.1.1' });
      expect((rateLimiter as any).store.size).toBe(1);
      
      rateLimiter.reset('192.168.1.1');
      expect((rateLimiter as any).store.size).toBe(0);
    });

    it('should not fail when resetting non-existent key', () => {
      expect(() => {
        rateLimiter.reset('non-existent');
      }).not.toThrow();
    });
  });

  // ============================================
  // RESET ALL
  // ============================================

  describe('resetAll', () => {
    it('should clear all keys', async () => {
      await rateLimiter.check({ ip: '192.168.1.1' });
      await rateLimiter.check({ ip: '192.168.1.2' });
      await rateLimiter.check({ ip: '192.168.1.3' });
      
      expect((rateLimiter as any).store.size).toBe(3);
      
      rateLimiter.resetAll();
      expect((rateLimiter as any).store.size).toBe(0);
    });

    it('should handle empty store', () => {
      expect(() => {
        rateLimiter.resetAll();
      }).not.toThrow();
    });
  });

  // ============================================
  // GET STATS
  // ============================================

  describe('getStats', () => {
    it('should return stats when store is empty', () => {
      const stats = rateLimiter.getStats();
      expect(stats).toEqual({
        totalKeys: 0,
        keys: [],
        defaultLimit: 100,
        defaultWindow: 60000
      });
    });

    it('should return stats with keys', async () => {
      await rateLimiter.check({ ip: '192.168.1.1' });
      await rateLimiter.check({ ip: '192.168.1.2' });
      
      const stats = rateLimiter.getStats();
      expect(stats.totalKeys).toBe(2);
      expect(stats.keys).toEqual(['192.168.1.1', '192.168.1.2']);
      expect(stats.defaultLimit).toBe(100);
      expect(stats.defaultWindow).toBe(60000);
    });
  });

  // ============================================
  // CLEANUP
  // ============================================

  describe('cleanup', () => {
    it('should remove expired keys', async () => {
      await rateLimiter.check({ ip: '192.168.1.1' });
      
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 70000);
      
      rateLimiter.cleanup();
      
      expect((rateLimiter as any).store.size).toBe(0);
      
      Date.now = originalNow;
    });

    it('should keep valid keys', async () => {
      await rateLimiter.check({ ip: '192.168.1.1' });
      
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 30000);
      
      rateLimiter.cleanup();
      
      expect((rateLimiter as any).store.size).toBe(1);
      
      Date.now = originalNow;
    });

    it('should handle empty store', () => {
      expect(() => {
        rateLimiter.cleanup();
      }).not.toThrow();
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should handle full rate limiting flow', async () => {
      const req = { ip: '192.168.1.1', path: '/api/test' };
      
      // Первый запрос - разрешен
      const result1 = await rateLimiter.check(req);
      expect(result1.blocked).toBe(false);
      expect(result1.remaining).toBe(99);
      
      // Делаем еще 98 запросов
      for (let i = 0; i < 98; i++) {
        await rateLimiter.check(req);
      }
      
      // 100-й запрос - последний разрешенный
      const result100 = await rateLimiter.check(req);
      expect(result100.blocked).toBe(false);
      expect(result100.remaining).toBe(0);
      
      // 101-й запрос - заблокирован
      const result101 = await rateLimiter.check(req);
      expect(result101.blocked).toBe(true);
      expect(result101.remaining).toBe(0);
      expect(result101.retryAfter).toBeGreaterThan(0);
      
      // Статистика
      const stats = rateLimiter.getStats();
      expect(stats.totalKeys).toBe(1);
      expect(stats.defaultLimit).toBe(100);
      
      // Сброс
      rateLimiter.resetAll();
      expect((rateLimiter as any).store.size).toBe(0);
    });

    it('should handle different rate limits for different paths', async () => {
      mockConfig.getModule.mockReturnValue({
        paths: {
          '/api/admin/*': { max: 5 },
          '/api/public/*': { max: 20 }
        }
      });
      rateLimiter = new RateLimiter(mockConfig);
      
      const adminReq = { ip: '192.168.1.1', path: '/api/admin/test' };
      const publicReq = { ip: '192.168.1.2', path: '/api/public/test' };
      
      // Admin limit - 5
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.check(adminReq);
        expect(result.blocked).toBe(false);
        expect(result.remaining).toBe(4 - i);
      }
      
      const adminResult = await rateLimiter.check(adminReq);
      expect(adminResult.blocked).toBe(true);
      
      // Public limit - 20
      for (let i = 0; i < 20; i++) {
        const result = await rateLimiter.check(publicReq);
        expect(result.blocked).toBe(false);
        expect(result.remaining).toBe(19 - i);
      }
      
      const publicResult = await rateLimiter.check(publicReq);
      expect(publicResult.blocked).toBe(true);
    });

    it('should handle different rate limits for different roles', async () => {
      mockConfig.getModule.mockReturnValue({
        roles: {
          admin: { max: 200 },
          user: { max: 50 }
        }
      });
      rateLimiter = new RateLimiter(mockConfig);
      
      const adminReq = { ip: '192.168.1.1', path: '/test', user: { role: 'admin' } };
      const userReq = { ip: '192.168.1.2', path: '/test', user: { role: 'user' } };
      
      // Admin - 200 limit
      for (let i = 0; i < 200; i++) {
        const result = await rateLimiter.check(adminReq);
        expect(result.blocked).toBe(false);
        expect(result.remaining).toBe(199 - i);
      }
      
      const adminResult = await rateLimiter.check(adminReq);
      expect(adminResult.blocked).toBe(true);
      
      // User - 50 limit
      for (let i = 0; i < 50; i++) {
        const result = await rateLimiter.check(userReq);
        expect(result.blocked).toBe(false);
        expect(result.remaining).toBe(49 - i);
      }
      
      const userResult = await rateLimiter.check(userReq);
      expect(userResult.blocked).toBe(true);
    });

    it('should cleanup expired keys', async () => {
      const req = { ip: '192.168.1.1' };
      
      await rateLimiter.check(req);
      expect((rateLimiter as any).store.size).toBe(1);
      
      // Мокаем время, чтобы ключ истек
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 70000);
      
      rateLimiter.cleanup();
      expect((rateLimiter as any).store.size).toBe(0);
      
      // Новый запрос должен создать новый ключ
      const result = await rateLimiter.check(req);
      expect(result.blocked).toBe(false);
      expect(result.remaining).toBe(99);
      
      Date.now = originalNow;
    });
  });
});
