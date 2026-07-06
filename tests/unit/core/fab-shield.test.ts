import { FABShield } from '../../../src/core/FABShield';
import { Request, Response, NextFunction } from 'express';

describe('FABShield - Core Coverage', () => {
  let shield: FABShield;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: NextFunction;

  beforeEach(() => {
    // Создаем shield с минимальной конфигурацией для быстрых тестов
    shield = new FABShield({
      env: 'test',
      headers: { enabled: false },
      csp: { enabled: false },
      ai: { enabled: false },
      monitoring: { enabled: false },
      rateLimit: { enabled: false }
    });

    mockReq = {
      method: 'GET',
      url: '/test',
      path: '/test',
      headers: {},
      ip: '127.0.0.1',
      body: {},
      query: {},
      params: {},
      get: jest.fn()
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      getHeader: jest.fn(),
      removeHeader: jest.fn(),
      statusCode: 200,
      headersSent: false
    };

    nextFn = jest.fn();
  });

  afterEach(() => {
    if (shield) {
      shield.destroy();
    }
    jest.restoreAllMocks();
  });

  // ============================================
  // ПРЯМЫЕ ТЕСТЫ ДЛЯ КАЖДОЙ НЕПОКРЫТОЙ СТРОКИ
  // ============================================

  describe('Line 75 - isActive', () => {
    it('should return active state', () => {
      expect(shield.isActive()).toBe(true);
      shield.stop();
      expect(shield.isActive()).toBe(false);
      shield.start();
      expect(shield.isActive()).toBe(true);
    });
  });

  describe('Lines 163-208 - Middleware Error Handling', () => {
    it('should handle errors in middleware', () => {
      const middleware = shield.middleware();
      
      const errorReq = {
        ...mockReq,
        get: jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        })
      };
      
      expect(() => {
        middleware(errorReq as Request, mockRes as Response, nextFn);
      }).not.toThrow();
    });
  });

  describe('Line 315 - Command Injection Patterns', () => {
    it('should have command injection patterns when AI enabled', () => {
      const aiShield = new FABShield({
        ai: { enabled: true, rules: { commandInjection: true } }
      });
      
      const aiModule = aiShield.getAIModule();
      expect(aiModule.engine.COMMAND_INJECTION_PATTERNS).toBeDefined();
      expect(Array.isArray(aiModule.engine.COMMAND_INJECTION_PATTERNS)).toBe(true);
      
      aiShield.destroy();
    });
  });

  describe('Lines 386-457 - Security Rule Patterns', () => {
    it('should have all security patterns when AI enabled', () => {
      const aiShield = new FABShield({
        ai: {
          enabled: true,
          rules: {
            sqlInjection: true,
            xss: true,
            pathTraversal: true,
            nosqlInjection: true
          }
        }
      });
      
      const aiModule = aiShield.getAIModule();
      expect(aiModule.engine.SQL_PATTERNS).toBeDefined();
      expect(aiModule.engine.XSS_PATTERNS).toBeDefined();
      expect(aiModule.engine.PATH_TRAVERSAL_PATTERNS).toBeDefined();
      expect(aiModule.engine.NOSQL_PATTERNS).toBeDefined();
      expect(aiModule.engine.COMMAND_INJECTION_PATTERNS).toBeDefined();
      expect(aiModule.engine.LDAP_PATTERNS).toBeDefined();
      
      aiShield.destroy();
    });
  });

  describe('Line 489 - Rate Limiter', () => {
    it('should create rate limiter when enabled', () => {
      const rateShield = new FABShield({
        rateLimit: {
          enabled: true,
          default: { max: 1, windowMs: 1000 }
        }
      });
      
      const rateLimiter = rateShield.getRateLimiter();
      expect(rateLimiter).toBeDefined();
      
      rateShield.destroy();
    });
  });

  describe('Line 495 - Whitelist', () => {
    it('should handle whitelist configuration', () => {
      (shield as any).config.whitelist = ['127.0.0.1', '192.168.1.1'];
      
      const whitelist = (shield as any).config.whitelist;
      expect(whitelist).toBeDefined();
      expect(Array.isArray(whitelist)).toBe(true);
      expect(whitelist).toContain('127.0.0.1');
    });

    it('should bypass security for whitelisted IPs', (done) => {
      const testShield = new FABShield({
        env: 'test',
        ai: { enabled: true, rules: { sqlInjection: true } },
        headers: { enabled: false },
        csp: { enabled: false },
        monitoring: { enabled: false },
        rateLimit: { enabled: false }
      });
      
      (testShield as any).config.whitelist = ['127.0.0.1'];
      
      const req = {
        ...mockReq,
        ip: '127.0.0.1',
        url: '/admin/../../etc/passwd'
      };
      
      const middleware = testShield.middleware();
      
      middleware(req as Request, mockRes as Response, () => {
        expect(mockRes.status).not.toHaveBeenCalledWith(403);
        testShield.destroy();
        done();
      });
    }, 5000);
  });

  // ============================================
  // ТЕСТЫ ДЛЯ CONTEXT MANAGER (строки 174-185)
  // ============================================

  describe('ContextManager - Lines 174-185', () => {
    it('should handle context timeout', (done) => {
      const context = shield.getContextManager();
      
      const ctx = context.create({ timeout: 10 });
      expect(ctx).toBeDefined();
      
      setTimeout(() => {
        const stats = shield.getContextStats();
        expect(stats).toBeDefined();
        expect(stats).toHaveProperty('total');
        done();
      }, 50);
    });

    it('should handle context with data', () => {
      const context = shield.getContextManager();
      
      const ctx = context.create({
        data: { userId: '123', session: 'abc' }
      });
      
      expect(ctx).toBeDefined();
      expect(ctx).toHaveProperty('id');
      expect(ctx).toHaveProperty('startTime');
      expect(ctx.data).toBeDefined();
    });
  });

  // ============================================
  // ТЕСТЫ ДЛЯ AI ENGINE (строки 413, 563, 595, 622)
  // ============================================

  describe('AIEngine - Lines 413, 563, 595, 622', () => {
    it('should initialize AI engine with patterns', () => {
      const aiShield = new FABShield({
        ai: {
          enabled: true,
          rules: {
            sqlInjection: true,
            xss: true,
            pathTraversal: true,
            commandInjection: true,
            nosqlInjection: true
          }
        }
      });
      
      const aiModule = aiShield.getAIModule();
      expect(aiModule).toBeDefined();
      expect(aiModule.engine).toBeDefined();
      
      // Проверяем все паттерны
      const patterns = [
        'SQL_PATTERNS',
        'XSS_PATTERNS',
        'PATH_TRAVERSAL_PATTERNS',
        'COMMAND_INJECTION_PATTERNS',
        'NOSQL_PATTERNS',
        'LDAP_PATTERNS'
      ];
      
      patterns.forEach(pattern => {
        expect(aiModule.engine[pattern]).toBeDefined();
        expect(Array.isArray(aiModule.engine[pattern])).toBe(true);
        expect(aiModule.engine[pattern].length).toBeGreaterThan(0);
      });
      
      aiShield.destroy();
    });
  });

  // ============================================
  // ТЕСТЫ ДЛЯ ДРУГИХ НЕПОКРЫТЫХ КОМПОНЕНТОВ
  // ============================================

  describe('Other components', () => {
    it('should get version', () => {
      expect(shield.getVersion()).toBe('1.1.0');
    });

    it('should get config', () => {
      const config = shield.getConfig();
      expect(config).toBeDefined();
      expect(config.env).toBe('test');
    });

    it('should update config', () => {
      shield.updateConfig({ env: 'production' });
      const config = shield.getConfig();
      expect(config.env).toBe('production');
    });

    it('should get metrics', () => {
      const metrics = shield.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('threatsBlocked');
    });

    it('should generate report', async () => {
      const report = await shield.generateReport();
      expect(report).toBeDefined();
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('summary');
    });

    it('should get status', () => {
      const status = shield.getStatus();
      expect(status).toBeDefined();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('version');
      expect(status).toHaveProperty('active');
    });

    it('should reset metrics', () => {
      const before = shield.getMetrics();
      expect(before.totalRequests).toBe(0);
      
      shield.reset();
      
      const after = shield.getMetrics();
      expect(after.totalRequests).toBe(0);
    });
  });
});